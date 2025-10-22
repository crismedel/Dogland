--
-- PostgreSQL database dump - BACKUP
-- Base de datos: dogland_test
-- Fecha: 2025-10-21
--

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
--

CREATE SCHEMA IF NOT EXISTS dogland;

--
-- Name: postgis; Type: EXTENSION
-- NOTA: Debe crearse manualmente como superusuario ANTES de restaurar este backup
-- Comando: psql -U postgres -d dogland_test_temp -c "CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA dogland;"
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
    ubicacion geography(Point,4326),
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
    ubicacion geometry(Point,4326),
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
-- Data for Name: rol
--

COPY dogland.rol (id_rol, nombre_rol) FROM stdin;
1	Admin
2	Usuario
3	Trabajador
\.

--
-- Data for Name: sexo
--

COPY dogland.sexo (id_sexo, sexo) FROM stdin;
1	M
2	F
3	O
\.

--
-- Data for Name: region (SOLO 15 REGIONES)
--

COPY dogland.region (id_region, nombre_region) FROM stdin;
1	Arica y Parinacota
2	Tarapacá
3	Antofagasta
4	Atacama
5	Coquimbo
6	Valparaíso
7	Región del Libertador Gral. Bernardo O'Higgins
8	Región del Maule
9	Región de Ñuble
10	Región del Biobío
11	Región de la Araucanía
12	Región de los Ríos
13	Región de los Lagos
14	Región Aisén del Gral. Carlos Ibañez del Campo
15	Región de Magallanes y de la Antártica Chilena
\.

--
-- Data for Name: ciudad (SIN DUPLICADOS, 294 CIUDADES)
--

COPY dogland.ciudad (id_ciudad, id_region, nombre_ciudad) FROM stdin;
1	1	Arica
2	1	Camarones
3	1	Putre
4	1	General Lagos
5	2	Iquique
6	2	Alto Hospicio
7	2	Pozo Almonte
8	2	Camiña
9	2	Colchane
10	2	Huara
11	2	Pica
12	3	Antofagasta
13	3	Mejillones
14	3	Sierra Gorda
15	3	Taltal
16	3	Calama
17	3	Ollagüe
18	3	San Pedro de Atacama
19	3	Tocopilla
20	3	María Elena
21	4	Copiapó
22	4	Caldera
23	4	Tierra Amarilla
24	4	Chañaral
25	4	Diego de Almagro
26	4	Vallenar
27	4	Alto del Carmen
28	4	Freirina
29	4	Huasco
30	5	La Serena
31	5	Coquimbo
32	5	Andacollo
33	5	La Higuera
34	5	Paiguano
35	5	Vicuña
36	5	Illapel
37	5	Canela
38	5	Los Vilos
39	5	Salamanca
40	5	Ovalle
41	5	Combarbalá
42	5	Monte Patria
43	5	Punitaqui
44	5	Río Hurtado
45	6	Valparaíso
46	6	Casablanca
47	6	Concón
48	6	Juan Fernández
49	6	Puchuncaví
50	6	Quintero
51	6	Viña del Mar
52	6	Isla de Pascua
53	6	Los Andes
54	6	Calle Larga
55	6	Riconada
56	6	San Esteban
57	6	La Ligua
58	6	Cabildo
59	6	Papudo
60	6	Petorca
61	6	Zapallar
62	6	Quillota
63	6	La Calera
64	6	Hijuelas
65	6	La Cruz
66	6	Nogales
67	6	San Antonio
68	6	Algarrobo
69	6	Cartagena
70	6	El Quisco
71	6	El Tabo
72	6	Santo Domingo
73	6	San Felipe
74	6	Catemu
75	6	Llaillay
76	6	Panquehue
77	6	Putaendo
78	6	Santa María
79	6	Quilpué
80	6	Limache
81	6	Olmué
82	6	Villa Alemana
83	7	Rancagua
84	7	Codegua
85	7	Coinco
86	7	Coltauco
87	7	Doñihue
88	7	Graneros
89	7	Las Cabras
90	7	Machalí
91	7	Malloa
92	7	Mostazal
93	7	Olivar
94	7	Peumo
95	7	Pichidegua
96	7	Quinta de Tilcoco
97	7	Rengo
98	7	Requínoa
99	7	San Vicente
100	7	Pichilemu
101	7	La Estrella
102	7	Litueche
103	7	Marichihue
104	7	Navidad
105	7	Paredones
106	7	San Fernando
107	7	Chépica
108	7	Chimbarongo
109	7	Lolol
110	7	Nancagua
111	7	Palmilla
112	7	Peralillo
113	7	Placilla
114	7	Pumanque
115	7	Santa Cruz
116	8	Talca
117	8	Constitución
118	8	Curepto
119	8	Empedrado
120	8	Maule
121	8	Pelarco
122	8	Pencahue
123	8	Río Claro
124	8	San Clemente
125	8	San Rafael
126	8	Cauquenes
127	8	Chanco
128	8	Pelluhue
129	8	Curicó
130	8	Hualañé
131	8	Licantén
132	8	Molina
133	8	Rauco
134	8	Romeral
135	8	Sagrada Familia
136	8	Teno
137	8	Vichuquén
138	8	Linares
139	8	Colbún
140	8	Longaví
141	8	Parral
142	8	Retiro
143	8	San Javier
144	8	Villa Alegre
145	8	Yerbas Buenas
146	9	Chillán
147	9	Chillán Viejo
148	9	Quillón
149	9	Bulnes
150	9	San Ignacio
151	9	El Carmen
152	9	Pinto
153	9	Pemuco
154	9	Yungay
155	9	Quirihue
156	9	Cobquecura
157	9	Ninhue
158	9	Treguaco
159	9	Coelemu
160	9	Portezuelo
161	9	Ránqui
162	9	San Carlos
163	9	Ñiquén
164	9	Coihueco
165	9	San Fabián
166	9	San Nico
167	10	Concepción
168	10	Coronel
169	10	Chiguayante
170	10	Florida
171	10	Hualqui
172	10	Lota
173	10	Penco
174	10	San Pedro de la Paz
175	10	Santa Juana
176	10	Talcahuano
177	10	Tomé
178	10	Hualpén
179	10	Lebu
180	10	Arauco
181	10	Cañete
182	10	Contulmo
183	10	Curanilahue
184	10	Los Álamos
185	10	Tirúa
186	10	Los Ángeles
187	10	Antuco
188	10	Cabrero
189	10	Laja
190	10	Mulchén
191	10	Nacimiento
192	10	Negrete
193	10	Quilaco
194	10	Quilleco
195	10	San Rosendo
196	10	Santa Bárbara
197	10	Tucapel
198	10	Yumbel
199	10	Alto Biobío
200	11	Temuco
201	11	Carahue
202	11	Cunco
203	11	Curarrehue
204	11	Freire
205	11	Galvarino
206	11	Gorbea
207	11	Lautaro
208	11	Loncoche
209	11	Melipeuco
210	11	Nueva Imperial
211	11	Padre Las Casas
212	11	Perquenco
213	11	Pitrufquén
214	11	Pucón
215	11	Saavedra
216	11	Teodoro Schmidt
217	11	Toltén
218	11	Vilcún
219	11	Villarrica
220	11	Cholchol
221	11	Angol
222	11	Collipulli
223	11	Curacautín
224	11	Ercilla
225	11	Lonquimay
226	11	Los Sauces
227	11	Lumaco
228	11	Purén
229	11	Renaico
230	11	Traiguén
231	11	Victoria
232	12	Valdivia
233	12	Corral
234	12	Lanco
235	12	Los Lagos
236	12	Máfil
237	12	Mariquina
238	12	Paillaco
239	12	Panguipulli
240	12	La Unión
241	12	Futrono
242	12	Lago Ranco
243	12	Río Bueno
244	13	Puerto Montt
245	13	Calbuco
246	13	Cochamó
247	13	Fresia
248	13	Frutillar
249	13	Los Muermos
250	13	Llanquihue
251	13	Maullín
252	13	Puerto Varas
253	13	Castro
254	13	Ancud
255	13	Chonchi
256	13	Curaco de Vélez
257	13	Dalcahue
258	13	Puqueldón
259	13	Queilén
260	13	Quellón
261	13	Quemchi
262	13	Quinchao
263	13	Osorno
264	13	Puerto Octay
265	13	Purranque
266	13	Puyehue
267	13	Río Negro
268	13	San Juan de la Costa
269	13	San Pablo
270	13	Chaitén
271	13	Futaleufú
272	13	Hualaihué
273	13	Palena
274	14	Coihaique
275	14	Lago Verde
276	14	Aisén
277	14	Cisnes
278	14	Guaitecas
279	14	Cochrane
280	14	O'Higgins
281	14	Tortel
282	14	Chile Chico
283	14	Río Ibáñez
284	15	Punta Arenas
285	15	Laguna Blanca
286	15	Río Verde
287	15	San Gregorio
288	15	Cabo de Hornos
289	15	Antártica
290	15	Porvenir
291	15	Primavera
292	15	Timaukel
293	15	Natales
294	15	Torres del Paine
\.

--
-- Data for Name: organizacion
--

COPY dogland.organizacion (id_organizacion, nombre_organizacion, telefono_organizacion, email_organizacion, id_ciudad, direccion) FROM stdin;
\.

--
-- Data for Name: usuario (1 USUARIO ADMIN CONSERVADO)
--

COPY dogland.usuario (id_usuario, nombre_usuario, apellido_paterno, apellido_materno, id_sexo, fecha_nacimiento, telefono, email, password_hash, fecha_creacion, fecha_ultimo_login, activo, id_ciudad, id_organizacion, id_rol) FROM stdin;
1	Admin	Test	Test	1	2001-01-01	900000000	admin@example.com	$2b$10$sQehJfhC5VzyUIutXhmqgOqXWN1f8FOKpajYl1x4ahBTTUGdNkL66	2025-10-21 21:16:38.757232+00	\N	t	200	\N	2
\.

--
-- Data for Name: password_reset
--

COPY dogland.password_reset (id_reset, id_usuario, token, expires_at, used, created_at) FROM stdin;
\.

--
-- Data for Name: google_accounts
--

COPY dogland.google_accounts (id_google_account, id_usuario, google_account_id, google_email, refresh_token, access_token, token_expiry, created_at, updated_at) FROM stdin;
\.

--
-- Data for Name: especie
--

COPY dogland.especie (id_especie, nombre_especie) FROM stdin;
1	Canino
2	Felino
3	Otro
\.

--
-- Data for Name: raza
--

COPY dogland.raza (id_raza, id_especie, nombre_raza) FROM stdin;
1	1	Labrador Retriever
2	1	Pastor Alemán
3	1	Bulldog
4	2	Persa
5	2	Siames
6	2	Maine Coon
7	3	Conejo
\.

--
-- Data for Name: estado_salud
--

COPY dogland.estado_salud (id_estado_salud, estado_salud) FROM stdin;
1	Saludable
2	Enfermo
3	Herido
4	Recuperando
5	Desconocido
\.

--
-- Data for Name: animal
--

COPY dogland.animal (id_animal, nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza) FROM stdin;
\.

--
-- Data for Name: animal_foto
--

COPY dogland.animal_foto (id_foto, id_animal, url) FROM stdin;
\.

--
-- Data for Name: estado_avistamiento
--

COPY dogland.estado_avistamiento (id_estado_avistamiento, estado_avistamiento) FROM stdin;
1	Activo
2	Desaparecido
3	Observado
4	Recuperado
\.

--
-- Data for Name: avistamiento
--

COPY dogland.avistamiento (id_avistamiento, id_usuario, id_estado_avistamiento, id_estado_salud, id_especie, fecha_creacion, fecha_actualizacion, descripcion, ubicacion, direccion) FROM stdin;
\.

--
-- Data for Name: avistamiento_foto
--

COPY dogland.avistamiento_foto (id_foto, id_avistamiento, url) FROM stdin;
\.

--
-- Data for Name: adopcion
--

COPY dogland.adopcion (id_adopcion, id_animal, id_usuario_rescatista, fecha_publicacion, fecha_adopcion, disponible, descripcion) FROM stdin;
\.

--
-- Data for Name: estado_solicitud
--

COPY dogland.estado_solicitud (id_estado_solicitud, estado_solicitud) FROM stdin;
1	Pendiente
2	Aprobada
3	Rechazada
4	Cancelada
\.

--
-- Data for Name: solicitud_adopcion
--

COPY dogland.solicitud_adopcion (id_solicitud_adopcion, id_usuario, id_adopcion, fecha_ingreso_solicitud, fecha_termino_solicitud, id_estado_solicitud) FROM stdin;
\.

--
-- Data for Name: tipo_alerta
--

COPY dogland.tipo_alerta (id_tipo_alerta, tipo_alerta) FROM stdin;
1	Jauria
2	Accidente
3	Robo
4	Animal Perdido
5	Otro
\.

--
-- Data for Name: nivel_riesgo
--

COPY dogland.nivel_riesgo (id_nivel_riesgo, nivel_riesgo) FROM stdin;
1	Bajo
2	Medio
3	Alto
4	Crítico
\.

--
-- Data for Name: alerta
--

COPY dogland.alerta (id_alerta, titulo, descripcion, id_tipo_alerta, id_nivel_riesgo, id_usuario, ubicacion, fecha_creacion, fecha_expiracion, activa, reportes) FROM stdin;
\.

--
-- Data for Name: dispositivo
--

COPY dogland.dispositivo (id_dispositivo, id_usuario, plataforma, token, fecha_creacion, fecha_actualizacion, activo) FROM stdin;
\.

--
-- Data for Name: historial_medico
--

COPY dogland.historial_medico (id_historial_medico, id_animal, fecha_evento, tipo_evento, diagnostico, detalles, nombre_veterinario) FROM stdin;
\.

--
-- Data for Name: audit_logs
--

COPY dogland.audit_logs (id_audit_log, id_usuario, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.

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
-- SEQUENCE VALUES
--

SELECT pg_catalog.setval('dogland.rol_id_rol_seq', 3, true);
SELECT pg_catalog.setval('dogland.sexo_id_sexo_seq', 3, true);
SELECT pg_catalog.setval('dogland.region_id_region_seq', 15, true);
SELECT pg_catalog.setval('dogland.ciudad_id_ciudad_seq', 294, true);
SELECT pg_catalog.setval('dogland.organizacion_id_organizacion_seq', 1, false);
SELECT pg_catalog.setval('dogland.usuario_id_usuario_seq', 1, true);
SELECT pg_catalog.setval('dogland.especie_id_especie_seq', 3, true);
SELECT pg_catalog.setval('dogland.raza_id_raza_seq', 7, true);
SELECT pg_catalog.setval('dogland.estado_salud_id_estado_salud_seq', 5, true);
SELECT pg_catalog.setval('dogland.estado_avistamiento_id_estado_avistamiento_seq', 4, true);
SELECT pg_catalog.setval('dogland.estado_solicitud_id_estado_solicitud_seq', 4, true);
SELECT pg_catalog.setval('dogland.tipo_alerta_id_tipo_alerta_seq', 5, true);
SELECT pg_catalog.setval('dogland.nivel_riesgo_id_nivel_riesgo_seq', 4, true);
SELECT pg_catalog.setval('dogland.avistamiento_id_avistamiento_seq', 1, false);
SELECT pg_catalog.setval('dogland.animal_id_animal_seq', 1, false);
SELECT pg_catalog.setval('dogland.adopcion_id_adopcion_seq', 1, false);

--
-- PostgreSQL database dump complete
--
