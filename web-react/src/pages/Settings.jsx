/**
 * Settings 页面
 * 设置页面：显示设置、定时刷新、关于
 */
import { useState, useEffect } from 'react';
import { useSettings } from '../stores/useSettings.jsx';
import { checkUpdate } from '../services/api.js';

export default function Settings() {
  const { settings, save } = useSettings();
  const [checking, setChecking] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);

  // 同步 darkMode 到 html 元素
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // 检查更新
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
    <div className="settings-wrap" style={{
      padding: '16px 0',
      background: 'var(--color-bg)',
      minHeight: '100vh',
    }}>
      {/* 显示设置 */}
      <div className="card" style={sectionStyle}>
        <div style={sectionTitleStyle}>显示</div>

        {/* 卡片大小 */}
        <div style={settingRowStyle}>
          <span style={{ color: 'var(--color-text)' }}>卡片大小</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'small', label: '小' },
              { key: 'medium', label: '中' },
              { key: 'large', label: '大' },
            ].map(item => (
              <button
                key={item.key}
                style={{
                  ...pickerBtnStyle,
                  background: settings.cardSize === item.key ? 'var(--color-primary)' : 'transparent',
                  color: settings.cardSize === item.key ? '#fff' : 'var(--color-text)',
                  borderColor: settings.cardSize === item.key ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                onClick={() => save({ cardSize: item.key })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 深色模式 */}
        <div style={settingRowStyle}>
          <span style={{ color: 'var(--color-text)' }}>深色模式</span>
          <div
            style={{
              ...toggleStyle,
              background: settings.darkMode ? 'var(--color-primary)' : '#ccc',
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

      {/* 定时刷新 */}
      <div className="card" style={sectionStyle}>
        <div style={sectionTitleStyle}>定时刷新</div>
        <div style={{ padding: '0 16px 16px' }}>
          <IntervalPicker
            value={settings.refreshIntervalSeconds || 300}
            onChange={v => save({ refreshIntervalSeconds: v })}
          />
        </div>
      </div>

      {/* 关于 */}
      <div className="card" style={sectionStyle}>
        <div style={sectionTitleStyle}>关于</div>
        <div style={{ padding: '0 16px 16px', color: 'var(--color-text)', fontSize: '13px', lineHeight: 1.8 }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>版本: </span>
            <strong>v1.0.0</strong>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>作者: </span>
            <strong>raopan</strong>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>开源: </span>
            <a
              href="https://github.com/raopan2021/api_quota_helper"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-primary)' }}
            >
              github.com/raopan2021/api_quota_helper
            </a>
          </div>
          <button
            style={btnStyle}
            onClick={handleCheckUpdate}
            disabled={checking}
          >
            {checking ? '检查中...' : '检查更新'}
          </button>
          {updateError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginTop: '8px' }}>
              {updateError}
            </p>
          )}
          {updateInfo && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text)' }}>
                发现新版本: <strong>{updateInfo.version}</strong>
              </p>
              <a
                href={updateInfo.downloadUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)', fontSize: '13px' }}
              >
                点击下载 →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 时间间隔选择器
function IntervalPicker({ value, onChange }) {
  const totalSeconds = value || 300;
  const [hours, setHours] = useState(Math.floor(totalSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((totalSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(totalSeconds % 60);

  function handleChange() {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total > 0) onChange(total);
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      {/* 小时 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>时</span>
        <select
          value={hours}
          onChange={e => { setHours(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={selectStyle}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
      <span style={{ color: 'var(--color-text)', fontSize: '18px', fontWeight: 'bold', marginTop: '16px' }}>:</span>
      {/* 分钟 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>分</span>
        <select
          value={minutes}
          onChange={e => { setMinutes(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={selectStyle}
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
      <span style={{ color: 'var(--color-text)', fontSize: '18px', fontWeight: 'bold', marginTop: '16px' }}>:</span>
      {/* 秒 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>秒</span>
        <select
          value={seconds}
          onChange={e => { setSeconds(parseInt(e.target.value)); }}
          onBlur={handleChange}
          style={selectStyle}
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
};

const sectionTitleStyle = {
  fontWeight: 'bold',
  marginBottom: '12px',
  fontSize: '15px',
  color: 'var(--color-text)',
};

const settingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid var(--color-border)',
};

const pickerBtnStyle = {
  padding: '6px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '13px',
  transition: 'all 0.15s ease',
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

const selectStyle = {
  width: '70px',
  height: '36px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  textAlign: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'var(--color-bg-card)',
  color: 'var(--color-text)',
};

const btnStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-btn-bg)',
  cursor: 'pointer',
  fontSize: '14px',
  color: 'var(--color-text)',
};
