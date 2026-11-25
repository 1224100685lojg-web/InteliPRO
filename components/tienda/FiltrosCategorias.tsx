"use client";

import type { Categoria } from "@/lib/types";

interface FiltrosCategoriasProps {
  categorias: Categoria[];
  seleccionada: string;
  onSeleccionar: (categoriaId: string) => void;
  cargando?: boolean;
}

const PILDORA =
  "inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2";

const ACTIVA = "bg-[#1d1d1f] text-white";

const INACTIVA =
  "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]";

export function FiltrosCategorias({
  categorias,
  seleccionada,
  onSeleccionar,
  cargando = false,
}: FiltrosCategoriasProps) {
  if (cargando && categorias.length === 0) {
    return (
      <div className="flex flex-wrap justify-center gap-2" aria-hidden="true">
        {Array.from({ length: 7 }, (_, indice) => (
          <div
            key={indice}
            className="h-9 w-24 animate-pulse rounded-full bg-[#e8e8ed]"
          />
        ))}
      </div>
    );
  }

  return (
    <nav aria-label="Filtrar por categoría">
      <ul className="flex flex-wrap justify-center gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSeleccionar("")}
            aria-pressed={seleccionada === ""}
            className={`${PILDORA} ${
              seleccionada === "" ? ACTIVA : INACTIVA
            }`}
          >
            Todas
          </button>
        </li>

        {categorias.map((categoria) => {
          const activa = seleccionada === categoria.id;

          return (
            <li key={categoria.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(categoria.id)}
                aria-pressed={activa}
                title={categoria.descripcion}
                className={`${PILDORA} ${activa ? ACTIVA : INACTIVA}`}
              >
                {categoria.nombre}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default FiltrosCategorias;
