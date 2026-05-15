"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      // IMPORTANTE: Barra final '/' después de password-reset
      const res = await fetch(
        "http://localhost:8000/api/auth/password-reset/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (res.ok) {
        toast.success("Si el email existe, recibirás un enlace.");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error en la solicitud");
      }
    } catch (error) {
      toast.error("Error de red: No se pudo conectar con Django");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black items-center justify-center px-6">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-green-900">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-6">
          Recuperar Contraseña
        </h1>
        <form onSubmit={handleRecover} className="space-y-6">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-zinc-800 text-green-400 border border-green-800 outline-none"
          />
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar Instrucciones"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-400 hover:underline">
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
