## 📱 Estructura y Funcionalidades del Frontend de Dogland

El frontend de Dogland, construido con **React Native, Expo y TypeScript**, está diseñado como una aplicación móvil intuitiva y completa, utilizando `expo-router` para la navegación basada en archivos (`app/`).

### 1\. Navegación Principal (`app/`) 🧭

La estructura de carpetas dentro de `app/` define las pantallas principales de la aplicación:

| Ruta de Carpeta | Pantallas y Flujo Principal | Funcionalidades Clave |
| :--- | :--- | :--- |
| **`auth`** | `login.tsx`, `register.tsx`, `forgot_password.tsx` | **Autenticación de Usuarios**. Maneja el acceso y la creación de cuentas. |
| **`home`** | `index.tsx` | Pantalla de inicio o *dashboard* de la aplicación. |
| **`create-report`** | `index.tsx` | **Creación de Reportes**. Flujo guiado para reportar un avistamiento de un animal callejero. |
| **`sightings`** | `index.tsx`, `[id].tsx` | **Avistamientos (Reportes)**. Lista de reportes y detalles de un reporte específico, probablemente incluyendo un mapa. |
| **`alerts`** | `index.tsx`, `create-alert.tsx`, `detail-alert.tsx`, `edit-alert.tsx` | **Gestión de Alertas Comunitarias**. Permite ver, crear y modificar alertas críticas (ej. jaurías agresivas). |
| **`adoptions`** | `index.tsx`, `perfilCan.tsx`, `solicitudAdopcion.tsx` | **Sistema de Adopción**. Lista de animales, perfiles detallados, y el proceso de postulación a adopción. |
| **`community_maps`** | `index.tsx` | **Mapa Comunitario**. Visualiza los reportes y alertas en tiempo real usando **`react-native-maps`**. |
| **`stats`** | `index.tsx` | **Estadísticas**. Muestra gráficos y datos relevantes (gracias a **`react-native-chart-kit`**) sobre la situación animal. |
| **`profile`**, **`settings`** | `index.tsx` | Gestión del perfil de usuario, historial y preferencias de la aplicación. |

### 2\. Capa de Servicios y Componentes Reutilizables 🏗️

  * **`src/api` (Conexión al Backend)**: Contiene los servicios (`adoptions.ts`, `alerts.ts`, `sighting.ts`, `users.ts`, etc.) que utilizan **`axios`** (visto en `package.json`) para comunicarse con la API de Node.js/Express. El archivo **`client.ts`** probablemente configura la URL base de la API y maneja la inclusión del token de autenticación (JWT).
  * **`src/components`**: Agrupa módulos de interfaz de usuario más pequeños y lógica específica:
      * **`report` y `sightings`**: Componentes para la visualización de reportes (`ReporteDetails.tsx`, `SightingCard.tsx`).
      * **`community_maps`**: Componentes específicos para el mapa (`MapsFilterModal.tsx`).
      * **`UI`**: Componentes básicos y genéricos (botón, encabezado, menú flotante) que aseguran la consistencia del diseño.
  * **`utils/expoNotifications.ts`**: Lógica de configuración y manejo de las **Notificaciones Push** usando el módulo **`expo-notifications`**.
  * **`utils/authStorage.ts`**: Utiliza **`expo-secure-store`** (visto en `package.json`) para manejar de forma segura el almacenamiento y recuperación de tokens de usuario (JWT).

### 3\. Tipos y Estilos (TypeScript) ✨

  * **`types`**: Define las estructuras de datos (interfaces) para la aplicación (`alert.ts`, `animals.ts`, `location.ts`, `user.ts`), crucial para la robustez de **TypeScript**.
  * **`constants`**: Almacena variables globales como colores (`colors.ts`) y fuentes (`fontFamily.ts`), garantizando un diseño unificado (gracias a las fuentes personalizadas en `assets/fonts`).

-----

## 🧪 Tutorial de Ejecución Específico para la Rama de Testing (Frontend)

Para probar la aplicación móvil, necesitamos asegurar que se conecta a la API de prueba y que todas las interacciones de usuario funcionan como se espera.

### 1\. Preconfiguración del Entorno de Pruebas

1.  **Navegación e Instalación:**
    ```bash
    cd /ruta/a/tu/carpeta/frontend
    npm install
    ```
2.  **Configuración de Conexión a la API:**
      * El archivo `.env` o la configuración en **`src/api/client.ts`** debe ser modificado para apuntar a la **URL del backend de pruebas** (ej. `http://[IP_LOCAL_COMPUTADOR]:3000`).

### 2\. Proceso de Inicio y Pruebas Funcionales

1.  **Iniciar la Aplicación Expo:**

    ```bash
    npm start
    ```

    Esto abrirá el Metro Bundler, listo para servir la aplicación a un dispositivo.

2.  **Ejecutar en Dispositivo/Emulador de Pruebas:**

      * Abre la aplicación **Expo Go** en el dispositivo/emulador y escanea el código QR que aparece en la terminal.

3.  **Escenarios Clave de Prueba Funcional (QA):**

| Funcionalidad | Escenario de Prueba | Módulos Clave a Verificar |
| :--- | :--- | :--- |
| **Autenticación** | Intentar iniciar sesión con credenciales válidas e inválidas. | `auth/login.tsx`, `authStorage.ts`, `api/users.ts`. |
| **Reporte** | Crear un nuevo reporte, permitiendo el acceso a la ubicación y adjuntando una foto. | `create-report/index.tsx`, `api/sightings.ts`, **`expo-location`**. |
| **Mapa** | Abrir el mapa y verificar que los marcadores (`ReporteMarker.tsx`) de los reportes de prueba se cargan correctamente con la librería **`react-native-maps`**. | `community_maps/index.tsx`, `report/ReporteMarker.tsx`. |
| **Adopciones** | Aplicar filtros (`filtroCan.tsx`) y verificar que la lista de animales se actualiza según la respuesta de la API. | `adoptions/index.tsx`, `api/adoptions.ts`, Componentes de `adoptions/component`. |
| **Notificaciones** | **(Requiere backend)** El backend debe enviar una notificación crítica. La aplicación debe recibirla y mostrarla (posiblemente usando `NotificationBanner.tsx`). | `utils/expoNotifications.ts`, `components/notifications/PushNotification.tsx`. |
| **UI/UX** | Navegar entre todas las pestañas de la `TabBar.tsx` y asegurarse de que el diseño se vea consistente (gracias a `constants/colors.ts`) y no haya fallos de diseño en diferentes resoluciones. | `components/UI/TabBar.tsx`, Archivos `_layout.tsx` de cada sección. |

Esto asegura que tanto la **interfaz de usuario** como la **integración con la API** de backend funcionan correctamente en un entorno de pruebas controlado.