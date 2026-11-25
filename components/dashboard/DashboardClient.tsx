"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  BadgePercent,
  BarChart3,
  Calculator,
  CalendarRange,
  ChevronDown,
  DollarSign,
  LayoutDashboard,
  PackageOpen,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Store,
  type LucideIcon,
} from "lucide-react";
import { getEstadisticas, getTiendas, mensajeDeError } from "@/lib/api";
import { COMISION, IMPUESTO, formatMoney } from "@/lib/constants";
import type { Estadisticas, Tienda } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { KpiCard, type TonoKpi } from "./KpiCard";
import { ProductosExtremos } from "./ProductosExtremos";
import { TablaCategorias } from "./TablaCategorias";
import { VentasPorCategoriaChart } from "./VentasPorCategoriaChart";
import { DashboardSkeleton } from "./DashboardSkeleton";

const PERIODOS = ["Últimos 30 días", "Últimos 90 días", "Este año"];

const formateadorEntero = new Intl.NumberFormat("es-MX");

interface KpiDefinicion {
  titulo: string;
  valor: string;
  nota: string;
  icono: LucideIcon;
  tono: TonoKpi;
}

interface EstadoErrorProps {
  titulo: string;
  mensaje: string;
  onReintentar: () => void;
  reintentando?: boolean;
}

function EstadoError({
  titulo,
  mensaje,
  onReintentar,
  reintentando = false,
}: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-5 rounded-3xl bg-[#f5f5f7] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#1d1d1f]">
          <AlertTriangle
            className="h-5 w-5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#1d1d1f]">{titulo}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#6e6e73]">
            {mensaje}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReintentar}
        disabled={reintentando}
        className="btn-primary shrink-0"
      >
        <RefreshCw
          className={`h-4 w-4 ${reintentando ? "animate-spin" : ""}`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        Reintentar
      </button>
    </div>
  );
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-[#f5f5f7] px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#1d1d1f]">
        <PackageOpen
          className="h-6 w-6"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-[#1d1d1f]">
        Sin ventas en este periodo
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6e6e73]">
        No encontramos ventas registradas para la tienda y el periodo
        seleccionados. Prueba con otro periodo o actualiza los datos.
      </p>
    </div>
  );
}

function formatearPorcentaje(valor: number): string {
  return `${(valor * 100).toLocaleString("es-MX", {
    maximumFractionDigits: 1,
  })}%`;
}

export function DashboardClient() {
  const { usuario } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/dashboard";
  const searchParams = useSearchParams();

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [cargandoTiendas, setCargandoTiendas] = useState(true);
  const [errorTiendas, setErrorTiendas] = useState<string | null>(null);
  const [intentoTiendas, setIntentoTiendas] = useState(0);

  const [datos, setDatos] = useState<Estadisticas | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [intentoDatos, setIntentoDatos] = useState(0);

  const peticionRef = useRef(0);

  // Catálogo de tiendas para el selector.
  useEffect(() => {
    let activo = true;
    setCargandoTiendas(true);
    setErrorTiendas(null);

    getTiendas()
      .then((lista) => {
        if (!activo) return;
        setTiendas(lista);
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setTiendas([]);
        setErrorTiendas(mensajeDeError(error));
      })
      .finally(() => {
        if (activo) setCargandoTiendas(false);
      });

    return () => {
      activo = false;
    };
  }, [intentoTiendas]);

  const tiendaParam = searchParams?.get("tienda") ?? "";
  const periodoParam = searchParams?.get("periodo") ?? "";

  const tiendaId = useMemo(() => {
    if (tiendas.length === 0) return "";
    if (tiendaParam && tiendas.some((tienda) => tienda.id === tiendaParam)) {
      return tiendaParam;
    }
    const tiendaDelGerente = usuario?.tiendaId;
    if (
      tiendaDelGerente &&
      tiendas.some((tienda) => tienda.id === tiendaDelGerente)
    ) {
      return tiendaDelGerente;
    }
    return tiendas[0].id;
  }, [tiendas, tiendaParam, usuario?.tiendaId]);

  const periodo = useMemo(
    () => (PERIODOS.includes(periodoParam) ? periodoParam : PERIODOS[0]),
    [periodoParam]
  );

  const tiendaSeleccionada = useMemo(
    () => tiendas.find((tienda) => tienda.id === tiendaId) ?? null,
    [tiendas, tiendaId]
  );

  // Mantiene la selección efectiva en la URL (?tienda=&periodo=).
  useEffect(() => {
    if (!tiendaId) return;
    const params = new URLSearchParams();
    params.set("tienda", tiendaId);
    params.set("periodo", periodo);
    const siguiente = params.toString();
    if ((searchParams?.toString() ?? "") !== siguiente) {
      router.replace(`${pathname}?${siguiente}`, { scroll: false });
    }
  }, [tiendaId, periodo, searchParams, router, pathname]);

  // Las estadísticas siempre vienen calculadas desde la capa de API.
  useEffect(() => {
    if (!tiendaId) return;

    const idPeticion = peticionRef.current + 1;
    peticionRef.current = idPeticion;
    let activo = true;

    setCargandoDatos(true);
    setErrorDatos(null);

    getEstadisticas(tiendaId, periodo)
      .then((resultado) => {
        // Descarta respuestas de filtros anteriores.
        if (!activo || idPeticion !== peticionRef.current) return;
        setDatos(resultado);
      })
      .catch((error: unknown) => {
        if (!activo || idPeticion !== peticionRef.current) return;
        setDatos(null);
        setErrorDatos(mensajeDeError(error));
      })
      .finally(() => {
        if (!activo || idPeticion !== peticionRef.current) return;
        setCargandoDatos(false);
      });

    return () => {
      activo = false;
    };
  }, [tiendaId, periodo, intentoDatos]);

  function cambiarTienda(nuevaTienda: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tienda", nuevaTienda);
    params.set("periodo", periodo);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function cambiarPeriodo(nuevoPeriodo: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (tiendaId) params.set("tienda", tiendaId);
    params.set("periodo", nuevoPeriodo);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const kpis: KpiDefinicion[] = datos
    ? [
        {
          titulo: "Venta global",
          valor: formatMoney(datos.ventaGlobal),
          nota: "Monto total vendido en el periodo seleccionado.",
          icono: DollarSign,
          tono: "brand",
        },
        {
          titulo: "Comisión al vendedor",
          valor: formatMoney(datos.comision),
          nota: `Comisión del ${formatearPorcentaje(
            COMISION
          )} sobre la venta global.`,
          icono: BadgePercent,
          tono: "violet",
        },
        {
          titulo: "Impuesto",
          valor: formatMoney(datos.impuesto),
          nota: `Impuesto del ${formatearPorcentaje(
            IMPUESTO
          )} sobre la venta global.`,
          icono: Receipt,
          tono: "amber",
        },
        {
          titulo: "Cantidad de ventas",
          valor: formateadorEntero.format(datos.cantidadVentas),
          nota: "Transacciones registradas en el periodo.",
          icono: ShoppingBag,
          tono: "sky",
        },
        {
          titulo: "Promedio de venta",
          valor: formatMoney(datos.promedioVenta),
          nota: "Ticket promedio por cada venta.",
          icono: Calculator,
          tono: "emerald",
        },
      ]
    : [];

  if (cargandoTiendas) {
    return <DashboardSkeleton />;
  }

  if (errorTiendas) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EstadoError
          titulo="No pudimos cargar las tiendas"
          mensaje={errorTiendas}
          onReintentar={() => setIntentoTiendas((valor) => valor + 1)}
        />
      </div>
    );
  }

  if (tiendas.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center rounded-3xl bg-[#f5f5f7] px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#1d1d1f]">
            <Store className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-[#1d1d1f]">
            No hay tiendas disponibles
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6e6e73]">
            Cuando se registre una tienda podrás consultar sus estadísticas
            aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="animate-fade-in flex flex-col gap-5 border-b border-black/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868b]">
            <LayoutDashboard
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Panel de control
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1d1d1f] sm:text-5xl">
            Dashboard de tienda
          </h1>
          <p className="mt-3 text-base text-[#6e6e73]">
            <span className="font-medium text-[#1d1d1f]">
              {tiendaSeleccionada?.nombre ?? "Tienda"}
            </span>
            {tiendaSeleccionada?.ciudad ? (
              <span className="text-[#86868b]">
                {" "}
                · {tiendaSeleccionada.ciudad}
              </span>
            ) : null}
            <span className="text-[#d2d2d7]"> · </span>
            <span>{periodo}</span>
          </p>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-xs font-medium text-[#6e6e73]">
          <CalendarRange
            className="h-3.5 w-3.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {periodo}
        </span>
      </header>

      <section
        aria-label="Filtros del dashboard"
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 sm:flex-1">
          <label
            htmlFor="filtro-tienda"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#86868b]"
          >
            Tienda
          </label>
          <div className="relative">
            <Store
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <select
              id="filtro-tienda"
              className="w-full cursor-pointer appearance-none rounded-2xl border-0 bg-[#f5f5f7] py-3 pl-11 pr-10 text-[15px] text-[#1d1d1f] transition-colors duration-300 hover:bg-[#ececef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
              value={tiendaId}
              onChange={(event) => cambiarTienda(event.target.value)}
            >
              {tiendas.map((tienda) => (
                <option key={tienda.id} value={tienda.id}>
                  {tienda.nombre} — {tienda.ciudad}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="min-w-0 sm:flex-1">
          <label
            htmlFor="filtro-periodo"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#86868b]"
          >
            Periodo
          </label>
          <div className="relative">
            <CalendarRange
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <select
              id="filtro-periodo"
              className="w-full cursor-pointer appearance-none rounded-2xl border-0 bg-[#f5f5f7] py-3 pl-11 pr-10 text-[15px] text-[#1d1d1f] transition-colors duration-300 hover:bg-[#ececef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
              value={periodo}
              onChange={(event) => cambiarPeriodo(event.target.value)}
            >
              {PERIODOS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIntentoDatos((valor) => valor + 1)}
          disabled={cargandoDatos}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-[#0071e3] transition-colors duration-300 hover:bg-[#f5f5f7] hover:text-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${cargandoDatos ? "animate-spin" : ""}`}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Actualizar
        </button>
      </section>

      <div aria-live="polite" aria-busy={cargandoDatos}>
        {cargandoDatos ? (
          <DashboardSkeleton compacto />
        ) : errorDatos ? (
          <EstadoError
            titulo="No pudimos cargar las estadísticas"
            mensaje={errorDatos}
            onReintentar={() => setIntentoDatos((valor) => valor + 1)}
          />
        ) : !datos ||
          (datos.cantidadVentas === 0 && datos.ventaGlobal === 0) ? (
          <EstadoVacio />
        ) : (
          <div className="animate-fade-up space-y-8">
            <section
              aria-label="Indicadores principales"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            >
              {kpis.map((kpi) => (
                <KpiCard key={kpi.titulo} {...kpi} />
              ))}
            </section>

            <ProductosExtremos
              masVendido={datos.productoMasVendido}
              menosVendido={datos.productoMenosVendido}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <section
                aria-labelledby="titulo-grafica-categorias"
                className="rounded-3xl bg-white p-6 ring-1 ring-black/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id="titulo-grafica-categorias"
                      className="text-base font-semibold tracking-tight text-[#1d1d1f]"
                    >
                      Monto de ventas por categoría
                    </h2>
                    <p className="mt-1 text-sm text-[#6e6e73]">
                      Distribución del monto vendido en el periodo.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1 text-[11px] font-medium text-[#6e6e73]">
                    <BarChart3
                      className="h-3.5 w-3.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    MXN
                  </span>
                </div>
                <div className="mt-6">
                  <VentasPorCategoriaChart
                    datos={datos.ventasPorCategoria}
                  />
                </div>
              </section>

              <TablaCategorias
                categorias={datos.ventasPorCategoria}
                total={datos.ventaGlobal}
              />
            </div>
          </div>
        )}
      </div>

      <p className="pt-2 text-center text-xs text-[#86868b]">
        Datos de ejemplo (mock)
      </p>
    </div>
  );
}

export default DashboardClient;
