/*
"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Efecto 1: Solo se ejecuta al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    // 1. Aplicamos la clase al HTML INMEDIATAMENTE (evita flash de tema incorrecto)
    document.documentElement.classList.toggle("dark", shouldDark);

    // 2. Actualizamos el estado de React en el siguiente microtask
    // Esto evita el warning "Calling setState synchronously within an effect"
    queueMicrotask(() => setIsDark(shouldDark));
  }, []);

  // Efecto 2: Se ejecuta cada vez que el usuario hace clic en el botón
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        padding: '1rem',
        borderRadius: '9999px',
        backgroundColor: isDark ? '#7c3aed' : '#fbbf24',
        color: isDark ? '#fff' : '#000',
        border: '3px solid #ef4444',
        cursor: 'pointer',
        fontSize: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

*/
