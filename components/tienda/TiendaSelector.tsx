"use client";

import { ChevronDown } from "lucide-react";
import type { Tienda } from "@/lib/types";

interface TiendaSelectorProps {
  tiendas: Tienda[];
  seleccionada: string;
  onSeleccionar: (tiendaId: string) => void;
  cargando?: boolean;
}

export function TiendaSelector({
  tiendas,
  seleccionada,
  onSeleccionar,
  cargando = false,
}: TiendaSelectorProps) {
  const deshabilitado = cargando || tiendas.length === 0;

  return (
    <div className="w-full shrink-0 sm:w-56">
      <label
        htmlFor="tienda-select"
        className="mb-1.5 block text-[13px] font-medium text-[#6e6e73]"
      >
        Tienda
      </label>
      <div className="relative">
        <select
          id="tienda-select"
          value={seleccionada}
          onChange={(evento) => onSeleccionar(evento.target.value)}
          disabled={deshabilitado}
          className="h-11 w-full appearance-none rounded-full border-0 bg-[#f5f5f7] pl-4 pr-10 text-[14px] text-[#1d1d1f] transition-colors duration-300 focus:bg-[#efeff1] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tiendas.length === 0 ? (
            <option value={seleccionada}>
              {cargando ? "Cargando tiendas…" : "Sin tiendas disponibles"}
            </option>
          ) : (
            tiendas.map((tienda) => (
              <option key={tienda.id} value={tienda.id}>
                {tienda.nombre} · {tienda.ciudad}
              </option>
            ))
          )}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default TiendaSelector;
