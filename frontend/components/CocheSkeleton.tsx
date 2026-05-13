// components/CocheSkeleton.tsx

export default function CocheSkeleton() {
  return (
    // La tarjeta ES el contenedor. No necesitas wrapper extra.
    // relative + animate-pulse van AQUÍ, en la tarjeta
    <div className="p-4 border border-zinc-200 dark:border-green-900 rounded-lg bg-zinc-100 dark:bg-green-900 shadow-sm relative animate-pulse">
      {/* Placeholder botón Editar */}
      <div className="absolute top-3 left-3 w-12 h-5 bg-zinc-300 dark:bg-green-600 rounded"></div>

      {/* Placeholder botón Eliminar */}
      <div className="absolute top-3 right-3 w-12 h-5 bg-zinc-300 dark:bg-green-600 rounded"></div>

      {/* Placeholder título */}
      <div className="h-5 bg-zinc-300 dark:bg-green-600 rounded w-3/4 mx-auto mb-3 px-8"></div>

      {/* Placeholder color */}
      <div className="h-4 bg-zinc-300 dark:bg-green-600 rounded w-1/2 mx-auto mb-2"></div>

      {/* Placeholder precio */}
      <div className="h-5 bg-zinc-300 dark:bg-green-600 rounded w-1/3 mx-auto"></div>
    </div>
  );
}
