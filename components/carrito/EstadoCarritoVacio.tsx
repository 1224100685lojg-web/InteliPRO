"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface EstadoCarritoVacioProps {
  titulo?: string;
  mensaje?: string;
}

export function EstadoCarritoVacio({
  titulo = "Tu carrito está vacío",
  mensaje = "Explora el catálogo y agrega los productos que necesites. Aquí verás el detalle antes de pagar.",
}: EstadoCarritoVacioProps) {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-lg flex-col items-center justify-center px-5 py-16 text-center animate-fade-in">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
        <ShoppingBag className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="mt-7 text-4xl font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-5xl">
        {titulo}
      </h1>
      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#6e6e73]">
        {mensaje}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 py-3.5 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-[#0077ed] active:bg-[#0066cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2"
      >
        Explorar catálogo
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <p className="mt-6 text-xs text-[#6e6e73]">
        Una venta corresponde a una sola tienda.
      </p>
    </div>
  );
}

export default EstadoCarritoVacio;
