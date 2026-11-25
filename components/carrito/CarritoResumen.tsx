"use client";

import { useId, type ReactNode } from "react";
import { useCart } from "@/lib/cart-context";
import { formatMoney, IMPUESTO } from "@/lib/constants";

interface CarritoResumenProps {
  titulo?: string;
  /** Muestra una lista compacta de productos (útil en el checkout). */
  mostrarItems?: boolean;
  className?: string;
  children?: ReactNode;
}

const PORCENTAJE_IMPUESTO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
}).format(IMPUESTO * 100);

export function CarritoResumen({
  titulo = "Resumen de la compra",
  mostrarItems = false,
  className = "",
  children,
}: CarritoResumenProps) {
  const idTitulo = useId();
  const { items, subtotal, impuesto, total, cantidadTotal } = useCart();

  return (
    <section
      aria-labelledby={idTitulo}
      className={`rounded-3xl bg-[#f5f5f7] p-6 sm:p-7 ${className}`.trim()}
    >
      <h2
        id={idTitulo}
        className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]"
      >
        {titulo}
      </h2>

      {mostrarItems && items.length > 0 && (
        <ul className="mt-4 max-h-56 divide-y divide-black/[0.06] overflow-y-auto border-t border-black/[0.08] text-sm">
          {items.map(({ producto, cantidad }) => (
            <li
              key={producto.id}
              className="flex items-start justify-between gap-3 py-2.5"
            >
              <span className="min-w-0 leading-snug text-[#6e6e73]">
                <span className="tabular-nums text-[#1d1d1f]">{cantidad}×</span>{" "}
                <span className="line-clamp-2">{producto.nombre}</span>
              </span>
              <span className="shrink-0 tabular-nums text-[#1d1d1f]">
                {formatMoney(producto.precio * cantidad)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[13px] text-[#6e6e73]">
            Subtotal{" "}
            <span className="tabular-nums">
              ({cantidadTotal} {cantidadTotal === 1 ? "artículo" : "artículos"})
            </span>
          </dt>
          <dd className="tabular-nums text-[#1d1d1f]">
            {formatMoney(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[13px] text-[#6e6e73]">
            Impuesto ({PORCENTAJE_IMPUESTO}%)
          </dt>
          <dd className="tabular-nums text-[#1d1d1f]">
            {formatMoney(impuesto)}
          </dd>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4 border-t border-black/[0.08] pt-4">
          <dt className="text-[15px] font-medium text-[#1d1d1f]">Total</dt>
          <dd className="text-3xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#1d1d1f]">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}

export default CarritoResumen;
