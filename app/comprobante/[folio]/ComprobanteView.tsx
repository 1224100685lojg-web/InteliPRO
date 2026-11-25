"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Printer,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { getComprobante, obtenerComprobantesLocales } from "@/lib/api";
import { formatFecha, formatMoney, IMPUESTO } from "@/lib/constants";
import type { Comprobante } from "@/lib/types";

interface ComprobanteViewProps {
  folio: string;
}

const PORCENTAJE_IMPUESTO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
}).format(IMPUESTO * 100);

const BOTON_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#f5f5f7] px-5 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors duration-300 hover:bg-[#e8e8ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2";

const BOTON_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#0077ed] active:bg-[#0066cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2";

/** Convierte "Tarjeta terminación 4242" en "Tarjeta •••• 4242". */
function metodoPagoLegible(metodo: string): string {
  const ultimos4 = metodo.match(/\d{4}/)?.[0];
  return ultimos4 ? `Tarjeta •••• ${ultimos4}` : metodo;
}

function buscarEnLocal(folio: string): Comprobante | null {
  const buscado = folio.trim().toUpperCase();
  return (
    obtenerComprobantesLocales().find(
      (item) => item.folio.toUpperCase() === buscado
    ) ?? null
  );
}

function ComprobanteEsqueleto() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse space-y-5">
        <div className="h-3 w-36 rounded-full bg-[#e8e8ed]" />
        <div className="h-11 w-48 rounded-2xl bg-[#f5f5f7]" />
        <div className="h-[28rem] rounded-3xl bg-[#f5f5f7]" />
      </div>
      <span className="sr-only">Cargando el comprobante…</span>
    </div>
  );
}

export function ComprobanteView({ folio }: ComprobanteViewProps) {
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "no-encontrado">(
    "cargando"
  );

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setEstado("cargando");

      try {
        const encontrado = await getComprobante(folio);
        if (!activo) return;

        if (encontrado) {
          setComprobante(encontrado);
          setEstado("listo");
          return;
        }

        // Respaldo explícito en localStorage.
        const local = buscarEnLocal(folio);
        if (!activo) return;

        if (local) {
          setComprobante(local);
          setEstado("listo");
        } else {
          setEstado("no-encontrado");
        }
      } catch {
        if (!activo) return;
        const local = buscarEnLocal(folio);
        if (local) {
          setComprobante(local);
          setEstado("listo");
        } else {
          setEstado("no-encontrado");
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [folio]);

  function imprimir() {
    if (typeof window !== "undefined") window.print();
  }

  function descargar() {
    if (!comprobante) return;

    const separador = "----------------------------------------";
    const metodo = metodoPagoLegible(comprobante.metodoPago);
    const lineas = [
      "INTELIPRO · COMPROBANTE DE VENTA",
      "========================================",
      `Folio: ${comprobante.folio}`,
      `Fecha: ${formatFecha(comprobante.fecha)}`,
      `Tienda: ${comprobante.tiendaNombre}`,
      `Cliente: ${comprobante.clienteNombre}`,
      `Correo: ${comprobante.clienteEmail || "No disponible"}`,
      "",
      "DETALLE DE PRODUCTOS",
      separador,
      ...comprobante.items.map(
        (item) =>
          `${item.cantidad} x ${item.nombre} | ${formatMoney(
            item.precio
          )} c/u | ${formatMoney(item.precio * item.cantidad)}`
      ),
      separador,
      `Subtotal: ${formatMoney(comprobante.subtotal)}`,
      `Impuesto (${PORCENTAJE_IMPUESTO}%): ${formatMoney(comprobante.impuesto)}`,
      `TOTAL: ${formatMoney(comprobante.total)}`,
      "",
      `Método de pago: ${metodo}`,
      "Estado: PAGADA",
      "",
      "Gracias por tu compra.",
    ];

    const blob = new Blob([lineas.join("\r\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `comprobante-${comprobante.folio}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (estado === "cargando") return <ComprobanteEsqueleto />;

  if (estado === "no-encontrado" || !comprobante) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-5 py-16 text-center animate-fade-in">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
          <AlertTriangle
            className="h-7 w-7"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
          Comprobante no encontrado
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
          No pudimos localizar el folio{" "}
          <span className="font-medium text-[#1d1d1f]">{folio}</span>. Revisa el
          enlace o vuelve al catálogo para realizar una nueva compra.
        </p>
        <Link href="/" className={`${BOTON_PRIMARIO} mt-8`}>
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] transition-colors duration-300 hover:text-[#0062c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Volver al catálogo
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={imprimir} className={BOTON_SECUNDARIO}>
            <Printer className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Imprimir
          </button>
          <button type="button" onClick={descargar} className={BOTON_PRIMARIO}>
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Descargar
          </button>
        </div>
      </div>

      <article
        className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white print:rounded-none print:border-0"
        aria-labelledby="comprobante-titulo"
      >
        <header className="border-b border-black/[0.06] px-6 py-8 sm:px-10 sm:py-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1d1d1f] text-white">
                <ShoppingBag
                  className="h-4.5 w-4.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                  InteliPro
                </p>
                <p className="text-xs text-[#6e6e73]">Cadena de tiendas</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#1d1d1f]">
              <CheckCircle2
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Pagada
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1
                id="comprobante-titulo"
                className="flex items-center gap-2.5 text-3xl font-semibold tracking-[-0.02em] text-[#1d1d1f]"
              >
                <Receipt
                  className="h-6 w-6 text-[#6e6e73]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Comprobante de venta
              </h1>
              <p className="mt-2.5 text-[13px] text-[#6e6e73]">
                Folio{" "}
                <span className="font-medium tracking-[0.04em] text-[#1d1d1f]">
                  {comprobante.folio}
                </span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                Fecha
              </p>
              <p className="mt-1 text-[15px] text-[#1d1d1f]">
                {formatFecha(comprobante.fecha)}
              </p>
            </div>
          </div>
        </header>

        <div className="px-6 py-8 sm:px-10">
          <dl className="grid gap-x-8 gap-y-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                Tienda
              </dt>
              <dd className="mt-1 text-[15px] text-[#1d1d1f]">
                {comprobante.tiendaNombre}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                Cliente
              </dt>
              <dd className="mt-1 text-[15px] text-[#1d1d1f]">
                {comprobante.clienteNombre}
              </dd>
              {comprobante.clienteEmail && (
                <dd className="text-xs text-[#6e6e73]">
                  {comprobante.clienteEmail}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                Método de pago
              </dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-[15px] text-[#1d1d1f]">
                <CreditCard
                  className="h-4 w-4 text-[#6e6e73]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {metodoPagoLegible(comprobante.metodoPago)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
                Estado
              </dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1d1d1f]">
                <CheckCircle2
                  className="h-4 w-4 text-[#6e6e73]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Pagada
              </dd>
            </div>
          </dl>

          <div className="mt-9 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">
                Detalle de productos del comprobante {comprobante.folio}
              </caption>
              <thead>
                <tr className="border-b border-black/[0.08] text-[10px] uppercase tracking-[0.14em] text-[#6e6e73]">
                  <th scope="col" className="py-2.5 pr-3 font-medium">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center font-medium">
                    Cant.
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">
                    Precio
                  </th>
                  <th scope="col" className="py-2.5 pl-3 text-right font-medium">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {comprobante.items.map((item) => (
                  <tr key={`${item.productoId}-${item.nombre}`}>
                    <td className="py-3.5 pr-3 text-[#1d1d1f]">
                      {item.nombre}
                    </td>
                    <td className="px-3 py-3.5 text-center tabular-nums text-[#6e6e73]">
                      {item.cantidad}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-[#6e6e73]">
                      {formatMoney(item.precio)}
                    </td>
                    <td className="py-3.5 pl-3 text-right font-medium tabular-nums text-[#1d1d1f]">
                      {formatMoney(item.precio * item.cantidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <dl className="w-full max-w-xs space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[13px] text-[#6e6e73]">Subtotal</dt>
                <dd className="tabular-nums text-[#1d1d1f]">
                  {formatMoney(comprobante.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[13px] text-[#6e6e73]">
                  Impuesto ({PORCENTAJE_IMPUESTO}%)
                </dt>
                <dd className="tabular-nums text-[#1d1d1f]">
                  {formatMoney(comprobante.impuesto)}
                </dd>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4 border-t border-black/[0.08] pt-4">
                <dt className="text-[15px] font-medium text-[#1d1d1f]">Total</dt>
                <dd className="text-3xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#1d1d1f]">
                  {formatMoney(comprobante.total)}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-10 border-t border-black/[0.06] pt-5 text-center text-xs leading-relaxed text-[#6e6e73]">
            Gracias por tu compra. Este comprobante es un documento simulado
            con fines académicos.
          </p>
        </div>
      </article>
    </div>
  );
}

export default ComprobanteView;
