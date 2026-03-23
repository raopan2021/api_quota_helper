import { useState } from 'react';
import { Cascader, Toast } from 'antd';
import { useSettings } from '../stores/useSettings.jsx';
import { checkUpdate } from '../services/api.js';

// 生成时分秒选项
function buildOptions() {
  const hours = Array.from({ length: 24 }, (_, i) => ({ label: `${i} 小时`, value: i * 3600 }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ label: `${i} 分钟`, value: i * 60 }));
  const seconds = Array.from({ length: 60 }, (_, i) => ({ label: `${i} 秒`, value: i }));
  return [
    { label: '时', children: hours },
    { label: '分', children: minutes },
    { label: '秒', children: seconds },
  ];
}

const CASCADE_OPTIONS = buildOptions();

export default function Settings() {
  const { settings, save } = useSettings();
  const [checking, setChecking] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLatest, setIsLatest] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const totalSeconds = settings.refreshIntervalSeconds || 300;
  const initValues = [
    String(Math.floor(totalSeconds / 3600)),
    String(Math.floor((totalSeconds % 3600) / 60)),
    String(totalSeconds % 60),
  ];

  function handleTimeChange(values) {
    const [h = 0, m = 0, s = 0] = values.map(v => parseInt(v, 10) || 0);
    const total = h * 3600 + m * 60 + s;
    save({ refreshIntervalSeconds: total });
    Toast.success(`已设置为 ${formatTime(total)}`);
  }

  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} 小时`);
    if (m > 0) parts.push(`${m} 分钟`);
    if (s > 0 || parts.length === 0) parts.push(`${s} 秒`);
    return parts.join(' ');
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
    <div style={{ padding: '16px 0' }}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>显示</div>
        <div style={styles.toggleRow}>
          <span style={styles.label}>深色模式</span>
          <div
            style={{ ...styles.toggle, ...(settings.darkMode ? styles.toggleOn : {}) }}
            onClick={() => save({ darkMode: !settings.darkMode })}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>刷新间隔</div>
        <div style={{ padding: '0 16px 16px' }}>
          <Cascader
            value={initValues}
            options={CASCADE_OPTIONS}
            onChange={handleTimeChange}
            placeholder="选择刷新间隔"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            当前: {formatTime(totalSeconds)}
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>版本更新</div>
        <div style={{ padding: '0 16px 16px' }}>
          <button style={styles.btn} onClick={handleCheckUpdate} disabled={checking}>
            {checking ? '检查中...' : '检查更新'}
          </button>
          {updateError && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{updateError}</p>}
          {updateInfo && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '13px' }}>发现新版本: <strong>{updateInfo.version}</strong></p>
              <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer" style={{ color: '#1677ff', fontSize: '13px' }}>点击下载</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: { padding: '0 16px 16px', borderBottom: '1px solid #f0f0f0' },
  sectionTitle: { fontWeight: 'bold', marginBottom: '12px', fontSize: '15px' },
  label: { fontSize: '14px', color: '#333' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', background: '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' },
  toggleOn: { background: '#1677ff' },
  btn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer', fontSize: '14px' },
};
