"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
// Necesario porque usamos hooks (useState, useEffect) y eventos del navegador.

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Hooks para leer la URL y navegar
import Link from "next/link"; // Componente para navegación interna
import toast from "react-hot-toast"; // Librería para notificaciones
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Iconos para el carrusel

// ------------------------------------------------------------------
// DEFINICIÓN DE TIPOS (TypeScript)
// ------------------------------------------------------------------

/**
 * Interfaz para cada imagen individual devuelta por el backend.
 * El backend ahora devuelve objetos con ID y URL para permitir borrado individual.
 */
interface ImagenDetalle {
  id: number;
  url: string;
}

/**
 * Interfaz principal del Coche.
 * Nota: 'imagenes' ahora es un array de objetos ImagenDetalle, no solo strings.
 */
interface Coche {
  id: number;
  marca: string;
  color: string;
  precio: number;
  imagenes?: ImagenDetalle[];
}

export default function CocheDetallePage() {
  // Obtenemos el ID dinámico de la URL (ej: /coche/1 → id = "1")
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Estados para gestionar los datos y la UI
  const [coche, setCoche] = useState<Coche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el carrusel: índice de la imagen actual
  const [indiceImagen, setIndiceImagen] = useState(0);

  // URL base de la API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ------------------------------------------------------------------
  // AQUÍ SE HACE: Cargar los datos del coche al montar
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/coches/${id}/`) // Petición GET al detalle
      .then((response) => {
        if (!response.ok) throw new Error("Coche no encontrado");
        return response.json();
      })
      .then((data) => {
        console.log("Datos del coche recibidos:", data); // DEBUG: Para verificar en consola
        setCoche(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar el coche:", err);
        setError("No se pudo cargar el coche");
        setLoading(false);
      });
  }, [id, API_URL]);

  // ------------------------------------------------------------------
  // PREPROCESAMIENTO: Extraer URLs simples para el carrusel
  // ------------------------------------------------------------------
  /**
   * Como el backend ahora devuelve objetos {id, url}, creamos un array plano
   * de solo URLs (strings) para facilitar la lógica del carrusel existente.
   */
  const urlsDeImagenes: string[] = [];
  if (coche?.imagenes) {
    coche.imagenes.forEach((img) => {
      if (img && img.url) {
        urlsDeImagenes.push(img.url);
      }
    });
  }

  // Determinamos qué imagen mostrar. Si hay fotos, usa la del índice. Si no, placeholder.
  const imagenActual =
    urlsDeImagenes.length > 0
      ? urlsDeImagenes[indiceImagen]
      : "/placeholder-car.jpg"; // Asegúrate de tener esta imagen en public/

  // ------------------------------------------------------------------
  // LÓGICA DEL CARRUSEL
  // ------------------------------------------------------------------

  // Ir a la siguiente imagen (cíclico)
  const siguienteImagen = () => {
    if (urlsDeImagenes.length > 0) {
      setIndiceImagen((prev) => (prev + 1) % urlsDeImagenes.length);
    }
  };

  // Ir a la imagen anterior (cíclico)
  const anteriorImagen = () => {
    if (urlsDeImagenes.length > 0) {
      setIndiceImagen((prev) =>
        prev === 0 ? urlsDeImagenes.length - 1 : prev - 1,
      );
    }
  };

  // ------------------------------------------------------------------
  // AQUÍ SE HACE: Eliminar el coche
  // ------------------------------------------------------------------
  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este coche?")) return;

    try {
      const respuesta = await fetch(`${API_URL}/api/coches/eliminar/${id}/`, {
        method: "DELETE",
      });

      if (respuesta.ok) {
        toast.success("Coche eliminado con éxito");
        router.push("/"); // Redirigir al inicio
      } else {
        toast.error("Error al eliminar el coche");
      }
    } catch (err) {
      console.error("Error de red:", err);
      toast.error("Error de red al eliminar el coche");
    }
  };

  // ------------------------------------------------------------------
  // RENDERIZADO CONDICIONAL: Loading y Error
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // AQUÍ SE RENDERIZA: Página Principal con Carrusel
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex-1 w-full px-6 py-10 md:px-12 lg:px-20">
        {/* Botón Volver */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition"
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

        {/* Tarjeta Principal */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-green-900">
          {/* SECCIÓN CARRUSEL */}
          <div className="relative w-full h-80 md:h-96 bg-zinc-200 dark:bg-zinc-800 group">
            {/* Imagen Principal */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagenActual}
              alt={`${coche.marca} - Foto ${indiceImagen + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Controles del Carrusel (Solo si hay más de 1 foto) */}
            {urlsDeImagenes.length > 1 && (
              <>
                {/* Botón Izquierda */}
                <button
                  onClick={anteriorImagen}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                >
                  <FaChevronLeft size={20} />
                </button>

                {/* Botón Derecha */}
                <button
                  onClick={siguienteImagen}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                >
                  <FaChevronRight size={20} />
                </button>

                {/* Indicadores (Puntos) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {urlsDeImagenes.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === indiceImagen ? "bg-white scale-125" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* INFORMACIÓN DEL COCHE */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                  {coche.marca}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg capitalize">
                  Color: {coche.color}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Precio
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {coche.precio.toLocaleString("es-ES")} €
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() =>
                  toast.success("Usa el formulario del inicio para editar")
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Editar Coche
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Eliminar Coche
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
