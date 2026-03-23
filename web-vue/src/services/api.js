import axios from 'axios'

const API_BASE = '/api'

export async function queryQuota(username, token) {
  try {
    const res = await axios.post(`${API_BASE}/chaxun`, { username, token })
    return { ok: true, status: res.status, body: JSON.stringify(res.data) }
  } catch (e) {
    if (e.response) {
      return { ok: false, status: e.response.status, body: JSON.stringify(e.response.data || {}) }
    }
    return { ok: false, status: 0, body: e.message }
  }
}

export async function checkUpdate() {
  try {
    const res = await axios.get('https://api.github.com/repos/raopan2021/api_quota_helper/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json' }
    })
    const json = res.data
    const tag = json.tag_name || ''
    const version = tag.startsWith('v') ? tag.slice(1) : tag
    let downloadUrl = null
    for (const asset of json.assets || []) {
      const name = asset.name || ''
      if (name.endsWith('.exe') || name.endsWith('.zip') || name.endsWith('.apk')) {
        downloadUrl = asset.browser_download_url
        break
      }
    }
    return { version, downloadUrl: downloadUrl || json.html_url, notes: json.body || '' }
  } catch (e) {
    return { error: e.message }
  }
}
