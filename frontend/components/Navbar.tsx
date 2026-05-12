"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  // usePathname devuelve la ruta actual de la URL
  const pathname = usePathname();

  // Función que determina si un enlace está activo comparando la ruta actual
  // con la ruta pasada como argumento. Retorna un valor booleano.
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO / TÍTULO */}
          <Link
            href="/"
            className="text-xl font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Tienda de Coches
          </Link>

          {/* ENLACES DE NAVEGACIÓN */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors ${
                isActive("/contacto")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
