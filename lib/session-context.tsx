"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Credenciales, Sesion, Usuario } from "./types";
import { login as apiLogin, logout as apiLogout } from "./api";
import { STORAGE_KEYS } from "./constants";

export interface SessionContextValue {
  usuario: Usuario | null;
  sesion: Sesion | null;
  cargando: boolean;
  iniciarSesion: (credenciales: Credenciales) => Promise<Sesion>;
  cerrarSesion: () => Promise<void>;
  esCliente: boolean;
  esGerente: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function leerSesionGuardada(): Sesion | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEYS.sesion);
    if (!crudo) return null;
    const datos = JSON.parse(crudo) as Partial<Sesion> | null;
    if (datos?.usuario?.id && datos?.usuario?.rol && datos?.token) {
      return datos as Sesion;
    }
    return null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // Hidratación segura: localStorage solo se lee al montar en el cliente.
  useEffect(() => {
    setSesion(leerSesionGuardada());
    setCargando(false);
  }, []);

  const iniciarSesion = useCallback(async (credenciales: Credenciales): Promise<Sesion> => {
    const nuevaSesion = await apiLogin(credenciales);
    setSesion(nuevaSesion);
    try {
      window.localStorage.setItem(STORAGE_KEYS.sesion, JSON.stringify(nuevaSesion));
    } catch {
      // Sin almacenamiento: la sesión permanece en memoria.
    }
    return nuevaSesion;
  }, []);

  const cerrarSesion = useCallback(async (): Promise<void> => {
    try {
      await apiLogout();
    } finally {
      setSesion(null);
      try {
        window.localStorage.removeItem(STORAGE_KEYS.sesion);
      } catch {
        // Sin almacenamiento: nada que limpiar.
      }
    }
  }, []);

  const usuario = sesion?.usuario ?? null;

  const valor = useMemo<SessionContextValue>(
    () => ({
      usuario,
      sesion,
      cargando,
      iniciarSesion,
      cerrarSesion,
      esCliente: usuario?.rol === "cliente",
      esGerente: usuario?.rol === "gerente",
    }),
    [usuario, sesion, cargando, iniciarSesion, cerrarSesion]
  );

  return <SessionContext.Provider value={valor}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const contexto = useContext(SessionContext);
  if (!contexto) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return contexto;
}
