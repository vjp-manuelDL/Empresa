"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
// "use client" es obligatorio porque este componente utiliza hooks
// (useState, useEffect) y eventos interactivos que solo pueden
// ejecutarse en el navegador, no en el servidor.

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CocheSkeleton from "../components/CocheSkeleton";
import toast from "react-hot-toast";

// Componente optimizado de Next.js para gestionar imágenes
// (lazy loading, formatos modernos, etc.)

// ------------------------------------------------------------------
// DEFINICIÓN DE TIPOS (TypeScript)
// ------------------------------------------------------------------
/**
 * Interfaz que define la estructura exacta de un objeto "Coche".
 * TypeScript usará esto para validar que los datos que recibimos
 * de Django coinciden con lo que esperamos.
 */
interface Coche {
  id: number;
  marca: string;
  color: string;
  precio: number;
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
export default function Home() {
  // ← AÑADIDO: URL base de la API desde variable de entorno
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // [SECCIÓN 1] ESTADOS GLOBALES DE LA VISTA
  // 'coches': Almacena el array de objetos que traemos de la base de datos.
  // 'loading': Controla si se debe mostrar el mensaje de "Cargando...".
  const [coches, setCoches] = useState<Coche[]>([]);
  const [loading, setLoading] = useState(true);

  // [SECCIÓN 2] ESTADOS DEL FORMULARIO (Inputs Controlados)
  // En React, los inputs no guardan valor por sí mismos. Vinculamos
  // su valor a estas variables para tener control total.
  const [marca, setmarca] = useState("");
  const [color, setcolor] = useState("");
  const [precio, setprecio] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [precioMin, setPrecioMin] = useState("0");
  const [precioMax, setPrecioMax] = useState("");

  // Estado para controlar el orden de visualización (ascendente o descendente)
  const [orden, setOrden] = useState<"asc" | "desc">("asc");

  // [NUEVO] Estado para controlar si estamos en modo edición
  // Si es null, el formulario está en modo "Crear".
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // [SECCIÓN 3] ESTADOS DE CONTROL DE UI
  // 'enviando': Desactiva el botón mientras se procesa la petición.
  const [enviando, setEnviando] = useState(false);

  // ------------------------------------------------------------------
  // [LÓGICA] FILTRAR Y ORDENAR COCHES
  // ------------------------------------------------------------------
  /**
   * Función autoejecutable que filtra y ordena la lista de coches.
   * Se ejecuta en cada renderizado para mantener la vista actualizada.
   */
  const cochesFiltrados = (() => {
    // Paso 1: Filtrar por marca y rango de precios
    let resultado = coches.filter((coche) => {
      const coincideMarca = coche.marca
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincidePrecioMin =
        precioMin === "" || coche.precio >= parseFloat(precioMin);

      const coincidePrecioMax =
        precioMax === "" || coche.precio <= parseFloat(precioMax);

      return coincideMarca && coincidePrecioMin && coincidePrecioMax;
    });

    // Paso 2: Ordenar por precio según la selección del usuario
    // Usamos spread operator [...] para crear una copia y no mutar el original
    if (orden === "asc") {
      resultado = [...resultado].sort((a, b) => a.precio - b.precio);
    } else {
      resultado = [...resultado].sort((a, b) => b.precio - a.precio);
    }

    return resultado;
  })();

  // ------------------------------------------------------------------
  // [FUNCIÓN] PREPARAR FORMULARIO PARA EDITAR
  // ------------------------------------------------------------------
  /**
   * Rellena el formulario con los datos del coche seleccionado
   * y activa el modo edición.
   */
  const prepararEdicion = (coche: Coche) => {
    setmarca(coche.marca);
    setcolor(coche.color);
    setprecio(coche.precio.toString());
    setEditandoId(coche.id);
    // Hacemos scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------------
  // [SECCIÓN 4] MANEJADOR DEL FORMULARIO (POST y PUT unificados)
  // ------------------------------------------------------------------
  /**
   * Función unificada que gestiona tanto la creación como la actualización.
   * Decide la URL y el método HTTP según el estado de 'editandoId'.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      // ← CORREGIDO: Usamos API_URL en lugar de URL hardcodeada
      const url = editandoId
        ? `${API_URL}/api/coches/actualizar/${editandoId}/`
        : `${API_URL}/api/coches/crear/`;

      const method = editandoId ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca,
          color,
          precio: parseFloat(precio),
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (editandoId) {
          // MODO EDICIÓN: Reemplazamos el coche antiguo por el actualizado
          setCoches((prev) =>
            prev.map((c) => (c.id === editandoId ? datos.coche : c)),
          );
          setEditandoId(null);
          toast.success("Coche actualizado con éxito");
        } else {
          // MODO CREACIÓN: Añadimos el nuevo coche al final de la lista
          setCoches((prev) => [...prev, datos.coche]);
          toast.success("Coche creado con éxito");
        }

        // Limpiamos el formulario y reseteamos estados
        setmarca("");
        setcolor("");
        setprecio("");
      } else {
        toast.error(datos.error || "Error al guardar el coche");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("Error de red al guardar el coche");
    } finally {
      setEnviando(false);
    }
  };

  // ------------------------------------------------------------------
  // [SECCIÓN EXTRA] ELIMINAR COCHE (PETICIÓN DELETE)
  // ------------------------------------------------------------------
  /**
   * Función para borrar un coche por su ID.
   * Incluye confirmación del usuario antes de ejecutar la petición.
   */
  const handleEliminar = async (cocheId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este coche?")) {
      return;
    }

    try {
      // ← CORREGIDO: Usamos API_URL en lugar de URL hardcodeada
      const respuesta = await fetch(
        `${API_URL}/api/coches/eliminar/${cocheId}/`,
        {
          method: "DELETE",
        },
      );

      if (respuesta.ok) {
        // Filtramos la lista local para quitar el coche eliminado
        setCoches((prev) => prev.filter((coche) => coche.id !== cocheId));
        toast.success("Coche eliminado con éxito");
      } else {
        toast.error("Error al eliminar el coche");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("Error de red al eliminar el coche");
    }
  };

  // ------------------------------------------------------------------
  // [SECCIÓN 5] EFECTO SECUNDARIO: CARGA INICIAL (PETICIÓN GET)
  // ------------------------------------------------------------------
  /**
   * useEffect ejecuta código después de que el componente se pinta.
   * El array vacío [] significa: "Ejecuta esto SOLO UNA VEZ".
   */
  useEffect(() => {
    // ← CORREGIDO: Usamos API_URL en lugar de URL hardcodeada
    fetch(`${API_URL}/api/coches/`)
      .then((response) => response.json())
      .then((data) => {
        setCoches(data.coches);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar la lista:", error);
        setLoading(false);
      });
  }, [API_URL]);

  // ------------------------------------------------------------------
  // [SECCIÓN 6] INTERFAZ VISUAL (JSX)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full px-6 py-10 md:px-12 lg:px-20">
        {/* LOGO Y TÍTULO PRINCIPAL */}
        <Image
          className="mx-auto dark:invert mb-4"
          src="/asds.jpg"
          alt="Logo Coches"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-3xl font-bold text-center text-zinc-900 dark:text-green-400 mb-8">
          Tienda de Coches
        </h1>

        {/* ENLACE A PÁGINA DE CONTACTO */}
        <div className="text-center mb-6">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
                       text-blue-600 hover:text-yellow-500 
                       dark:text-green-500 dark:hover:text-green-300 
                       border border-blue-600 dark:border-green-700 
                       rounded-lg hover:bg-blue-50 dark:hover:bg-green-900/20
                       transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contacto
          </Link>
        </div>

        {/* FORMULARIO DINÁMICO (Crear / Editar) */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 border rounded-xl bg-zinc-100 dark:bg-zinc-900 dark:border-green-900"
        >
          {/* Título que cambia según el modo */}
          <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-green-400">
            {editandoId
              ? `Editando coche ID: ${editandoId}`
              : "Añadir nuevo coche"}
          </h2>

          {/* Inputs controlados */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Marca"
              value={marca}
              onChange={(e) => setmarca(e.target.value)}
              required
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Color"
              value={color}
              onChange={(e) => setcolor(e.target.value)}
              required
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Precio (€)"
              value={precio}
              onChange={(e) => setprecio(e.target.value)}
              required
              step="0.01"
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Botón con texto dinámico (ACCIÓN - mantiene color azul para destacar) */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando
              ? "Guardando..."
              : editandoId
                ? "Actualizar Coche"
                : "Añadir Coche"}
          </button>
        </form>

        {/* LISTA DE COCHES DISPONIBLES */}
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-green-400">
          Coches disponibles
        </h2>

        {/* Campo de búsqueda */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por Marca"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border border-zinc-300 dark:border-green-800
               bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700
               focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* BUSCAR POR PRECIO */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-green-500 mb-1">
              Precio Mínimo (€)
            </label>
            <input
              type="number"
              placeholder="0"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              step="0.01"
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800
                bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700
                focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-green-500 mb-1">
              Precio Máximo (€)
            </label>
            <input
              type="number"
              placeholder="Máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              step="0.01"
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800
                bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 placeholder-zinc-400 dark:placeholder-green-700
                focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
        </div>

        {/* SELECTOR DE ORDENACIÓN */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-700 dark:text-green-500 mb-1">
            Ordenar por precio
          </label>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as "asc" | "desc")}
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 
               bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400
               focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="asc">Menor a Mayor</option>
            <option value="desc">Mayor a Menor</option>
          </select>
        </div>

        {/* BOTÓN PARA LIMPIAR FILTROS */}
        {(busqueda || precioMin !== "0" || precioMax || orden !== "asc") && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setPrecioMin("0");
              setPrecioMax("");
              setOrden("asc");
            }}
            className="mb-6 w-full bg-zinc-500 hover:bg-zinc-600 dark:bg-green-700 dark:hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
          >
            Limpiar Filtros
          </button>
        )}

        {/* LISTA DE RESULTADOS */}
        {loading ? (
          // Mientras carga, mostramos 4 skeletons en la misma grid que los coches reales
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CocheSkeleton />
            <CocheSkeleton />
            <CocheSkeleton />
            <CocheSkeleton />
          </div>
        ) : cochesFiltrados.length === 0 ? (
          <p className="text-center text-zinc-800 dark:text-green-500 py-8">
            No hay coches disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cochesFiltrados.map((coche) => (
              <Link
                key={coche.id}
                href={`/coche/${coche.id}`}
                className="block p-4 border border-zinc-200 dark:border-green-900 rounded-lg bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-md transition relative cursor-pointer"
              >
                {/* Botón Editar (ACCIÓN - azul para destacar) */}
                <button
                  onClick={() => prepararEdicion(coche)}
                  className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  Editar
                </button>

                {/* Botón Eliminar (ACCIÓN - rojo para destacar como acción destructiva) */}
                <button
                  onClick={() => handleEliminar(coche.id)}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  Eliminar
                </button>

                {/* Información del coche (texto verde en dark mode) */}
                <h3 className="font-bold text-lg text-zinc-900 dark:text-green-400 px-8 text-center">
                  {coche.marca}
                </h3>

                <p className="text-zinc-600 dark:text-green-500 text-center">
                  Color: {coche.color}
                </p>

                <p className="text-green-600 dark:text-green-400 font-semibold mt-2 text-center">
                  {coche.precio} €
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* SECCIÓN: MAPA DE UBICACIÓN */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-green-900">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-green-400 mb-6">
            Nuestra Ubicación
          </h2>
          <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-green-900">
            <iframe
              src="https://maps.google.com/maps?q=40.029889,-6.090175&hl=es&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Mapa de ubicación"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
