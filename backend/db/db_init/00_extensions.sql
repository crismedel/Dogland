-- Crear schema y extension PostGIS

-- Crear extension PostGIS antes del schema dogland
-- Hace que los tipos geography/geometry esten disponibles globalmente
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear el schema dogland
CREATE SCHEMA IF NOT EXISTS dogland;
