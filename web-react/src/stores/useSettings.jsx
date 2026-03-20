import { createContext, useContext, useState, useCallback } from 'react';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'api_quota_settings';

const defaults = { darkMode: false, refreshIntervalSeconds: 300 };

function loadSettings() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return defaults; }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  const save = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, save }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
