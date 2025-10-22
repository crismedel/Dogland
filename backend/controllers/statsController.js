import pool from '../db/db.js';

export const getReportStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*)::int FROM avistamiento) AS total_reports,
                (SELECT COUNT(*)::int FROM avistamiento WHERE id_estado_salud = 3) AS critical_reports,
                (SELECT COUNT(*)::int FROM avistamiento WHERE id_estado_avistamiento = 1) AS active_reports
        `);


        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron estadísticas.' });
        }

        const stats = result.rows[0];

        res.status(200).json({ 
            success: true, 
            data: {
                totalReports: stats.total_reports,
                criticalReports: stats.critical_reports,
                activeReports: stats.active_reports,
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de resumen:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener estadísticas.' });
    }
};

export const getReportsByHealthState = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT es.estado_salud AS nombre, COUNT(av.id_avistamiento)::int AS total
            FROM estado_salud es
            LEFT JOIN avistamiento av ON es.id_estado_salud = av.id_estado_salud
            GROUP BY es.estado_salud
            ORDER BY total DESC;
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener reportes por estado de salud:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener estadísticas por estado de salud.' });
    }
};

export const getReportsBySpecies = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.nombre_especie AS nombre, COUNT(av.id_avistamiento)::int AS total
            FROM especie e
            LEFT JOIN avistamiento av ON e.id_especie = av.id_especie
            GROUP BY e.nombre_especie
            ORDER BY total DESC;
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener reportes por especie:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener estadísticas por especie.' });
    }
};

export const getHeatmapData = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                -- Extraemos las coordenadas
                ST_Y(ubicacion::geometry) AS latitude,
                ST_X(ubicacion::geometry) AS longitude,
                -- Incluimos el ID de estado de salud para que el frontend pueda ponderar el peso (weight)
                id_estado_salud
            FROM
                avistamiento
            -- Opcional: solo avistamientos activos o no resueltos
            WHERE 
                id_estado_avistamiento IN (1, 2) OR id_estado_salud > 1 
            -- Aseguramos que la ubicación no sea nula para el mapa
            AND ubicacion IS NOT NULL;
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron datos de ubicación para el mapa de calor.' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener datos del Mapa de Calor:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener datos para el Mapa de Calor.' });
    }
};