// src/hooks/useAutoRefresh.ts
import { useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRefresh } from '@/src/contexts/RefreshContext';

type UseAutoRefreshOptions = {
  // Identificador único del recurso a refrescar (usa REFRESH_KEYS)
  key: string;
  // Función que recarga los datos (envolver en useCallback)
  onRefresh: () => void | Promise<void>;
  // Refrescar al volver el foco a la pantalla (default: true)
  refreshOnFocus?: boolean;
  // Refrescar al montar el componente (default: true)
  refreshOnMount?: boolean;
};

export const useAutoRefresh = ({
  key,
  onRefresh,
  refreshOnFocus = true,
  refreshOnMount = true,
}: UseAutoRefreshOptions) => {
  const { refreshTriggers } = useRefresh();
  // Evita doble ejecución en el primer render cuando hay focus + mount
  const isFirstMount = useRef(true);

  // 1) Carga inicial (opcional)
  useEffect(() => {
    if (refreshOnMount && isFirstMount.current) {
      isFirstMount.current = false;
      onRefresh();
    }
  }, [refreshOnMount]);

  // 2) Responde a triggerRefresh(key) (pub/sub)
  useEffect(() => {
    if (refreshTriggers[key] && !isFirstMount.current) {
      onRefresh();
    }
  }, [refreshTriggers[key], key]);

  // 3) Refresca al recuperar el foco (opcional)
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus && !isFirstMount.current) {
        onRefresh();
      }
    }, [refreshOnFocus]),
  );
};
