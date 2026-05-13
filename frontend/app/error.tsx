// app/error.tsx
"use client"; // Necesario porque usamos eventos de clic

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Aquí registro el error en consola (útil para debug)
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // Fondo oscuro y centrado
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black text-center p-4">
      {/* Tarjeta de error con estilo verde/negro */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-xl border border-zinc-200 dark:border-green-900 max-w-md w-full">
        {/* Título en verde (modo oscuro) */}
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-green-400 mb-4">
          ¡Ups! Algo salió mal
        </h2>

        {/* Texto explicativo */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Ha ocurrido un error inesperado. Puedes intentar recargar la página.
        </p>

        {/* Botón para reintentar (llama a reset() de Next.js) */}
        <button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
