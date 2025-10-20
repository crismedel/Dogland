## ⚙️ Estructura y Funcionalidades del Backend de Dogland

El backend está organizado de manera modular, siguiendo el patrón **MVC (Modelo-Vista-Controlador)** con una clara separación de responsabilidades para manejar todas las operaciones de la plataforma.

### 1\. Controladores (`controllers`) 💻

Estos archivos contienen la **lógica de negocio** principal, interactuando con la base de datos a través de los modelos y las rutas.

| Controlador | Funcionalidad Principal |
| :--- | :--- |
| `adoptionsController.js` | Gestiona el proceso de adopciones, incluyendo la aplicación, aprobación/rechazo y filtros avanzados. |
| `alertsController.js` | Maneja la creación y distribución de alertas críticas comunitarias. |
| `animalController.js` | Controla la creación, actualización y consulta de perfiles de animales (callejeros o en adopción). |
| `sightingController.js` | Gestiona los reportes georreferenciados de avistamientos de animales callejeros. |
| `notificationsController.js` | Lógica para la creación, envío y seguimiento de las notificaciones push. |
| `statsController.js` | Recopila y procesa datos para generar estadísticas sobre la población animal, reportes y adopciones. |
| `usersController.js` | Maneja el registro, login, actualización de perfiles y la gestión de usuarios. |
| `animalFullController.js`, `medicalHistoryController.js` | Controladores específicos para información detallada y registros médicos de los animales. |

### 2\. Rutas (`routes`) 🛣️

Definen los **endpoints** de la API y dirigen las solicitudes HTTP al controlador apropiado.

| Archivo de Ruta | Endpoints (Ejemplo) | Propósito |
| :--- | :--- | :--- |
| `auth.js` | `/api/login`, `/api/register` | Manejo de autenticación y autorización (Login/Registro). |
| `users.js` | `/api/users/:id` | Operaciones CRUD sobre los perfiles de usuario. |
| `animals.js` | `/api/animals`, `/api/animals/:id` | Endpoints para la gestión de animales. |
| `sightings.js` | `/api/sightings` | Recibir y consultar los reportes georreferenciados. |
| `alerts.js` | `/api/alerts` | Creación y distribución de alertas críticas. |
| `stats.js` | `/api/stats/dashboard` | Endpoints para el consumo de datos estadísticos. |

### 3\. Middlewares y Seguridad 🔒

Estos componentes aseguran la protección y el correcto flujo de datos a través de la API.

  * **`auth.js`**: Verifica el token **JWT** (`jsonwebtoken`) en las solicitudes para asegurar que solo usuarios autenticados puedan acceder a rutas protegidas.
  * **`permissions.js`**: Aplica la lógica de autorización (roles) para limitar qué usuarios pueden realizar ciertas acciones.
  * **`validateParams.js`**, `validateSchema.js`, `validationAdoption.js`, `validationAlert.js`, `validationAnimal.js`: Utiliza la librería **`zod`** (mencionada en `package.json`) para **validar y sanear** los datos de entrada (inputs) antes de que lleguen a los controladores, previniendo errores y ataques.
  * **`corsConfig.js`**: Configura el **CORS** (`cors`) para permitir que la aplicación móvil (frontend) se comunique con el backend.
  * **`errorHandler.js`**: Centraliza el manejo de errores, devolviendo respuestas uniformes y útiles.

### 4\. Servicios Adicionales 📧

  * **`mail`**: Configuración (`mail.config.js`) y servicio (`mail.service.js`) de correo electrónico usando **`nodemailer`** para enviar notificaciones importantes (ej. confirmación de cuenta, restablecimiento de contraseña). Utiliza plantillas de **`handlebars`** (`templates`) para dar formato a los correos.
  * **`db`**: Archivos de conexión y configuración a la base de datos (`db.js`), usando **`pg`** o **`pg-promise`** (PostgreSQL) o **`mysql2`**.
  * **`utils/hash.js`**: Utiliza **`bcrypt`** para asegurar que las contraseñas se almacenen de forma segura y nunca en texto plano.

-----

## 🧪 Tutorial de Ejecución Específico para la Rama de Testing

El flujo de trabajo en la rama de *testing* se centra en la verificación de la **integridad y funcionalidad de la API** mediante pruebas automatizadas antes de la implementación manual con el frontend.

### 1\. Preconfiguración del Entorno de Pruebas

1.  **Navegación e Instalación:**
    ```bash
    cd /ruta/a/tu/carpeta/backend
    npm install
    ```
2.  **Configuración del Entorno (`.env`):**
    Asegúrate de tener un archivo `.env` configurado. Para la rama de testing, se recomienda modificar las variables para que apunten a una **Base de Datos de Pruebas** separada (ej. `TEST_DB_NAME` vs `DB_NAME`).

### 2\. Ejecución de Pruebas de Integración y Unitarias

El `package.json` ya incluye el script `"test": "jest"`.

1.  **Revisar Configuración de Pruebas:**
    Los archivos `jest.config.cjs` y `jest.setup.js` definen cómo se ejecutarán las pruebas.
2.  **Ejecutar Pruebas Automatizadas:**
    Ejecuta el script de pruebas para validar los módulos críticos de la API.
    ```bash
    npm test
    ```
      * **Archivos a Probar:** `auth.test.js` y `users.test.js` (en la carpeta `tests/integration`) utilizarán **`supertest`** para enviar peticiones HTTP simuladas a tu API y verificar que:
          * El registro de usuarios funciona correctamente.
          * El *login* devuelve un token **JWT** válido.
          * Las rutas protegidas (`/users/:id`) son inaccesibles sin un token.
          * La validación de esquemas (**`zod`**) previene datos incorrectos.

### 3\. Ejecución Manual de la API para Pruebas de Integración (Frontend)

Para probar la conexión en vivo con la aplicación móvil (frontend), debes iniciar el servidor:

1.  **Iniciar el Servidor en Modo Desarrollo:**
    ```bash
    npm run dev
    # El servidor se iniciará y se reiniciará automáticamente con 'nodemon' al detectar cambios.
    ```
2.  **Verificación de Endpoints:**
    Utiliza una herramienta como **Postman** o **Insomnia** para verificar manualmente los endpoints clave antes de entregárselos al equipo de frontend:
      * **Probar Login:** Enviar credenciales a `/api/login` y capturar el JWT.
      * **Probar una Ruta Protegida (ej. Reporte):** Enviar un `POST` a `/api/sightings` incluyendo el JWT en el *header* `Authorization: Bearer <token>`.
      * **Verificar Notificaciones Push:** Simular un evento en el controlador `notificationsController.js` para asegurar que el **`expo-server-sdk`** esté enviando correctamente la data de alerta.