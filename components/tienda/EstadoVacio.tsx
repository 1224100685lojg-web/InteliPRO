import { Package, RotateCcw } from "lucide-react";

interface EstadoVacioProps {
  titulo?: string;
  descripcion?: string;
  etiquetaAccion?: string;
  onAccion: () => void;
}

export function EstadoVacio({
  titulo = "No encontramos productos",
  descripcion = "Prueba con otra búsqueda, cambia de categoría o revisa otra tienda.",
  etiquetaAccion = "Limpiar filtros",
  onAccion,
}: EstadoVacioProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
        <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-xl font-semibold tracking-tight text-[#1d1d1f]">
        {titulo}
      </h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#6e6e73]">
        {descripcion}
      </p>
      <button type="button" onClick={onAccion} className="btn-primary mt-6">
        <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        {etiquetaAccion}
      </button>
    </div>
  );
}

export default EstadoVacio;
