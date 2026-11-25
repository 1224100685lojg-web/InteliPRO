"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useSession } from "@/lib/session-context";
import type { Rol } from "@/lib/types";

interface RequireAuthProps {
  children: ReactNode;
  /** Roles autorizados. Sin roles, basta con tener sesión iniciada. */
  roles?: Rol[];
}

function SkeletonPantalla() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-56 rounded-full bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded-full bg-slate-200/80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <div key={indice} className="card h-36" />
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando la información…</span>
    </div>
  );
}

function PantallaRedireccion() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4">
      <div className="card flex w-full items-center gap-3 p-6" aria-live="polite">
        <Loader2
          className="h-6 w-6 shrink-0 animate-spin text-brand-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Necesitas iniciar sesión
          </p>
          <p className="text-xs text-slate-500">
            Te estamos llevando al inicio de sesión y te devolveremos aquí.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { usuario, cargando, cerrarSesion } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [cambiando, setCambiando] = useState(false);

  const autorizado = useMemo(() => {
    if (!usuario) return false;
    if (!roles || roles.length === 0) return true;
    return roles.includes(usuario.rol);
  }, [usuario, roles]);

  // Conserva la ruta actual (incluidos parámetros) como destino tras el login.
  useEffect(() => {
    if (cargando || usuario) return;
    if (pathname === "/login") return;
    const busqueda =
      typeof window !== "undefined" ? window.location.search : "";
    const destino = `${pathname}${busqueda}`;
    router.replace(`/login?next=${encodeURIComponent(destino)}`);
  }, [cargando, usuario, pathname, router]);

  async function cambiarCuenta() {
    if (cambiando) return;
    setCambiando(true);
    try {
      await cerrarSesion();
      router.replace("/login");
    } finally {
      setCambiando(false);
    }
  }

  if (cargando) return <SkeletonPantalla />;

  if (!usuario) return <PantallaRedireccion />;

  if (!autorizado) {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Acceso restringido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tu cuenta es{" "}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            {usuario.rol === "gerente" ? "Gerente de tienda" : "Cliente"}
          </span>{" "}
          y no tiene permisos para ver esta sección. Si crees que es un error,
          inicia sesión con una cuenta autorizada.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al catálogo
          </Link>
          <button
            type="button"
            onClick={cambiarCuenta}
            disabled={cambiando}
            className="btn-secondary"
          >
            {cambiando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="h-4 w-4" aria-hidden="true" />
            )}
            {cambiando ? "Cerrando sesión…" : "Cambiar de cuenta"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireAuth;
