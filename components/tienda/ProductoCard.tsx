"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Ban,
  Check,
  ImageOff,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/constants";
import type { Producto } from "@/lib/types";

interface ProductoCardProps {
  producto: Producto;
}

function etiquetaStock(stock: number): {
  texto: string;
  clases: string;
  punto: string;
} {
  if (stock <= 0) {
    return {
      texto: "Agotado",
      clases: "text-[#86868b]",
      punto: "bg-[#c7c7cc]",
    };
  }
  if (stock <= 5) {
    return {
      texto: `Últimas ${stock}`,
      clases: "text-[#6e6e73]",
      punto: "bg-[#ff9f0a]",
    };
  }
  return {
    texto: "Disponible",
    clases: "text-[#6e6e73]",
    punto: "bg-[#34c759]",
  };
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [imagenFallida, setImagenFallida] = useState(
    () => !producto.imagen.trim()
  );
  const [agregado, setAgregado] = useState(false);
  const [cantidadAgregada, setCantidadAgregada] = useState(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const maximo = Math.max(0, Math.floor(producto.stock));
  const cantidadActual = maximo > 0 ? Math.min(cantidad, maximo) : 0;
  const stock = etiquetaStock(maximo);

  function disminuir() {
    setCantidad((valor) => Math.max(1, Math.min(valor, maximo) - 1));
  }

  function aumentar() {
    setCantidad((valor) => Math.min(maximo, Math.min(valor, maximo) + 1));
  }

  function agregarAlCarrito() {
    if (maximo <= 0 || cantidadActual <= 0) return;

    agregar(producto, cantidadActual);
    setCantidadAgregada(cantidadActual);
    setAgregado(true);

    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAgregado(false), 1600);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-[#f5f5f7] transition-transform duration-300 ease-out hover:-translate-y-1">
      <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f7]">
        {imagenFallida ? (
          <div
            role="img"
            aria-label={`Imagen no disponible para ${producto.nombre}`}
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f5f5f7] text-[#86868b]"
          >
            <ImageOff
              className="h-8 w-8"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="text-[11px] font-medium">Imagen no disponible</span>
          </div>
        ) : (
          <Image
            src={producto.imagen}
            alt={`${producto.nombre} — ${producto.categoriaNombre}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-105 sm:p-7"
            onError={() => setImagenFallida(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <div className="flex items-center justify-between gap-2 text-[12px]">
          <span className="truncate text-[#6e6e73]">
            {producto.categoriaNombre}
          </span>
          {producto.destacado && (
            <span className="shrink-0 font-medium text-[#1d1d1f]">
              Destacado
            </span>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-[#1d1d1f]">
          {producto.nombre}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#6e6e73]">
          {producto.descripcion}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-[22px] font-semibold leading-none tracking-tight text-[#1d1d1f]">
            {formatMoney(producto.precio)}
            <span className="ml-1 align-middle text-[10px] font-medium uppercase tracking-wider text-[#86868b]">
              MXN
            </span>
          </p>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 pb-0.5 text-[11px] font-medium ${stock.clases}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${stock.punto}`}
              aria-hidden="true"
            />
            {stock.texto}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <div className="inline-flex shrink-0 items-center rounded-full bg-white">
            <button
              type="button"
              onClick={disminuir}
              disabled={maximo <= 0 || cantidadActual <= 1}
              aria-label={`Quitar una unidad de ${producto.nombre}`}
              className="grid h-9 w-8 place-items-center rounded-l-full text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
            <span
              className="w-7 text-center text-[13px] font-semibold tabular-nums text-[#1d1d1f]"
              aria-live="polite"
              aria-label={`Cantidad seleccionada: ${cantidadActual}`}
            >
              {cantidadActual}
            </span>
            <button
              type="button"
              onClick={aumentar}
              disabled={maximo <= 0 || cantidadActual >= maximo}
              aria-label={`Agregar una unidad de ${producto.nombre}`}
              className="grid h-9 w-8 place-items-center rounded-r-full text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={agregarAlCarrito}
            disabled={maximo <= 0}
            className={`inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
              maximo <= 0
                ? "bg-[#e8e8ed] text-[#86868b]"
                : agregado
                  ? "bg-[#1d1d1f] text-white hover:bg-black"
                  : "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#0066cc]"
            }`}
          >
            {maximo <= 0 ? (
              <>
                <Ban
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Agotado
              </>
            ) : agregado ? (
              <>
                <Check
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Agregar
              </>
            )}
          </button>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {agregado
            ? `${cantidadAgregada} ${
                cantidadAgregada === 1 ? "unidad" : "unidades"
              } de ${producto.nombre} ${
                cantidadAgregada === 1 ? "agregada" : "agregadas"
              } al carrito`
            : ""}
        </span>
      </div>
    </article>
  );
}

export default ProductoCard;
