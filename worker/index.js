import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use('/api/*', cors());

// Health Check
app.get('/api/health', (c) => {
  const hasDB = !!c.env?.DB;
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cloudflare_d1_connected: hasDB,
    environment: c.env?.ENVIRONMENT || 'development'
  });
});

// GET all documents
app.get('/api/documents', async (c) => {
  if (!c.env?.DB) {
    return c.json({ documents: [], message: 'D1 not bound' });
  }

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, type, title, data, total_amount, created_at, updated_at FROM documents ORDER BY created_at DESC'
    ).all();

    const documents = (results || []).map(row => {
      let parsedData = {};
      try {
        parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
      } catch {
        parsedData = {};
      }
      return {
        ...row,
        data: parsedData
      };
    });

    return c.json({ documents });
  } catch (error) {
    return c.json({ error: error.message, documents: [] }, 500);
  }
});

// GET single document by ID
app.get('/api/documents/:id', async (c) => {
  const id = c.req.param('id');
  if (!c.env?.DB) {
    return c.json({ error: 'D1 not bound' }, 500);
  }

  try {
    const doc = await c.env.DB.prepare(
      'SELECT * FROM documents WHERE id = ?'
    ).bind(id).first();

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    let parsedData = {};
    try {
      parsedData = typeof doc.data === 'string' ? JSON.parse(doc.data) : (doc.data || {});
    } catch {
      parsedData = {};
    }

    return c.json({
      ...doc,
      data: parsedData
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// POST create/update document
app.post('/api/documents', async (c) => {
  const body = await c.req.json();
  const { id, type, title, data, total_amount } = body;

  const docId = id || `doc-${Date.now()}`;
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data || {});
  const now = new Date().toISOString();

  if (!c.env?.DB) {
    return c.json({ success: true, id: docId, source: 'memory_no_d1' });
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO documents (id, type, title, data, total_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         data = excluded.data,
         total_amount = excluded.total_amount,
         updated_at = excluded.updated_at`
    ).bind(docId, type || 'kosan', title || 'Dokumen', dataStr, Number(total_amount) || 0, now, now).run();

    return c.json({ success: true, id: docId });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// DELETE document
app.delete('/api/documents/:id', async (c) => {
  const id = c.req.param('id');
  if (!c.env?.DB) {
    return c.json({ success: true });
  }

  try {
    await c.env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Presets endpoints
app.get('/api/presets', async (c) => {
  if (!c.env?.DB) {
    return c.json({ presets: [] });
  }

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM presets').all();
    return c.json({ presets: results || [] });
  } catch (error) {
    return c.json({ error: error.message, presets: [] }, 500);
  }
});

// ==========================================
// PUBLIC REMOTE SIGNING ENDPOINTS (1-Hour Expiring Links)
// ==========================================

// Ensure sign_tokens table exists
async function ensureSignTokensTable(db) {
  if (!db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS sign_tokens (
        token TEXT PRIMARY KEY,
        slot_field TEXT,
        slot_title TEXT,
        assigned_name TEXT,
        assigned_role TEXT,
        form_category TEXT,
        doc_title TEXT,
        total_amount REAL,
        doc_details TEXT,
        created_at INTEGER,
        expires_at INTEGER,
        status TEXT,
        signature TEXT,
        signed_at TEXT,
        signer_name TEXT
      )
    `).run();
  } catch (err) {
    console.error('Failed to ensure sign_tokens table:', err);
  }
}

// 1. POST /api/public-sign/create
app.post('/api/public-sign/create', async (c) => {
  const payload = await c.req.json();
  const now = Date.now();
  const durationMs = payload.durationMs || 3600000; // 1 hour default
  const expiresAt = now + durationMs;
  const token = `st_${now.toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  const session = {
    token,
    slotField: payload.slotField || 'sign',
    slotTitle: payload.slotTitle || 'Tanda Tangan',
    assignedName: payload.assignedName || 'Pejabat Terkait',
    assignedRole: payload.assignedRole || '',
    formCategory: payload.formCategory || 'Dokumen Resmi',
    docTitle: payload.docTitle || 'Formulir Dokumen Resmi',
    totalAmount: payload.totalAmount || 0,
    docDetails: payload.docDetails || {},
    createdAt: now,
    expiresAt,
    status: 'pending',
    signature: null,
    signedAt: null,
    signerName: null
  };

  if (c.env?.DB) {
    try {
      await ensureSignTokensTable(c.env.DB);
      await c.env.DB.prepare(`
        INSERT INTO sign_tokens (
          token, slot_field, slot_title, assigned_name, assigned_role,
          form_category, doc_title, total_amount, doc_details,
          created_at, expires_at, status, signature, signed_at, signer_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        session.token, session.slotField, session.slotTitle, session.assignedName, session.assignedRole,
        session.formCategory, session.docTitle, session.totalAmount, JSON.stringify(session.docDetails),
        session.createdAt, session.expiresAt, session.status, session.signature, session.signedAt, session.signerName
      ).run();
    } catch (err) {
      console.error('Database error in public-sign/create:', err);
    }
  }

  return c.json({
    ok: true,
    token,
    expiresAt,
    expiresInSeconds: Math.floor(durationMs / 1000),
    session
  });
});

// 2. GET /api/public-sign/recent (For continuous background auto-sync)
app.get('/api/public-sign/recent', async (c) => {
  if (!c.env?.DB) {
    return c.json({ ok: true, tokens: [] });
  }

  try {
    await ensureSignTokensTable(c.env.DB);
    const now = Date.now();
    const cutoff = now - (6 * 3600 * 1000); // Past 6 hours
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM sign_tokens WHERE created_at > ? ORDER BY created_at DESC LIMIT 50`
    ).bind(cutoff).all();

    const tokens = (results || []).map(row => ({
      token: row.token,
      slotField: row.slot_field,
      slotTitle: row.slot_title,
      assignedName: row.assigned_name,
      assignedRole: row.assigned_role,
      formCategory: row.form_category,
      docTitle: row.doc_title,
      totalAmount: row.total_amount,
      docDetails: row.doc_details ? (typeof row.doc_details === 'string' ? JSON.parse(row.doc_details) : row.doc_details) : {},
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      status: row.status,
      signature: row.signature,
      signedAt: row.signed_at,
      signerName: row.signer_name
    }));

    return c.json({ ok: true, tokens });
  } catch (err) {
    return c.json({ ok: false, error: err.message, tokens: [] }, 500);
  }
});

// 3. POST /api/public-sign/submit or /api/public-sign/:token/submit
const handleSubmitSign = async (c) => {
  const payload = await c.req.json();
  const token = payload.token || c.req.param('token');

  if (!token) {
    return c.json({ ok: false, error: 'Token tidak valid' }, 400);
  }

  if (!c.env?.DB) {
    return c.json({ ok: false, error: 'Database D1 tidak terhubung' }, 500);
  }

  try {
    await ensureSignTokensTable(c.env.DB);
    const row = await c.env.DB.prepare("SELECT * FROM sign_tokens WHERE token = ? LIMIT 1").bind(token).first();
    if (!row) {
      return c.json({ ok: false, error: 'Token tidak valid atau tidak ditemukan' }, 404);
    }

    const now = Date.now();
    if (now > row.expires_at || row.status === 'expired') {
      await c.env.DB.prepare("UPDATE sign_tokens SET status = 'expired' WHERE token = ?").bind(token).run();
      return c.json({
        ok: false,
        error: 'Link tanda tangan ini telah kedaluwarsa (melebihi batas waktu 1 jam).'
      }, 410);
    }

    if (row.status === 'signed') {
      return c.json({
        ok: false,
        error: 'Dokumen ini sudah berhasil ditandatangani sebelumnya. Link sekali pakai ini sudah tidak aktif.'
      }, 409);
    }

    const signedAt = new Date().toISOString();
    const signerName = payload.signerName || row.assigned_name;
    const signature = payload.signature;

    await c.env.DB.prepare(
      `UPDATE sign_tokens
       SET status = 'signed', signature = ?, signed_at = ?, signer_name = ?
       WHERE token = ?`
    ).bind(signature, signedAt, signerName, token).run();

    const session = {
      token: row.token,
      slotField: row.slot_field,
      slotTitle: row.slot_title,
      assignedName: row.assigned_name,
      assignedRole: row.assigned_role,
      formCategory: row.form_category,
      docTitle: row.doc_title,
      totalAmount: row.total_amount,
      docDetails: row.doc_details ? (typeof row.doc_details === 'string' ? JSON.parse(row.doc_details) : row.doc_details) : {},
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      status: 'signed',
      signature,
      signedAt,
      signerName
    };

    return c.json({
      ok: true,
      message: 'Tanda tangan berhasil disimpan. Link ini sekarang telah selesai digunakan.',
      session
    });
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500);
  }
};

app.post('/api/public-sign/submit', handleSubmitSign);
app.post('/api/public-sign/:token/submit', handleSubmitSign);

// 4. GET /api/public-sign/:token
app.get('/api/public-sign/:token', async (c) => {
  const token = c.req.param('token');
  if (!token) {
    return c.json({ ok: false, error: 'Token tidak diberikan.' }, 400);
  }

  if (!c.env?.DB) {
    return c.json({ ok: false, error: 'Database D1 tidak terhubung' }, 500);
  }

  try {
    await ensureSignTokensTable(c.env.DB);
    const row = await c.env.DB.prepare("SELECT * FROM sign_tokens WHERE token = ? LIMIT 1").bind(token).first();
    if (!row) {
      return c.json({ ok: false, error: 'Token tidak ditemukan atau tidak valid.' }, 404);
    }

    const now = Date.now();
    let status = row.status;
    if (status === 'pending' && now > row.expires_at) {
      status = 'expired';
      await c.env.DB.prepare("UPDATE sign_tokens SET status = 'expired' WHERE token = ?").bind(token).run();
    }

    const session = {
      token: row.token,
      slotField: row.slot_field,
      slotTitle: row.slot_title,
      assignedName: row.assigned_name,
      assignedRole: row.assigned_role,
      formCategory: row.form_category,
      docTitle: row.doc_title,
      totalAmount: row.total_amount,
      docDetails: row.doc_details ? (typeof row.doc_details === 'string' ? JSON.parse(row.doc_details) : row.doc_details) : {},
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      status,
      signature: row.signature,
      signedAt: row.signed_at,
      signerName: row.signer_name
    };

    return c.json({
      ok: true,
      session,
      timeRemainingSeconds: Math.max(0, Math.floor((row.expires_at - now) / 1000))
    });
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// Serve frontend assets on Cloudflare Pages / Workers
app.all('*', async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Cloudflare Worker running. Frontend assets not bound in dev mode.');
});

export default app;
