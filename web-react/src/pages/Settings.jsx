import { useState } from 'react';
import { useSettings } from '../stores/useSettings.jsx';
import { checkUpdate } from '../services/api.js';

const INTERVALS = [
  { label: '30秒', value: 30 },
  { label: '1分钟', value: 60 },
  { label: '5分钟', value: 300 },
  { label: '10分钟', value: 600 },
];

export default function Settings() {
  const { settings, save } = useSettings();
  const [checking, setChecking] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLatest, setIsLatest] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 16px 16px' }}>
          {INTERVALS.map(opt => (
            <button key={opt.value} style={{ ...styles.btn, ...(settings.refreshIntervalSeconds === opt.value ? styles.btnActive : {}) }} onClick={() => save({ refreshIntervalSeconds: opt.value })}>
              {opt.label}
            </button>
          ))}
        </div>
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
  btnActive: { background: '#1976D2', color: '#fff', borderColor: '#1976D2' },
};
