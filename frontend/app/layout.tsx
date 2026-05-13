import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ------------------------------------------------------------------
// METADATOS SEO MEJORADOS
// ------------------------------------------------------------------
export const metadata: Metadata = {
  // Título con plantilla: "Página | Tienda de Coches" o solo "Tienda de Coches"
  title: {
    template: "%s | Tienda de Coches",
    default: "Tienda de Coches - Gestión de Inventario",
  },
  // Descripción para Google y redes sociales
  description:
    "Aplicación web para la gestión profesional de inventario de vehículos. Compra, vende y administra coches fácilmente.",
  // Palabras clave para SEO
  keywords: ["coches", "venta", "inventario", "tienda", "vehículos", "gestión"],
  // Autor del proyecto
  authors: [{ name: "Manuel Delgado Lopes" }],
  // Configuración para robots de búsqueda
  robots: {
    index: true,
    follow: true,
  },
  // Metadatos para Open Graph (compartir en redes sociales)
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "http://localhost:3000",
    siteName: "Tienda de Coches",
    title: "Tienda de Coches - Gestión de Inventario",
    description:
      "Aplicación web para la gestión profesional de inventario de vehículos.",
  },
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <Navbar />
        {children}
        <Footer />

        {/* Toaster global para notificaciones flotantes */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b", // zinc-900: fondo oscuro
              color: "#86efac", // green-300: texto verde claro
              border: "1px solid #166534", // green-800: borde verde oscuro
              fontSize: "14px",
            },
            duration: 4000, // 4 segundos antes de desaparecer
            success: {
              iconTheme: { primary: "#86efac", secondary: "#18181b" },
            },
            error: {
              style: {
                background: "#18181b",
                color: "#fca5a5", // red-300 para errores
                border: "1px solid #991b1b", // red-900
              },
              iconTheme: { primary: "#fca5a5", secondary: "#18181b" },
            },
          }}
        />
      </body>
    </html>
  );
}
