const API_BASE = 'https://untitled-node-6gyb.onrender.com/api';

export async function queryQuota(username, token) {
  const res = await fetch(`${API_BASE}/quota`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, token })
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

export async function checkUpdate() {
  try {
    const res = await fetch('https://api.github.com/repos/raopan2021/api_quota_helper/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const json = await res.json();
    const tag = json.tag_name || '';
    const version = tag.startsWith('v') ? tag.slice(1) : tag;
    let downloadUrl = null;
    for (const asset of json.assets || []) {
      const name = asset.name || '';
      if (name.endsWith('.exe') || name.endsWith('.zip') || name.endsWith('.apk')) {
        downloadUrl = asset.browser_download_url;
        break;
      }
    }
    return { version, downloadUrl: downloadUrl || json.html_url, notes: json.body || '' };
  } catch (e) {
    return { error: e.message };
  }
}
