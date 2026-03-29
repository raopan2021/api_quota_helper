/**
 * AddEditModal 组件
 * 添加/编辑账户弹窗
 */
import { useState, useEffect } from 'react';
import { useSettings } from '../stores/useSettings.jsx';

export default function AddEditModal({ show, editing, onClose, onSave }) {
  const { settings } = useSettings();
  const darkMode = settings.darkMode;

  const [localUsername, setLocalUsername] = useState('');
  const [localToken, setLocalToken] = useState('');
  const [error, setError] = useState('');
  const [recognizeResult, setRecognizeResult] = useState(null);
  const [recognizeText, setRecognizeText] = useState('');

  // 监听 show 变化，重置表单
  useEffect(() => {
    if (show) {
      if (editing) {
        setLocalUsername(editing.username || '');
        setLocalToken(editing.token || '');
      } else {
        setLocalUsername('');
        setLocalToken('');
      }
      setError('');
      setRecognizeResult(null);
      setRecognizeText('');
    }
  }, [show, editing]);

  // 解析账户信息
  function parseAccount(text) {
    if (!text) return null;
    const apiKey = text.match(/API Key[：:]\s*(\S+)/)?.[1] || text.match(/(sk-[\w-]+)/)?.[1];
    const username = text.match(/账户[：:]\s*(\S+)/)?.[1] || text.match(/用户名[：:]\s*(\S+)/)?.[1];
    if (apiKey && username) return { username, token: apiKey };
    return null;
  }

  // 自动识别
  async function handleAutoRecognize() {
    let text = recognizeText.trim();
    if (!text) {
      try {
        text = await navigator.clipboard.readText();
      } catch {
        setRecognizeResult({ ok: false, message: '读取剪贴板失败，请手动粘贴' });
        setTimeout(() => setRecognizeResult(null), 3000);
        return;
      }
    }
    const result = parseAccount(text);
    if (result) {
      setLocalUsername(result.username);
      setLocalToken(result.token);
      setRecognizeResult({ ok: true, message: `识别成功：${result.username}` });
    } else {
      const m = text.match(/(sk-[\w-]+)/);
      if (m) {
        setLocalToken(m[1]);
        setRecognizeResult({ ok: true, message: '已提取 Token，请补充用户名' });
      } else {
        setRecognizeResult({ ok: false, message: '无法识别，请手动输入' });
      }
    }
    setTimeout(() => setRecognizeResult(null), 3000);
  }

  // 保存
  function handleSave() {
    setError('');
    const u = localUsername.trim();
    const t = localToken.trim();
    if (!u) { setError('用户名不能为空'); return; }
    if (!t) { setError('Token不能为空'); return; }
    onSave({ username: u, token: t });
  }

  if (!show) return null;

  const modalStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  };

  const contentStyle = {
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '360px',
    background: darkMode ? '#2a2a2a' : '#fff',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    marginBottom: '4px',
    marginTop: '12px',
    color: darkMode ? '#aaa' : '#666',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: darkMode ? '#333' : '#fafafa',
    color: darkMode ? '#e0e0e0' : '#333',
    outline: 'none',
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    background: darkMode ? '#333' : '#fafafa',
    color: darkMode ? '#e0e0e0' : '#333',
    fontFamily: 'monospace',
    resize: 'none',
    lineHeight: '1.5',
    display: 'block',
    outline: 'none',
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '16px 0 12px',
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    background: darkMode ? '#444' : '#eee',
  };

  const dividerTextStyle = {
    fontSize: '12px',
    color: darkMode ? '#666' : '#999',
    whiteSpace: 'nowrap',
  };

  const recognizeBtnStyle = {
    width: '100%',
    marginTop: '8px',
    padding: '8px 14px',
    border: `1px solid #1677ff`,
    borderRadius: '8px',
    background: '#f0f7ff',
    color: '#1677ff',
    cursor: 'pointer',
    fontSize: '13px',
  };

  const cancelBtnStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
    background: darkMode ? '#333' : '#f5f5f5',
    color: darkMode ? '#e0e0e0' : '#333',
    fontSize: '14px',
  };

  const saveBtnStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    background: '#1976D2',
    color: '#fff',
    fontSize: '14px',
  };

  const recognizeResultStyle = {
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '6px',
    marginTop: '8px',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', color: darkMode ? '#e0e0e0' : '#333' }}>
          {editing ? '编辑账户' : '添加账户'}
        </h3>

        <label style={labelStyle}>用户名</label>
        <input
          style={inputStyle}
          value={localUsername}
          onChange={e => setLocalUsername(e.target.value)}
          placeholder="输入或粘贴用户名"
        />

        <label style={labelStyle}>Token</label>
        <input
          style={{ ...inputStyle, fontFamily: 'monospace' }}
          value={localToken}
          onChange={e => setLocalToken(e.target.value)}
          placeholder="粘贴 Token，sk-xxxx"
        />

        <div style={dividerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>或从剪贴板自动识别</span>
          <div style={dividerLineStyle} />
        </div>

        <textarea
          style={textareaStyle}
          value={recognizeText}
          onChange={e => setRecognizeText(e.target.value)}
          placeholder="粘贴包含用户名和 Token 的混合文本，点击识别自动填充上方字段"
          rows={3}
        />
        <button style={recognizeBtnStyle} onClick={handleAutoRecognize}>
          🎯 自动识别并填充上方
        </button>

        {recognizeResult && (
          <div style={{
            ...recognizeResultStyle,
            background: recognizeResult.ok ? '#E8F5E9' : '#FFEBEE',
            color: recognizeResult.ok ? '#2E7D32' : '#C62828',
          }}>
            {recognizeResult.message}
          </div>
        )}

        {error && (
          <p style={{ color: '#F44336', fontSize: '13px', marginTop: '8px' }}>{error}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button style={cancelBtnStyle} onClick={onClose}>取消</button>
          <button style={saveBtnStyle} onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
