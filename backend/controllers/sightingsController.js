import pool from '../db/db.js';

// Función auxiliar para expandir la geometría (ubicación) y las relaciones
const getSightingBaseQuery = () => `
    SELECT 
        av.id_avistamiento, 
        av.id_usuario, 
        av.fecha_creacion, 
        av.fecha_actualizacion, 
        av.descripcion, 
        av.direccion,
        -- Expande la geometría a Longitude y Latitude
        ST_X(av.ubicacion::geometry) AS longitude,
        ST_Y(av.ubicacion::geometry) AS latitude,
        -- Añade los datos de la relación (para el frontend)
        json_build_object('nombre', es.nombre, 'id', av.id_especie) AS especie,
        json_build_object('nombre', ests.estado_salud, 'id', av.id_estado_salud) AS estado_salud,
        json_build_object('nombre', esta.estado_avistamiento, 'id', av.id_estado_avistamiento) AS estado_avistamiento,
        -- Agrupa todas las URLs de fotos en un array JSON
        COALESCE(
            json_agg(af.url) FILTER (WHERE af.url IS NOT NULL), 
            '[]'
        ) AS fotos_url
    FROM avistamiento av
    LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
    LEFT JOIN especie es ON av.id_especie = es.id_especie
    LEFT JOIN estado_salud ests ON av.id_estado_salud = ests.id_estado_salud
    LEFT JOIN estado_avistamiento esta ON av.id_estado_avistamiento = esta.id_estado_avistamiento
`;

// --- FUNCIONES DE LECTURA (GET) CORREGIDAS ---

// Función para obtener todos los avistamientos con fotos y detalles asociados
export const getSightings = async (req, res) => {
    try {
        const result = await pool.query(`
            ${getSightingBaseQuery()}
            GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento
            ORDER BY av.fecha_creacion DESC
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener los avistamientos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Función para obtener un avistamiento por ID con fotos y detalles
export const getSightingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            ${getSightingBaseQuery()}
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener el avistamiento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- FUNCIÓN DE ESCRITURA (POST) CORREGIDA ---

// Función para crear un nuevo avistamiento
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

        // 2. Si se ha enviado una URL de foto, se inserta en la tabla avistamiento_foto
        if (url) {
            await pool.query(
                `
                INSERT INTO avistamiento_foto (id_avistamiento, url)
                VALUES ($1, $2)
                `,
                [avistamiento.id_avistamiento, url]
            );
        }
        
        // 3. Volvemos a consultar el avistamiento completo para devolver la respuesta con los datos anidados
        // Esto garantiza que la URL de la foto (y otros joins) estén en la respuesta
        const finalResult = await pool.query(`
            ${getSightingBaseQuery()}
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento
        `, [avistamiento.id_avistamiento]);
        
        const fullSighting = finalResult.rows[0];


        res.status(201).json({ success: true, data: fullSighting });
    } catch (error) {
        console.error('Error al crear el avistamiento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- FUNCIONES DE ACTUALIZACIÓN Y ELIMINACIÓN (UPDATE & DELETE) ---

// Función para actualizar un avistamiento
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

        // 2. Si se incluye una URL de foto, actualizar/insertar en avistamiento_foto
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
        
        // 3. Volvemos a consultar el avistamiento completo para devolver la respuesta con los datos anidados
        const finalResult = await pool.query(`
            ${getSightingBaseQuery()}
            WHERE av.id_avistamiento = $1
            GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento
        `, [id]);
        
        const fullSighting = finalResult.rows[0];

        res.status(200).json({ success: true, data: fullSighting });
    } catch (error) {
        console.error('Error al actualizar el avistamiento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Función para eliminar un avistamiento
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
        res.status(500).json({ success: false, error: error.message });
    }
};

// Función para obtener avistamientos por ubicación (sin cambios necesarios en la lógica de fotos)
export const getSightingsByLocation = async (req, res) => {
    try {
        const { longitude, latitude, distance } = req.query;

        if (!longitude || !latitude || !distance) {
            return res.status(400).json({ success: false, error: 'Faltan parámetros: longitud, latitud y distancia son requeridos' });
        }

        const result = await pool.query(
            `
            ${getSightingBaseQuery()}
            WHERE ST_DWithin(av.ubicacion, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
            GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento
            `,
            [longitude, latitude, distance]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos cerca de esta ubicación' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener avistamientos por ubicación:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Función para filtrar avistamientos (sin cambios necesarios en la lógica de fotos)
export const filterSightings = async (req, res) => {
    try {
        const { id_especie, id_estado_salud, id_estado_avistamiento } = req.query;

        const filters = [];
        const values = [];
        let query = getSightingBaseQuery();

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
        
        // Siempre agrupar al final de la consulta base
        query += ` GROUP BY av.id_avistamiento, es.nombre, ests.estado_salud, esta.estado_avistamiento`;


        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron avistamientos con los filtros aplicados' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al filtrar los avistamientos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};