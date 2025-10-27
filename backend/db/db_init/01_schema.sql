--
-- PostgreSQL database schema
-- Base de datos: dogland
-- Fecha: 2025-10-21
--

-- Configurar search_path para que use el schema dogland por defecto
SET search_path TO dogland, public;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: dogland; Type: SCHEMA
-- NOTA: El schema se crea en 00_extensions.sql
--

-- CREATE SCHEMA IF NOT EXISTS dogland;

--
-- Name: postgis; Type: EXTENSION
-- NOTA: La extensión PostGIS se crea en 00_extensions.sql
--

-- CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA dogland;
-- COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';

--
-- Name: tipo_plataforma; Type: TYPE
--

CREATE TYPE dogland.tipo_plataforma AS ENUM (
    'ios',
    'android',
    'web'
);

--
-- Name: trigger_set_fecha_actualizacion(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION dogland.trigger_set_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$;

--
-- Name: trigger_set_fecha_termino_solicitud(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION dogland.trigger_set_fecha_termino_solicitud() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fecha_termino_solicitud = now();
  RETURN NEW;
END;
$$;

--
-- Name: update_fecha_actualizacion_column(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION dogland.update_fecha_actualizacion_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.fecha_actualizacion = NOW();
   RETURN NEW;
END;
$$;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: rol; Type: TABLE
--

CREATE TABLE dogland.rol (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);

ALTER TABLE dogland.rol ALTER COLUMN id_rol ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.rol_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: sexo; Type: TABLE
--

CREATE TABLE dogland.sexo (
    id_sexo integer NOT NULL,
    sexo character varying(15) NOT NULL
);

ALTER TABLE dogland.sexo ALTER COLUMN id_sexo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.sexo_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: region; Type: TABLE
--

CREATE TABLE dogland.region (
    id_region integer NOT NULL,
    nombre_region character varying(50) NOT NULL
);

ALTER TABLE dogland.region ALTER COLUMN id_region ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.region_id_region_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: ciudad; Type: TABLE
--

CREATE TABLE dogland.ciudad (
    id_ciudad integer NOT NULL,
    id_region integer NOT NULL,
    nombre_ciudad character varying(50) NOT NULL
);

ALTER TABLE dogland.ciudad ALTER COLUMN id_ciudad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.ciudad_id_ciudad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: organizacion; Type: TABLE
--

CREATE TABLE dogland.organizacion (
    id_organizacion integer NOT NULL,
    nombre_organizacion character varying(50) NOT NULL,
    telefono_organizacion character varying(20),
    email_organizacion character varying(100),
    id_ciudad integer NOT NULL,
    direccion character varying(100)
);

ALTER TABLE dogland.organizacion ALTER COLUMN id_organizacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.organizacion_id_organizacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: usuario; Type: TABLE
--

CREATE TABLE dogland.usuario (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    apellido_paterno character varying(30),
    apellido_materno character varying(30),
    id_sexo integer NOT NULL,
    fecha_nacimiento date,
    telefono character varying(20),
    email character varying(100),
    password_hash character varying(255),
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_login timestamp with time zone,
    activo boolean DEFAULT true,
    deleted_at timestamp with time zone DEFAULT NULL,
    id_ciudad integer NOT NULL,
    id_organizacion integer,
    id_rol smallint NOT NULL
);

ALTER TABLE dogland.usuario ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: password_reset; Type: TABLE
--

CREATE TABLE dogland.password_reset (
    id_reset integer NOT NULL,
    id_usuario integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE dogland.password_reset ALTER COLUMN id_reset ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.password_reset_id_reset_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: google_accounts; Type: TABLE
--

CREATE TABLE dogland.google_accounts (
    id_google_account integer NOT NULL,
    id_usuario integer NOT NULL,
    google_account_id character varying(255),
    google_email character varying(255),
    refresh_token text,
    access_token text,
    token_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dogland.google_accounts ALTER COLUMN id_google_account ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.google_accounts_id_google_account_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: especie; Type: TABLE
--

CREATE TABLE dogland.especie (
    id_especie integer NOT NULL,
    nombre_especie character varying(50) NOT NULL
);

ALTER TABLE dogland.especie ALTER COLUMN id_especie ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.especie_id_especie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: raza; Type: TABLE
--

CREATE TABLE dogland.raza (
    id_raza integer NOT NULL,
    id_especie integer NOT NULL,
    nombre_raza character varying(50) NOT NULL
);

ALTER TABLE dogland.raza ALTER COLUMN id_raza ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.raza_id_raza_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: estado_salud; Type: TABLE
--

CREATE TABLE dogland.estado_salud (
    id_estado_salud integer NOT NULL,
    estado_salud character varying(50) NOT NULL
);

ALTER TABLE dogland.estado_salud ALTER COLUMN id_estado_salud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_salud_id_estado_salud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: animal; Type: TABLE
--

CREATE TABLE dogland.animal (
    id_animal integer NOT NULL,
    nombre_animal character varying(50) NOT NULL,
    edad_animal smallint,
    edad_aproximada character varying(20),
    id_estado_salud integer NOT NULL,
    id_raza integer
);

ALTER TABLE dogland.animal ALTER COLUMN id_animal ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.animal_id_animal_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: animal_foto; Type: TABLE
--

CREATE TABLE dogland.animal_foto (
    id_foto integer NOT NULL,
    id_animal integer NOT NULL,
    url character varying(255) NOT NULL
);

ALTER TABLE dogland.animal_foto ALTER COLUMN id_foto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.animal_foto_id_foto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: estado_avistamiento; Type: TABLE
--

CREATE TABLE dogland.estado_avistamiento (
    id_estado_avistamiento integer NOT NULL,
    estado_avistamiento character varying(50) NOT NULL
);

ALTER TABLE dogland.estado_avistamiento ALTER COLUMN id_estado_avistamiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_avistamiento_id_estado_avistamiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: avistamiento; Type: TABLE (AGREGADA - faltaba en backupppppp)
--

CREATE TABLE dogland.avistamiento (
    id_avistamiento integer NOT NULL,
    id_usuario integer NOT NULL,
    id_estado_avistamiento integer NOT NULL,
    id_estado_salud integer NOT NULL,
    id_especie integer NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    descripcion text,
    ubicacion public.geography(Point,4326),
    direccion character varying(100)
);

ALTER TABLE dogland.avistamiento ALTER COLUMN id_avistamiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.avistamiento_id_avistamiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: avistamiento_foto; Type: TABLE
--

CREATE TABLE dogland.avistamiento_foto (
    id_foto integer NOT NULL,
    id_avistamiento integer NOT NULL,
    url character varying(255) NOT NULL
);

ALTER TABLE dogland.avistamiento_foto ALTER COLUMN id_foto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.avistamiento_foto_id_foto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: adopcion; Type: TABLE
--

CREATE TABLE dogland.adopcion (
    id_adopcion integer NOT NULL,
    id_animal integer NOT NULL,
    id_usuario_rescatista integer NOT NULL,
    fecha_publicacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_adopcion timestamp with time zone,
    disponible boolean DEFAULT true,
    descripcion text
);

ALTER TABLE dogland.adopcion ALTER COLUMN id_adopcion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.adopcion_id_adopcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: estado_solicitud; Type: TABLE
--

CREATE TABLE dogland.estado_solicitud (
    id_estado_solicitud integer NOT NULL,
    estado_solicitud character varying(50) NOT NULL
);

ALTER TABLE dogland.estado_solicitud ALTER COLUMN id_estado_solicitud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_solicitud_id_estado_solicitud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: solicitud_adopcion; Type: TABLE
--

CREATE TABLE dogland.solicitud_adopcion (
    id_solicitud_adopcion integer NOT NULL,
    id_usuario integer NOT NULL,
    id_adopcion integer NOT NULL,
    fecha_ingreso_solicitud timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_termino_solicitud timestamp with time zone,
    id_estado_solicitud integer NOT NULL
);

ALTER TABLE dogland.solicitud_adopcion ALTER COLUMN id_solicitud_adopcion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.solicitud_adopcion_id_solicitud_adopcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: tipo_alerta; Type: TABLE
--

CREATE TABLE dogland.tipo_alerta (
    id_tipo_alerta integer NOT NULL,
    tipo_alerta character varying(50) NOT NULL
);

ALTER TABLE dogland.tipo_alerta ALTER COLUMN id_tipo_alerta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.tipo_alerta_id_tipo_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: nivel_riesgo; Type: TABLE
--

CREATE TABLE dogland.nivel_riesgo (
    id_nivel_riesgo integer NOT NULL,
    nivel_riesgo character varying(50) NOT NULL
);

ALTER TABLE dogland.nivel_riesgo ALTER COLUMN id_nivel_riesgo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.nivel_riesgo_id_nivel_riesgo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: alerta; Type: TABLE
--

CREATE TABLE dogland.alerta (
    id_alerta integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text NOT NULL,
    id_tipo_alerta integer NOT NULL,
    id_nivel_riesgo integer NOT NULL,
    id_usuario integer NOT NULL,
    ubicacion public.geometry(Point,4326),
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp with time zone,
    activa boolean DEFAULT true,
    reportes integer DEFAULT 0,
    direccion character varying(255)
);

ALTER TABLE dogland.alerta ALTER COLUMN id_alerta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.alerta_id_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: dispositivo; Type: TABLE
--

CREATE TABLE dogland.dispositivo (
    id_dispositivo integer NOT NULL,
    id_usuario integer NOT NULL,
    plataforma dogland.tipo_plataforma NOT NULL,
    token text NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    activo boolean DEFAULT true NOT NULL
);

ALTER TABLE dogland.dispositivo ALTER COLUMN id_dispositivo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.dispositivo_id_dispositivo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: historial_medico; Type: TABLE
--

CREATE TABLE dogland.historial_medico (
    id_historial_medico integer NOT NULL,
    id_animal integer NOT NULL,
    fecha_evento timestamp with time zone NOT NULL,
    tipo_evento character varying(25) NOT NULL,
    diagnostico text,
    detalles text,
    nombre_veterinario character varying(50)
);

ALTER TABLE dogland.historial_medico ALTER COLUMN id_historial_medico ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.historial_medico_id_historial_medico_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: audit_logs; Type: TABLE
--

CREATE TABLE dogland.audit_logs (
    id_audit_log integer NOT NULL,
    id_usuario integer,
    action character varying(10) NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id integer NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_logs_action_check CHECK (((action)::text = ANY (ARRAY[('CREATE'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text])))
);

ALTER TABLE dogland.audit_logs ALTER COLUMN id_audit_log ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.audit_logs_id_audit_log_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- PRIMARY KEYS
--

ALTER TABLE ONLY dogland.rol ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);
ALTER TABLE ONLY dogland.sexo ADD CONSTRAINT sexo_pkey PRIMARY KEY (id_sexo);
ALTER TABLE ONLY dogland.region ADD CONSTRAINT region_pkey PRIMARY KEY (id_region);
ALTER TABLE ONLY dogland.ciudad ADD CONSTRAINT ciudad_pkey PRIMARY KEY (id_ciudad);
ALTER TABLE ONLY dogland.organizacion ADD CONSTRAINT organizacion_pkey PRIMARY KEY (id_organizacion);
ALTER TABLE ONLY dogland.usuario ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);
ALTER TABLE ONLY dogland.password_reset ADD CONSTRAINT password_reset_pkey PRIMARY KEY (id_reset);
ALTER TABLE ONLY dogland.google_accounts ADD CONSTRAINT google_accounts_pkey PRIMARY KEY (id_google_account);
ALTER TABLE ONLY dogland.especie ADD CONSTRAINT especie_pkey PRIMARY KEY (id_especie);
ALTER TABLE ONLY dogland.raza ADD CONSTRAINT raza_pkey PRIMARY KEY (id_raza);
ALTER TABLE ONLY dogland.estado_salud ADD CONSTRAINT estado_salud_pkey PRIMARY KEY (id_estado_salud);
ALTER TABLE ONLY dogland.animal ADD CONSTRAINT animal_pkey PRIMARY KEY (id_animal);
ALTER TABLE ONLY dogland.animal_foto ADD CONSTRAINT animal_foto_pkey PRIMARY KEY (id_foto);
ALTER TABLE ONLY dogland.estado_avistamiento ADD CONSTRAINT estado_avistamiento_pkey PRIMARY KEY (id_estado_avistamiento);
ALTER TABLE ONLY dogland.avistamiento ADD CONSTRAINT avistamiento_pkey PRIMARY KEY (id_avistamiento);
ALTER TABLE ONLY dogland.avistamiento_foto ADD CONSTRAINT avistamiento_foto_pkey PRIMARY KEY (id_foto);
ALTER TABLE ONLY dogland.adopcion ADD CONSTRAINT adopcion_pkey PRIMARY KEY (id_adopcion);
ALTER TABLE ONLY dogland.estado_solicitud ADD CONSTRAINT estado_solicitud_pkey PRIMARY KEY (id_estado_solicitud);
ALTER TABLE ONLY dogland.solicitud_adopcion ADD CONSTRAINT solicitud_adopcion_pkey PRIMARY KEY (id_solicitud_adopcion);
ALTER TABLE ONLY dogland.tipo_alerta ADD CONSTRAINT tipo_alerta_pkey PRIMARY KEY (id_tipo_alerta);
ALTER TABLE ONLY dogland.nivel_riesgo ADD CONSTRAINT nivel_riesgo_pkey PRIMARY KEY (id_nivel_riesgo);
ALTER TABLE ONLY dogland.alerta ADD CONSTRAINT alerta_pkey PRIMARY KEY (id_alerta);
ALTER TABLE ONLY dogland.dispositivo ADD CONSTRAINT dispositivo_pkey PRIMARY KEY (id_dispositivo);
ALTER TABLE ONLY dogland.historial_medico ADD CONSTRAINT historial_medico_pkey PRIMARY KEY (id_historial_medico);
ALTER TABLE ONLY dogland.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id_audit_log);

--
-- UNIQUE CONSTRAINTS
--

ALTER TABLE ONLY dogland.organizacion ADD CONSTRAINT organizacion_email_organizacion_key UNIQUE (email_organizacion);
ALTER TABLE ONLY dogland.usuario ADD CONSTRAINT usuario_email_key UNIQUE (email);
ALTER TABLE ONLY dogland.password_reset ADD CONSTRAINT password_reset_token_key UNIQUE (token);
ALTER TABLE ONLY dogland.dispositivo ADD CONSTRAINT dispositivo_token_key UNIQUE (token);
ALTER TABLE ONLY dogland.google_accounts ADD CONSTRAINT google_accounts_google_account_id_key UNIQUE (google_account_id);
ALTER TABLE ONLY dogland.google_accounts ADD CONSTRAINT google_accounts_google_email_key UNIQUE (google_email);
ALTER TABLE ONLY dogland.tipo_alerta ADD CONSTRAINT tipo_alerta_tipo_alerta_key UNIQUE (tipo_alerta);
ALTER TABLE ONLY dogland.nivel_riesgo ADD CONSTRAINT nivel_riesgo_nivel_riesgo_key UNIQUE (nivel_riesgo);

--
-- FOREIGN KEY CONSTRAINTS
--

ALTER TABLE ONLY dogland.ciudad
    ADD CONSTRAINT fk_ciudad_region FOREIGN KEY (id_region) REFERENCES dogland.region(id_region);

ALTER TABLE ONLY dogland.organizacion
    ADD CONSTRAINT fk_organizacion_ciudad FOREIGN KEY (id_ciudad) REFERENCES dogland.ciudad(id_ciudad);

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES dogland.rol(id_rol);

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_sexo FOREIGN KEY (id_sexo) REFERENCES dogland.sexo(id_sexo);

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_organizacion FOREIGN KEY (id_organizacion) REFERENCES dogland.organizacion(id_organizacion);

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_ciudad FOREIGN KEY (id_ciudad) REFERENCES dogland.ciudad(id_ciudad);

ALTER TABLE ONLY dogland.password_reset
    ADD CONSTRAINT fk_password_reset_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.google_accounts
    ADD CONSTRAINT fk_google_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.raza
    ADD CONSTRAINT fk_raza_especie FOREIGN KEY (id_especie) REFERENCES dogland.especie(id_especie);

ALTER TABLE ONLY dogland.animal
    ADD CONSTRAINT fk_animal_estado_salud FOREIGN KEY (id_estado_salud) REFERENCES dogland.estado_salud(id_estado_salud);

ALTER TABLE ONLY dogland.animal
    ADD CONSTRAINT fk_animal_raza FOREIGN KEY (id_raza) REFERENCES dogland.raza(id_raza);

ALTER TABLE ONLY dogland.animal_foto
    ADD CONSTRAINT fk_animal_foto FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_estado_avistamiento FOREIGN KEY (id_estado_avistamiento) REFERENCES dogland.estado_avistamiento(id_estado_avistamiento);

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_estado_salud FOREIGN KEY (id_estado_salud) REFERENCES dogland.estado_salud(id_estado_salud);

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_especie FOREIGN KEY (id_especie) REFERENCES dogland.especie(id_especie);

ALTER TABLE ONLY dogland.avistamiento_foto
    ADD CONSTRAINT fk_avistamiento_foto FOREIGN KEY (id_avistamiento) REFERENCES dogland.avistamiento(id_avistamiento);

ALTER TABLE ONLY dogland.adopcion
    ADD CONSTRAINT fk_adopcion_animal FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);

ALTER TABLE ONLY dogland.adopcion
    ADD CONSTRAINT fk_adopcion_usuario FOREIGN KEY (id_usuario_rescatista) REFERENCES dogland.usuario(id_usuario) ON DELETE SET NULL;

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_adopcion FOREIGN KEY (id_adopcion) REFERENCES dogland.adopcion(id_adopcion);

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_estado FOREIGN KEY (id_estado_solicitud) REFERENCES dogland.estado_solicitud(id_estado_solicitud);

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_tipo FOREIGN KEY (id_tipo_alerta) REFERENCES dogland.tipo_alerta(id_tipo_alerta);

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_riesgo FOREIGN KEY (id_nivel_riesgo) REFERENCES dogland.nivel_riesgo(id_nivel_riesgo);

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.dispositivo
    ADD CONSTRAINT fk_dispositivo_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;

ALTER TABLE ONLY dogland.historial_medico
    ADD CONSTRAINT fk_historial_medico_animal FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);

ALTER TABLE ONLY dogland.audit_logs
    ADD CONSTRAINT fk_audit_logs_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE SET NULL;

--
-- TRIGGERS
--

CREATE TRIGGER trg_solicitud_update
    BEFORE UPDATE ON dogland.solicitud_adopcion
    FOR EACH ROW
    EXECUTE FUNCTION dogland.trigger_set_fecha_termino_solicitud();

CREATE TRIGGER trg_avistamiento_update
    BEFORE UPDATE ON dogland.avistamiento
    FOR EACH ROW
    EXECUTE FUNCTION dogland.update_fecha_actualizacion_column();

CREATE TRIGGER trg_dispositivo_update
    BEFORE UPDATE ON dogland.dispositivo
    FOR EACH ROW
    EXECUTE FUNCTION dogland.update_fecha_actualizacion_column();

CREATE TRIGGER trg_google_accounts_update
    BEFORE UPDATE ON dogland.google_accounts
    FOR EACH ROW
    EXECUTE FUNCTION dogland.update_fecha_actualizacion_column();

--
-- SEQUENCE VALUES (will be set by 02_seed.sql after data insertion)
--
-- Note: Sequence values are managed in 02_seed.sql to ensure they match inserted data
