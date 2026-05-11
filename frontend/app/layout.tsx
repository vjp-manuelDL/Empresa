import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle"; // ← Importamos el nuevo componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda de Coches",
  description: "Gestión de inventario de vehículos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // ← OBLIGATORIO: evita warning de hidratación al modificar clases en el cliente
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        {children}
        <ThemeToggle /> {/* ← Renderizamos el botón flotante */}
      </body>
    </html>
  );
}
