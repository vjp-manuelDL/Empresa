// components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  // Aquí saco el año actual para que el copyright se actualice solo
  const currentYear = new Date().getFullYear();

  return (
    // Aquí empiezo el footer: ancho completo, borde arriba, fondo negro en modo oscuro
    // mt-auto empuja el footer al final si hay poco contenido en la página
    <footer className="w-full border-t border-zinc-200 dark:border-green-900 bg-zinc-50 dark:bg-black mt-auto">
      {/* Aquí centro el contenido y limito el ancho para que no se estire demasiado en pantallas grandes */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-20">
        {/* Aquí creo la cuadrícula: 1 columna en móvil, 3 en escritorio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* === SECCIÓN 1: Información de la empresa === */}
          <div>
            {/* Título de la tienda en verde (modo oscuro) */}
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-green-400 mb-4">
              Tienda de Coches
            </h3>
            {/* Descripción breve */}
            <p className="text-sm text-zinc-600 dark:text-green-500 mb-2">
              Gestión profesional de inventario de vehículos.
            </p>
            {/* Copyright con año automático */}
            <p className="text-xs text-zinc-500 dark:text-green-600">
              © {currentYear} Todos los derechos reservados.
            </p>
          </div>

          {/* === SECCIÓN 2: Enlaces de navegación === */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-green-400 mb-4">
              Enlaces
            </h3>
            <ul className="space-y-2">
              {/* Enlace a Inicio: ruta correcta es "/" no la ruta del archivo */}
              <li>
                <Link
                  href="/"
                  className="text-sm text-zinc-600 dark:text-green-500 hover:text-blue-600 dark:hover:text-green-300 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              {/* Enlace a Contacto: ruta correcta es "/contacto" */}
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-zinc-600 dark:text-green-500 hover:text-blue-600 dark:hover:text-green-300 transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* === SECCIÓN 3: Información de contacto === */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-green-400 mb-4">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-green-500">
              {/* === ICONO 1: UBICACIÓN === */}
              <li className="flex items-center gap-2 hover:text-green-300 transition-colors">
                {/* Icono de ubicación (SVG corregido para JSX) */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  {/* Aquí los atributos del path también van en camelCase */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span>Ubicación</span>
              </li>

              {/* === ICONO 2: TELÉFONO === */}
              <li className="flex items-center gap-2 hover:text-green-300 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                  />
                </svg>
                <span>+34 927 00 00 00</span>
              </li>

              {/* === ICONO 3: EMAIL === */}
              <li className="flex items-center gap-2 hover:text-green-300 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span>contacto@tienda.es</span>
              </li>
            </ul>
          </div>
        </div>{" "}
        {/* ← Aquí cierro la cuadrícula de 3 columnas */}
        {/* Aquí pongo la línea separadora inferior y el texto del proyecto */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-green-900 text-center">
          <p className="text-xs text-zinc-500 dark:text-green-600">
            Proyecto FEOE - IES Valle del Jerte
          </p>
        </div>
      </div>{" "}
      {/* ← Aquí cierro el contenedor centrado */}
    </footer>
  );
}
