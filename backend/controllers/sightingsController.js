import pool from '../db/db.js';

// --- FUNCIONES DE LECTURA (GET) ---

// Función para obtener todos los avistamientos con fotos
export const getSightings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                -- Expande la geometría a Longitude y Latitude
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                
                -- Agrupa todas las URLs de fotos en un array JSON
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
            GROUP BY av.id_avistamiento
            ORDER BY av.fecha_creacion DESC
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener los avistamientos:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener avistamientos.' });
    }
};


// Función para obtener un avistamiento por ID con fotos
export const getSightingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                -- Expande la geometría a Longitude y Latitude
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                
                -- Agrupa todas las URLs de fotos en un array JSON
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener el avistamiento:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener el avistamiento.' });
    }
};



// --- FUNCIÓN DE ESCRITURA (POST) ---

export const createSighting = async (req, res) => {
    try {
        const {
            id_usuario,
            id_estado_avistamiento,
            id_estado_salud,
            id_especie,
            descripcion,
            ubicacion, // { longitude, latitude }
            direccion,
            url, // URL de la foto
        } = req.body;

        if (!id_usuario || !id_estado_avistamiento || !id_estado_salud || !id_especie) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }

        // 1. Crear el avistamiento
        const result = await pool.query(
            `
            INSERT INTO avistamiento 
            (id_usuario, id_estado_avistamiento, id_estado_salud, id_especie, descripcion, ubicacion, direccion) 
            VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8) 
            RETURNING *
            `,
            [
                id_usuario,
                id_estado_avistamiento,
                id_estado_salud,
                id_especie,
                descripcion,
                ubicacion.longitude,
                ubicacion.latitude,
                direccion,
            ]
        );

        const avistamiento = result.rows[0];

        // 2. Insertar foto
        if (url) {
            await pool.query(
                `
                INSERT INTO avistamiento_foto (id_avistamiento, url)
                VALUES ($1, $2)
                `,
                [avistamiento.id_avistamiento, url]
            );
        }
        
        // 3. Volvemos a consultar el avistamiento completo para devolver la respuesta
        const finalResult = await pool.query(`
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                -- Expande la geometría a Longitude y Latitude
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                
                -- Agrupa todas las URLs de fotos en un array JSON
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento
        `, [avistamiento.id_avistamiento]);
        
        const fullSighting = finalResult.rows[0];

        res.status(201).json({ success: true, data: fullSighting });
    } catch (error) {
        console.error('Error al crear el avistamiento:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al crear el avistamiento.' });
    }
};



// --- FUNCIONES DE ACTUALIZACIÓN Y ELIMINACIÓN ---

export const updateSighting = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_estado_avistamiento,
            id_estado_salud,
            id_especie,
            descripcion,
            ubicacion,
            direccion,
            url, // URL de la foto
        } = req.body;

        // 1. Actualizar el avistamiento principal
        const result = await pool.query(
            `
            UPDATE avistamiento 
            SET id_estado_avistamiento = COALESCE($1, id_estado_avistamiento),
                id_estado_salud = COALESCE($2, id_estado_salud),
                id_especie = COALESCE($3, id_especie),
                descripcion = COALESCE($4, descripcion),
                ubicacion = COALESCE(ST_SetSRID(ST_MakePoint($5, $6), 4326), ubicacion),
                direccion = COALESCE($7, direccion),
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_avistamiento = $8
            RETURNING *
            `,
            [
                id_estado_avistamiento,
                id_estado_salud,
                id_especie,
                descripcion,
                ubicacion ? ubicacion.longitude : null,
                ubicacion ? ubicacion.latitude : null,
                direccion,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
        }

        // 2. Actualizar/insertar foto
        if (url) {
            const updatePhoto = await pool.query(
                `
                UPDATE avistamiento_foto
                SET url = $1
                WHERE id_avistamiento = $2
                RETURNING *
                `,
                [url, id]
            );

            // Si no hay foto asociada, inserta la nueva foto
            if (updatePhoto.rowCount === 0) {
                await pool.query(
                    `
                    INSERT INTO avistamiento_foto (id_avistamiento, url)
                    VALUES ($1, $2)
                    `,
                    [id, url]
                );
            }
        }
        
        // 3. Volvemos a consultar el avistamiento completo 
        const finalResult = await pool.query(`
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                -- Expande la geometría a Longitude y Latitude
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                
                -- Agrupa todas las URLs de fotos en un array JSON
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento
        `, [id]);
        
        const fullSighting = finalResult.rows[0];

        res.status(200).json({ success: true, data: fullSighting });
    } catch (error) {
        console.error('Error al actualizar el avistamiento:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al actualizar el avistamiento.' });
    }
};



export const deleteSighting = async (req, res) => {
    try {
        const { id } = req.params;

        // Primero eliminamos la foto asociada (para evitar errores de clave foránea)
        await pool.query('DELETE FROM avistamiento_foto WHERE id_avistamiento = $1', [id]);

        // Luego eliminamos el avistamiento
        const result = await pool.query(
            'DELETE FROM avistamiento WHERE id_avistamiento = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Avistamiento y su foto eliminados correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar el avistamiento:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al eliminar el avistamiento.' });
    }
};



// --- FUNCIONES DE UBICACIÓN Y FILTRO ---

export const getSightingsByLocation = async (req, res) => {
    try {
        const { longitude, latitude, distance } = req.query;

        if (!longitude || !latitude || !distance) {
            return res.status(400).json({ success: false, error: 'Faltan parámetros: longitud, latitud y distancia son requeridos' });
        }

        const result = await pool.query(
            `
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                -- Expande la geometría a Longitude y Latitude
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                
                -- Agrupa todas las URLs de fotos en un array JSON
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
            WHERE ST_DWithin(av.ubicacion, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
            GROUP BY av.id_avistamiento
            `,
            [longitude, latitude, distance]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos cerca de esta ubicación' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener avistamientos por ubicación:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al filtrar por ubicación.' });
    }
};



export const filterSightings = async (req, res) => {
    try {
        const { id_especie, id_estado_salud, id_estado_avistamiento } = req.query;

        const filters = [];
        const values = [];
        
        // La consulta base se define aquí dentro, sin joins a tablas externas
        let query = `
            SELECT 
                av.id_avistamiento, 
                av.id_usuario, 
                av.id_estado_avistamiento, 
                av.id_estado_salud, 
                av.id_especie, 
                av.fecha_creacion, 
                av.fecha_actualizacion, 
                av.descripcion, 
                av.direccion,
                ST_X(av.ubicacion::geometry) AS longitude,
                ST_Y(av.ubicacion::geometry) AS latitude,
                COALESCE(
                    json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
                    '[]'
                ) AS fotos_url
            FROM avistamiento av
            LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
        `;

        let paramIndex = 1;

        if (id_especie) {
            filters.push(`av.id_especie = $${paramIndex}`);
            values.push(id_especie);
            paramIndex++;
        }
        if (id_estado_salud) {
            filters.push(`av.id_estado_salud = $${paramIndex}`);
            values.push(id_estado_salud);
            paramIndex++;
        }
        if (id_estado_avistamiento) {
            filters.push(`av.id_estado_avistamiento = $${paramIndex}`);
            values.push(id_estado_avistamiento);
            paramIndex++;
        }

        if (filters.length > 0) {
            query += ` WHERE ` + filters.join(" AND ");
        }
        
        // Agrupar al final
        query += ` GROUP BY av.id_avistamiento`;


        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos con los filtros aplicados' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al filtrar los avistamientos:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al aplicar filtros.' });
    }
};