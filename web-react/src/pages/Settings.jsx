import { useState } from 'react';
import { useSettings } from '../stores/useSettings.jsx';
import { checkUpdate } from '../services/api.js';

function toHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

function toSeconds(h, m, s) {
  return h * 3600 + m * 60 + s;
}

export default function Settings() {
  const { settings, save } = useSettings();
  const [checking, setChecking] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLatest, setIsLatest] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const hms = toHMS(settings.refreshIntervalSeconds || 300);

  function updateField(field, val) {
    const n = parseInt(val, 10) || 0;
    const next = toSeconds(field === 'h' ? n : hms.h, field === 'm' ? n : hms.m, field === 's' ? n : hms.s);
    save({ refreshIntervalSeconds: next });
  }

  async function handleCheckUpdate() {
    setChecking(true);
    setUpdateError('');
    setIsLatest(false);
    setUpdateInfo(null);
    const result = await checkUpdate();
    setChecking(false);
    if (result.error) {
      setUpdateError(result.error);
    } else {
      setUpdateInfo(result);
    }
  }

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>显示</div>
        <div style={styles.toggleRow}>
          <span>深色模式</span>
          <div style={{ ...styles.toggle, ...(settings.darkMode ? styles.toggleOn : {}) }} onClick={() => save({ darkMode: !settings.darkMode })} />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>刷新间隔</div>
        <div style={styles.hmsRow}>
          <div style={styles.hmsUnit}>
            <input
              style={styles.hmsInput}
              type="number"
              min="0"
              max="23"
              value={hms.h}
              onChange={e => updateField('h', e.target.value)}
            />
            <span style={styles.hmsLabel}>时</span>
          </div>
          <div style={styles.hmsUnit}>
            <input
              style={styles.hmsInput}
              type="number"
              min="0"
              max="59"
              value={hms.m}
              onChange={e => updateField('m', e.target.value)}
            />
            <span style={styles.hmsLabel}>分</span>
          </div>
          <div style={styles.hmsUnit}>
            <input
              style={styles.hmsInput}
              type="number"
              min="0"
              max="59"
              value={hms.s}
              onChange={e => updateField('s', e.target.value)}
            />
            <span style={styles.hmsLabel}>秒</span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', paddingLeft: '4px' }}>
          当前: {settings.refreshIntervalSeconds} 秒
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>版本更新</div>
        <div style={{ padding: '0 16px 16px' }}>
          <button style={styles.btn} onClick={handleCheckUpdate} disabled={checking}>
            {checking ? '检查中...' : '检查更新'}
          </button>
          {updateError && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{updateError}</p>}
          {isLatest && <p style={{ color: '#4CAF50', fontSize: '13px', marginTop: '8px' }}>当前已是最新版本</p>}
          {updateInfo && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '13px' }}>发现新版本: <strong>{updateInfo.version}</strong></p>
              <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer" style={{ color: '#1976D2', fontSize: '13px' }}>点击下载</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: { padding: '16px', borderBottom: '1px solid #eee' },
  sectionTitle: { fontWeight: 'bold', marginBottom: '12px', fontSize: '15px' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', background: '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' },
  toggleOn: { background: '#1976D2' },
  btn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  hmsRow: { display: 'flex', gap: '12px', alignItems: 'center', padding: '0 4px' },
  hmsUnit: { display: 'flex', alignItems: 'center', gap: '4px' },
  hmsInput: { width: '52px', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', textAlign: 'center', background: '#fafafa' },
  hmsLabel: { fontSize: '13px', color: '#666' },
};
