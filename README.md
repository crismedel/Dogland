## Dogland

**Dogland** es una plataforma digital colaborativa diseñada para abordar y mitigar la compleja problemática de la **sobrepoblación de animales callejeros** en la comuna de **Temuco**. Utilizando tecnología moderna, busca ser el nexo entre la comunidad, los rescatistas y los organismos locales para promover el bienestar animal, la seguridad ciudadana y la tenencia responsable.

### ⚠️ Nuestra Problemática

Temuco se enfrenta a un desafío significativo por el aumento de animales callejeros, lo que genera una serie de consecuencias graves:

1.  **Riesgos Sanitarios:** La falta de control propicia la propagación de **enfermedades zoonóticas** (transmisibles de animales a humanos), afectando la salud pública.
2.  **Inseguridad Ciudadana:** La formación de **jaurías agresivas** representa un peligro para la comunidad.
3.  **Colapso de Refugios:** Existe una grave **falta de coordinación y recursos** que sobrepasa la capacidad de los refugios locales para gestionar la creciente cantidad de animales.

### 🎯 Nuestros Objetivos

El propósito principal de Dogland es **desarrollar una plataforma digital** que permita:

  * **Controlar y prevenir enfermedades** en animales callejeros.
  * **Promover la tenencia responsable** de mascotas.
  * Mejorar la **seguridad ciudadana** al gestionar la ubicación y estado de los animales.
  * Asegurar el **bienestar animal** en la comuna.

### 🛠️ Tecnología

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend (Servidor)** | **Node.js** con **Express** | Manejo de la lógica de negocio, seguridad, autenticación (JWT), bases de datos (MySQL2/PostgreSQL), envío de correos (Nodemailer) y notificaciones (Expo Server SDK). |
| **Frontend (Aplicación)** | **React Native** con **Expo** | Desarrollo de la aplicación móvil multiplataforma (Android/iOS) con funcionalidades avanzadas como geolocalización (expo-location, react-native-maps), notificaciones push (expo-notifications) y gestión de formularios (react-hook-form). |

-----

## Funcionalidades Clave y Estructura

Dogland busca ser una solución integral, desarrollando las siguientes funcionalidades principales:

1.  **Gestión de Reportes Georreferenciados:**

      * Los usuarios podrán reportar animales callejeros, indicando su estado de salud, ubicación exacta (gracias a la **georreferenciación** con `expo-location` y `react-native-maps`) y adjuntando imágenes.
      * Esto permite a rescatistas y la comunidad visualizar los puntos críticos en un mapa.

2.  **Sistema de Adopciones Avanzado:**

      * Una sección dedicada a la adopción con **filtros avanzados** para facilitar la búsqueda de un nuevo hogar para los animales rescatados.
      * Gestión de perfiles de usuarios y animales.

3.  **Alertas Comunitarias y Notificaciones:**

      * Implementación de **Notificaciones Push** (`expo-notifications` y `expo-server-sdk`) para alertar a la comunidad sobre situaciones críticas (ej. jaurías agresivas, animales heridos en una zona específica, operativos de rescate).

4.  **Promoción de la Tenencia Responsable:**

      * Inclusión de contenido educativo y recursos para fomentar el cuidado adecuado y la responsabilidad de los dueños de mascotas.

-----

## Pequeño Tutorial de Uso del Proyecto Dogland

El proyecto Dogland se divide en dos componentes principales: el *backend* (servidor) y el *frontend* (aplicación móvil). Para utilizar y probar el proyecto, necesitarás iniciar ambos.

### 1\. Requisitos Previos

Asegúrate de tener instalado:

  * **Node.js** y **npm** (o **yarn**).
  * **Expo CLI** o **Expo Go** en tu dispositivo móvil o emulador/simulador.
  * Un servidor de base de datos (según lo configurado, podría ser PostgreSQL o MySQL).

### 2\. Puesta en Marcha del Backend (Servidor)

El backend es el núcleo de la lógica y la gestión de datos.

1.  **Navega a la Carpeta del Backend:**
    ```bash
    cd /ruta/a/tu/carpeta/backend
    ```
2.  **Instala las Dependencias:**
    Utiliza el archivo `package.json` del backend para instalar todas las librerías necesarias (Express, bcrypt, mysql2/pg, etc.).
    ```bash
    npm install
    # o: yarn install
    ```
3.  **Configura Variables de Entorno:**
    Crea un archivo `.env` para las credenciales de la base de datos, puertos, y la clave secreta de JWT, tal como lo indica la dependencia `dotenv`.
4.  **Inicia el Servidor en Modo Desarrollo:**
    El script `dev` utiliza `nodemon` para reiniciar automáticamente el servidor al detectar cambios.
    ```bash
    npm run dev
    # o: yarn dev
    ```
    El servidor de Dogland (la API) debería estar corriendo, probablemente en un puerto como `3000` o `8080`.

### 3\. Puesta en Marcha del Frontend (Aplicación Móvil)

El frontend es la aplicación construida con React Native y Expo que los usuarios utilizarán.

1.  **Navega a la Carpeta del Frontend (Dogland):**

    ```bash
    cd /ruta/a/tu/carpeta/Dogland
    ```

    *(Nota: La carpeta del frontend es la que tiene el `package.json` con `expo` como dependencia principal).*

2.  **Instala las Dependencias:**
    Utiliza el archivo `package.json` del frontend.

    ```bash
    npm install
    # o: yarn install
    ```

3.  **Inicia la Aplicación Expo:**
    El script `start` iniciará el servidor de desarrollo de Expo.

    ```bash
    npm start
    # o: yarn start
    ```

    Esto abrirá una ventana de terminal con un código QR y una interfaz web (Metro Bundler).

4.  **Ejecuta la Aplicación:**

      * **En Dispositivo Físico:** Escanea el **código QR** con la aplicación **Expo Go** de tu teléfono para cargar el proyecto.
      * **En Emulador/Simulador:** Usa las opciones en la terminal (`a` para Android, `i` para iOS) para iniciar la aplicación en un emulador o simulador que tengas instalado.

5.  **Interacción:**
    Una vez cargada, la aplicación se conectará al backend que iniciaste en el paso 2 para permitirte:

      * **Registrar/Iniciar Sesión:** Crear tu cuenta de usuario.
      * **Reportar Animales:** Usar la función de georreferenciación para reportar un animal en situación de calle.
      * **Explorar Adopciones:** Filtrar y ver los animales disponibles.
      * **Recibir Notificaciones:** Probar las alertas comunitarias (si el backend envía notificaciones a tu dispositivo).