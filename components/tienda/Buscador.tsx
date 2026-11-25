"use client";

import { Search, X } from "lucide-react";

interface BuscadorProps {
  valor: string;
  onCambiar: (valor: string) => void;
  onLimpiar: () => void;
}

export function Buscador({ valor, onCambiar, onLimpiar }: BuscadorProps) {
  return (
    <div className="w-full">
      <label htmlFor="buscar-productos" className="sr-only">
        Buscar productos por nombre o descripción
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          id="buscar-productos"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Buscar por nombre o descripción…"
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
          className="h-11 w-full rounded-full border-0 bg-[#f5f5f7] pl-11 pr-11 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] transition-colors duration-300 focus:bg-[#efeff1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
        />
        {valor.length > 0 && (
          <button
            type="button"
            onClick={onLimpiar}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#86868b] transition-colors hover:bg-[#e8e8ed] hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Buscador;
