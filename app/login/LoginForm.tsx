"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { mensajeDeError } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import type { Rol } from "@/lib/types";

interface ErroresCampo {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Solo acepta rutas internas para evitar redirecciones abiertas. */
function destinoSeguro(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  if (next.includes("\\")) return null;
  if (next === "/login" || next.startsWith("/login?") || next.startsWith("/login/")) {
    return null;
  }
  return next;
}

function inicioPorRol(rol: Rol): string {
  return rol === "gerente" ? "/dashboard" : "/";
}

/** Respeta las restricciones de rol conocidas por la interfaz. */
function destinoPermitido(destino: string, rol: Rol): string {
  if (destino.startsWith("/dashboard") && rol !== "gerente") {
    return inicioPorRol(rol);
  }
  return destino;
}

function PantallaSesion({ iniciada }: { iniciada: boolean }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4">
      <div className="card flex w-full items-center gap-3 p-6" aria-live="polite">
        <Loader2
          className="h-6 w-6 shrink-0 animate-spin text-brand-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {iniciada ? "Sesión iniciada" : "Comprobando tu sesión…"}
          </p>
          <p className="text-xs text-slate-500">
            {iniciada
              ? "Te estamos redirigiendo a tu panel."
              : "Un momento, por favor."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { sesion, cargando, iniciarSesion } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<ErroresCampo>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const yaRedirigido = useRef(false);

  // Si ya existe una sesión, evita mostrar el formulario de nuevo.
  useEffect(() => {
    if (cargando || !sesion || yaRedirigido.current) return;
    yaRedirigido.current = true;
    const destino = destinoSeguro(next);
    const objetivo = destino
      ? destinoPermitido(destino, sesion.usuario.rol)
      : inicioPorRol(sesion.usuario.rol);
    router.replace(objetivo);
  }, [cargando, sesion, next, router]);

  function limpiarError(campo: keyof ErroresCampo) {
    setErrores((previos) =>
      previos[campo] ? { ...previos, [campo]: undefined } : previos
    );
    if (errorGeneral) setErrorGeneral(null);
  }

  function validar(): boolean {
    const nuevos: ErroresCampo = {};

    if (!email.trim()) {
      nuevos.email = "Ingresa tu correo electrónico.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nuevos.email =
        "Escribe un correo válido, por ejemplo nombre@dominio.com.";
    }

    if (!password) {
      nuevos.password = "Ingresa tu contraseña.";
    } else if (password.length < 6) {
      nuevos.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);

    if (!validar()) return;

    setEnviando(true);
    try {
      await iniciarSesion({ email: email.trim(), password });
      // La redirección la resuelve el efecto al detectar la nueva sesión.
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  }

  function usarDemo(rol: "cliente" | "gerente") {
    if (enviando) return;
    const credenciales =
      rol === "cliente"
        ? { email: "cliente@intelipro.com", password: "cliente123" }
        : { email: "gerente@intelipro.com", password: "gerente123" };

    setEmail(credenciales.email);
    setPassword(credenciales.password);
    setMostrarPassword(false);
    setErrores({});
    setErrorGeneral(null);
  }

  if (cargando || sesion) {
    return <PantallaSesion iniciada={Boolean(sesion)} />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10 sm:py-16">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50 via-white to-white px-6 py-8 text-center sm:px-8">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Inicia sesión en InteliPro
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Accede para comprar o consultar las estadísticas de tu tienda.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {errorGeneral && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{errorGeneral}</span>
            </div>
          )}

          <form onSubmit={enviar} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(evento) => {
                    setEmail(evento.target.value);
                    limpiarError("email");
                  }}
                  disabled={enviando}
                  aria-invalid={Boolean(errores.email)}
                  aria-describedby={errores.email ? "email-error" : undefined}
                  className={`input pl-10 ${
                    errores.email
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : ""
                  }`}
                />
              </div>
              {errores.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-xs font-medium text-rose-600"
                >
                  {errores.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(evento) => {
                    setPassword(evento.target.value);
                    limpiarError("password");
                  }}
                  disabled={enviando}
                  aria-invalid={Boolean(errores.password)}
                  aria-describedby={
                    errores.password ? "password-error" : "password-hint"
                  }
                  className={`input pl-10 pr-11 ${
                    errores.password
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((valor) => !valor)}
                  aria-label={
                    mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errores.password ? (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs font-medium text-rose-600"
                >
                  {errores.password}
                </p>
              ) : (
                <p id="password-hint" className="mt-1.5 text-xs text-slate-500">
                  Mínimo 6 caracteres.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Verificando…
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Cuentas demo
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => usarDemo("cliente")}
              disabled={enviando}
              className="btn-secondary justify-start text-left"
            >
              <UserRound
                className="h-4 w-4 shrink-0 text-brand-600"
                aria-hidden="true"
              />
              <span className="leading-tight">
                <span className="block text-xs font-semibold text-slate-800">
                  Usar demo cliente
                </span>
                <span className="block truncate text-[11px] font-normal text-slate-500">
                  cliente@intelipro.com
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => usarDemo("gerente")}
              disabled={enviando}
              className="btn-secondary justify-start text-left"
            >
              <Store
                className="h-4 w-4 shrink-0 text-brand-600"
                aria-hidden="true"
              />
              <span className="leading-tight">
                <span className="block text-xs font-semibold text-slate-800">
                  Usar demo gerente
                </span>
                <span className="block truncate text-[11px] font-normal text-slate-500">
                  gerente@intelipro.com
                </span>
              </span>
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Contraseñas demo: cliente123 · gerente123
          </p>

          <p className="mt-6 text-center text-xs text-slate-500">
            ¿Solo quieres explorar?{" "}
            <Link
              href="/"
              className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Volver al catálogo
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;
