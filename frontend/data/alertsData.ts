import { Alert } from '../features/alerts/types';

export const mockAlerts: Alert[] = [
  // 🚨 SANITARIO
  {
    id: '1',
    title: 'Foco Sanitario Detectado',
    description:
      'Se confirmó un caso de sarna en perros callejeros en el sector Amanecer. Evite el contacto y notifique a las autoridades.',
    date: '2025-09-06',
    type: 'sanitario',
    riskLevel: 'alto',
    location: 'Sector Amanecer',
    isActive: true,
    expirationDate: '2025-09-20',
    reportCount: 3,
  },
  {
    id: '2',
    title: 'Brote de Zoonosis Confirmado',
    description:
      'Detectado brote de parásitos en Labranza. Autoridades sanitarias activaron protocolo de emergencia.',
    date: '2025-09-06',
    type: 'sanitario',
    riskLevel: 'alto',
    location: 'Labranza',
    isActive: true,
    expirationDate: '2025-09-25',
    reportCount: 7,
  },
  {
    id: '3',
    title: 'Vacunas Atrasadas - Zona Crítica',
    description:
      'Múltiples animales sin historial de vacunación antirrábica en Pedro de Valdivia. Riesgo sanitario elevado.',
    date: '2025-09-05',
    type: 'sanitario',
    riskLevel: 'alto',
    location: 'Pedro de Valdivia',
    isActive: false,
    expirationDate: '2025-09-01',
    reportCount: 12,
  },

  // ⚠️ SEGURIDAD
  {
    id: '4',
    title: 'Jauría Peligrosa Detectada',
    description:
      'Se reportó una jauría agresiva en Labranza. Se recomienda precaución al transitar en la zona.',
    date: '2025-09-05',
    type: 'seguridad',
    riskLevel: 'alto',
    location: 'Labranza',
    isActive: true,
    expirationDate: '2025-09-15',
    reportCount: 5,
  },
  {
    id: '5',
    title: 'Ataque Reportado',
    description:
      'Ataque de perros callejeros a menor de edad en Plaza Aníbal Pinto. Autoridades en terreno.',
    date: '2025-09-04',
    type: 'seguridad',
    riskLevel: 'alto',
    location: 'Plaza Aníbal Pinto',
    isActive: false,
    expirationDate: '2025-09-05',
    reportCount: 1,
  },
  {
    id: '6',
    title: 'Animal Agresivo Identificado',
    description:
      'Perro territorial en paradero de Av. Alemania. Evitar acercarse y contactar a control animal.',
    date: '2025-09-03',
    type: 'seguridad',
    riskLevel: 'medio',
    location: 'Av. Alemania',
    isActive: true,
    expirationDate: '2025-09-17',
    reportCount: 2,
  },
  {
    id: '7',
    title: 'Aumento de Denuncias',
    description:
      'Incremento del 40% en reportes de jaurías en sector Amanecer durante la última semana.',
    date: '2025-09-02',
    type: 'seguridad',
    riskLevel: 'medio',
    location: 'Sector Amanecer',
    isActive: false,
    expirationDate: '2025-09-04',
    reportCount: 8,
  },

  // 🐾 VACUNACIÓN
  {
    id: '8',
    title: 'Campaña de Vacunación',
    description:
      'Vacunación gratuita antirrábica en la Plaza Teodoro Schmidt este sábado a las 11:00 hrs. Cupos limitados.',
    date: '2025-09-01',
    type: 'vacunacion',
    riskLevel: 'bajo',
    location: 'Plaza Teodoro Schmidt',
    isActive: false,
    expirationDate: '2025-09-02',
    reportCount: 0,
  },
  {
    id: '9',
    title: 'Jornada de Esterilización',
    description:
      'Esterilización gratuita para perros y gatos en Centro Comunitario Labranza. Inscripciones disponibles.',
    date: '2025-09-09',
    type: 'vacunacion',
    riskLevel: 'bajo',
    location: 'Centro Comunitario Labranza',
    isActive: true,
    expirationDate: '2025-09-09',
    reportCount: 0,
  },
  {
    id: '10',
    title: 'Taller sobre Tenencia Responsable',
    description:
      'Capacitación comunitaria sobre cuidado responsable de mascotas en Municipalidad de Temuco.',
    date: '2025-09-12',
    type: 'vacunacion',
    riskLevel: 'bajo',
    location: 'Municipalidad de Temuco',
    isActive: true,
    expirationDate: '2025-09-12',
    reportCount: 0,
  },

  // 🐶 ADOPCIÓN
  {
    id: '11',
    title: 'Jornada de Adopción',
    description:
      'Este domingo en el Estadio Germán Becker podrás adoptar perros rescatados de forma responsable.',
    date: '2025-09-01',
    type: 'adopcion',
    riskLevel: 'bajo',
    location: 'Estadio Germán Becker',
    isActive: false,
    expirationDate: '2025-09-01',
    reportCount: 0,
  },
  {
    id: '12',
    title: 'Refugio en Sobrecupo',
    description:
      'Refugio "Patitas Felices" está con capacidad al 150%. Se buscan adoptantes urgentes.',
    date: '2025-09-03',
    type: 'adopcion',
    riskLevel: 'medio',
    location: 'Refugio Patitas Felices',
    isActive: true,
    expirationDate: '2025-10-03',
    reportCount: 1,
  },

  // 🔍 PERDIDA / ABANDONO / RESCATE
  {
    id: '13',
    title: 'Mascota Perdida',
    description:
      'Se busca perro raza Labrador, color amarillo, perdido en Pedro de Valdivia. Contacto: +56 9 XXXX XXXX.',
    date: '2025-08-30',
    type: 'perdida',
    riskLevel: 'medio',
    location: 'Pedro de Valdivia',
    isActive: false,
    expirationDate: '2025-09-02',
    reportCount: 1,
  },
  {
    id: '14',
    title: 'Animal Abandonado',
    description:
      'Perro abandonado en estado crítico encontrado en Av. Rudecindo Ortega. Requiere rescate inmediato.',
    date: '2025-09-06',
    type: 'perdida',
    riskLevel: 'alto',
    location: 'Av. Rudecindo Ortega',
    isActive: true,
    expirationDate: '2025-09-13',
    reportCount: 2,
  },
  {
    id: '15',
    title: 'Rescate de Emergencia',
    description:
      'Perro atropellado en Av. Balmaceda requiere atención veterinaria urgente. Voluntarios en camino.',
    date: '2025-09-06',
    type: 'perdida',
    riskLevel: 'alto',
    location: 'Av. Balmaceda',
    isActive: true,
    expirationDate: '2025-09-13',
    reportCount: 1,
  },
];
