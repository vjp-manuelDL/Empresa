// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar usuario y su rol
        localStorage.setItem("tienda_coches_user", data.username);
        localStorage.setItem(
          "tienda_coches_is_staff",
          data.is_staff.toString(),
        ); // "true" o "false"

        toast.success(`Bienvenido, ${data.username}`);
        router.push("/");
      } else {
        toast.error(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      toast.error("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-green-900">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-green-400 mb-6">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-green-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-zinc-300 dark:border-green-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-green-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
