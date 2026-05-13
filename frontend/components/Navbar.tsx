"use client";

import { useState } from "react"; // ← AÑADIDO: para el estado del menú móvil
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // ← AÑADIDO: Estado para controlar el menú móvil (abierto/cerrado)
  const [menuAbierto, setMenuAbierto] = useState(false);

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

          {/* ENLACES ESCRITORIO (ocultos en móvil con 'hidden md:flex') */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* ← AÑADIDO: BOTÓN HAMBURGUESA (solo visible en móvil con 'md:hidden') */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
          >
            {/* Icono dinámico: hamburguesa o X */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuAbierto ? (
                // Icono X (cerrar)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Icono hamburguesa (abrir)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* ← AÑADIDO: MENÚ MÓVIL (se muestra solo cuando menuAbierto=true) */}
        {menuAbierto && (
          <div className="md:hidden pb-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => {
                  setMenuAbierto(false); // Cierra el menú al hacer clic
                }}
                className={`text-sm font-medium transition-colors py-2 ${
                  isActive("/")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Inicio
              </Link>
              <Link
                href="/contacto"
                onClick={() => {
                  setMenuAbierto(false); // Cierra el menú al hacer clic
                }}
                className={`text-sm font-medium transition-colors py-2 ${
                  isActive("/contacto")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
