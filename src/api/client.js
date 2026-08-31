/**
 * API Client supporting Cloudflare Workers + D1 backend with localStorage fallback
 */

const LOCAL_STORAGE_KEY_DOCS = 'applimetis_docs_history';

export async function fetchSavedDocuments() {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents)) {
        return data.documents;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/documents, using localStorage fallback', err);
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_DOCS);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

export async function saveDocument(type, title, data, totalAmount = 0) {
  const docPayload = {
    id: `doc-${Date.now()}`,
    type,
    title,
    data,
    total_amount: totalAmount,
    created_at: new Date().toISOString()
  };

  // Try D1 Cloudflare Worker API
  let savedToApi = false;
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload)
    });
    if (res.ok) {
      savedToApi = true;
    }
  } catch (err) {
    console.warn('Failed to save to /api/documents, saving to localStorage', err);
  }

  // Always keep localStorage synchronized as well
  try {
    const existing = await fetchSavedDocuments();
    const filtered = Array.isArray(existing) ? existing.filter(d => d.id !== docPayload.id) : [];
    const updated = [docPayload, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_KEY_DOCS, JSON.stringify(updated));
    return { success: true, doc: docPayload, source: savedToApi ? 'D1' : 'localStorage' };
  } catch (e) {
    console.error('Failed to save to localStorage', e);
    return { success: savedToApi, error: e.message };
  }
}

export async function deleteSavedDocument(id) {
  try {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete on server', err);
  }

  try {
    const existing = await fetchSavedDocuments();
    const updated = Array.isArray(existing) ? existing.filter(d => d.id !== id) : [];
    localStorage.setItem(LOCAL_STORAGE_KEY_DOCS, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}
