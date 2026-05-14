"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CocheSkeleton from "../components/CocheSkeleton";
import toast from "react-hot-toast";

// ------------------------------------------------------------------
// DEFINICIÓN DE TIPOS (TypeScript)
// ------------------------------------------------------------------
interface Coche {
  id: number;
  marca: string;
  color: string;
  precio: number;
}

// Interfaz para las imágenes que vienen del backend (con ID y URL)
interface ImagenDetalle {
  id: number;
  url: string;
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // [SECCIÓN 1] ESTADOS GLOBALES
  const [coches, setCoches] = useState<Coche[]>([]);
  const [loading, setLoading] = useState(true);

  // Archivos nuevos seleccionados en el input file
  const [archivosImagenes, setArchivosImagenes] = useState<FileList | null>(
    null,
  );

  // Estados para gestionar imágenes al EDITAR
  const [imagenesActuales, setImagenesActuales] = useState<ImagenDetalle[]>([]);
  const [idsABorrar, setIdsABorrar] = useState<number[]>([]);

  // [SECCIÓN 2] ESTADOS DEL FORMULARIO
  const [marca, setmarca] = useState("");
  const [color, setcolor] = useState("");
  const [precio, setprecio] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [precioMin, setPrecioMin] = useState("0");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState<"asc" | "desc">("asc");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  // ------------------------------------------------------------------
  // [FUNCIÓN AUXILIAR] RECARGAR LISTA DESDE LA BD
  // ------------------------------------------------------------------
  const cargarCoches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coches/`);
      const data = await response.json();
      setCoches(data.coches);
    } catch (error) {
      console.error("Error al cargar coches:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // ------------------------------------------------------------------
  // [EFECTO] CARGA INICIAL
  // ------------------------------------------------------------------
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCoches();
  }, [cargarCoches]);

  // ------------------------------------------------------------------
  // [LÓGICA] FILTRAR Y ORDENAR
  // ------------------------------------------------------------------
  const cochesFiltrados = (() => {
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

    if (orden === "asc") {
      resultado = [...resultado].sort((a, b) => a.precio - b.precio);
    } else {
      resultado = [...resultado].sort((a, b) => b.precio - a.precio);
    }
    return resultado;
  })();

  // ------------------------------------------------------------------
  // [FUNCIÓN] PREPARAR EDICIÓN
  // ------------------------------------------------------------------
  const prepararEdicion = async (coche: Coche) => {
    setmarca(coche.marca);
    setcolor(coche.color);
    setprecio(coche.precio.toString());
    setEditandoId(coche.id);

    // Resetear estados de imágenes
    setArchivosImagenes(null);
    setIdsABorrar([]);

    // Fetch para obtener las imágenes actuales (con IDs)
    try {
      const res = await fetch(`${API_URL}/api/coches/${coche.id}/`);
      const data = await res.json();
      if (data.imagenes) {
        setImagenesActuales(data.imagenes);
      } else {
        setImagenesActuales([]);
      }
    } catch (error) {
      console.error("Error cargando imágenes para editar:", error);
      setImagenesActuales([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------------
  // [FUNCIÓN] MARCAR IMAGEN PARA BORRAR
  // ------------------------------------------------------------------
  const toggleBorrarImagen = (id: number) => {
    if (idsABorrar.includes(id)) {
      setIdsABorrar(idsABorrar.filter((item) => item !== id));
    } else {
      setIdsABorrar([...idsABorrar, id]);
    }
  };

  // ------------------------------------------------------------------
  // [MANEJADOR] SUBMIT FORMULARIO
  // ------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de máximo 4 fotos
    const numExistentes = imagenesActuales.length;
    const numBorradas = idsABorrar.length;
    const numNuevas = archivosImagenes ? archivosImagenes.length : 0;
    const totalFinal = numExistentes - numBorradas + numNuevas;

    if (totalFinal > 4) {
      toast.error(
        `No puedes tener más de 4 fotos. Actualmente tendrías ${totalFinal}.`,
      );
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("marca", marca);
      formData.append("color", color);
      formData.append("precio", precio);

      if (editandoId) {
        idsABorrar.forEach((id) => {
          formData.append("imagenes_a_borrar", id.toString());
        });
      }

      if (archivosImagenes) {
        for (let i = 0; i < archivosImagenes.length; i++) {
          formData.append("imagenes", archivosImagenes[i]);
        }
      }

      const url = editandoId
        ? `${API_URL}/api/coches/actualizar/${editandoId}/`
        : `${API_URL}/api/coches/crear/`;

      const respuesta = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        toast.success(
          editandoId ? "Coche actualizado con éxito" : "Coche creado con éxito",
        );

        // Limpiar campos básicos
        setmarca("");
        setcolor("");
        setprecio("");
        setArchivosImagenes(null);
        setIdsABorrar([]);

        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // ¡IMPORTANTE! Recargamos la lista general de coches
        await cargarCoches();

        // Si estábamos editando, volvemos a cargar los detalles de ESE coche para ver las fotos nuevas
        if (editandoId) {
          try {
            const resDetalle = await fetch(
              `${API_URL}/api/coches/${editandoId}/`,
            );
            const dataDetalle = await resDetalle.json();
            if (dataDetalle.imagenes) {
              setImagenesActuales(dataDetalle.imagenes);
            } else {
              setImagenesActuales([]);
            }
          } catch (error) {
            console.error("Error recargando detalles tras actualizar:", error);
          }
          // No reseteamos editandoId ni scrollamos, para que el usuario siga viendo el formulario de edición
          // Pero si quieres que salga del modo edición, descomenta esto:
          // setEditandoId(null);
          // window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // Si era creación, salimos del modo edición (por seguridad)
          setEditandoId(null);
          setImagenesActuales([]);
        }
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
  // [MANEJADOR] ELIMINAR COCHE
  // ------------------------------------------------------------------
  const handleEliminar = async (cocheId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este coche?")) return;

    try {
      const respuesta = await fetch(
        `${API_URL}/api/coches/eliminar/${cocheId}/`,
        { method: "DELETE" },
      );

      if (respuesta.ok) {
        toast.success("Coche eliminado con éxito");
        await cargarCoches();
      } else {
        toast.error("Error al eliminar el coche");
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("Error de red al eliminar el coche");
    }
  };

  // Calculamos si debemos deshabilitar el input de archivos
  // Si estamos editando, contamos las existentes menos las marcadas para borrar
  // Usamos !! para asegurar que el resultado sea estrictamente booleano (true/false) y evitar errores de TypeScript
  const fotosRestantes = editandoId
    ? imagenesActuales.length - idsABorrar.length
    : 0;

  const deshabilitarInputArchivos = Boolean(editandoId && fotosRestantes >= 4);

  // ------------------------------------------------------------------
  // [RENDERIZADO] JSX
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full px-6 py-10 md:px-12 lg:px-20">
        {/* LOGO Y TÍTULO */}
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

        {/* ENLACE CONTACTO */}
        <div className="text-center mb-6">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-yellow-500 dark:text-green-500 dark:hover:text-green-300 border border-blue-600 dark:border-green-700 rounded-lg hover:bg-blue-50 dark:hover:bg-green-900/20 transition"
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

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 border rounded-xl bg-zinc-100 dark:bg-zinc-900 dark:border-green-900"
        >
          <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-green-400">
            {editandoId
              ? `Editando coche ID: ${editandoId}`
              : "Añadir nuevo coche"}
          </h2>

          {/* Inputs Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Marca"
              value={marca}
              onChange={(e) => setmarca(e.target.value)}
              required
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Color"
              value={color}
              onChange={(e) => setcolor(e.target.value)}
              required
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Precio (€)"
              value={precio}
              onChange={(e) => setprecio(e.target.value)}
              required
              step="0.01"
              className="p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* SECCIÓN DE GESTIÓN DE IMÁGENES */}
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Gestión de Fotos (Máximo 4 en total)
            </label>

            {/* Input para subir NUEVAS fotos */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setArchivosImagenes(e.target.files)}
              disabled={deshabilitarInputArchivos} // Ahora es estrictamente booleano
              className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-700 dark:file:text-zinc-200 cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Selecciona archivos para añadirlos. Las fotos actuales se muestran
              abajo.
            </p>

            {/* Vista previa de fotos EXISTENTES (Solo en modo Edición) */}
            {editandoId && imagenesActuales.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Fotos actuales (Haz clic en X para eliminar):
                </p>
                <div className="flex flex-wrap gap-3">
                  {imagenesActuales.map((img) => {
                    const estaMarcadaParaBorrar = idsABorrar.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        className={`relative group ${estaMarcadaParaBorrar ? "opacity-50 grayscale" : ""}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Foto existente"
                          className="w-20 h-20 object-cover rounded border border-zinc-300 dark:border-zinc-600 shadow-sm"
                        />
                        {/* Botón X para marcar/desmarcar borrado */}
                        <button
                          type="button"
                          onClick={() => toggleBorrarImagen(img.id)}
                          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md transition ${estaMarcadaParaBorrar ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                          title={
                            estaMarcadaParaBorrar
                              ? "Recuperar foto"
                              : "Eliminar foto"
                          }
                        >
                          {estaMarcadaParaBorrar ? "↺" : "×"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vista previa de fotos NUEVAS seleccionadas */}
            {archivosImagenes && archivosImagenes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  Nuevas fotos seleccionadas:
                </p>
                <div className="flex flex-wrap gap-3">
                  {Array.from(archivosImagenes).map((file, idx) => (
                    <div key={idx} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Nueva foto"
                        className="w-20 h-20 object-cover rounded border border-blue-300 dark:border-blue-700 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón Submit */}
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

        {/* RESTO DEL CÓDIGO (FILTROS Y LISTA) */}
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-green-400">
          Coches disponibles
        </h2>

        {/* Buscador */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar por Marca"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Filtros Precio */}
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
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Ordenación */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-700 dark:text-green-500 mb-1">
            Ordenar por precio
          </label>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as "asc" | "desc")}
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="asc">Menor a Mayor</option>
            <option value="desc">Mayor a Menor</option>
          </select>
        </div>

        {/* Limpiar Filtros */}
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

        {/* Lista Resultados */}
        {loading ? (
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prepararEdicion(coche);
                  }}
                  className="absolute top-3 left-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded transition z-10"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEliminar(coche.id);
                  }}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded transition z-10"
                >
                  Eliminar
                </button>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-green-400 px-8 text-center mt-2">
                  {coche.marca}
                </h3>
                <p className="text-zinc-600 dark:text-green-500 text-center">
                  Color: {coche.color}
                </p>
                <p className="text-green-600 dark:text-green-400 font-semibold mt-2 text-center">
                  {coche.precio.toLocaleString("es-ES")} €
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Mapa */}
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
              title="Mapa"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
