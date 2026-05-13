"use client"; // Necesario porque usamos hooks y eventos del navegador

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Hooks para leer la URL y navegar
import Link from "next/link"; // Componente para navegación interna sin recargar
import toast from "react-hot-toast"; // Para mostrar notificaciones flotantes

// Definimos la estructura de datos de un coche (TypeScript)
interface Coche {
  id: number;
  marca: string;
  color: string;
  precio: number;
}

export default function CocheDetallePage() {
  // Obtenemos el ID de la URL (ej: /coche/1 → id = "1")
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Estados: datos del coche, si está cargando, y si hubo error
  const [coche, setCoche] = useState<Coche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL de la API: usa variable de entorno o localhost por defecto
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Aquí se hace: cargar los datos del coche cuando cambia el ID
  useEffect(() => {
    fetch(`${API_URL}/api/coches/${id}/`)
      .then((response) => {
        if (!response.ok) throw new Error("Coche no encontrado");
        return response.json();
      })
      .then((data) => {
        setCoche(data.coche || data); // Ajusta según la respuesta de tu API
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar el coche:", err);
        setError("No se pudo cargar el coche");
        setLoading(false);
      });
  }, [id, API_URL]); // Se ejecuta cuando cambia id o API_URL

  // Aquí se hace: eliminar el coche vía DELETE y redirigir al inicio
  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este coche?")) return;

    try {
      const respuesta = await fetch(`${API_URL}/api/coches/eliminar/${id}/`, {
        method: "DELETE",
      });

      if (respuesta.ok) {
        toast.success("Coche eliminado con éxito");
        router.push("/"); // Redirige al inicio tras eliminar
      } else {
        toast.error("Error al eliminar el coche");
      }
    } catch (err) {
      console.error("Error de red:", err);
      toast.error("Error de red al eliminar el coche");
    }
  };

  // Aquí se muestra: spinner de carga mientras se fetchan los datos
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Cargando coche...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Aquí se muestra: mensaje de error si no se encontró el coche
  if (error || !coche) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {error || "Coche no encontrado"}
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Aquí se renderiza: la página principal con los datos del coche
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex-1 w-full px-6 py-10 md:px-12 lg:px-20">
        {/* Botón para volver a la lista principal */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a la lista
          </Link>
        </div>

        {/* Tarjeta principal del coche */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-green-900 overflow-hidden">
            {/* Header con gradiente y título */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-green-700 dark:to-green-800 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{coche.marca}</h1>
              <p className="text-blue-100 dark:text-green-200 text-lg">
                ID: {coche.id}
              </p>
            </div>

            {/* Contenido: precio y detalles */}
            <div className="p-8">
              {/* Precio destacado en grande */}
              <div className="mb-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  Precio
                </p>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {coche.precio.toLocaleString("es-ES")} €
                </p>
              </div>

              {/* Grid con marca y color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Marca
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {coche.marca}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    Color
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">
                    {coche.color}
                  </p>
                </div>
              </div>

              {/* Botones de acción: Editar y Eliminar */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Muestra toast informativo (react-hot-toast no tiene .info())
                    toast(
                      "Usa el formulario del inicio para editar este coche",
                      {
                        icon: "ℹ️",
                        style: {
                          background: "#18181b",
                          color: "#86efac",
                          border: "1px solid #166534",
                        },
                      },
                    );
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-center"
                >
                  Editar
                </button>
                <button
                  onClick={handleEliminar}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* Sección informativa extra con iconos */}
          <div className="mt-6 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-green-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-green-400 mb-3">
              Información del vehículo
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Disponible para prueba
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Financiación disponible
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Garantía incluida
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
