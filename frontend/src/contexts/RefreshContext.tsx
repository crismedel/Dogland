// src/contexts/RefreshContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

type RefreshContextType = {
  refreshTriggers: Record<string, number>;
  triggerRefresh: (key: string) => void;
  useRefreshEffect: (key: string, callback: () => void | Promise<void>) => void;
};

const RefreshContext = createContext<RefreshContextType | null>(null);

export const useRefresh = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error('useRefresh must be used within RefreshProvider');
  return ctx;
};

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [refreshTriggers, setRefreshTriggers] = useState<
    Record<string, number>
  >({});

  // Dispara un refresh para una key (usa timestamp para garantizar cambio)
  const triggerRefresh = useCallback((key: string) => {
    setRefreshTriggers((prev) => ({
      ...prev,
      [key]: Date.now(),
    }));
  }, []);

  // Efecto auxiliar opcional basado en key
  const useRefreshEffect = useCallback(
    (key: string, callback: () => void | Promise<void>) => {
      React.useEffect(() => {
        if (refreshTriggers[key]) callback();
      }, [refreshTriggers[key]]);
    },
    [refreshTriggers],
  );

  return (
    <RefreshContext.Provider
      value={{ refreshTriggers, triggerRefresh, useRefreshEffect }}
    >
      {children}
    </RefreshContext.Provider>
  );
};
