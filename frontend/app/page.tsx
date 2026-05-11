"use client";
// DIRECTIVA DE NEXT.JS: Obliga a que este componente se renderice en el navegador (Cliente).
// Es obligatorio usarla porque utilizamos hooks (useState, useEffect) y eventos interactivos.

import { useState, useEffect } from "react";
import Image from "next/image";
// Componente optimizado de Next.js para gestionar imágenes (lazy loading, formatos modernos, etc.)

// ------------------------------------------------------------------
// DEFINICIÓN DE TIPOS (TypeScript)
// ------------------------------------------------------------------
/**
 * Interfaz que define la estructura exacta de un objeto "Coche".
 * TypeScript usará esto para validar que los datos que recibimos de Django
 * coinciden con lo que esperamos (números para precio, strings para marca, etc.).
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
  // [SECCIÓN 1] ESTADOS GLOBALES DE LA VISTA
  // 'coches': Almacena el array de objetos que traemos de la base de datos.
  // 'loading': Controla si se debe mostrar el mensaje de "Cargando..." mientras llega la respuesta.
  const [coches, setCoches] = useState<Coche[]>([]);
  const [loading, setLoading] = useState(true);

  // [SECCIÓN 2] ESTADOS DEL FORMULARIO (Inputs Controlados)
  // En React, los inputs no guardan valor por sí mismos. Vinculamos su valor a estas variables
  // para tener control total sobre lo que el usuario escribe.
  const [marca, setmarca] = useState("");
  const [color, setcolor] = useState("");
  const [precio, setprecio] = useState("");

  // [NUEVO] Estado para controlar si estamos en modo edición
  // Si es null, el formulario está en modo "Crear". Si tiene un número, estamos editando ese ID.
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // [SECCIÓN 3] ESTADOS DE CONTROL DE UI
  // 'enviando': Desactiva el botón de envío mientras se procesa la petición para evitar clics dobles.
  // 'mensaje': Almacena el texto de feedback (éxito o error) para mostrárselo al usuario.
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // ------------------------------------------------------------------
  // [FUNCIÓN] PREPARAR FORMULARIO PARA EDITAR
  // ------------------------------------------------------------------
  /**
   * Rellena el formulario con los datos del coche seleccionado y activa el modo edición.
   * Se llama al pulsar el botón "Editar" en una tarjeta.
   */
  const prepararEdicion = (coche: Coche) => {
    setmarca(coche.marca);
    setcolor(coche.color);
    setprecio(coche.precio.toString());
    setEditandoId(coche.id);
    // Hacemos scroll suave hacia el formulario para mejor experiencia de usuario
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
    setMensaje("");

    try {
      // Determinamos ruta y método dinámicamente según el modo (crear o editar)
      // CORRECCIÓN: La URL debe apuntar a /actualizar/ (no /editar/) para coincidir con Django
      const url = editandoId
        ? `http://localhost:8000/api/coches/actualizar/${editandoId}/`
        : "http://localhost:8000/api/coches/crear/";

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
          // MODO EDICIÓN: Reemplazamos el coche antiguo por el actualizado en la lista local
          // Buscamos el coche con el mismo ID y lo reemplazamos por los nuevos datos
          setCoches((prev) =>
            prev.map((c) => (c.id === editandoId ? datos.coche : c)),
          );
          setEditandoId(null); // Salimos del modo edición para volver a modo "Crear"
          setMensaje("Coche actualizado con éxito");
        } else {
          // MODO CREACIÓN: Añadimos el nuevo coche al final de la lista
          // Usamos el spread operator (...) para crear un nuevo array sin mutar el original
          setCoches((prev) => [...prev, datos.coche]);
          setMensaje("Coche creado con éxito");
        }

        // Limpiamos el formulario y reseteamos estados
        setmarca("");
        setcolor("");
        setprecio("");
      } else {
        // Si la respuesta no es exitosa, mostramos el error que devuelve Django
        setMensaje(datos.error || "Error al guardar el coche");
      }
    } catch (error) {
      // Capturamos errores de red (Django apagado, CORS, etc.)
      console.error("Error de red:", error);
      setMensaje("Error de red al guardar el coche");
    } finally {
      // Este bloque se ejecuta siempre, haya éxito o error
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
      return; // Si el usuario cancela, detenemos la ejecución
    }

    try {
      const respuesta = await fetch(
        `http://localhost:8000/api/coches/eliminar/${cocheId}/`,
        {
          method: "DELETE",
        },
      );

      if (respuesta.ok) {
        // Filtramos la lista local para quitar el coche eliminado
        // .filter() crea un nuevo array excluyendo el coche con ese ID
        setCoches((prev) => prev.filter((coche) => coche.id !== cocheId));
        setMensaje("Coche eliminado con éxito");
      } else {
        alert("Error al eliminar el coche");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al eliminar el coche");
    }
  };

  // ------------------------------------------------------------------
  // [SECCIÓN 5] EFECTO SECUNDARIO: CARGA INICIAL (PETICIÓN GET)
  // ------------------------------------------------------------------
  /**
   * useEffect ejecuta código después de que el componente se pinta en pantalla.
   * El array vacío [] al final significa: "Ejecuta esto SOLO UNA VEZ, al montar el componente".
   * Es equivalente al componentDidMount de las clases antiguas de React.
   */
  useEffect(() => {
    fetch("http://localhost:8000/api/coches/")
      .then((response) => response.json())
      .then((data) => {
        setCoches(data.coches);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar la lista:", error);
        setLoading(false);
      });
  }, []);

  // ------------------------------------------------------------------
  // [SECCIÓN 6] INTERFAZ VISUAL (JSX)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-6">
      <main className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
        {/* LOGO Y TÍTULO PRINCIPAL */}
        <Image
          className="mx-auto dark:invert mb-4"
          src="/asds.jpg"
          alt="Logo Coches"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-8">
          Tienda de Coches
        </h1>

        {/* FORMULARIO DINÁMICO (Crear / Editar) */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 border rounded-xl bg-zinc-100 dark:bg-zinc-800"
        >
          {/* Título que cambia según el modo */}
          <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
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
              className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Color"
              value={color}
              onChange={(e) => setcolor(e.target.value)}
              required
              className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Precio (€)"
              value={precio}
              onChange={(e) => setprecio(e.target.value)}
              required
              step="0.01"
              className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botón con texto dinámico */}
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

          {/* Mensaje de feedback */}
          {mensaje && (
            <p className="mt-3 text-center font-medium text-zinc-700 dark:text-zinc-300">
              {mensaje}
            </p>
          )}
        </form>

        {/* LISTA DE COCHES DISPONIBLES */}
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
          Coches disponibles
        </h2>

        {loading ? (
          <p className="text-center text-zinc-500 py-8">Cargando coches...</p>
        ) : coches.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">
            No hay coches disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coches.map((coche) => (
              <div
                key={coche.id}
                // 'relative' es necesario para posicionar los botones absolutos dentro de la tarjeta
                className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition relative"
              >
                {/* Botón Editar (posicionado a la izquierda) */}
                <button
                  onClick={() => prepararEdicion(coche)}
                  className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  Editar
                </button>

                {/* Botón Eliminar (posicionado a la derecha) */}
                <button
                  onClick={() => handleEliminar(coche.id)}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded transition"
                >
                  Eliminar
                </button>

                {/* Título con padding lateral (px-8) para no solapar los botones */}
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white px-8 text-center">
                  {coche.marca}
                </h3>

                <p className="text-zinc-600 dark:text-zinc-400 text-center">
                  Color: {coche.color}
                </p>

                <p className="text-green-600 dark:text-green-400 font-semibold mt-2 text-center">
                  {coche.precio} €
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
