import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite acceso desde tu IP de red en desarrollo
  allowedDevOrigins: ["192.168.27.117"],
};

export default nextConfig;
