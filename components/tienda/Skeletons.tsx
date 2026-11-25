export function TarjetaSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-[#f5f5f7]">
      <div className="aspect-square w-full animate-pulse rounded-3xl bg-[#e8e8ed]" />
      <div className="space-y-3 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-20 animate-pulse rounded-full bg-[#e8e8ed]" />
          <div className="h-3 w-12 animate-pulse rounded-full bg-[#e8e8ed]" />
        </div>
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#e8e8ed]" />
        <div className="h-3 w-full animate-pulse rounded-full bg-[#e8e8ed]/70" />
        <div className="flex items-end justify-between pt-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-[#e8e8ed]" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-[#e8e8ed]" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#e8e8ed]" />
          <div className="h-9 flex-1 animate-pulse rounded-full bg-[#e8e8ed]" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: cantidad }, (_, indice) => (
        <TarjetaSkeleton key={indice} />
      ))}
    </div>
  );
}

export function FiltrosSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full shrink-0 sm:w-56">
          <div className="mb-1.5 h-3 w-12 animate-pulse rounded-full bg-[#e8e8ed]" />
          <div className="h-11 w-full animate-pulse rounded-full bg-[#e8e8ed]" />
        </div>
        <div className="h-11 flex-1 animate-pulse rounded-full bg-[#e8e8ed]" />
        <div className="hidden h-4 w-14 animate-pulse rounded-full bg-[#e8e8ed] sm:mb-3 sm:block" />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 7 }, (_, indice) => (
          <div
            key={indice}
            className="h-9 w-24 animate-pulse rounded-full bg-[#e8e8ed]"
          />
        ))}
      </div>
    </div>
  );
}

export function CatalogoSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-0 sm:px-6 sm:pb-24 lg:px-8">
      <p className="sr-only" role="status" aria-live="polite">
        Cargando catálogo…
      </p>

      <div className="flex flex-col items-center py-16 text-center sm:py-20 lg:py-24">
        <div className="h-12 w-3/4 max-w-2xl animate-pulse rounded-full bg-[#f5f5f7] sm:h-16" />
        <div className="mt-5 h-4 w-2/3 max-w-xl animate-pulse rounded-full bg-[#f5f5f7]" />
        <div className="mt-6 h-3 w-40 animate-pulse rounded-full bg-[#f5f5f7]" />
      </div>

      <FiltrosSkeleton />

      <div className="mt-10 sm:mt-12">
        <GridSkeleton />
      </div>
    </div>
  );
}

export default CatalogoSkeleton;
