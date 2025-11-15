import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import apiClient from '../api/client'; // Tu cliente de Axios
import { getPendingReports, removePendingReport } from '../utils/offlineStorage';

export const useReportSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncReports = async () => {
    if (isSyncing) return;

    const pendingReports = await getPendingReports();
    if (pendingReports.length === 0) return;

    setIsSyncing(true);
    console.log(`Iniciando sincronización de ${pendingReports.length} reportes...`);

    let successCount = 0;

    for (const report of pendingReports) {
      try {
        // AQUÍ DEBES ADAPTAR TU LLAMADA A LA API
        // Esto asume que tu 'report.data' ya tiene el formato correcto para tu backend.
        // Si envías imágenes, quizás necesites reconstruir el FormData aquí.
        await apiClient.post('/avistamientos', report.data);

        // Si tuvo éxito, lo borramos de la lista local
        await removePendingReport(report.id);
        successCount++;
      } catch (error) {
        console.error(`Error sincronizando reporte ${report.id}:`, error);
        // No lo borramos para reintentar después
      }
    }

    setIsSyncing(false);

    if (successCount > 0) {
       // Opcional: Notificar al usuario que se subieron cosas en segundo plano
       // ToastAndroid.show(`${successCount} reportes sincronizados`, ToastAndroid.SHORT);
       console.log(`${successCount} reportes sincronizados exitosamente.`);
    }
  };

  useEffect(() => {
    // Suscribirse a cambios de red
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Si volvemos a tener internet, intentamos sincronizar
        syncReports();
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    isSyncing,
    manualSync: syncReports // Por si quieres poner un botón de "Reintentar ahora"
  };
};