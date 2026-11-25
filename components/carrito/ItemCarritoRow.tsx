"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { ItemCarrito } from "@/lib/types";
import { formatMoney } from "@/lib/constants";

interface ItemCarritoRowProps {
  item: ItemCarrito;
  onCambiarCantidad: (productoId: string, cantidad: number) => void;
  onQuitar: (productoId: string) => void;
}

export function ItemCarritoRow({
  item,
  onCambiarCantidad,
  onQuitar,
}: ItemCarritoRowProps) {
  const { producto, cantidad } = item;
  const importe = producto.precio * cantidad;
  const maximoAlcanzado = cantidad >= producto.stock;

  return (
    <article className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
        <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-[#f5f5f7] p-2.5 sm:h-24 sm:w-24 sm:p-3">
          <div className="relative h-full w-full">
            <Image
              src={producto.imagen}
              alt={`Imagen de ${producto.nombre}`}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-[#6e6e73]">
            {producto.categoriaNombre}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#1d1d1f] sm:text-base">
            {producto.nombre}
          </h3>
          <p className="mt-1.5 text-sm tabular-nums text-[#6e6e73]">
            {formatMoney(producto.precio)}{" "}
            <span className="text-xs">c/u</span>
          </p>
          {maximoAlcanzado && (
            <p className="mt-1.5 text-xs text-[#6e6e73]">
              Alcanzaste el máximo disponible ({producto.stock}).
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
        <div
          className="inline-flex items-center rounded-full bg-[#f5f5f7] p-1"
          role="group"
          aria-label={`Cantidad de ${producto.nombre}`}
        >
          <button
            type="button"
            onClick={() => onCambiarCantidad(producto.id, cantidad - 1)}
            disabled={cantidad <= 1}
            aria-label={`Disminuir cantidad de ${producto.nombre}`}
            className="grid h-8 w-8 place-items-center rounded-full text-[#1d1d1f] transition-colors duration-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span
            aria-live="polite"
            className="min-w-[2rem] px-1 text-center text-sm font-medium tabular-nums text-[#1d1d1f]"
          >
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => onCambiarCantidad(producto.id, cantidad + 1)}
            disabled={maximoAlcanzado}
            aria-label={`Aumentar cantidad de ${producto.nombre}`}
            className="grid h-8 w-8 place-items-center rounded-full text-[#1d1d1f] transition-colors duration-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-[#1d1d1f]">
            {formatMoney(importe)}
          </p>
          <button
            type="button"
            onClick={() => onQuitar(producto.id)}
            aria-label={`Quitar ${producto.nombre} del carrito`}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-[#6e6e73] transition-colors duration-300 hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            Quitar
          </button>
        </div>
      </div>
    </article>
  );
}

export default ItemCarritoRow;
