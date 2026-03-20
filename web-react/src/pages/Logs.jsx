import { useState } from 'react';
import { useLogs } from '../stores/useLogs.jsx';

export default function Logs() {
  const { logs, clearByType, getTypes } = useLogs();
  const [selectedType, setSelectedType] = useState('额度查询');
  const [expanded, setExpanded] = useState(null);

  const types = getTypes();
  const filtered = logs.filter(l => l.logType === selectedType);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {types.map(t => (
          <button key={t} style={{ ...styles.tab, ...(selectedType === t ? styles.tabActive : {}) }} onClick={() => setSelectedType(t)}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>暂无日志</p>}

      {filtered.map(log => (
        <div key={log.id} style={styles.logEntry}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>{log.time} {log.logType}</span>
            <span style={{ fontSize: '12px', color: log.success ? '#4CAF50' : '#F44336' }}>
              {log.success ? '✅' : '❌'} {log.message}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{log.username}</div>
          {expanded === log.id && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', wordBreak: 'break-all' }}>
              <div><strong>请求:</strong> {log.requestBody}</div>
              {log.body && <div style={{ marginTop: '4px' }}><strong>响应:</strong> {log.body}</div>}
              {log.error && <div style={{ color: '#F44336', marginTop: '4px' }}><strong>错误:</strong> {log.error}</div>}
            </div>
          )}
          <button style={{ marginTop: '6px', background: 'none', border: 'none', color: '#1976D2', cursor: 'pointer', fontSize: '12px' }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
            {expanded === log.id ? '收起' : '展开详情'}
          </button>
        </div>
      ))}

      <div style={{ padding: '12px 16px' }}>
        <button style={styles.btn} onClick={() => clearByType(selectedType)}>清空当前类型日志</button>
      </div>
    </div>
  );
}

const styles = {
  tab: { padding: '4px 12px', borderRadius: '16px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '12px' },
  tabActive: { background: '#1976D2', color: '#fff', borderColor: '#1976D2' },
  logEntry: { background: '#fff', borderRadius: '8px', margin: '8px 16px', padding: '12px', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  btn: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' },
};
