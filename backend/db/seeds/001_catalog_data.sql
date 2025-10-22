-- Seed data para tablas de catalogo
-- Este archivo contiene los datos iniciales que no cambian

-- Roles
INSERT INTO rol (id_rol, nombre_rol) VALUES
  (1, 'Admin'),
  (2, 'Usuario'),
  (3, 'Trabajador')
ON CONFLICT (id_rol) DO NOTHING;

-- Sexos
INSERT INTO sexo (id_sexo, sexo) VALUES
  (1, 'M'),
  (2, 'F'),
  (3, 'O')
ON CONFLICT (id_sexo) DO NOTHING;

-- Especies
INSERT INTO especie (id_especie, nombre_especie) VALUES
  (1, 'Canino'),
  (2, 'Felino'),
  (3, 'Otro')
ON CONFLICT (id_especie) DO NOTHING;

-- Estados de Avistamiento
INSERT INTO estado_avistamiento (id_estado_avistamiento, estado_avistamiento) VALUES
  (1, 'Activo'),
  (2, 'Desaparecido'),
  (3, 'Observado'),
  (4, 'Recuperado')
ON CONFLICT (id_estado_avistamiento) DO NOTHING;

-- Estados de Salud
INSERT INTO estado_salud (id_estado_salud, estado_salud) VALUES
  (1, 'Saludable'),
  (2, 'Enfermo'),
  (3, 'Herido'),
  (4, 'Recuperando'),
  (5, 'Desconocido'),
  (6, 'Saludable'),
  (7, 'Enfermo'),
  (8, 'Recuperándose'),
  (9, 'Desconocido')
ON CONFLICT (id_estado_salud) DO NOTHING;

-- Estados de Solicitud
INSERT INTO estado_solicitud (id_estado_solicitud, estado_solicitud) VALUES
  (1, 'Pendiente'),
  (2, 'Aprobada'),
  (3, 'Rechazada'),
  (4, 'Cancelada')
ON CONFLICT (id_estado_solicitud) DO NOTHING;

-- Nivel de Riesgo
INSERT INTO nivel_riesgo (id_nivel_riesgo, nivel_riesgo) VALUES
  (1, 'Bajo'),
  (2, 'Medio'),
  (3, 'Alto'),
  (4, 'Crítico')
ON CONFLICT (id_nivel_riesgo) DO NOTHING;

-- Razas
INSERT INTO raza (id_raza, id_especie, nombre_raza) VALUES
  (1, 1, 'Labrador Retriever'),
  (2, 1, 'Pastor Alemán'),
  (3, 1, 'Bulldog'),
  (4, 2, 'Persa'),
  (5, 2, 'Siames'),
  (6, 2, 'Maine Coon'),
  (7, 3, 'Conejo'),
  (8, 1, 'Labrador'),
  (9, 1, 'Pastor Alemán'),
  (10, 1, 'Bulldog'),
  (11, 2, 'Siamés'),
  (12, 2, 'Persa'),
  (13, 2, 'Maine Coon'),
  (14, 3, 'Angora'),
  (15, 3, 'Mini Lop')
ON CONFLICT (id_raza) DO NOTHING;
