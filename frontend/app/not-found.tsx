// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    // Fondo oscuro y centrado
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black text-center p-4">
      {/* Tarjeta de error 404 con estilo verde/negro */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-xl border border-zinc-200 dark:border-green-900 max-w-md w-full">
        {/* Número 404 grande en verde */}
        <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-green-400 mb-2">
          404
        </h2>

        {/* Título */}
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
          Página no encontrada
        </h3>

        {/* Texto explicativo */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Enlace para volver al inicio */}
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
