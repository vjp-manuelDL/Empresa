"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
// "use client" obliga a que este componente se ejecute en el navegador.
// Es necesario porque usamos hooks (useState, useEffect) y manipulamos
// el DOM directamente (document.documentElement.classList).

import { useState, useEffect } from "react";

// ------------------------------------------------------------------
// COMPONENTE: ThemeToggle
// ------------------------------------------------------------------
/**
 * Botón flotante que alterna entre modo oscuro y modo claro.
 *
 * Características:
 * - Detecta automáticamente la preferencia del sistema operativo al iniciar.
 * - Guarda la elección del usuario en localStorage para recordarla en futuras visitas.
 * - Aplica la clase "dark" en la etiqueta <html> para que Tailwind funcione.
 * - Muestra un icono diferente según el tema activo (Sol/Luna).
 */
export default function ThemeToggle() {
  // [ESTADO] Controla si el modo oscuro está activo
  // isDark: true = modo oscuro activado | false = modo claro activado
  const [isDark, setIsDark] = useState(false);

  // [EFECTO] Se ejecuta UNA SOLA VEZ cuando el componente se monta en el navegador
  useEffect(() => {
    // 1. Intentamos leer la preferencia guardada previamente por el usuario
    const preferenciaGuardada = localStorage.getItem("theme");

    // 2. Si no hay nada guardado, detectamos la preferencia nativa del sistema operativo
    const prefiereOscuroSistema = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    // 3. Decidimos qué tema aplicar:
    //    - Si el usuario guardó "dark" → usamos oscuro
    //    - Si no guardó nada pero su sistema es oscuro → usamos oscuro
    //    - En cualquier otro caso → usamos claro
    if (
      preferenciaGuardada === "dark" ||
      (!preferenciaGuardada && prefiereOscuroSistema)
    ) {
      // Añadimos la clase "dark" al elemento raíz <html> para activar Tailwind Dark Mode
      document.documentElement.classList.add("dark");
      // Actualizamos el estado interno del componente
      setIsDark(true);
    }
  }, []); // El array vacío [] asegura que este código solo se ejecute al montar, no en cada render

  // ------------------------------------------------------------------
  // FUNCIÓN: toggleTheme
  // ------------------------------------------------------------------
  /**
   * Alterna entre modo claro y oscuro cuando el usuario pulsa el botón.
   * Actualiza el estado, modifica el DOM y guarda la preferencia.
   */
  const toggleTheme = () => {
    // Calculamos el nuevo estado: si era oscuro pasa a claro, y viceversa
    const nuevoEstado = !isDark;

    // Actualizamos el estado de React para que el icono se repinte correctamente
    setIsDark(nuevoEstado);

    // Aplicamos los cambios visuales y de persistencia
    if (nuevoEstado) {
      // MODO OSCURO:
      document.documentElement.classList.add("dark"); // Activa estilos Tailwind con prefijo "dark:"
      localStorage.setItem("theme", "dark"); // Guarda preferencia para la próxima visita
    } else {
      // MODO CLARO:
      document.documentElement.classList.remove("dark"); // Desactiva estilos oscuros
      localStorage.setItem("theme", "light"); // Guarda preferencia clara
    }
  };

  // ------------------------------------------------------------------
  // INTERFAZ VISUAL (JSX)
  // ------------------------------------------------------------------
  return (
    <button
      onClick={toggleTheme} // Ejecuta la función toggleTheme al hacer clic
      // [ESTILOS CON TAILWIND]
      // fixed bottom-4 right-4 → Posición fija en la esquina inferior derecha
      // z-50 → Se asegura de estar por encima de todo el contenido
      // p-3 rounded-full → Espaciado interno y forma circular
      // bg-zinc-200 dark:bg-zinc-800 → Fondo claro por defecto, oscuro si hay clase "dark"
      // text-zinc-800 dark:text-zinc-200 → Color de texto adaptativo
      // shadow-lg hover:shadow-xl → Sombra suave que aumenta al pasar el ratón
      // transition-all duration-300 → Animación suave de 300ms para todos los cambios
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full 
                 bg-zinc-200 dark:bg-zinc-800 
                 text-zinc-800 dark:text-zinc-200 
                 shadow-lg hover:shadow-xl 
                 transition-all duration-300"
      // [ACCESIBILIDAD]
      // aria-label: Texto para lectores de pantalla
      // title: Tooltip que aparece al pasar el ratón por encima
      aria-label="Cambiar entre modo oscuro y modo claro"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {/* ICONO DINÁMICO: Se renderiza uno u otro según el estado isDark */}

      {isDark ? (
        // ☀️ ICONO DE SOL (se muestra cuando estamos en MODO OSCURO)
        // Sugiere al usuario que puede cambiar a modo claro
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // 🌙 ICONO DE LUNA (se muestra cuando estamos en MODO CLARO)
        // Sugiere al usuario que puede cambiar a modo oscuro
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
