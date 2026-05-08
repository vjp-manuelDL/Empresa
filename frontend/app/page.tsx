"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Coche {
  id: number;
  marca: string;
  color: string;
  precio: number;
}

export default function Home() {
  const [coches, setCoches] = useState<Coche[]>([]); // estado para almacenar los coches
  const [loading, setLoading] = useState(true); // estado para controlar la carga

  useEffect(() => {
    fetch("http://localhost:8000/api/coches/") // ← Tu API de Django
      .then((response) => response.json())
      .then((data) => {
        setCoches(data.coches); // ← Guardamos los coches
        setLoading(false); // ← Terminamos de cargar
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/asds.jpg"
          alt="Logo Coches"
          width={500}
          height={300}
          priority
        />

        <h1 className="max-w-xs text-3xl font-semibold text-shadow-red-300 leading-10 tracking-tight text-black dark:text-zinc-50 text-center sm:text-left">
          Tienda de Coches
        </h1>

        <div className="w-full mt-6">
          {loading ? (
            <p className="text-center  text-yellow-400">Cargando coches...</p>
          ) : coches.length === 0 ? (
            <p className="text-center  text-yellow-700">
              No hay coches disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {coches.map((coche: Coche) => (
                <div
                  key={coche.id}
                  className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-600"
                >
                  <h3 className=" border border-amber-600 bg-zinc-900 text-yellow-300">
                    {coche.marca}
                  </h3>

                  <p className=" text-pink-400  text-3xl">
                    Color: {coche.color}
                  </p>

                  <p className="text-sm text-green-700 dark:text-blue-900 ">
                    Precio: {coche.precio}€
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
