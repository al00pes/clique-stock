import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  whatsappNumber: string;
  setWhatsappNumber: (n: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [whatsappNumber, setWhatsappNumber] = useState('');

  return (
    <SettingsContext.Provider value={{ whatsappNumber, setWhatsappNumber }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
