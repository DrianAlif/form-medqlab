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

// Serve frontend assets on Cloudflare Pages / Workers
app.all('*', async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Cloudflare Worker running. Frontend assets not bound in dev mode.');
});

export default app;
