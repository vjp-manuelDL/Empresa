# Tienda de Coches - Gestión de Inventario

> **Proyecto Académico FCT/FEOE**  
> **Alumno:** Manuel Delgado Lopes  
> **Curso:** 1º DAM (Desarrollo de Aplicaciones Multiplataforma)  
> **Centro:** IES Valle del Jerte  
> **Periodo:** Formación en Empresa / Proyecto Final de Módulo (2025-2026)

---

## Descripción del Proyecto

"Tienda de Coches" es una aplicación web full-stack diseñada para la gestión eficiente de inventario de vehículos. El sistema permite a los administradores realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre una base de datos de coches, mientras ofrece a los usuarios finales una interfaz moderna, rápida y responsive para explorar el catálogo.

Este proyecto ha sido desarrollado durante el periodo de **Formación en Centros de Trabajo (FCT)** o **Proyecto de Módulo**, aplicando las mejores prácticas actuales en desarrollo frontend con **Next.js** y **TypeScript**, consumiendo una API RESTful desarrollada en **Django**.

### Objetivos Principales

- Implementar una arquitectura cliente-servidor robusta.
- Desarrollar una interfaz de usuario (UI) intuitiva con soporte para modo oscuro.
- Gestionar estados complejos en React (filtros, búsqueda, formularios controlados).
- Integrar servicios externos (Formspree para contacto, Google Maps Embed).
- Optimizar la experiencia de usuario con feedback visual inmediato (toasts, skeletons).

---

## Stack Tecnológico

### Frontend

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño utilitario y responsive)
- **Gestión de Estado:** React Hooks (`useState`, `useEffect`)
- **Notificaciones:** `react-hot-toast`
- **Iconografía:** Heroicons (SVG inline)

### Backend & Servicios

- **API:** Django / Django REST Framework (Python)
- **Base de Datos:** SQLite (Desarrollo)
- **Emails:** Formspree API
- **Mapas:** Google Maps Embed API

---

## Instalación y Despliegue Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Requisitos Previos

- Node.js v18.17 o superior.
- Python 3.10+ (para el backend Django).
- Git instalado.

### 2. Configuración del Backend (Django)

```bash
# Accede a la carpeta del backend
cd backend

# Crea y activa un entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instala dependencias
pip install django djangorestframework django-cors-headers

# Aplica migraciones y arranca el servidor
python manage.py migrate
python manage.py runserver
# El backend estará disponible en http://localhost:8000

```

### 3. Configuración del Frontend (Next.js)

```bash

# Accede a la carpeta del frontend
cd frontend

# Instala las dependencias de npm
npm install

# (Opcional) Configura variables de entorno
# Crea un archivo .env.local en la raíz de frontend/
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Inicia el servidor de desarrollo
npm run dev
# El frontend estará disponible en http://localhost:3000

```

## Funcionalidades Destacadas

### 1. Gestión Multimedia de Vehículos

- **Subida Múltiple:** Capacidad para subir hasta 4 imágenes por vehículo durante los procesos de creación o edición.
- **Gestión en Edición:** Al modificar un registro, se visualizan las fotografías actuales con la opción de eliminarlas individualmente (marcado para borrado) antes de confirmar los cambios.
- **Validación de Límites:** El sistema restringe activamente el número total de imágenes a un máximo de 4, calculando la suma de existentes más nuevas menos las marcadas para eliminar.
- **Previsualización Local:** Visualización inmediata de las nuevas imágenes seleccionadas mediante URLs locales (blobs) antes de su transmisión al servidor.

### 2. Galería Interactiva en Detalle

- **Carrusel Dinámico:** Navegación fluida entre las imágenes asociadas al vehículo mediante controles laterales de anterior/siguiente.
- **Indicadores Visuales:** Sistema de paginación visual (puntos inferiores) que indica la posición actual dentro del conjunto de imágenes.
- **Interacción por Hover:** Los controles de navegación aparecen suavemente al pasar el cursor sobre la imagen principal, manteniendo una interfaz limpia.
- **Manejo de Ausencia de Datos:** Implementación de una imagen por defecto (placeholder) cuando un registro no dispone de fotografías asociadas.

### 3. Filtrado y Búsqueda Avanzada

- **Búsqueda en Tiempo Real:** Filtrado instantáneo por marca del vehículo mientras el usuario escribe, sin necesidad de recargar la página.
- **Rango de Precios:** Inputs dinámicos que permiten definir límites mínimos y máximos para acotar los resultados de búsqueda.
- **Ordenación de Listados:** Opción para ordenar los resultados por precio de forma ascendente o descendente.
- **Gestión de Estado de Filtros:** Botón dedicado para restablecer todos los criterios de búsqueda y ordenación a sus valores por defecto.

### 4. Experiencia de Usuario (UX/UI)

- **Soporte para Modo Oscuro/Claro:** Diseño adaptativo que detecta y respeta la preferencia de tema del sistema operativo del usuario.
- **Skeletons de Carga:** Uso de placeholders visuales animados durante la petición de datos a la API para mejorar la percepción de velocidad.
- **Sistema de Notificaciones:** Feedback visual no intrusivo (toasts) para informar al usuario sobre el éxito o fallo de operaciones (creación, edición, eliminación).
- **Formularios Controlados:** Implementación de validaciones en tiempo real y mecanismos para prevenir el doble envío de datos.

### 5. Página de Contacto y Ubicación

- **Integración con Formspree:** Envío de correos electrónicos gestionado externamente, eliminando la necesidad de configurar un servidor de correo propio.
- **Mapa Interactivo:** Integración de Google Maps Embed para mostrar geolocalmente la ubicación física del establecimiento.
- **Validación de Formularios:** Comprobación estricta de longitud, formato de email y otros campos requeridos antes del envío.

---

### 6. Estructura del Proyecto

```bash
frontend/
├── app/
│   ├── coche/
│   │   └── [id]/
│   │       └── page.tsx          # Página de detalle dinámico
│   ├── contacto/
│   │   └── page.tsx              # Formulario de contacto
│   ├── layout.tsx                # Layout raíz (Navbar, Footer, Toaster)
│   ├── page.tsx                  # Página principal (Home)
│   ├── error.tsx                 # Manejo global de errores
│   └── not-found.tsx             # Página 404 personalizada
├── components/
│   ├── Navbar.tsx                # Barra de navegación responsive
│   ├── Footer.tsx                # Pie de página con enlaces
│   └── CocheSkeleton.tsx         # Componente de carga visual
├── public/
│   └── asds.jpg                  # Logo de la aplicación
├── .env.local                    # Variables de entorno
├── next.config.ts                # Configuración de Next.js
└── package.json                  # Dependencias y scripts

```

## Sobre el Autor

**Manuel Delgado Lopes**  
Estudiante de **1º DAM** en el **IES Valle del Jerte**.

---

## Licencia

Este proyecto es de uso académico y educativo. No está destinado para producción comercial sin las modificaciones adecuadas de seguridad y optimización.
