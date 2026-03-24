import { useState } from 'react';
import { useSettings } from '../stores/useSettings.jsx';
import { checkUpdate } from '../services/api.js';

export default function Settings() {
  const { settings, save } = useSettings();
  const [checking, setChecking] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);

  const bg = settings.darkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBg = settings.darkMode ? '#2a2a2a' : '#fff';
  const textColor = settings.darkMode ? '#e0e0e0' : '#333';
  const borderColor = settings.darkMode ? '#333' : '#eee';
  const metaColor = settings.darkMode ? '#888' : '#888';

  async function handleCheckUpdate() {
    setChecking(true);
    setUpdateError('');
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
    <div style={{ padding: '16px 0', background: bg, minHeight: '100vh' }}>
      {/* 显示设置 */}
      <div style={{ ...sectionStyle, background: cardBg }}>
        <div style={{ ...sectionTitleStyle, color: textColor }}>显示</div>

        {/* 卡片大小 */}
        <div style={settingRowStyle}>
          <span style={{ color: textColor }}>卡片大小</span>
          <div style={pickerGroupStyle}>
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                style={{
                  ...pickerBtnStyle,
                  background: settings.cardSize === size ? '#1677ff' : 'transparent',
                  color: settings.cardSize === size ? '#fff' : textColor,
                  borderColor: settings.cardSize === size ? '#1677ff' : borderColor,
                }}
                onClick={() => save({ cardSize: size })}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 深色模式 */}
        <div style={settingRowStyle}>
          <span style={{ color: textColor }}>深色模式</span>
          <div
            style={{
              ...toggleStyle,
              background: settings.darkMode ? '#1677ff' : '#ccc',
            }}
            onClick={() => save({ darkMode: !settings.darkMode })}
          >
            <div style={{
              ...toggleKnobStyle,
              left: settings.darkMode ? '22px' : '2px',
            }} />
          </div>
        </div>
      </div>

      {/* 刷新间隔 */}
      <div style={{ ...sectionStyle, background: cardBg }}>
        <div style={{ ...sectionTitleStyle, color: textColor }}>定时刷新</div>
        <div style={refreshIntervalStyle}>
          <IntervalPicker
            value={settings.refreshIntervalSeconds || 300}
            onChange={v => save({ refreshIntervalSeconds: v })}
            darkMode={settings.darkMode}
          />
        </div>
      </div>

      {/* 版本更新 */}
      <div style={{ ...sectionStyle, background: cardBg }}>
        <div style={{ ...sectionTitleStyle, color: textColor }}>关于</div>
        <div style={{ padding: '0 16px 16px' }}>
          <button style={btnStyle} onClick={handleCheckUpdate} disabled={checking}>
            {checking ? '检查中...' : '检查更新'}
          </button>
          {updateError && <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{updateError}</p>}
          {updateInfo && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: textColor }}>发现新版本: <strong>{updateInfo.version}</strong></p>
              <a href={updateInfo.downloadUrl} target="_blank" rel="noreferrer" style={{ color: '#1677ff', fontSize: '13px' }}>点击下载</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntervalPicker({ value, onChange, darkMode }) {
  const totalSeconds = value || 300;
  const [hours, setHours] = useState(Math.floor(totalSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((totalSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(totalSeconds % 60);

  function handleChange() {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total > 0) onChange(total);
  }

  const borderColor = darkMode ? '#444' : '#ddd';
  const textColor = darkMode ? '#e0e0e0' : '#333';
  const bgColor = darkMode ? '#1a1a1a' : '#fff';

  return (
    <div style={intervalContainerStyle}>
      <div style={intervalUnitStyle}>
        <div style={{ ...intervalLabelStyle, color: textColor }}>时</div>
        <select
          value={hours}
          onChange={e => { setHours(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={{ ...selectStyle, borderColor, color: textColor, background: bgColor }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
      <span style={{ color: textColor, fontSize: '18px', fontWeight: 'bold' }}>:</span>
      <div style={intervalUnitStyle}>
        <div style={{ ...intervalLabelStyle, color: textColor }}>分</div>
        <select
          value={minutes}
          onChange={e => { setMinutes(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={{ ...selectStyle, borderColor, color: textColor, background: bgColor }}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
      <span style={{ color: textColor, fontSize: '18px', fontWeight: 'bold' }}>:</span>
      <div style={intervalUnitStyle}>
        <div style={{ ...intervalLabelStyle, color: textColor }}>秒</div>
        <select
          value={seconds}
          onChange={e => { setSeconds(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={{ ...selectStyle, borderColor, color: textColor, background: bgColor }}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const sectionStyle = {
  maxWidth: '480px',
  margin: '0 auto 12px',
  padding: '16px',
  borderRadius: '12px',
};

const sectionTitleStyle = {
  fontWeight: 'bold',
  marginBottom: '12px',
  fontSize: '15px',
};

const settingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #f0f0f0',
};

const pickerGroupStyle = {
  display: 'flex',
  gap: '4px',
};

const pickerBtnStyle = {
  padding: '6px 14px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '13px',
};

const toggleStyle = {
  width: '44px',
  height: '24px',
  borderRadius: '12px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const toggleKnobStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#fff',
  position: 'absolute',
  top: '2px',
  transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

const refreshIntervalStyle = {
  padding: '0 16px 16px',
};

const intervalContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const intervalUnitStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const intervalLabelStyle = {
  fontSize: '12px',
  marginBottom: '4px',
};

const selectStyle = {
  width: '70px',
  height: '36px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  textAlign: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const btnStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #d9d9d9',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};
