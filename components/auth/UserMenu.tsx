"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Store,
  UserRound,
} from "lucide-react";
import { useSession } from "@/lib/session-context";
import { getTienda } from "@/lib/api";

type Variante = "dropdown" | "inline";

function etiquetaRol(rol: "cliente" | "gerente"): string {
  return rol === "gerente" ? "Gerente de tienda" : "Cliente";
}

function Avatar({ iniciales }: { iniciales: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
    >
      {iniciales || "IP"}
    </span>
  );
}

export function UserMenu({ variant = "dropdown" }: { variant?: Variante }) {
  const { usuario, cerrarSesion, esGerente } = useSession();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [tiendaNombre, setTiendaNombre] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  const tiendaId = usuario?.tiendaId;

  // Resuelve el nombre de la tienda del gerente sin bloquear el render.
  useEffect(() => {
    if (!tiendaId) {
      setTiendaNombre(null);
      return;
    }
    let activo = true;
    getTienda(tiendaId)
      .then((tienda) => {
        if (activo) setTiendaNombre(tienda?.nombre ?? null);
      })
      .catch(() => {
        if (activo) setTiendaNombre(null);
      });
    return () => {
      activo = false;
    };
  }, [tiendaId]);

  // Cierra el menú al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!abierto || variant !== "dropdown") return;

    function alPresionarFuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.removeEventListener("mousedown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [abierto, variant]);

  if (!usuario) return null;

  const rol = etiquetaRol(usuario.rol);
  const tiendaEtiqueta = usuario.tiendaId
    ? tiendaNombre ?? `Tienda ${usuario.tiendaId}`
    : null;

  async function manejarSalir() {
    if (saliendo) return;
    setSaliendo(true);
    try {
      await cerrarSesion();
      setAbierto(false);
      router.push("/");
      router.refresh();
    } finally {
      setSaliendo(false);
    }
  }

  if (variant === "inline") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
        <div className="flex items-center gap-3">
          <Avatar iniciales={usuario.avatarIniciales} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {usuario.nombre}
            </p>
            <p className="truncate text-xs text-slate-500">{usuario.email}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="badge bg-brand-50 text-brand-700">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            {rol}
          </span>
          {tiendaEtiqueta && (
            <span className="badge bg-white text-slate-600 ring-1 ring-slate-200">
              <Store className="h-3 w-3" aria-hidden="true" />
              {tiendaEtiqueta}
            </span>
          )}
        </div>

        <div className="mt-3 grid gap-2">
          {esGerente && (
            <Link
              href="/dashboard"
              className="btn-secondary w-full justify-start"
              onClick={() => setAbierto(false)}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Ir al dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={manejarSalir}
            disabled={saliendo}
            className="btn-secondary w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            {saliendo ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Menú de ${usuario.nombre}`}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <Avatar iniciales={usuario.avatarIniciales} />
        <span className="hidden leading-tight lg:block">
          <span className="block max-w-[10rem] truncate text-xs font-semibold text-slate-900">
            {usuario.nombre}
          </span>
          <span className="block text-[11px] text-slate-500">{rol}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div
          role="menu"
          aria-label="Opciones de cuenta"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
        >
          <div className="border-b border-slate-100 px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-slate-900">
              {usuario.nombre}
            </p>
            <p className="truncate text-xs text-slate-500">{usuario.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="badge bg-brand-50 text-brand-700">
                <UserRound className="h-3 w-3" aria-hidden="true" />
                {rol}
              </span>
              {tiendaEtiqueta && (
                <span className="badge bg-slate-100 text-slate-600">
                  <Store className="h-3 w-3" aria-hidden="true" />
                  {tiendaEtiqueta}
                </span>
              )}
            </div>
          </div>

          <div className="p-1.5">
            {esGerente && (
              <Link
                href="/dashboard"
                role="menuitem"
                onClick={() => setAbierto(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={manejarSalir}
              disabled={saliendo}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
            >
              {saliendo ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="h-4 w-4" aria-hidden="true" />
              )}
              {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
