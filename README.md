## 🐕 Funcionalidades Clave del Proyecto Dogland

El proyecto Dogland se centra en ser una plataforma colaborativa y tecnológicamente avanzada para gestionar la problemática de los animales callejeros en Temuco, cumpliendo con los objetivos específicos definidos:

### 1\. Gestión de Reportes y Georreferenciación 🗺️

  * **Reporte Colaborativo:** Los usuarios pueden crear reportes detallados de animales callejeros (estado, necesidad de ayuda, etc.).
  * **Geolocalización:** Cada reporte incluye la ubicación exacta (latitud y longitud) gracias a **`expo-location`** y se visualiza en un mapa interactivo usando **`react-native-maps`**.
  * **Gestión de Datos:** El backend de Node.js/Express maneja el almacenamiento seguro de estos reportes en la base de datos (PostgreSQL/MySQL), permitiendo a los administradores y rescatistas tener una visión clara de los **puntos críticos** en la comuna.

### 2\. Sistema de Adopciones y Perfiles 🏡

  * **Perfiles de Animales:** Se gestionan perfiles completos de los animales rescatados listos para adopción.
  * **Filtros Avanzados:** La aplicación facilita la búsqueda de la mascota ideal mediante filtros por especie, edad, tamaño y temperamento.
  * **Gestión de Usuarios:** El backend autentica a los usuarios con **JWT** (`jsonwebtoken`) y **`bcrypt`** y gestiona sus perfiles, incluyendo posibles adoptantes y rescatistas.

### 3\. Alertas Comunitarias y Notificaciones Push 🚨

  * **Notificaciones Críticas:** Se implementa un sistema para enviar **notificaciones push** (`expo-notifications` y **`expo-server-sdk`** en el backend) a los usuarios cercanos a zonas de riesgo (ej. jaurías, animales heridos graves) o para alertar sobre operativos de rescate.
  * **Comunicación Segura:** Se utiliza **`expo-secure-store`** para almacenar tokens y datos sensibles de manera segura en el dispositivo.

### 4\. Tenencia Responsable y Educativa 💡

  * La plataforma incluye secciones de contenido para **promover la educación** sobre el cuidado, esterilización y responsabilidad legal de la tenencia de mascotas.

-----

## 🧪 Tutorial de Ejecución para Rama de Testing

Dado que este es un proyecto con un *frontend* (Dogland) y un *backend* (backend) separados, se debe asegurar que ambos se comuniquen correctamente para realizar pruebas funcionales.

### 1\. Configuración del Backend (API de Pruebas)

El backend será la fuente de datos (usuarios de prueba, reportes, animales).

1.  **Navegar e Instalar Dependencias:**
    ```bash
    cd /ruta/a/tu/carpeta/backend
    npm install
    ```
2.  **Preparar el Entorno de Pruebas:**
      * **Base de Datos de Pruebas:** Asegúrate de configurar una base de datos separada (ej. `dogland_test`) para evitar corromper los datos de producción. El backend probablemente usa variables de entorno (`dotenv`) para esta configuración.
      * **Scripts de Pruebas:** El `package.json` incluye un *script* para ejecutar pruebas unitarias/de integración.
        ```json
        "scripts": {
          "test": "jest",
          ...
        }
        ```
      * **Ejecutar Pruebas:**
        ```bash
        npm test
        ```
        Esto utiliza **`jest`** y potencialmente **`supertest`** para verificar la lógica de la API (ej. autenticación, *endpoints* de reportes, etc.).
3.  **Iniciar el Servidor para Pruebas Manuales:**
    Si el equipo de *frontend* (o QA) necesita probar la aplicación contra la API, se inicia el servidor.
    ```bash
    npm run dev
    # o: npm start
    ```
    ⚠️ **Importante:** Anota el URL/IP y el puerto donde se inicia el backend (ej. `http://localhost:3000`). Este deberá ser accesible desde el dispositivo de prueba. Si usas un dispositivo físico en tu red, reemplaza `localhost` por la IP local de tu computador.

### 2\. Configuración del Frontend (Aplicación Móvil de Pruebas)

El frontend es la interfaz donde se realizarán las pruebas funcionales de usuario.

1.  **Navegar e Instalar Dependencias:**
    ```bash
    cd /ruta/a/tu/carpeta/Dogland
    npm install
    ```
2.  **Configurar Conexión a la API:**
      * En el código de la aplicación React Native, debes **modificar la variable de entorno** o el archivo de configuración que apunta a la URL del backend, reemplazándola con la URL de la API de pruebas que anotaste en el paso anterior.
3.  **Iniciar el Proyecto Expo:**
    Usa el script de inicio para lanzar el proceso de *bundling* de Expo.
    ```bash
    npm start
    ```
4.  **Ejecución en Dispositivos de Prueba:**
      * **Dispositivos Físicos/Emuladores:** Escanea el código QR con la aplicación **Expo Go** en el dispositivo/emulador donde se realizarán las pruebas funcionales (Android o iOS).
      * **Comprobación:** Asegúrate de que el dispositivo pueda comunicarse con la IP de tu backend (paso 1).
      * **Prueba Funcional:** Una vez cargada la aplicación, el equipo de pruebas debe ejecutar los escenarios clave:
          * **Registro/Login** (Verificar la autenticación segura).
          * **Reporte con GPS** (Verificar la precisión de **`expo-location`** y el envío de datos a la API).
          * **Filtros de Adopción** (Verificar que los filtros del `MultiSlider` y *pickers* funcionen y la API devuelva los datos correctos).
          * **Notificaciones Push** (Simular un evento crítico en el backend y verificar la recepción con **`expo-notifications`**).