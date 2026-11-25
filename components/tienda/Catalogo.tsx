"use client";
 
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Gamepad2,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Store,
  Watch,
} from "lucide-react";
import { getCategorias, getProductos, getTiendas, mensajeDeError } from "@/lib/api";
import type { Categoria, Producto, Tienda } from "@/lib/types";
import { Buscador } from "./Buscador";
import { EstadoVacio } from "./EstadoVacio";
import { FiltrosCategorias } from "./FiltrosCategorias";
import { ProductoCard } from "./ProductoCard";
import { FiltrosSkeleton, GridSkeleton } from "./Skeletons";
import { TiendaSelector } from "./TiendaSelector";
 
const TIENDA_POR_DEFECTO = "t-01";
 
// Edita estos textos según lo que realmente ofrezca la tienda.
const GARANTIAS = [
  { icono: Store, titulo: "Recoge en sucursal", texto: "Elige tu tienda y pasa por tu pedido." },
  { icono: ShieldCheck, titulo: "Garantía incluida", texto: "Todos los productos cuentan con garantía." },
  { icono: CreditCard, titulo: "Pago seguro", texto: "Tus datos siempre protegidos." },
  { icono: MessageCircle, titulo: "Te ayudamos", texto: "Atención directa por WhatsApp." },
];
 
// Términos de búsqueda que lanzan los mosaicos y las marcas. Ajústalos a tu inventario.
const BUSQUEDAS = {
  audio: "Audífonos",
  juegos: "Consola",
  accesorios: "Cargador",
};
 
const MARCAS = ["Apple", "Samsung", "Xiaomi", "Sony", "Nintendo", "Xbox", "JBL", "Motorola"];
 
const BARRAS_EQ = [38, 62, 46, 84, 56, 96, 70, 48, 88, 60, 42, 74];
 
function contarProductos(total: number): string {
  return `${total} ${total === 1 ? "producto" : "productos"}`;
}
 
export function Catalogo() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
 
  const tiendaParam = searchParams.get("tienda") ?? "";
  const categoriaParam = searchParams.get("categoria") ?? "";
  const q = searchParams.get("q") ?? "";
 
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [metaCargando, setMetaCargando] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaRecarga, setMetaRecarga] = useState(0);
 
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  const solicitudRef = useRef(0);
 
  const [texto, setTexto] = useState(q);
  const qPrevio = useRef(q);
 
  const actualizarParametros = useCallback(
    (cambios: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
 
      for (const [clave, valor] of Object.entries(cambios)) {
        if (!valor) params.delete(clave);
        else params.set(clave, valor);
      }
 
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );
 
  const tiendaId = useMemo(() => {
    if (!tiendaParam) return TIENDA_POR_DEFECTO;
    if (tiendas.length > 0 && !tiendas.some((tienda) => tienda.id === tiendaParam)) {
      return TIENDA_POR_DEFECTO;
    }
    return tiendaParam;
  }, [tiendaParam, tiendas]);
 
  const categoriaId = useMemo(() => {
    if (!categoriaParam) return "";
    if (
      categorias.length > 0 &&
      !categorias.some((categoria) => categoria.id === categoriaParam)
    ) {
      return "";
    }
    return categoriaParam;
  }, [categoriaParam, categorias]);
 
  const tiendaActual = tiendas.find((tienda) => tienda.id === tiendaId) ?? null;
 
  // Tiendas y categorías: una sola carga, con reintento independiente.
  useEffect(() => {
    let activo = true;
 
    setMetaCargando(true);
    setMetaError(null);
 
    Promise.all([getTiendas(), getCategorias()])
      .then(([listaTiendas, listaCategorias]) => {
        if (!activo) return;
        setTiendas(listaTiendas);
        setCategorias(listaCategorias);
      })
      .catch((err) => {
        if (!activo) return;
        setMetaError(mensajeDeError(err));
      })
      .finally(() => {
        if (activo) setMetaCargando(false);
      });
 
    return () => {
      activo = false;
    };
  }, [metaRecarga]);
 
  // Productos: cada cambio de filtros invalida las respuestas anteriores.
  useEffect(() => {
    let activo = true;
    const solicitud = solicitudRef.current + 1;
    solicitudRef.current = solicitud;
 
    setCargando(true);
    setError(null);
 
    getProductos({
      tiendaId,
      categoriaId: categoriaId || undefined,
      q: q.trim() || undefined,
    })
      .then((datos) => {
        if (!activo || solicitud !== solicitudRef.current) return;
        setProductos(datos);
      })
      .catch((err) => {
        if (!activo || solicitud !== solicitudRef.current) return;
        setError(mensajeDeError(err));
        setProductos([]);
      })
      .finally(() => {
        if (!activo || solicitud !== solicitudRef.current) return;
        setCargando(false);
      });
 
    return () => {
      activo = false;
    };
  }, [tiendaId, categoriaId, q, recarga]);
 
  // Limpia parámetros inválidos una vez que ya conocemos tiendas y categorías.
  useEffect(() => {
    if (metaCargando || metaError) return;
 
    const cambios: Record<string, string | null> = {};
    if (tiendaParam && !tiendas.some((tienda) => tienda.id === tiendaParam)) {
      cambios.tienda = null;
    }
    if (
      categoriaParam &&
      !categorias.some((categoria) => categoria.id === categoriaParam)
    ) {
      cambios.categoria = null;
    }
 
    if (Object.keys(cambios).length > 0) actualizarParametros(cambios);
  }, [
    metaCargando,
    metaError,
    tiendaParam,
    categoriaParam,
    tiendas,
    categorias,
    actualizarParametros,
  ]);
 
  // Sincroniza el campo de búsqueda cuando la URL cambia por otra vía.
  useEffect(() => {
    if (q !== qPrevio.current) {
      qPrevio.current = q;
      setTexto(q);
    }
  }, [q]);
 
  // Debounce de la búsqueda antes de escribir en la URL.
  useEffect(() => {
    const actual = texto.trim();
    if (actual === q) return;
 
    const temporizador = setTimeout(() => {
      actualizarParametros({ q: actual || null });
    }, 300);
 
    return () => clearTimeout(temporizador);
  }, [texto, q, actualizarParametros]);
 
  const cambiarTienda = useCallback(
    (id: string) => {
      actualizarParametros({ tienda: id || null });
    },
    [actualizarParametros]
  );
 
  const cambiarCategoria = useCallback(
    (id: string) => {
      actualizarParametros({ categoria: id || null });
    },
    [actualizarParametros]
  );
 
  const limpiarBusqueda = useCallback(() => {
    setTexto("");
    actualizarParametros({ q: null });
  }, [actualizarParametros]);
 
  const limpiarFiltros = useCallback(() => {
    setTexto("");
    actualizarParametros({ tienda: null, categoria: null, q: null });
  }, [actualizarParametros]);
 
  const buscarYVer = useCallback(
    (termino: string) => {
      setTexto(termino);
      actualizarParametros({ q: termino, categoria: null });
      document
        .getElementById("productos")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [actualizarParametros]
  );
 
  const hayFiltros = Boolean(q || texto || categoriaParam || tiendaParam);
 
  const textoConteo = error
    ? "Sin resultados"
    : cargando
      ? "Buscando…"
      : contarProductos(productos.length);
 
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      {/* Encabezado compacto */}
      <header className="animate-fade-in flex flex-col gap-3 pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pb-8 sm:pt-12">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] sm:text-5xl">
          Catálogo InteliPro
        </h1>
        <p className="inline-flex items-center gap-1.5 text-[15px] text-[#6e6e73]">
          <MapPin className="h-4 w-4 text-[#86868b]" strokeWidth={1.5} aria-hidden="true" />
          {tiendaActual
            ? `${tiendaActual.nombre}, ${tiendaActual.ciudad}`
            : metaCargando
              ? "Cargando sucursal…"
              : "InteliPro"}
        </p>
      </header>
 
      {/* Mosaico bento: una pieza grande y cuatro de apoyo */}
      <section
        aria-label="Destacados"
        className="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-template-rows:repeat(2,minmax(15rem,1fr))]"
      >
        {/* 1. Principal: celulares */}
        <div className="relative isolate flex min-h-[34rem] flex-col items-center overflow-hidden rounded-[2rem] bg-black px-6 pt-12 text-center text-white sm:col-span-2 lg:row-span-2">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(65%_45%_at_50%_100%,rgba(41,151,255,0.6),transparent_70%),radial-gradient(40%_30%_at_85%_10%,rgba(191,90,242,0.25),transparent_70%)]"
          />
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Tu próximo upgrade
          </h2>
          <p className="mt-3 max-w-sm text-lg text-white/75 sm:text-xl">
            Celulares de última generación, listos en tu sucursal.
          </p>
          <div className="mt-5 flex items-center gap-6 text-[17px]">
            <a
              href="#productos"
              className="inline-flex items-center text-[#2997ff] hover:underline focus:outline-none focus-visible:underline"
            >
              Ver catálogo
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="#filtros"
              className="inline-flex items-center text-[#2997ff] hover:underline focus:outline-none focus-visible:underline"
            >
              Elegir sucursal
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
 
          {/* Dos teléfonos dibujados con CSS */}
          <div
            aria-hidden="true"
            className="relative mt-auto h-72 w-full max-w-md translate-y-10"
          >
            <div className="absolute bottom-0 left-1/2 z-0 ml-2 h-72 w-36 rotate-[8deg] rounded-[2.2rem] bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 p-1 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/30">
              <div className="absolute left-3 top-3 grid h-16 w-16 grid-cols-2 place-items-center gap-0.5 rounded-2xl bg-zinc-900/85 p-1.5 ring-1 ring-white/10">
                <span className="h-5 w-5 rounded-full bg-zinc-950 ring-2 ring-zinc-600" />
                <span className="h-5 w-5 rounded-full bg-zinc-950 ring-2 ring-zinc-600" />
                <span className="h-5 w-5 rounded-full bg-zinc-950 ring-2 ring-zinc-600" />
              </div>
            </div>
 
            <div className="absolute bottom-0 left-1/2 z-10 -ml-28 h-72 w-36 -rotate-[6deg] rounded-[2.2rem] bg-zinc-800 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/20">
              <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500">
                <span className="absolute left-1/2 top-2 h-3 w-12 -translate-x-1/2 rounded-full bg-black" />
                <span className="absolute inset-x-0 top-12 text-center text-4xl font-light tracking-tight text-white/90">
                  9:41
                </span>
                <span className="absolute inset-x-6 bottom-5 h-1 rounded-full bg-white/60" />
              </div>
            </div>
 
            <span className="absolute left-2 top-10 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur">
              5G
            </span>
            <span className="absolute right-2 top-24 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur">
              256 GB
            </span>
          </div>
        </div>
 
        {/* 2. Audio */}
        <a
          href="#productos"
          onClick={(e) => {
            e.preventDefault();
            buscarYVer(BUSQUEDAS.audio);
          }}
          className="group relative isolate flex min-h-[15rem] items-center justify-between gap-4 overflow-hidden rounded-[2rem] bg-[#f5f5f7] p-8 sm:col-span-2 lg:col-span-2"
        >
          <style>{`
            @keyframes catalogo-eq { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
            .catalogo-eq { transform-origin: bottom; animation: catalogo-eq 1.4s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) { .catalogo-eq { animation: none; } }
          `}</style>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_100%_100%,rgba(0,113,227,0.14),transparent_70%)]"
          />
          <div className="min-w-0">
            <h3 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl">
              Sonido sin límites
            </h3>
            <p className="mt-2 max-w-[16rem] text-[17px] leading-snug text-[#6e6e73]">
              Audífonos y bocinas para cada momento.
            </p>
            <span className="mt-4 inline-flex items-center text-[17px] text-[#0066cc] group-hover:underline">
              Ver audio
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
          <div aria-hidden="true" className="flex h-32 shrink-0 items-end gap-1.5">
            {BARRAS_EQ.map((alto, i) => (
              <span
                key={i}
                className="catalogo-eq w-1.5 rounded-full bg-gradient-to-t from-[#0071e3] to-[#bf5af2] sm:w-2"
                style={{ height: `${alto}%`, animationDelay: `${i * 0.11}s` }}
              />
            ))}
          </div>
        </a>
 
        {/* 3. Videojuegos */}
        <a
          href="#productos"
          onClick={(e) => {
            e.preventDefault();
            buscarYVer(BUSQUEDAS.juegos);
          }}
          className="group relative isolate flex min-h-[15rem] flex-col overflow-hidden rounded-[2rem] bg-[#120d2b] p-7 text-white"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_80%_90%,rgba(217,70,239,0.5),transparent_70%),radial-gradient(50%_50%_at_10%_0%,rgba(59,130,246,0.35),transparent_70%)]"
          />
          <h3 className="text-2xl font-semibold tracking-tight">Sube de nivel</h3>
          <p className="mt-1 max-w-[10rem] text-[15px] leading-snug text-white/70">
            Consolas y accesorios gamer.
          </p>
          <span className="mt-3 inline-flex items-center text-[15px] text-[#c4a1ff] group-hover:underline">
            Jugar
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <Gamepad2
            aria-hidden="true"
            className="absolute -bottom-5 -right-4 h-36 w-36 -rotate-12 text-white/90 drop-shadow-[0_10px_30px_rgba(217,70,239,0.7)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
            strokeWidth={0.8}
          />
        </a>
 
        {/* 4. Accesorios */}
        <a
          href="#productos"
          onClick={(e) => {
            e.preventDefault();
            buscarYVer(BUSQUEDAS.accesorios);
          }}
          className="group relative isolate flex min-h-[15rem] flex-col overflow-hidden rounded-[2rem] bg-[#fbf1e6] p-7 text-[#1d1d1f]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_95%,rgba(251,146,60,0.35),transparent_70%)]"
          />
          <h3 className="text-2xl font-semibold tracking-tight">El detalle perfecto</h3>
          <p className="mt-1 max-w-[10rem] text-[15px] leading-snug text-[#6e6e73]">
            Cargadores, fundas y wearables.
          </p>
          <span className="mt-3 inline-flex items-center text-[15px] text-[#0066cc] group-hover:underline">
            Ver accesorios
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <Watch
            aria-hidden="true"
            className="absolute -bottom-5 -right-3 h-36 w-36 rotate-12 text-[#1d1d1f]/85 drop-shadow-[0_10px_30px_rgba(234,88,12,0.35)] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
            strokeWidth={0.8}
          />
        </a>
 
        {/* 5. Sucursal actual */}
        <div className="flex flex-col items-start justify-between gap-2 rounded-[2rem] bg-[#f5f5f7] px-7 py-5 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-4">
          <p className="inline-flex items-center gap-2 text-[17px] text-[#1d1d1f]">
            <MapPin className="h-5 w-5 text-[#0071e3]" strokeWidth={1.5} aria-hidden="true" />
            {tiendaActual
              ? `Inventario de ${tiendaActual.nombre}, ${tiendaActual.ciudad}`
              : metaCargando
                ? "Cargando sucursal…"
                : "Inventario de tu sucursal"}
          </p>
          <a
            href="#filtros"
            className="inline-flex items-center text-[17px] text-[#0066cc] hover:underline focus:outline-none focus-visible:underline"
          >
            Cambiar sucursal
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>
 
      {/* Compra por marca, como la tira de marcas de doto */}
      <section aria-label="Marcas" className="mt-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          Compra por marca
        </h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {MARCAS.map((marca) => {
            const activa = q.trim().toLowerCase() === marca.toLowerCase();
            return (
              <button
                key={marca}
                type="button"
                aria-pressed={activa}
                onClick={() => (activa ? limpiarBusqueda() : buscarYVer(marca))}
                className={`shrink-0 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                  activa
                    ? "bg-[#1d1d1f] text-white"
                    : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                }`}
              >
                {marca}
              </button>
            );
          })}
        </div>
      </section>
 
      {metaError && (
        <div
          role="alert"
          className="mx-auto mt-6 flex max-w-3xl flex-col gap-2 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm text-[#6e6e73] sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#86868b]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>No pudimos cargar tiendas y categorías. {metaError}</span>
          </span>
          <button
            type="button"
            onClick={() => setMetaRecarga((valor) => valor + 1)}
            className="shrink-0 self-start text-[13px] font-medium text-[#0071e3] transition-colors hover:underline focus:outline-none focus-visible:underline sm:self-auto"
          >
            Reintentar
          </button>
        </div>
      )}
 
      {/* Barra de filtros estilo subnav de Apple: se fija al hacer scroll */}
      <div
        id="filtros"
        className="-mx-4 mt-10 scroll-mt-4 border-y border-black/5 bg-white/80 px-4 py-3 backdrop-blur-xl sm:sticky sm:top-0 sm:z-30 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {metaCargando && tiendas.length === 0 && categorias.length === 0 ? (
          <FiltrosSkeleton />
        ) : (
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <TiendaSelector
                tiendas={tiendas}
                seleccionada={tiendaId}
                onSeleccionar={cambiarTienda}
                cargando={metaCargando}
              />
 
              <div className="min-w-0 flex-1">
                <Buscador
                  valor={texto}
                  onCambiar={setTexto}
                  onLimpiar={limpiarBusqueda}
                />
              </div>
 
              <button
                type="button"
                onClick={limpiarFiltros}
                disabled={!hayFiltros}
                className="shrink-0 self-start px-2 py-2 text-[14px] text-[#0066cc] transition-opacity hover:underline focus:outline-none focus-visible:underline disabled:pointer-events-none disabled:opacity-40 sm:self-end"
              >
                Limpiar
              </button>
            </div>
 
            <div className="mt-3">
              <FiltrosCategorias
                categorias={categorias}
                seleccionada={categoriaId}
                onSeleccionar={cambiarCategoria}
                cargando={metaCargando}
              />
            </div>
          </div>
        )}
      </div>
 
      <p className="sr-only" role="status" aria-live="polite">
        {error
          ? "Ocurrió un error al cargar los productos."
          : cargando
            ? "Cargando productos…"
            : `${contarProductos(productos.length)} ${
                productos.length === 1 ? "encontrado" : "encontrados"
              }.`}
      </p>
 
      {/* Resultados */}
      <section id="productos" className="mt-10 scroll-mt-40 sm:mt-14" aria-busy={cargando}>
        {!error && (
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl">
              {q ? `Resultados para “${q}”` : "Los más buscados"}
            </h2>
            <span className="shrink-0 pb-1 text-[15px] tabular-nums text-[#6e6e73]">
              {textoConteo}
            </span>
          </div>
        )}
 
        <div className="rounded-[2rem] bg-[#f5f5f7] p-3 sm:p-6 lg:p-8">
          {error ? (
            <div
              role="alert"
              className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center sm:py-20"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                <AlertTriangle className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-xl font-semibold tracking-tight text-[#1d1d1f]">
                No pudimos cargar el catálogo
              </h2>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#6e6e73]">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRecarga((valor) => valor + 1)}
                className="btn-primary mt-6"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : cargando ? (
            <GridSkeleton cantidad={8} />
          ) : productos.length === 0 ? (
            <EstadoVacio
              titulo="No encontramos productos"
              descripcion="No hay productos que coincidan con tu búsqueda y filtros. Prueba con otra categoría, cambia de tienda o limpia los filtros."
              etiquetaAccion="Limpiar filtros"
              onAccion={limpiarFiltros}
            />
          ) : (
            <div className="animate-fade-in grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </section>
 
      {/* Franja de confianza, como la de doto */}
      <section aria-label="Beneficios" className="mt-16 sm:mt-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl">
          Comprar con nosotros es seguro
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {GARANTIAS.map(({ icono: Icono, titulo, texto: descripcion }) => (
            <li key={titulo} className="flex flex-col items-center text-center">
              <Icono className="h-9 w-9 text-[#1d1d1f]" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
                {titulo}
              </h3>
              <p className="mt-1 max-w-[16rem] text-[15px] leading-snug text-[#6e6e73]">
                {descripcion}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
 
export default Catalogo;
 