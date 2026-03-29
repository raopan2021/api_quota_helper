/**
 * AccountCard 组件
 * 账户卡片，显示账户信息和额度
 */
import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../stores/useSettings.jsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// 计算倒计时
function useCountdown(resetTime) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    if (!resetTime) return '';
    const diff = dayjs(resetTime).diff(dayjs());
    if (diff <= 0) return '已重置';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}小时${m}分${s}秒`;
  }, [resetTime, tick]);
}

// 格式化下次重置时间
function formatNextResetLabel(resetTime) {
  if (!resetTime) return '';
  try {
    const reset = dayjs(resetTime);
    const isTomorrow = reset.isAfter(dayjs().endOf('day'));
    const prefix = isTomorrow ? '明天 ' : '';
    const h = reset.hour();
    const m = reset.minute();
    const s = reset.second();
    const period = h < 6 ? '凌晨' : h < 12 ? '早上' : h < 18 ? '下午' : '晚上';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${prefix}${period}${hour12}点${m}分${s}秒`;
  } catch {
    return '';
  }
}

// 格式化相对时间
function formatLastUpdated(updatedAt, refreshInterval) {
  if (!updatedAt) return '';
  try {
    const intervalSec = refreshInterval || 300;
    return dayjs(updatedAt).add(intervalSec, 'second').fromNow();
  } catch {
    return '';
  }
}

// 上次更新时间 hook
function useLastUpdated(updatedAt, refreshInterval) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000); // 每30秒更新
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => formatLastUpdated(updatedAt, refreshInterval), [updatedAt, refreshInterval, tick]);
}

export default function AccountCard({ account, data: d, refreshing, onRefresh, onEdit, onDelete }) {
  const { settings } = useSettings();
  const darkMode = settings.darkMode;
  const cardSize = settings.cardSize || 'medium';

  // 卡片尺寸样式
  const sizeStyles = {
    small: { padding: '12px', gap: '6px', fontSize: '12px', spacing: '8px' },
    medium: { padding: '16px', gap: '8px', fontSize: '13px', spacing: '12px' },
    large: { padding: '20px', gap: '10px', fontSize: '14px', spacing: '16px' },
  };
  const sz = sizeStyles[cardSize] || sizeStyles.medium;

  const textColor = darkMode ? '#e0e0e0' : '#333';
  const metaColor = darkMode ? '#888' : '#888';
  const cardBg = darkMode ? '#2a2a2a' : '#fff';
  const borderColor = darkMode ? '#333' : '#eee';

  // 计算百分比
  const remainingPercent = d ? (d.remaining / d.amount * 100) : 0;
  const isLoading = !d && !d?.error;

  // 额度颜色
  const quotaColor = refreshing ? '#9E9E9E'
    : remainingPercent > 50 ? '#4CAF50'
    : remainingPercent > 20 ? '#FFC107'
    : '#F44336';

  // 天数颜色
  const daysColor = d?.daysRemaining > 10 ? '#4CAF50'
    : d?.daysRemaining > 3 ? '#FFC107'
    : '#F44336';

  // 倒计时
  const countdown = useCountdown(d?.nextResetTime);

  // 下次重置时间标签
  const nextResetLabel = useMemo(() => formatNextResetLabel(d?.nextResetTime), [d?.nextResetTime]);

  // 上次更新时间
  const lastUpdated = useLastUpdated(d?.updatedAt, settings.refreshIntervalSeconds);

  // 头像首字母
  const avatarLetter = account.username.charAt(0).toUpperCase();

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '12px',
    overflow: 'hidden',
    background: cardBg,
    padding: `0 0 ${sz.padding} 0`,
  };

  const headerStyle = {
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
    background: quotaColor + '20',
    color: quotaColor,
  };

  const percentBadgeStyle = {
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '15px',
    background: quotaColor + '18',
    color: quotaColor,
  };

  const quotaRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: sz.fontSize,
    marginTop: sz.gap,
  };

  const progressTrackStyle = {
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    background: darkMode ? '#333' : '#eee',
    marginTop: sz.gap,
  };

  const footerRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: sz.gap,
  };

  const btnStyle = {
    background: 'none',
    border: `1px solid ${borderColor}`,
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: `${parseInt(sz.fontSize) - 1}px`,
    color: textColor,
  };

  const errorStyle = {
    color: '#F44336',
    fontSize: '13px',
    marginTop: '8px',
  };

  return (
    <div style={cardStyle}>
      {/* 状态条 */}
      <div style={{
        height: refreshing ? '6px' : '4px',
        borderRadius: '4px 4px 0 0',
        margin: `-${sz.padding} -${sz.padding} 0 -${sz.padding}`,
        background: quotaColor,
        overflow: 'hidden',
      }}>
        {refreshing && (
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${quotaColor}40 0%, ${quotaColor} 50%, ${quotaColor}40 100%)`,
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s ease-in-out infinite',
          }} />
        )}
      </div>

      <div style={{ padding: `0 ${sz.padding}` }}>
        {/* 头部：头像 + 用户名 + 百分比徽章 */}
        <div style={headerStyle}>
          <div style={userInfoStyle}>
            <div style={avatarStyle}>{avatarLetter}</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: sz.fontSize, color: textColor }}>
                {account.username}
              </div>
              {d?.planName && (
                <div style={{ fontSize: `${parseInt(sz.fontSize) - 2}px`, color: metaColor }}>
                  {d.planName}
                  {d.daysRemaining != null && (
                    <span style={{ color: daysColor, marginLeft: '4px' }}>
                      · 剩余 {d.daysRemaining} 天
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {d ? (
            <div style={percentBadgeStyle}>
              {remainingPercent.toFixed(1)}%
            </div>
          ) : isLoading ? (
            <div style={{ ...percentBadgeStyle, background: '#9E9E9E18', color: '#9E9E9E' }}>
              加载中
            </div>
          ) : null}
        </div>

        {/* 错误提示 */}
        {d?.error && (
          <div style={errorStyle}>{d.error}</div>
        )}

        {/* 额度信息 */}
        {d && !d.error && (
          <>
            <div style={quotaRowStyle}>
              <div>
                <div style={{ color: metaColor }}>已用额度</div>
                <div style={{ fontWeight: 'bold', color: textColor }}>
                  {d.amountUsed?.toFixed(1)}
                </div>
              </div>
              <div>
                <div style={{ color: metaColor }}>总额度</div>
                <div style={{ fontWeight: 'bold', color: textColor }}>
                  {d.amount?.toFixed(1)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: metaColor }}>剩余额度</div>
                <div style={{ fontWeight: 'bold', color: quotaColor }}>
                  {d.remaining?.toFixed(1)}
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div style={progressTrackStyle}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, remainingPercent)}%`,
                background: quotaColor,
                borderRadius: '4px',
                transition: 'width 0.3s',
              }} />
            </div>

            {/* 底部：距重置时间 + 下次重置时间 */}
            <div style={footerRowStyle}>
              {countdown && (
                <div style={{ fontSize: '12px', color: metaColor }}>
                  距重置: <span style={{ color: '#1976D2', fontWeight: 500 }}>{countdown}</span>
                </div>
              )}
              {nextResetLabel && (
                <div style={{ fontSize: '12px', color: metaColor }}>
                  下次重置: <span style={{ color: '#1976D2', fontWeight: 500 }}>{nextResetLabel}</span>
                </div>
              )}
            </div>

            {/* 上次更新时间 */}
            {lastUpdated && (
              <div style={{ fontSize: '11px', color: metaColor, marginTop: '4px' }}>
                ~ {lastUpdated} 自动更新
              </div>
            )}
          </>
        )}

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button style={btnStyle} onClick={onRefresh} disabled={refreshing}>
            {refreshing ? '刷新中' : '刷新'}
          </button>
          <button style={btnStyle} onClick={onEdit}>编辑</button>
          <button style={{ ...btnStyle, color: '#F44336' }} onClick={onDelete}>删除</button>
        </div>
      </div>

      {/* 加载动画 */}
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
