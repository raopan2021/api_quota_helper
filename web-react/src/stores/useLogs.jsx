import { createContext, useContext, useState, useCallback } from 'react';

const LogsContext = createContext(null);
const MAX_SIZE = 50;

export function LogsProvider({ children }) {
  const [logs, setLogs] = useState([]);

  const log = useCallback(({ logType, username, requestBody, success, status, message, body, error }) => {
    setLogs(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      logType, username, requestBody, success, status, message, body, error
    }, ...prev].slice(0, MAX_SIZE));
  }, []);

  const clearByType = useCallback((type) => {
    setLogs(prev => prev.filter(l => l.logType !== type));
  }, []);

  const clear = useCallback(() => setLogs([]), []);

  const getTypes = useCallback(() => [...new Set(logs.map(l => l.logType))], [logs]);

  return (
    <LogsContext.Provider value={{ logs, log, clearByType, clear, getTypes }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
}
