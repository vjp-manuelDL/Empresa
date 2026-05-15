// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

/**
 * Componente LoginPage: Gestiona el acceso de usuarios a la plataforma.
 * Se conecta con el endpoint de Django 'api/auth/login/'.
 */
export default function LoginPage() {
  const router = useRouter();

  // --- ESTADOS ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Controla el estado del botón de envío

  /**
   * handleLogin: Función que procesa el formulario.
   * Envía las credenciales al backend y gestiona la respuesta.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Desactivamos el botón para evitar múltiples peticiones

    try {
      // Petición POST a nuestra API de Django
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        /**
         * 1. PERSISTENCIA DE SESIÓN:
         * Guardamos la información en localStorage para que el navegador
         * recuerde quién está logueado al recargar.
         */
        localStorage.setItem("tienda_coches_user", data.username);

        /**
         * 2. CONTROL DE PERMISOS (is_staff):
         * Verificamos si el usuario es administrador. Usamos una validación
         * por defecto (false) por si Django no envía el campo, evitando errores.
         */
        const isStaff = data.is_staff !== undefined ? data.is_staff : false;
        localStorage.setItem("tienda_coches_is_staff", isStaff.toString());

        toast.success(`¡Bienvenido de nuevo, ${data.username}!`);

        /**
         * 3. REDIRECCIÓN Y REFRESCO:
         * Usamos window.location.href en lugar de router.push para FORZAR
         * una recarga completa. Esto hace que el Navbar lea el localStorage
         * inmediatamente y actualice los botones de la interfaz.
         */
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        // Errores controlados devueltos por la API (Ej: 401 Unauthorized)
        toast.error(data.error || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      /**
       * 4. GESTIÓN DE ERRORES DE RED:
       * Captura fallos si el servidor está apagado o hay problemas de CORS.
       */
      console.error("Detalle del fallo:", error);
      toast.error("No se pudo conectar con el servidor de Django");
    } finally {
      setLoading(false); // Reactivamos el botón pase lo que pase
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black items-center justify-center px-4">
      {/* Contenedor del Formulario */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-green-900">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-green-400 mb-6">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo Usuario */}
          <input
            type="text"
            placeholder="Introduce tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />

          {/* Campo Contraseña */}
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-green-400 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />

          {/* Botón de Acción */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando credenciales..." : "Entrar"}
          </button>
        </form>

        {/* Enlaces de Ayuda y Registro */}
        <div className="mt-6 flex flex-col items-center gap-3 text-sm border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <Link
            href="/recover"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ¿Has olvidado tu contraseña?
          </Link>
          <p className="text-zinc-600 dark:text-zinc-400">
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Crea una ahora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
