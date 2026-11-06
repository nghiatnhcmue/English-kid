import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { store } from './utils/storage.js';
import { setSfxEnabled } from './utils/sfx.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => store().getSettings());

  useEffect(() => {
    setSfxEnabled(settings.sound);
  }, [settings.sound]);

  const update = useCallback((patch) => setSettings(store().saveSettings(patch)), []);

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
