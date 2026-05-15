"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// Separamos el formulario en un componente interno para usar useSearchParams correctamente
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtenemos los datos y limpiamos posibles caracteres extraños del copiado (como "3D" de los correos raw)
  const uid = searchParams.get("uid")?.replace("3D", "");
  const token = searchParams.get("token")?.replace("3D", "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid || !token) {
      toast.error("Faltan parámetros en la URL. Solicita un nuevo enlace.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/auth/password-reset-confirm/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: uid,
            token: token,
            new_password: newPassword,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Contraseña actualizada con éxito");
        router.push("/login");
      } else {
        // Django nos dirá aquí si el token expiró (Error 400)
        toast.error(data.error || "El enlace es inválido o ha expirado");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-green-900 shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-6">
          Nueva Contraseña
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña ( 6 caracteres mínimo )"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-zinc-800 text-green-400 border border-green-800 focus:ring-2 focus:ring-green-500 outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-zinc-800 text-green-400 border border-green-800 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente principal que envuelve el contenido en Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
