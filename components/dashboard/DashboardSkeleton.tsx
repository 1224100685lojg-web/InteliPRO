interface DashboardSkeletonProps {
  /** Oculta el encabezado y los filtros para usarse dentro del contenido. */
  compacto?: boolean;
}

function ContenidoSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, indice) => (
          <div key={indice} className="h-40 rounded-3xl bg-[#f5f5f7]" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 rounded-3xl bg-[#f5f5f7]" />
        <div className="h-44 rounded-3xl bg-[#f5f5f7]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-3xl bg-[#f5f5f7]" />
        <div className="h-96 rounded-3xl bg-[#f5f5f7]" />
      </div>
    </div>
  );
}

export function DashboardSkeleton({ compacto = false }: DashboardSkeletonProps) {
  if (compacto) {
    return (
      <div aria-busy="true" aria-live="polite">
        <ContenidoSkeleton />
        <span className="sr-only">Cargando estadísticas de la tienda…</span>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse space-y-4" aria-hidden="true">
        <div className="h-3 w-28 rounded-full bg-[#e8e8ed]" />
        <div className="h-10 w-80 max-w-full rounded-2xl bg-[#e8e8ed]" />
        <div className="h-4 w-96 max-w-full rounded-full bg-[#e8e8ed]" />
      </div>

      <div className="animate-pulse" aria-hidden="true">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="h-12 rounded-2xl bg-[#f5f5f7]" />
          <div className="h-12 rounded-2xl bg-[#f5f5f7]" />
          <div className="h-12 w-28 rounded-full bg-[#f5f5f7]" />
        </div>
      </div>

      <ContenidoSkeleton />
      <span className="sr-only">Cargando el dashboard…</span>
    </div>
  );
}

export default DashboardSkeleton;
