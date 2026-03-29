/**
 * Logs 页面
 * 日志查看页面
 */
import { useState } from 'react';
import { useLogs } from '../stores/useLogs.jsx';

export default function Logs() {
  const { logs, clearByType, getTypes } = useLogs();
  const [selectedType, setSelectedType] = useState('额度查询');
  const [expanded, setExpanded] = useState(null);

  const types = getTypes();
  const filtered = logs.filter(l => l.logType === selectedType);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* 类型标签 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border: `1px solid ${selectedType === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: selectedType === t ? 'var(--color-primary)' : 'transparent',
              color: selectedType === t ? '#fff' : 'var(--color-text)',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.15s ease',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 空状态 */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}>
          暂无日志
        </div>
      )}

      {/* 日志列表 */}
      {filtered.map(log => (
        <div
          key={log.id}
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: '8px',
            margin: '8px 16px',
            padding: '12px',
            fontSize: '13px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {/* 日志头部 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {log.time} {log.logType}
            </span>
            <span style={{
              fontSize: '12px',
              color: log.success ? 'var(--color-success)' : 'var(--color-danger)',
            }}>
              {log.success ? '✅' : '❌'} {log.message}
            </span>
          </div>

          {/* 用户名 */}
          <div style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginTop: '4px',
          }}>
            {log.username}
          </div>

          {/* 展开详情 */}
          {expanded === log.id && (
            <div style={{
              marginTop: '10px',
              fontSize: '11px',
              color: 'var(--color-text)',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}>
              {log.requestBody && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>请求:</strong>
                  <pre style={{
                    margin: '4px 0 0',
                    padding: '8px',
                    background: 'var(--color-bg)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '150px',
                    fontSize: '11px',
                  }}>
                    {formatJson(log.requestBody)}
                  </pre>
                </div>
              )}
              {log.body && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>响应:</strong>
                  <pre style={{
                    margin: '4px 0 0',
                    padding: '8px',
                    background: 'var(--color-bg)',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '150px',
                    fontSize: '11px',
                  }}>
                    {formatJson(log.body)}
                  </pre>
                </div>
              )}
              {log.error && (
                <div style={{ color: 'var(--color-danger)' }}>
                  <strong>错误:</strong> {log.error}
                </div>
              )}
            </div>
          )}

          {/* 展开/收起按钮 */}
          <button
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            style={{
              marginTop: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: 0,
            }}
          >
            {expanded === log.id ? '收起' : '展开详情'}
          </button>
        </div>
      ))}

      {/* 清空按钮 */}
      {filtered.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={() => clearByType(selectedType)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-btn-bg)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            清空当前类型日志
          </button>
        </div>
      )}
    </div>
  );
}

// 格式化 JSON
function formatJson(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
