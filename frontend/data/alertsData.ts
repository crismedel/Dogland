// 📂 src/data/alertsData.ts

import { Alert } from '../app/alerts/index';

export const mockAlerts: Alert[] = [
  // 🚨 SANITARIO
  {
    id: '1',
    title: '🦠 Foco Sanitario Detectado',
    description:
      'Se confirmó un caso de sarna en perros callejeros en el sector Amanecer. Evite el contacto y notifique a las autoridades.',
    date: '2025-09-06',
    type: 'sanitario',
  },
  {
    id: '2',
    title: '🦠 Brote de Zoonosis Confirmado',
    description:
      'Detectado brote de parásitos en Labranza. Autoridades sanitarias activaron protocolo de emergencia.',
    date: '2025-09-06',
    type: 'sanitario',
  },
  {
    id: '3',
    title: '💉 Vacunas Atrasadas - Zona Crítica',
    description:
      'Múltiples animales sin historial de vacunación antirrábica en Pedro de Valdivia. Riesgo sanitario elevado.',
    date: '2025-09-05',
    type: 'sanitario',
  },

  // ⚠️ SEGURIDAD
  {
    id: '4',
    title: '⚠️ Jauría Peligrosa Detectada',
    description:
      'Se reportó una jauría agresiva en Labranza. Se recomienda precaución al transitar en la zona.',
    date: '2025-09-05',
    type: 'seguridad',
  },
  {
    id: '5',
    title: '🚨 Ataque Reportado',
    description:
      'Ataque de perros callejeros a menor de edad en Plaza Aníbal Pinto. Autoridades en terreno.',
    date: '2025-09-04',
    type: 'seguridad',
  },
  {
    id: '6',
    title: '⚠️ Animal Agresivo Identificado',
    description:
      'Perro territorial en paradero de Av. Alemania. Evitar acercarse y contactar a control animal.',
    date: '2025-09-03',
    type: 'seguridad',
  },
  {
    id: '7',
    title: '📈 Aumento de Denuncias',
    description:
      'Incremento del 40% en reportes de jaurías en sector Amanecer durante la última semana.',
    date: '2025-09-02',
    type: 'seguridad',
  },

  // 🐾 VACUNACIÓN
  {
    id: '8',
    title: '💉 Campaña de Vacunación',
    description:
      'Vacunación gratuita antirrábica en la Plaza Teodoro Schmidt este sábado a las 11:00 hrs. Cupos limitados.',
    date: '2025-09-08',
    type: 'vacunacion',
  },
  {
    id: '9',
    title: '✂️ Jornada de Esterilización',
    description:
      'Esterilización gratuita para perros y gatos en Centro Comunitario Labranza. Inscripciones disponibles.',
    date: '2025-09-09',
    type: 'vacunacion', // ← mapeado a vacunacion
  },
  {
    id: '10',
    title: '📚 Taller sobre Tenencia Responsable',
    description:
      'Capacitación comunitaria sobre cuidado responsable de mascotas en Municipalidad de Temuco.',
    date: '2025-09-12',
    type: 'vacunacion', // ← se agrupa en preventivas / comunitarias
  },

  // 🐶 ADOPCIÓN
  {
    id: '11',
    title: '🐶 Jornada de Adopción',
    description:
      'Este domingo en el Estadio Germán Becker podrás adoptar perros rescatados de forma responsable.',
    date: '2025-09-10',
    type: 'adopcion',
  },
  {
    id: '12',
    title: '🏠 Refugio en Sobrecupo',
    description:
      'Refugio "Patitas Felices" está con capacidad al 150%. Se buscan adoptantes urgentes.',
    date: '2025-09-03',
    type: 'adopcion', // ← mapeado como incentivo a adopciones
  },

  // 🔍 PERDIDA / ABANDONO / RESCATE
  {
    id: '13',
    title: '🔍 Mascota Perdida',
    description:
      'Se busca perro raza Labrador, color amarillo, perdido en Pedro de Valdivia. Contacto: +56 9 XXXX XXXX.',
    date: '2025-09-04',
    type: 'perdida',
  },
  {
    id: '14',
    title: '🐕 Animal Abandonado',
    description:
      'Perro abandonado en estado crítico encontrado en Av. Rudecindo Ortega. Requiere rescate inmediato.',
    date: '2025-09-06',
    type: 'perdida', // ← mapeado aquí
  },
  {
    id: '15',
    title: '🚑 Rescate de Emergencia',
    description:
      'Perro atropellado en Av. Balmaceda requiere atención veterinaria urgente. Voluntarios en camino.',
    date: '2025-09-06',
    type: 'perdida', // ← también entra como pérdida de bienestar
  },
];
