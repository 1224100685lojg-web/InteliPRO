"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogIn,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { UserMenu } from "@/components/auth/UserMenu";

interface Enlace {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
}

function formatearCantidad(cantidad: number): string {
  return cantidad > 99 ? "99+" : String(cantidad);
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const { usuario, esGerente, cargando } = useSession();
  const { cantidadTotal } = useCart();
  const [montado, setMontado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Evita diferencias de hidratación: sesión y carrito se leen del cliente.
  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  function estaActivo(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sesionLista = montado && !cargando;

  const enlaces: Enlace[] = [
    { href: "/", etiqueta: "Catálogo", icono: Store },
    { href: "/carrito", etiqueta: "Carrito", icono: ShoppingCart },
    ...(sesionLista && esGerente
      ? [{ href: "/dashboard", etiqueta: "Dashboard", icono: LayoutDashboard }]
      : []),
  ];

  const hrefLogin =
    pathname && pathname !== "/login"
      ? `/login?next=${encodeURIComponent(pathname)}`
      : "/login";

  const mostrarBadge = montado && cantidadTotal > 0;

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="InteliPro, ir al catálogo"
          className="flex shrink-0 items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2"
        >
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#1d1d1f] text-white">
            <ShoppingBag
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          <span className="text-[13px] font-semibold tracking-tight text-[#1d1d1f]">
            InteliPro
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-7 md:flex"
        >
          {enlaces.map(({ href, etiqueta }) => {
            const activo = estaActivo(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`group relative inline-flex items-center gap-1.5 py-1 text-[12px] transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2 ${
                  activo
                    ? "text-[#1d1d1f]"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {etiqueta}
                {href === "/carrito" && mostrarBadge && (
                  <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#f5f5f7] px-1 text-[10px] font-medium leading-none tabular-nums text-[#1d1d1f]">
                    {formatearCantidad(cantidadTotal)}
                    <span className="sr-only"> productos en el carrito</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/carrito"
            aria-label={
              mostrarBadge
                ? `Carrito, ${cantidadTotal} productos`
                : "Carrito de compras"
            }
            className="relative rounded-full p-2 text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 md:hidden"
          >
            <ShoppingCart
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {mostrarBadge && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#1d1d1f] px-1 text-[9px] font-semibold leading-none text-white">
                {formatearCantidad(cantidadTotal)}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {!sesionLista ? (
              <span
                aria-hidden="true"
                className="block h-6 w-24 animate-pulse rounded-full bg-[#f5f5f7]"
              />
            ) : usuario ? (
              <UserMenu />
            ) : (
              <Link
                href={hrefLogin}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] text-[#0071e3] transition-colors hover:text-[#0077ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2"
              >
                <LogIn
                  className="h-3.5 w-3.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Iniciar sesión
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="rounded-full p-2 text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 md:hidden"
          >
            {menuAbierto ? (
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div
          id="menu-movil"
          className="animate-fade-in border-t border-black/[0.06] bg-white/95 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto max-w-6xl px-6 py-5">
            <nav aria-label="Navegación móvil" className="grid gap-1">
              {enlaces.map(({ href, etiqueta }) => {
                const activo = estaActivo(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-2 py-3 text-[17px] font-medium tracking-tight transition-colors ${
                      activo ? "text-[#1d1d1f]" : "text-[#6e6e73]"
                    }`}
                  >
                    <span>{etiqueta}</span>
                    {href === "/carrito" && mostrarBadge && (
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#f5f5f7] px-1.5 text-[11px] font-semibold text-[#1d1d1f]">
                        {formatearCantidad(cantidadTotal)}
                        <span className="sr-only"> productos en el carrito</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-black/[0.06] pt-4">
              {!sesionLista ? (
                <div
                  aria-hidden="true"
                  className="h-14 animate-pulse rounded-2xl bg-[#f5f5f7]"
                />
              ) : usuario ? (
                <UserMenu variant="inline" />
              ) : (
                <Link
                  href={hrefLogin}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed]"
                  onClick={() => setMenuAbierto(false)}
                >
                  <LogIn
                    className="h-4 w-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
