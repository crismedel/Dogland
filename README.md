# Dogland

## 📂 `app/`

La carpeta `app` contiene la **navegación y pantallas principales** de la aplicación, siguiendo la convención de rutas automáticas de Expo Router.

🔹 **Nota:** El archivo `_layout.tsx` en cada subcarpeta define la estructura de navegación (layout) para las pantallas de esa sección.

---

## 📂 `src/`

La carpeta `src` se utiliza para almacenar **lógica reutilizable** y **recursos auxiliares** que sirven de soporte a las pantallas principales definidas en `app`.

En general, **`src` actúa como capa de infraestructura y lógica**, mientras que **`app` define pantallas y navegación**.

---

## 🚀 Flujo General

1. El usuario navega dentro de la app a través de las rutas definidas en la carpeta `app`.
2. Las pantallas usan componentes, hooks, servicios o utilidades definidas en `src`.
3. La capa de presentación (`app`) se mantiene limpia, utilizando la capa de lógica (`src`) para la mayor parte del trabajo.

---

## 🗂️ Resumen

- `app/` → Pantallas y navegación (qué ve/interactúa el usuario).
- `src/` → Lógica, utilidades y componentes reutilizables (cómo funciona internamente).

---
