-- Configuracion post-inicializacion
-- Se ejecuta despues de crear el schema y seed

-- Configurar search_path por defecto para la base de datos
-- Nota: Esto funciona solo si la DB se llama 'dogland'
-- Para dogland_test, se configurará en la conexión del pool

-- Intentar configurar para la DB actual
DO $$
DECLARE
    db_name text;
BEGIN
    SELECT current_database() INTO db_name;
    EXECUTE format('ALTER DATABASE %I SET search_path TO dogland, public', db_name);
    EXECUTE format('ALTER DATABASE %I SET datestyle TO ''ISO, DMY''', db_name);
    RAISE NOTICE 'search_path y datestyle configurados para base de datos: %', db_name;
END $$;
