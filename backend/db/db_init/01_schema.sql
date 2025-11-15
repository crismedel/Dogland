--
-- Name: tipo_plataforma; Type: TYPE; Schema: dogland; Owner: -
--

CREATE TYPE dogland.tipo_plataforma AS ENUM (
    'ios',
    'android',
    'web'
);

--
-- Name: trigger_set_fecha_actualizacion(); Type: FUNCTION; Schema: dogland; Owner: -
--

CREATE FUNCTION dogland.trigger_set_fecha_actualizacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Esta es la línea clave: usa el nombre de columna correcto
  NEW.fecha_actualizacion = now(); 
  RETURN NEW;
END;
$$;


--
-- Name: trigger_set_fecha_termino_solicitud(); Type: FUNCTION; Schema: dogland; Owner: -
--

CREATE FUNCTION dogland.trigger_set_fecha_termino_solicitud() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fecha_termino_solicitud = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_fecha_actualizacion_column(); Type: FUNCTION; Schema: dogland; Owner: -
--

CREATE FUNCTION dogland.update_fecha_actualizacion_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adopcion; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: adopcion_id_adopcion_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.adopcion ALTER COLUMN id_adopcion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.adopcion_id_adopcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: alerta; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: alerta_id_alerta_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.alerta ALTER COLUMN id_alerta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.alerta_id_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: animal; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.animal (
    id_animal integer NOT NULL,
    nombre_animal character varying(50) NOT NULL,
    edad_animal smallint,
    edad_aproximada character varying(20),
    id_estado_salud integer NOT NULL,
    id_raza integer
);


--
-- Name: animal_foto; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.animal_foto (
    id_foto integer NOT NULL,
    id_animal integer NOT NULL,
    url character varying(255) NOT NULL
);


--
-- Name: animal_foto_id_foto_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.animal_foto ALTER COLUMN id_foto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.animal_foto_id_foto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: animal_id_animal_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.animal ALTER COLUMN id_animal ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.animal_id_animal_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: audit_logs_id_audit_log_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.audit_logs ALTER COLUMN id_audit_log ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.audit_logs_id_audit_log_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: avistamiento; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: avistamiento_foto; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.avistamiento_foto (
    id_foto integer NOT NULL,
    id_avistamiento integer NOT NULL,
    url character varying(255) NOT NULL
);


--
-- Name: avistamiento_foto_id_foto_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.avistamiento_foto ALTER COLUMN id_foto ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.avistamiento_foto_id_foto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: avistamiento_id_avistamiento_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.avistamiento ALTER COLUMN id_avistamiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.avistamiento_id_avistamiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ciudad; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.ciudad (
    id_ciudad integer NOT NULL,
    id_region integer NOT NULL,
    nombre_ciudad character varying(50) NOT NULL
);


--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.ciudad ALTER COLUMN id_ciudad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.ciudad_id_ciudad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: especie; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.especie (
    id_especie integer NOT NULL,
    nombre_especie character varying(50) NOT NULL
);


--
-- Name: especie_id_especie_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.especie ALTER COLUMN id_especie ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.especie_id_especie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estado_avistamiento; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.estado_avistamiento (
    id_estado_avistamiento integer NOT NULL,
    estado_avistamiento character varying(50) NOT NULL
);


--
-- Name: estado_avistamiento_id_estado_avistamiento_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.estado_avistamiento ALTER COLUMN id_estado_avistamiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_avistamiento_id_estado_avistamiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estado_salud; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.estado_salud (
    id_estado_salud integer NOT NULL,
    estado_salud character varying(50) NOT NULL
);


--
-- Name: estado_salud_id_estado_salud_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.estado_salud ALTER COLUMN id_estado_salud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_salud_id_estado_salud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estado_solicitud; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.estado_solicitud (
    id_estado_solicitud integer NOT NULL,
    estado_solicitud character varying(50) NOT NULL
);


--
-- Name: estado_solicitud_id_estado_solicitud_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.estado_solicitud ALTER COLUMN id_estado_solicitud ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.estado_solicitud_id_estado_solicitud_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: google_accounts; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: google_accounts_id_google_account_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.google_accounts ALTER COLUMN id_google_account ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.google_accounts_id_google_account_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historial_medico; Type: TABLE; Schema: dogland; Owner: -
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


--
-- Name: historial_medico_id_historial_medico_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.historial_medico ALTER COLUMN id_historial_medico ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.historial_medico_id_historial_medico_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: nivel_riesgo; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.nivel_riesgo (
    id_nivel_riesgo integer NOT NULL,
    nivel_riesgo character varying(50) NOT NULL
);


--
-- Name: nivel_riesgo_id_nivel_riesgo_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.nivel_riesgo ALTER COLUMN id_nivel_riesgo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.nivel_riesgo_id_nivel_riesgo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255),
    body text,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    read boolean DEFAULT false,
    read_at timestamp with time zone,
    type character varying(100)
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

CREATE SEQUENCE dogland.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: dogland; Owner: -
--

ALTER SEQUENCE dogland.notifications_id_seq OWNED BY dogland.notifications.id;


--
-- Name: organizacion; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.organizacion (
    id_organizacion integer NOT NULL,
    nombre_organizacion character varying(50) NOT NULL,
    telefono_organizacion character varying(20),
    email_organizacion character varying(100),
    id_ciudad integer NOT NULL,
    direccion character varying(100)
);


--
-- Name: organizacion_id_organizacion_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.organizacion ALTER COLUMN id_organizacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.organizacion_id_organizacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.password_reset (
    id_reset integer NOT NULL,
    id_usuario integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_id_reset_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.password_reset ALTER COLUMN id_reset ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.password_reset_id_reset_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: push_tickets; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.push_tickets (
    id integer NOT NULL,
    ticket_id text NOT NULL,
    push_token text NOT NULL,
    user_id integer,
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    status text,
    details jsonb
);


--
-- Name: push_tickets_id_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

CREATE SEQUENCE dogland.push_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: push_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: dogland; Owner: -
--

ALTER SEQUENCE dogland.push_tickets_id_seq OWNED BY dogland.push_tickets.id;


--
-- Name: raza; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.raza (
    id_raza integer NOT NULL,
    id_especie integer NOT NULL,
    nombre_raza character varying(50) NOT NULL
);


--
-- Name: raza_id_raza_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.raza ALTER COLUMN id_raza ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.raza_id_raza_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: region; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.region (
    id_region integer NOT NULL,
    nombre_region character varying(50) NOT NULL
);


--
-- Name: region_id_region_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.region ALTER COLUMN id_region ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.region_id_region_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.rol (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.rol ALTER COLUMN id_rol ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.rol_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sexo; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.sexo (
    id_sexo integer NOT NULL,
    sexo character varying(15) NOT NULL
);


--
-- Name: sexo_id_sexo_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.sexo ALTER COLUMN id_sexo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.sexo_id_sexo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: solicitud_adopcion; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.solicitud_adopcion (
    id_solicitud_adopcion integer NOT NULL,
    id_usuario integer NOT NULL,
    id_adopcion integer NOT NULL,
    fecha_ingreso_solicitud timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_termino_solicitud timestamp with time zone,
    id_estado_solicitud integer NOT NULL
);


--
-- Name: solicitud_adopcion_id_solicitud_adopcion_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.solicitud_adopcion ALTER COLUMN id_solicitud_adopcion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.solicitud_adopcion_id_solicitud_adopcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipo_alerta; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.tipo_alerta (
    id_tipo_alerta integer NOT NULL,
    tipo_alerta character varying(50) NOT NULL
);


--
-- Name: tipo_alerta_id_tipo_alerta_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.tipo_alerta ALTER COLUMN id_tipo_alerta ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.tipo_alerta_id_tipo_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: two_factor_tokens; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.two_factor_tokens (
    id_two_factor integer NOT NULL,
    id_usuario integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: two_factor_tokens_id_two_factor_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.two_factor_tokens ALTER COLUMN id_two_factor ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.two_factor_tokens_id_two_factor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_push_tokens; Type: TABLE; Schema: dogland; Owner: -
--

CREATE TABLE dogland.user_push_tokens (
    user_id integer NOT NULL,
    push_token text NOT NULL,
    platform text,
    app_version text,
    is_valid boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    device_id text,
    failure_count integer DEFAULT 0,
    last_failed_at timestamp with time zone,
    last_sent_at timestamp with time zone,
    preferences jsonb DEFAULT '{"system": true, "marketing": true}'::jsonb
);


--
-- Name: usuario; Type: TABLE; Schema: dogland; Owner: -
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
    deleted_at timestamp with time zone,
    id_ciudad integer,
    id_organizacion integer,
    id_rol smallint NOT NULL,
    push_token character varying(255),
    foto_perfil_updated_at timestamp without time zone,
    foto_perfil_blob bytea,
    foto_perfil_mime text,
    has_2fa boolean DEFAULT false
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: dogland; Owner: -
--

ALTER TABLE dogland.usuario ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME dogland.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications id; Type: DEFAULT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.notifications ALTER COLUMN id SET DEFAULT nextval('dogland.notifications_id_seq'::regclass);


--
-- Name: push_tickets id; Type: DEFAULT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.push_tickets ALTER COLUMN id SET DEFAULT nextval('dogland.push_tickets_id_seq'::regclass);


--
-- Name: adopcion adopcion_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.adopcion
    ADD CONSTRAINT adopcion_pkey PRIMARY KEY (id_adopcion);


--
-- Name: alerta alerta_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT alerta_pkey PRIMARY KEY (id_alerta);


--
-- Name: animal_foto animal_foto_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.animal_foto
    ADD CONSTRAINT animal_foto_pkey PRIMARY KEY (id_foto);


--
-- Name: animal animal_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.animal
    ADD CONSTRAINT animal_pkey PRIMARY KEY (id_animal);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id_audit_log);


--
-- Name: avistamiento_foto avistamiento_foto_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento_foto
    ADD CONSTRAINT avistamiento_foto_pkey PRIMARY KEY (id_foto);


--
-- Name: avistamiento avistamiento_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT avistamiento_pkey PRIMARY KEY (id_avistamiento);


--
-- Name: ciudad ciudad_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.ciudad
    ADD CONSTRAINT ciudad_pkey PRIMARY KEY (id_ciudad);


--
-- Name: especie especie_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.especie
    ADD CONSTRAINT especie_pkey PRIMARY KEY (id_especie);


--
-- Name: estado_avistamiento estado_avistamiento_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.estado_avistamiento
    ADD CONSTRAINT estado_avistamiento_pkey PRIMARY KEY (id_estado_avistamiento);


--
-- Name: estado_salud estado_salud_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.estado_salud
    ADD CONSTRAINT estado_salud_pkey PRIMARY KEY (id_estado_salud);


--
-- Name: estado_solicitud estado_solicitud_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.estado_solicitud
    ADD CONSTRAINT estado_solicitud_pkey PRIMARY KEY (id_estado_solicitud);


--
-- Name: google_accounts google_accounts_google_account_id_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.google_accounts
    ADD CONSTRAINT google_accounts_google_account_id_key UNIQUE (google_account_id);


--
-- Name: google_accounts google_accounts_google_email_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.google_accounts
    ADD CONSTRAINT google_accounts_google_email_key UNIQUE (google_email);


--
-- Name: google_accounts google_accounts_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.google_accounts
    ADD CONSTRAINT google_accounts_pkey PRIMARY KEY (id_google_account);


--
-- Name: historial_medico historial_medico_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.historial_medico
    ADD CONSTRAINT historial_medico_pkey PRIMARY KEY (id_historial_medico);


--
-- Name: nivel_riesgo nivel_riesgo_nivel_riesgo_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.nivel_riesgo
    ADD CONSTRAINT nivel_riesgo_nivel_riesgo_key UNIQUE (nivel_riesgo);


--
-- Name: nivel_riesgo nivel_riesgo_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.nivel_riesgo
    ADD CONSTRAINT nivel_riesgo_pkey PRIMARY KEY (id_nivel_riesgo);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organizacion organizacion_email_organizacion_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.organizacion
    ADD CONSTRAINT organizacion_email_organizacion_key UNIQUE (email_organizacion);


--
-- Name: organizacion organizacion_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.organizacion
    ADD CONSTRAINT organizacion_pkey PRIMARY KEY (id_organizacion);


--
-- Name: password_reset password_reset_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.password_reset
    ADD CONSTRAINT password_reset_pkey PRIMARY KEY (id_reset);


--
-- Name: password_reset password_reset_token_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.password_reset
    ADD CONSTRAINT password_reset_token_key UNIQUE (token);


--
-- Name: push_tickets push_tickets_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.push_tickets
    ADD CONSTRAINT push_tickets_pkey PRIMARY KEY (id);


--
-- Name: push_tickets push_tickets_ticket_id_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.push_tickets
    ADD CONSTRAINT push_tickets_ticket_id_key UNIQUE (ticket_id);


--
-- Name: raza raza_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.raza
    ADD CONSTRAINT raza_pkey PRIMARY KEY (id_raza);


--
-- Name: region region_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id_region);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- Name: sexo sexo_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.sexo
    ADD CONSTRAINT sexo_pkey PRIMARY KEY (id_sexo);


--
-- Name: solicitud_adopcion solicitud_adopcion_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT solicitud_adopcion_pkey PRIMARY KEY (id_solicitud_adopcion);


--
-- Name: tipo_alerta tipo_alerta_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.tipo_alerta
    ADD CONSTRAINT tipo_alerta_pkey PRIMARY KEY (id_tipo_alerta);


--
-- Name: tipo_alerta tipo_alerta_tipo_alerta_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.tipo_alerta
    ADD CONSTRAINT tipo_alerta_tipo_alerta_key UNIQUE (tipo_alerta);


--
-- Name: two_factor_tokens two_factor_tokens_id_usuario_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.two_factor_tokens
    ADD CONSTRAINT two_factor_tokens_id_usuario_key UNIQUE (id_usuario);


--
-- Name: two_factor_tokens two_factor_tokens_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.two_factor_tokens
    ADD CONSTRAINT two_factor_tokens_pkey PRIMARY KEY (id_two_factor);


--
-- Name: user_push_tokens user_push_tokens_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.user_push_tokens
    ADD CONSTRAINT user_push_tokens_pkey PRIMARY KEY (user_id, push_token);


--
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_notifications_user_created ON dogland.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_push_tickets_processed; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_push_tickets_processed ON dogland.push_tickets USING btree (processed_at);


--
-- Name: idx_push_tickets_user; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_push_tickets_user ON dogland.push_tickets USING btree (user_id);


--
-- Name: idx_user_push_tokens_is_valid; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_user_push_tokens_is_valid ON dogland.user_push_tokens USING btree (is_valid);


--
-- Name: idx_user_push_tokens_token; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_user_push_tokens_token ON dogland.user_push_tokens USING btree (push_token);


--
-- Name: idx_user_push_tokens_user; Type: INDEX; Schema: dogland; Owner: -
--

CREATE INDEX idx_user_push_tokens_user ON dogland.user_push_tokens USING btree (user_id);


--
-- Name: avistamiento trg_avistamiento_update; Type: TRIGGER; Schema: dogland; Owner: -
--

CREATE TRIGGER trg_avistamiento_update BEFORE UPDATE ON dogland.avistamiento FOR EACH ROW EXECUTE FUNCTION dogland.trigger_set_fecha_actualizacion();


--
-- Name: google_accounts trg_google_accounts_update; Type: TRIGGER; Schema: dogland; Owner: -
--

CREATE TRIGGER trg_google_accounts_update BEFORE UPDATE ON dogland.google_accounts FOR EACH ROW EXECUTE FUNCTION dogland.update_fecha_actualizacion_column();


--
-- Name: solicitud_adopcion trg_solicitud_update; Type: TRIGGER; Schema: dogland; Owner: -
--

CREATE TRIGGER trg_solicitud_update BEFORE UPDATE ON dogland.solicitud_adopcion FOR EACH ROW EXECUTE FUNCTION dogland.trigger_set_fecha_termino_solicitud();


--
-- Name: adopcion fk_adopcion_animal; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.adopcion
    ADD CONSTRAINT fk_adopcion_animal FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);


--
-- Name: adopcion fk_adopcion_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.adopcion
    ADD CONSTRAINT fk_adopcion_usuario FOREIGN KEY (id_usuario_rescatista) REFERENCES dogland.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: alerta fk_alerta_riesgo; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_riesgo FOREIGN KEY (id_nivel_riesgo) REFERENCES dogland.nivel_riesgo(id_nivel_riesgo);


--
-- Name: alerta fk_alerta_tipo; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_tipo FOREIGN KEY (id_tipo_alerta) REFERENCES dogland.tipo_alerta(id_tipo_alerta);


--
-- Name: alerta fk_alerta_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.alerta
    ADD CONSTRAINT fk_alerta_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: animal fk_animal_estado_salud; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.animal
    ADD CONSTRAINT fk_animal_estado_salud FOREIGN KEY (id_estado_salud) REFERENCES dogland.estado_salud(id_estado_salud);


--
-- Name: animal_foto fk_animal_foto; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.animal_foto
    ADD CONSTRAINT fk_animal_foto FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);


--
-- Name: animal fk_animal_raza; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.animal
    ADD CONSTRAINT fk_animal_raza FOREIGN KEY (id_raza) REFERENCES dogland.raza(id_raza);


--
-- Name: audit_logs fk_audit_logs_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.audit_logs
    ADD CONSTRAINT fk_audit_logs_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: avistamiento fk_avistamiento_especie; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_especie FOREIGN KEY (id_especie) REFERENCES dogland.especie(id_especie);


--
-- Name: avistamiento fk_avistamiento_estado_avistamiento; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_estado_avistamiento FOREIGN KEY (id_estado_avistamiento) REFERENCES dogland.estado_avistamiento(id_estado_avistamiento);


--
-- Name: avistamiento fk_avistamiento_estado_salud; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_estado_salud FOREIGN KEY (id_estado_salud) REFERENCES dogland.estado_salud(id_estado_salud);


--
-- Name: avistamiento_foto fk_avistamiento_foto; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento_foto
    ADD CONSTRAINT fk_avistamiento_foto FOREIGN KEY (id_avistamiento) REFERENCES dogland.avistamiento(id_avistamiento);


--
-- Name: avistamiento fk_avistamiento_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.avistamiento
    ADD CONSTRAINT fk_avistamiento_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: ciudad fk_ciudad_region; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.ciudad
    ADD CONSTRAINT fk_ciudad_region FOREIGN KEY (id_region) REFERENCES dogland.region(id_region);


--
-- Name: google_accounts fk_google_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.google_accounts
    ADD CONSTRAINT fk_google_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: historial_medico fk_historial_medico_animal; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.historial_medico
    ADD CONSTRAINT fk_historial_medico_animal FOREIGN KEY (id_animal) REFERENCES dogland.animal(id_animal);


--
-- Name: organizacion fk_organizacion_ciudad; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.organizacion
    ADD CONSTRAINT fk_organizacion_ciudad FOREIGN KEY (id_ciudad) REFERENCES dogland.ciudad(id_ciudad);


--
-- Name: password_reset fk_password_reset_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.password_reset
    ADD CONSTRAINT fk_password_reset_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: raza fk_raza_especie; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.raza
    ADD CONSTRAINT fk_raza_especie FOREIGN KEY (id_especie) REFERENCES dogland.especie(id_especie);


--
-- Name: solicitud_adopcion fk_solicitud_adopcion; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_adopcion FOREIGN KEY (id_adopcion) REFERENCES dogland.adopcion(id_adopcion);


--
-- Name: solicitud_adopcion fk_solicitud_estado; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_estado FOREIGN KEY (id_estado_solicitud) REFERENCES dogland.estado_solicitud(id_estado_solicitud);


--
-- Name: solicitud_adopcion fk_solicitud_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.solicitud_adopcion
    ADD CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: two_factor_tokens fk_two_factor_usuario; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.two_factor_tokens
    ADD CONSTRAINT fk_two_factor_usuario FOREIGN KEY (id_usuario) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;


--
-- Name: usuario fk_usuario_ciudad; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_ciudad FOREIGN KEY (id_ciudad) REFERENCES dogland.ciudad(id_ciudad);


--
-- Name: usuario fk_usuario_organizacion; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_organizacion FOREIGN KEY (id_organizacion) REFERENCES dogland.organizacion(id_organizacion);


--
-- Name: usuario fk_usuario_rol; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES dogland.rol(id_rol);


--
-- Name: usuario fk_usuario_sexo; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.usuario
    ADD CONSTRAINT fk_usuario_sexo FOREIGN KEY (id_sexo) REFERENCES dogland.sexo(id_sexo);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: dogland; Owner: -
--

ALTER TABLE ONLY dogland.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES dogland.usuario(id_usuario) ON DELETE CASCADE;
