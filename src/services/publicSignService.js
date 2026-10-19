/**
 * Public Sign Service
 * Manages one-time, expiring public signing links for approvals
 */

export async function createPublicSignToken(payload) {
  try {
    const res = await fetch('/api/public-sign/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Gagal membuat link tanda tangan');
    }

    const origin = window.location.origin;
    const shareUrl = `${origin}/?signToken=${data.token}`;

    return {
      ok: true,
      token: data.token,
      shareUrl,
      localShareUrl: shareUrl,
      expiresAt: data.expiresAt,
      expiresInSeconds: data.expiresInSeconds,
      session: data.session
    };
  } catch (err) {
    console.error('Error creating public sign token:', err);
    throw err;
  }
}

export async function getPublicSignSession(token) {
  try {
    const res = await fetch(`/api/public-sign/${token}`);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || 'Link tidak ditemukan atau sudah kedaluwarsa.'
      };
    }
    return data;
  } catch (err) {
    console.error('Error fetching public sign session:', err);
    return {
      ok: false,
      error: 'Gagal menghubungi server untuk memvalidasi link tanda tangan.'
    };
  }
}

export async function submitPublicSignature(token, signatureDataUrl, signerName = '') {
  try {
    const res = await fetch(`/api/public-sign/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        signature: signatureDataUrl,
        signerName
      })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Gagal menyimpan tanda tangan');
    }
    return data;
  } catch (err) {
    console.error('Error submitting public signature:', err);
    throw err;
  }
}

export async function getRecentSignTokens() {
  try {
    const res = await fetch('/api/public-sign/recent');
    const data = await res.json();
    if (res.ok && data.ok) {
      return data.tokens || [];
    }
    return [];
  } catch (err) {
    console.error('Error fetching recent sign tokens:', err);
    return [];
  }
}
