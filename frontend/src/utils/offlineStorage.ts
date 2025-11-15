import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_REPORTS_KEY = '@dogland_pending_reports';

export interface PendingReport {
  id: string;
  timestamp: number;
  data: any; // Aquí iría tu interfaz del formulario de reporte
}

// Guardar un nuevo reporte en la cola
export const saveReportOffline = async (reportData: any) => {
  try {
    const existingReportsJson = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
    const existingReports: PendingReport[] = existingReportsJson ? JSON.parse(existingReportsJson) : [];

    const newReport: PendingReport = {
      id: Date.now().toString(), // ID temporal simple
      timestamp: Date.now(),
      data: reportData,
    };

    existingReports.push(newReport);
    await AsyncStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(existingReports));
    console.log('Reporte guardado offline:', newReport.id);
  } catch (error) {
    console.error('Error guardando reporte offline:', error);
    throw error;
  }
};

// Obtener todos los reportes pendientes
export const getPendingReports = async (): Promise<PendingReport[]> => {
  try {
    const reportsJson = await AsyncStorage.getItem(PENDING_REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error('Error obteniendo reportes offline:', error);
    return [];
  }
};

// Eliminar un reporte específico (usado después de subirlo con éxito)
export const removePendingReport = async (id: string) => {
  try {
    const reports = await getPendingReports();
    const filteredReports = reports.filter(report => report.id !== id);
    await AsyncStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(filteredReports));
  } catch (error) {
    console.error('Error eliminando reporte offline:', error);
  }
};