import { Animal } from '../types/animals';

// Constantes y mapeos
export const FALLBACK_IMAGE =
  'https://placehold.co/600x400?text=Animal&font=montserrat';

export const HEALTH_MAPPING: Record<number, string> = {
  1: 'Sano',
  2: 'En tratamiento',
  3: 'Recuperado',
  4: 'Discapacitado',
};

export const BREED_MAPPING: Record<number, string> = {
  1: 'Labrador Retriever',
  2: 'Pastor Alemán',
  3: 'Bulldog',
  4: 'Persa',
  5: 'Siames',
  6: 'Maine Coon',
  7: 'Conejo',
};

export const SIZES_MAPPING: Record<number | string, string> = {
  Pequeño: 'Pequeño',
  Mediano: 'Mediano',
  Grande: 'Grande',
};

// Funciones utilitarias
export function toNumber(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function toStringSafe(v: any, fallback = ''): string {
  if (v == null) return fallback;
  return String(v);
}

export function getImageUrlCandidate(...candidates: any[]): string {
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim() !== '') return c;
  }
  return FALLBACK_IMAGE;
}

function parseEdadAproximada(raw: any): { months?: number; isApprox: boolean } {
  if (raw == null) return { isApprox: false };

  const s = String(raw).trim();
  if (s === '') return { isApprox: false };

  // Extraer número (soporta "60 meses", "3 meses", "120", "10 años", etc.)
  const numMatch = s.match(/(\d+)/);
  if (!numMatch) return { isApprox: true }; // existe texto pero sin número

  const n = Number(numMatch[1]);
  // Detectar unidad: si contiene "año" -> convertir a meses
  if (/año|años|años?/i.test(s)) {
    return { months: n * 12, isApprox: true };
  }
  // Por defecto: asumir meses si aparece "mes" o sin unidad asumir meses
  return { months: n, isApprox: true };
}

export function normalizeAnimal(raw: unknown): Animal {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, any>) : {};

  const id = toStringSafe(r.id_animal ?? r.id ?? '');
  const ageNum = toNumber(r.edad_animal ?? r.age ?? 0);
  const edad_aproximada = toStringSafe(r.edad_aproximada ?? `${ageNum} meses`);
  const name =
    toStringSafe(r.nombre_animal ?? r.name ?? 'Sin nombre').trim() ||
    'Sin nombre';

  const id_raza = r.id_raza ?? r.breed ?? null;
  const breed =
    id_raza != null
      ? typeof id_raza === 'number'
        ? id_raza
        : id_raza
      : 'Desconocida';

  const estadoMedico =
    r.id_estado_salud ?? r.estado_salud ?? r.estadoMedico ?? null;

  const imageUrl = getImageUrlCandidate(
    r.foto,
    r.imagen,
    r.imageUrl,
    FALLBACK_IMAGE,
  );

  // Normalizar tamaño
  const rawSize =
    r.tamano ?? r.tamanio ?? r['tamaño'] ?? r.size ?? r.tamanio ?? null;

  const size =
    rawSize != null
      ? typeof rawSize === 'number'
        ? SIZES_MAPPING[rawSize] ?? String(rawSize)
        : String(rawSize).trim() || undefined
      : undefined;

  const normalized: Animal = {
    id,
    name,
    breed,
    age: ageNum,
    edad_aproximada: edad_aproximada,
    imageUrl,
    size,
    health:
      estadoMedico != null && HEALTH_MAPPING[estadoMedico]
        ? HEALTH_MAPPING[estadoMedico]
        : r.health ?? null,
    estadoMedico,
    descripcionMedica: r.descripcion_medica ?? r.descripcionMedica ?? null,
    species: r.especie ?? r.species ?? null,
    isFavorited: Boolean(r.isFavorited ?? false),
    id_estado_salud: r.id_estado_salud ?? null,
    id_raza: r.id_raza ?? null,
  };

  return normalized;
}

export function getHealthLabel(animal: Animal): string | null {
  // Primero intentar con el mapeo de id_estado_salud
  if (animal.id_estado_salud && HEALTH_MAPPING[animal.id_estado_salud]) {
    return HEALTH_MAPPING[animal.id_estado_salud];
  }

  // Luego con estadoMedico
  if (animal.estadoMedico && HEALTH_MAPPING[animal.estadoMedico]) {
    return HEALTH_MAPPING[animal.estadoMedico];
  }

  // Finalmente con health string
  if (animal.health && typeof animal.health === 'string') {
    return animal.health;
  }

  return 'Desconocido';
}

export function getBreedLabel(breed: string | number | undefined): string {
  if (breed == null) return 'Desconocida';

  // Si es número, usar el mapeo de razas
  if (typeof breed === 'number') {
    return BREED_MAPPING[breed] ?? `Raza #${breed}`;
  }

  // Si es string numérico, convertir y mapear
  if (typeof breed === 'string') {
    const t = breed.trim();
    if (t === '') return 'Desconocida';
    if (/^\d+$/.test(t)) {
      const id = Number(t);
      return BREED_MAPPING[id] ?? `Raza #${id}`;
    }
    return t;
  }

  return 'Desconocida';
}

// Función adicional para obtener la edad display
export function getAgeDisplay(animal: Animal): string {
  // Si la edad aproximada viene como string válida, úsala
  if (animal.edad_aproximada && animal.edad_aproximada.trim() !== '') {
    return animal.edad_aproximada;
  }

  // Si solo viene edad numérica (meses)
  const m = Number(animal.age ?? 0);

  if (m <= 0) return 'Desconocida';
  if (m < 12) return `${m} meses`;

  const years = Math.floor(m / 12);
  const restMonths = m % 12;

  if (restMonths === 0) return `${years} años`;
  return `${years} años ${restMonths} meses`;
}

export function getAgeInYearsDisplay(
  age: number | string | undefined | null,
): string {
  if (age == null) return 'Desconocida';

  const years = Number(age);
  if (isNaN(years) || years < 0) return 'Desconocida';

  if (years === 0) return '0 año';

  return `${years} año${years === 1 ? '' : 's'}`;
}

// Función helper para formatear raza (usada en PerfilCan)
export const formatBreed = (b: any): string => {
  if (b == null) return 'Desconocida';
  if (typeof b === 'number' || /^\d+$/.test(String(b)))
    return getBreedLabel(Number(b));
  if (typeof b === 'object') return b?.name ?? String(b?.id ?? 'Desconocida');
  if (typeof b === 'string' && b.trim() !== '') return b;
  return 'Desconocida';
};
