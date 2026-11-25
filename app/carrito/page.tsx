"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Trash2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { CarritoResumen } from "@/components/carrito/CarritoResumen";
import { ItemCarritoRow } from "@/components/carrito/ItemCarritoRow";
import { EstadoCarritoVacio } from "@/components/carrito/EstadoCarritoVacio";

const BOTON_PRIMARIO =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 py-3.5 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-[#0077ed] active:bg-[#0066cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

function CarritoEsqueleto() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-28 rounded-full bg-[#e8e8ed]" />
        <div className="h-11 w-56 rounded-2xl bg-[#f5f5f7]" />
        <div className="h-4 w-72 max-w-full rounded-full bg-[#f5f5f7]" />
        <div className="grid gap-8 pt-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, indice) => (
              <div key={indice} className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#f5f5f7] sm:h-24 sm:w-24" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 w-24 rounded-full bg-[#f5f5f7]" />
                  <div className="h-4 w-3/4 rounded-full bg-[#f5f5f7]" />
                  <div className="h-3 w-28 rounded-full bg-[#f5f5f7]" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-80 rounded-3xl bg-[#f5f5f7]" />
        </div>
      </div>
      <span className="sr-only">Cargando tu carrito…</span>
    </div>
  );
}

export default function CarritoPage() {
  const {
    items,
    quitar,
    cambiarCantidad,
    vaciar,
    cantidadTotal,
    listo,
  } = useCart();
  const { usuario, cargando } = useSession();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const tiendas = useMemo(
    () => Array.from(new Set(items.map((item) => item.producto.tiendaId))),
    [items]
  );
  const variasTiendas = tiendas.length > 1;

  if (!listo) return <CarritoEsqueleto />;
  if (items.length === 0) return <EstadoCarritoVacio />;

  const resumenCantidad =
    cantidadTotal === 1 ? "1 artículo" : `${cantidadTotal} artículos`;
  const resumenProductos =
    items.length === 1 ? "1 producto" : `${items.length} productos`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] transition-colors duration-300 hover:text-[#0062c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            Seguir comprando
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-5xl">
            Tu carrito
          </h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            {resumenCantidad} en {resumenProductos}.
          </p>
        </div>

        {confirmarVaciar ? (
          <div
            className="flex flex-wrap items-center gap-2 rounded-full bg-[#f5f5f7] p-1.5 pl-4"
            role="group"
            aria-label="Confirmar vaciar el carrito"
          >
            <span className="text-xs text-[#1d1d1f]">
              ¿Vaciar todo el carrito?
            </span>
            <button
              type="button"
              onClick={() => {
                vaciar();
                setConfirmarVaciar(false);
              }}
              className="rounded-full bg-[#1d1d1f] px-3.5 py-1.5 text-xs font-medium text-white transition-colors duration-300 hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
            >
              Sí, vaciar
            </button>
            <button
              type="button"
              onClick={() => setConfirmarVaciar(false)}
              className="rounded-full px-3 py-1.5 text-xs text-[#6e6e73] transition-colors duration-300 hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmarVaciar(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[13px] text-[#6e6e73] transition-colors duration-300 hover:text-[#1d1d1f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Vaciar carrito
          </button>
        )}
      </div>

      {variasTiendas && (
        <div
          role="alert"
          className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f5f5f7] px-5 py-4 text-sm"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#1d1d1f]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-[#1d1d1f]">
              Una venta corresponde a una sola tienda
            </p>
            <p className="mt-1 leading-relaxed text-[#6e6e73]">
              Tu carrito tiene productos de {tiendas.length} tiendas distintas.
              Quita los productos de las otras tiendas para continuar con el
              pago.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section aria-label="Productos en el carrito" className="min-w-0">
          <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {items.map((item) => (
              <ItemCarritoRow
                key={item.producto.id}
                item={item}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitar}
              />
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <CarritoResumen>
            {variasTiendas ? (
              <div>
                <button type="button" disabled className={BOTON_PRIMARIO}>
                  <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Pago no disponible
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-[#6e6e73]">
                  Ajusta el carrito para comprar en una sola tienda.
                </p>
              </div>
            ) : cargando ? (
              <button type="button" disabled className={BOTON_PRIMARIO}>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Comprobando sesión…
              </button>
            ) : usuario ? (
              <Link href="/checkout" className={BOTON_PRIMARIO}>
                Continuar al pago
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            ) : (
              <div>
                <Link href="/login?next=%2Fcheckout" className={BOTON_PRIMARIO}>
                  <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Inicia sesión para pagar
                </Link>
                <p className="mt-3 text-center text-xs leading-relaxed text-[#6e6e73]">
                  Te llevaremos al pago después de iniciar sesión.
                </p>
              </div>
            )}

            <p className="mt-4 text-center text-[11px] leading-relaxed text-[#6e6e73]">
              El impuesto del 4.3% ya está incluido en el total.
            </p>
          </CarritoResumen>
        </aside>
      </div>
    </div>
  );
}
