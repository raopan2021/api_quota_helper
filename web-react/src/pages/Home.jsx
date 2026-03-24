import { useState, useEffect, useRef } from 'react';
import { useAccounts } from '../stores/useAccounts.jsx';
import { useSettings } from '../stores/useSettings.jsx';

export default function Home({ onEdit }) {
  const { accounts, accountData, refreshAll, deleteAccount } = useAccounts();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && Object.keys(accountData).length === 0) {
      refreshAll();
    }
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  const bg = settings.darkMode ? '#1a1a1a' : '#f5f5f5';
  const textColor = settings.darkMode ? '#e0e0e0' : '#333';
  const metaColor = settings.darkMode ? '#888' : '#888';

  // Card size styles
  const cardSizes = {
    small: { padding: '12px', gap: '6px', fontSize: '12px', spacing: '8px' },
    medium: { padding: '16px', gap: '8px', fontSize: '13px', spacing: '12px' },
    large: { padding: '20px', gap: '10px', fontSize: '14px', spacing: '16px' },
  };
  const sz = cardSizes[settings.cardSize] || cardSizes.medium;

  if (accounts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999', fontSize: '15px' }}>
        <p>暂无账户</p>
        <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbb' }}>点击上方 + 添加账户</p>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: `${sz.spacing} 0` }}>
      {accounts.map(acc => {
        const d = accountData[acc.id];
        return (
          <div key={acc.id} style={cardWrapStyle}>
            <AccountCard
              acc={acc}
              d={d}
              refreshing={refreshing}
              settings={settings}
              onRefresh={handleRefresh}
              onEdit={() => onEdit(acc)}
              onDelete={() => deleteAccount(acc.id)}
              sz={sz}
            />
          </div>
        );
      })}
    </div>
  );
}

function AccountCard({ acc, d, refreshing, settings, onRefresh, onEdit, onDelete, sz }) {
  const textColor = settings.darkMode ? '#e0e0e0' : '#333';
  const metaColor = settings.darkMode ? '#888' : '#888';
  const cardBg = settings.darkMode ? '#2a2a2a' : '#fff';
  const borderColor = settings.darkMode ? '#333' : '#eee';

  const remainingPercent = d ? (d.remaining / d.amount * 100) : 0;
  const isLoading = !d && !d?.error;

  // Quota color based on remaining percentage
  const quotaColor = refreshing ? '#9E9E9E'
    : remainingPercent > 50 ? '#4CAF50'
    : remainingPercent > 20 ? '#FFC107'
    : '#F44336';

  // Days color
  const daysColor = d?.days_remaining > 10 ? '#4CAF50'
    : d?.days_remaining > 3 ? '#FFC107'
    : '#F44336';

  return (
    <div style={{ ...cardStyle, background: cardBg, padding: sz.padding }}>
      {/* Status bar */}
      <div style={{
        height: refreshing ? '6px' : '4px',
        borderRadius: '4px 4px 0 0',
        margin: `-${sz.padding} -${sz.padding} 0 -${sz.padding}`,
        background: quotaColor,
        overflow: 'hidden',
      }}>
        {refreshing && <div style={loadingBarStyle(quotaColor)} />}
      </div>

      <div style={{ padding: '0 4px' }}>
        {/* Header: avatar + username + percent badge */}
        <div style={headerRowStyle}>
          <div style={userInfoStyle}>
            <div style={{ ...avatarStyle, background: quotaColor + '20', color: quotaColor }}>
              {acc.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ ...usernameStyle, color: textColor, fontSize: sz.fontSize }}>{acc.username}</div>
              {d?.planName && (
                <div style={{ fontSize: `${parseInt(sz.fontSize) - 2}px`, color: metaColor }}>
                  {d.planName}
                  {d.days_remaining != null && (
                    <span style={{ color: daysColor, marginLeft: '4px' }}>· 剩余 {d.days_remaining} 天</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {d ? (
            <div style={{ ...percentBadgeStyle, background: quotaColor + '15', color: quotaColor }}>
              {remainingPercent.toFixed(1)}%
            </div>
          ) : isLoading ? (
            <div style={{ ...percentBadgeStyle, background: '#9E9E9E15', color: '#9E9E9E' }}>
              <span style={loadingDotsStyle}>加载中</span>
            </div>
          ) : null}
        </div>

        {/* Error */}
        {d?.error && (
          <div style={errorStyle}>{d.error}</div>
        )}

        {/* Quota info */}
        {d && !d.error && (
          <>
            <div style={{ ...quotaRowStyle, fontSize: sz.fontSize, marginTop: sz.gap }}>
              <div style={quotaItemStyle}>
                <div style={{ color: metaColor }}>已用额度</div>
                <div style={{ fontWeight: 'bold', color: textColor }}>{d.amountUsed?.toFixed(1)}</div>
              </div>
              <div style={quotaItemStyle}>
                <div style={{ color: metaColor }}>总额度</div>
                <div style={{ fontWeight: 'bold', color: textColor }}>{d.amount?.toFixed(1)}</div>
              </div>
              <div style={{ ...quotaItemStyle, textAlign: 'right' }}>
                <div style={{ color: metaColor }}>剩余额度</div>
                <div style={{ fontWeight: 'bold', color: quotaColor }}>{d.remaining?.toFixed(1)}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ ...progressTrackStyle, background: settings.darkMode ? '#333' : '#eee', marginTop: sz.gap }}>
              <div style={{
                ...progressFillStyle,
                width: `${Math.min(100, remainingPercent)}%`,
                background: quotaColor
              }} />
            </div>

            {/* Footer: update time + countdown */}
            <div style={{ ...footerRowStyle, marginTop: sz.gap }}>
              <CountdownTimer resetTime={d.nextResetTime} darkMode={settings.darkMode} />
            </div>
          </>
        )}

        {/* Actions */}
        <div style={actionsRowStyle}>
          <button
            style={{ ...btnStyle, borderColor, color: textColor, fontSize: `${parseInt(sz.fontSize) - 1}px` }}
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? '刷新中' : '刷新'}
          </button>
          <button
            style={{ ...btnStyle, borderColor, color: textColor, fontSize: `${parseInt(sz.fontSize) - 1}px` }}
            onClick={onEdit}
          >
            编辑
          </button>
          <button
            style={{ ...btnStyle, borderColor, color: '#F44336', fontSize: `${parseInt(sz.fontSize) - 1}px` }}
            onClick={onDelete}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ resetTime, darkMode }) {
  const [countdown, setCountdown] = useState('');
  const textColor = darkMode ? '#888' : '#888';

  useEffect(() => {
    if (!resetTime) {
      setCountdown('');
      return;
    }

    function calculate() {
      try {
        const sdf = new Date(resetTime.replace(/\//g, '/'));
        const diff = sdf.getTime() - Date.now();
        if (diff <= 0) {
          setCountdown('已重置');
          return;
        }
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${h}小时${m}分${s}秒`);
      } catch {
        setCountdown('');
      }
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [resetTime]);

  if (!countdown) return null;

  return (
    <div style={{ fontSize: '12px', color: textColor }}>
      距重置: <span style={{ color: '#1976D2' }}>{countdown}</span>
    </div>
  );
}

const cardWrapStyle = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '0 16px',
};

const cardStyle = {
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  marginBottom: '12px',
  overflow: 'hidden',
};

const headerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '12px',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px',
};

const usernameStyle = {
  fontWeight: 'bold',
  fontSize: '16px',
};

const percentBadgeStyle = {
  padding: '6px 12px',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '15px',
};

const loadingDotsStyle = {
  fontSize: '12px',
  fontWeight: 'normal',
};

const quotaRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
};

const quotaItemStyle = {
  textAlign: 'left',
};

const progressTrackStyle = {
  height: '8px',
  borderRadius: '4px',
  overflow: 'hidden',
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s',
};

const footerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const errorStyle = {
  color: '#F44336',
  fontSize: '13px',
  marginTop: '8px',
};

const actionsRowStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
  marginTop: '12px',
};

const btnStyle = {
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: '12px',
};

function loadingBarStyle(color) {
  return {
    height: '100%',
    background: `linear-gradient(90deg, ${color}40 0%, ${color} 50%, ${color}40 100%)`,
    backgroundSize: '200% 100%',
    animation: 'loading 1.5s ease-in-out infinite',
  };
}
