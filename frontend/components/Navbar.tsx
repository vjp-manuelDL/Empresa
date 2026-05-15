"use client"; // Indica que el componente se renderiza en el cliente para usar Hooks y eventos

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

/**
 * COMPONENTE NAVBAR GLOBAL
 * Gestiona la navegación principal, el estado visual de la sesión
 * y la adaptabilidad para dispositivos móviles.
 */
export default function Navbar() {
  const pathname = usePathname(); // Obtiene la ruta actual (ej: "/", "/contacto")
  const router = useRouter(); // Permite navegar programáticamente (redirecciones)

  // --- ESTADOS ---

  // Controla la visibilidad del menú desplegable en pantallas pequeñas
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Almacena el nombre del usuario logueado para mostrarlo en la interfaz
  const [usuario, setUsuario] = useState<string | null>(null);

  // --- LÓGICA DE SINCRONIZACIÓN DE SESIÓN ---

  /**
   * Este useEffect se encarga de leer el localStorage cada vez que el usuario
   * cambia de página (detectado por [pathname]). Esto asegura que si el usuario
   * inicia sesión en la página de Login, al volver al Inicio el Navbar se actualice.
   */
  useEffect(() => {
    const handleAuthChange = () => {
      // Intentamos recuperar el nombre del usuario guardado en el navegador
      const user = localStorage.getItem("tienda_coches_user");

      // Solo actualizamos el estado si el valor ha cambiado (evita re-renders innecesarios)
      setUsuario((prev) => (prev !== user ? user : prev));
    };

    handleAuthChange();

    /**
     * "storage" listener: Si el usuario abre la web en dos pestañas y cierra sesión en una,
     * este evento detecta el cambio y actualiza el Navbar en la otra pestaña automáticamente.
     */
    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [pathname]);

  // --- FUNCIONES AUXILIARES ---

  /**
   * Comprueba si una ruta está activa para aplicar estilos de resaltado azul
   */
  const isActive = (path: string) => pathname === path;

  /**
   * Limpia el almacenamiento local, resetea el estado y redirige al login
   */
  const handleLogout = () => {
    localStorage.removeItem("tienda_coches_user");
    localStorage.removeItem("tienda_coches_is_staff");
    setUsuario(null); // Borra el usuario del estado para que el Navbar cambie visualmente
    toast.success("Sesión cerrada correctamente");
    router.push("/login"); // Envía al usuario fuera de la zona privada
  };

  return (
    // "sticky top-0": Mantiene la barra siempre visible al hacer scroll
    // "backdrop-blur": Efecto de cristal esmerilado moderno
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* SECCIÓN IZQUIERDA: IDENTIDAD (Logo + Nombre) */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white transition-colors"
          >
            <Image
              className="dark:invert object-contain hover:scale-120 transition-transform"
              src="/asds.jpg"
              alt="Logo"
              width={60}
              height={35}
              priority // Carga la imagen del logo con prioridad para evitar parpadeos
            />
            <span className="hidden sm:inline dark:hover:text-green-400">
              Tienda de Coches
            </span>
          </Link>

          {/* SECCIÓN DERECHA: NAVEGACIÓN DESKTOP (Oculta en móviles) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Enlaces de navegación con resaltado condicional */}
            <Link
              href="/"
              className={`text-sm font-medium ${isActive("/") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-300 hover:scale-120 transition-transform"}`}
            >
              Inicio
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium ${isActive("/contacto") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-300 hover:scale-120 transition-transform"}`}
            >
              Contacto
            </Link>

            {/* ZONA DE USUARIO / AUTENTICACIÓN */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-transform">
              {usuario ? (
                // Si el usuario existe, mostramos saludo y botón de Logout CON ICONO
                <>
                  <span className="text-base text-zinc-600 dark:text-zinc-400 font-medium italic">
                    Hola,
                    <div className="text-base text-blue-600 dark:text-green-600 hover:underline inline-block ml-1 uppercase">
                      {usuario}
                    </div>
                  </span>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition rounded-lg shadow-md flex items-center gap-2"
                  >
                    {/* Icono de Logout (Heroicon: User with arrow) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                // Si no hay sesión, mostramos el botón de Login CON ICONO
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg flex items-center gap-2"
                >
                  {/* Icono de Login (Heroicon: User) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>

          {/* BOTÓN MENÚ MÓVIL (Hamburguesa / X) */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuAbierto ? (
                /* Icono de X cuando el menú está abierto */
                <path d="M6 18L18 6M6 6l12 12" strokeWidth={2} />
              ) : (
                /* Icono de 3 líneas cuando el menú está cerrado */
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2} />
              )}
            </svg>
          </button>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE (Aparece al pulsar el botón hamburguesa) */}
        {menuAbierto && (
          <div className="md:hidden pb-6 border-t border-zinc-100 dark:border-zinc-800 pt-4 text-center space-y-4 bg-white dark:bg-black ">
            <Link
              href="/"
              onClick={() => setMenuAbierto(false)} // Cierra el menú tras hacer clic
              className="block text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMenuAbierto(false)}
              className="block text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Contacto
            </Link>

            {/* Auth en móvil CON ICONOS */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {usuario ? (
                <div className="flex flex-col gap-3">
                  <span className="text-base text-zinc-500 italic">
                    Hola, {usuario}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuAbierto(false);
                    }}
                    className="font-bold text-red-600 flex items-center justify-center gap-2"
                  >
                    {/* Icono de Logout para móvil */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="font-bold text-blue-600 flex items-center justify-center gap-2"
                >
                  {/* Icono de Login para móvil */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
