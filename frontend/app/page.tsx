"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  main_image?: string | null; // URL de la primera imagen del coche
}

interface ImagenDetalle {
  id: number;
  url: string;
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
export default function Home() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // ------------------------------------------------------------------
  // [SECCIÓN 0] ESTADOS DE AUTENTICACIÓN Y ROLES
  // ------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tienda_coches_user") || "";
    }
    return "";
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tienda_coches_is_staff") === "true";
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem("tienda_coches_user");
    localStorage.removeItem("tienda_coches_is_staff");
    setCurrentUser("");
    setIsAdmin(false);
    toast("Sesión cerrada correctamente");
    router.push("/login");
  };

  // ------------------------------------------------------------------
  // [SECCIÓN 1] ESTADOS GLOBALES DEL INVENTARIO
  // ------------------------------------------------------------------
  const [coches, setCoches] = useState<Coche[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivosImagenes, setArchivosImagenes] = useState<FileList | null>(
    null,
  );
  const [imagenesActuales, setImagenesActuales] = useState<ImagenDetalle[]>([]);
  const [idsABorrar, setIdsABorrar] = useState<number[]>([]);

  // ------------------------------------------------------------------
  // [SECCIÓN 2] ESTADOS DEL FORMULARIO
  // ------------------------------------------------------------------
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
  // [EFECTO] CARGA INICIAL DE COCHES
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
    setArchivosImagenes(null);
    setIdsABorrar([]);

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
        setmarca("");
        setcolor("");
        setprecio("");
        setArchivosImagenes(null);
        setIdsABorrar([]);

        const fileInput = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        await cargarCoches();

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
        } else {
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

  const fotosRestantes = editandoId
    ? imagenesActuales.length - idsABorrar.length
    : 0;
  const deshabilitarInputArchivos = Boolean(editandoId && fotosRestantes >= 4);

  // ------------------------------------------------------------------
  // [RENDERIZADO] JSX
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full px-6 py-10 md:px-12 lg:px-20 relative">
        {/* SECCIÓN DE ADMINISTRACIÓN (Solo visible para admins) */}
        {isAdmin ? (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 border rounded-xl bg-zinc-100 dark:bg-zinc-900 dark:border-green-900 shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-green-400">
              {editandoId
                ? `Editando coche ID: ${editandoId}`
                : "Añadir nuevo coche"}
            </h2>
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

            {/* GESTIÓN DE IMÁGENES */}
            <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Gestión de Fotos (Máximo 4 en total)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setArchivosImagenes(e.target.files)}
                disabled={deshabilitarInputArchivos}
                className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-700 dark:file:text-zinc-200 cursor-pointer disabled:opacity-50"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Selecciona archivos para añadirlos. Las fotos actuales se
                muestran abajo.
              </p>

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
        ) : (
          /* MENSAJE DE BIENVENIDA PARA USUARIOS */
          <div className="mb-8 p-6 text-center bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-zinc-200 dark:border-green-900 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-green-400 mb-2">
                ¡Bienvenido a Tienda de Coches!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Explora nuestro catálogo de vehículos seleccionados. Encuentra
                el coche perfecto para ti con nuestra búsqueda avanzada y
                filtros por precio.
              </p>
            </div>
          </div>
        )}

        {/* LISTADO PÚBLICO */}
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

        {/* Lista Resultados CON IMÁGENES */}
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
                className="block border border-zinc-200 dark:border-green-900 rounded-lg bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-md transition relative cursor-pointer overflow-hidden"
              >
                {/* IMAGEN PRINCIPAL DEL COCHE */}
                <div className="relative w-full h-48 bg-zinc-200 dark:bg-zinc-800">
                  {coche.main_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`${API_URL}${coche.main_image}`}
                      alt={coche.marca}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Placeholder si no hay imagen */
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* BOTONES DE GESTIÓN (Solo visibles si ES ADMIN) */}
                {isAdmin && (
                  <>
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
                  </>
                )}

                {/* INFORMACIÓN DEL COCHE */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-green-400 text-center mb-2">
                    {coche.marca}
                  </h3>
                  <p className="text-zinc-600 dark:text-green-500 text-center text-sm mb-2">
                    Color: {coche.color}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-semibold text-center">
                    {coche.precio.toLocaleString("es-ES")} €
                  </p>
                </div>
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
