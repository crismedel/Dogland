-- Seed data para tablas de catalogo
-- Este archivo contiene los datos iniciales que no cambian

-- Set search path to dogland schema
SET search_path TO dogland;

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
-- Data for Name: especie
--

COPY dogland.especie (id_especie, nombre_especie) FROM stdin;
1	Canino
2	Felino
3	Otro
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
-- Data for Name: estado_solicitud
--

COPY dogland.estado_solicitud (id_estado_solicitud, estado_solicitud) FROM stdin;
1	Pendiente
2	Aprobada
3	Rechazada
4	Cancelada
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
-- Data for Name: region (16 REGIONES)
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
16	Región Metropolitana de Santiago
\.

--
-- Data for Name: ciudad (SIN DUPLICADOS, 346 CIUDADES)
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
293	15	Puerto Natales
294	15	Torres del Paine
295	16	Santiago
296	16	Cerrillos
297	16	Cerro Navia
298	16	Conchalí
299	16	El Bosque
300	16	Estación Central
301	16	Huechuraba
302	16	Independencia
303	16	La Cisterna
304	16	La Florida
305	16	La Granja
306	16	La Pintana
307	16	La Reina
308	16	Las Condes
309	16	Lo Barnechea
310	16	Lo Espejo
311	16	Lo Prado
312	16	Macul
313	16	Maipú
314	16	Ñuñoa
315	16	Pedro Aguirre Cerda
316	16	Peñalolén
317	16	Providencia
318	16	Pudahuel
319	16	Quilicura
320	16	Quinta Normal
321	16	Recoleta
322	16	Renca
323	16	San Joaquín
324	16	San Miguel
325	16	San Ramón
326	16	Vitacura
327	16	Puente Alto
328	16	Pirque
329	16	San José de Maipo
330	16	Colina
331	16	Lampa
332	16	Tiltil
333	16	San Bernardo
334	16	Buin
335	16	Calera de Tango
336	16	Paine
337	16	Melipilla
338	16	Alhué
339	16	Curacaví
340	16	María Pinto
341	16	San Pedro
342	16	Talagante
343	16	El Monte
344	16	Isla de Maipo
345	16	Padre Hurtado
346	16	Peñaflor
\.

--
-- SEQUENCE VALUES
-- Reset sequences to current max values after data insertion
--

SELECT pg_catalog.setval('dogland.rol_id_rol_seq', 3, true);
SELECT pg_catalog.setval('dogland.sexo_id_sexo_seq', 3, true);
SELECT pg_catalog.setval('dogland.region_id_region_seq', 16, true);
SELECT pg_catalog.setval('dogland.ciudad_id_ciudad_seq', 346, true);
SELECT pg_catalog.setval('dogland.organizacion_id_organizacion_seq', 1, false);
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
SELECT pg_catalog.setval('dogland.usuario_id_usuario_seq', 1, false);
SELECT pg_catalog.setval('dogland.password_reset_id_reset_seq', 1, false);
SELECT pg_catalog.setval('dogland.google_accounts_id_google_account_seq', 1, false);
SELECT pg_catalog.setval('dogland.animal_foto_id_foto_seq', 1, false);
SELECT pg_catalog.setval('dogland.avistamiento_foto_id_foto_seq', 1, false);
SELECT pg_catalog.setval('dogland.solicitud_adopcion_id_solicitud_adopcion_seq', 1, false);
SELECT pg_catalog.setval('dogland.alerta_id_alerta_seq', 1, false);
SELECT pg_catalog.setval('dogland.dispositivo_id_dispositivo_seq', 1, false);
SELECT pg_catalog.setval('dogland.historial_medico_id_historial_medico_seq', 1, false);
SELECT pg_catalog.setval('dogland.audit_logs_id_audit_log_seq', 1, false);
