"use client";

import { Cpu, CreditCard, Lock } from "lucide-react";
import {
  detectarMarca,
  formatearNumeroTarjeta,
  formatearVencimiento,
  soloDigitos,
  type MarcaTarjeta,
} from "@/lib/validacion-tarjeta";

export interface DatosTarjeta {
  titular: string;
  numero: string;
  vencimiento: string;
  cvv: string;
}

export interface ErroresTarjeta {
  titular?: string;
  numero?: string;
  vencimiento?: string;
  cvv?: string;
}

interface TarjetaFormProps {
  datos: DatosTarjeta;
  errores: ErroresTarjeta;
  deshabilitado?: boolean;
  onCambiar: (campo: keyof DatosTarjeta, valor: string) => void;
  onUsarPrueba?: () => void;
}

const ETIQUETAS_MARCA: Record<MarcaTarjeta, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  otra: "Otra",
};

function claseCampo(error?: string): string {
  const borde = error
    ? "border-[#d70015]/40 focus:border-[#d70015]/60 focus:ring-[#d70015]/10"
    : "border-transparent focus:border-[#0071e3]/40 focus:ring-[#0071e3]/10";

  return `w-full rounded-2xl border bg-[#f5f5f7] px-4 py-3.5 text-[15px] tabular-nums text-[#1d1d1f] placeholder:text-[#86868b] transition-colors duration-300 focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${borde}`;
}

/** Enmascara todo el número salvo los últimos 4 dígitos. */
function enmascararNumero(numero: string): string {
  const digitos = soloDigitos(numero);
  const visibles = digitos.length >= 4 ? digitos.slice(-4) : "";
  return ["••••", "••••", "••••", visibles.padStart(4, "•")].join(" ");
}

export function TarjetaForm({
  datos,
  errores,
  deshabilitado = false,
  onCambiar,
  onUsarPrueba,
}: TarjetaFormProps) {
  const marca = detectarMarca(datos.numero);
  const etiquetaMarca = datos.numero
    ? ETIQUETAS_MARCA[marca]
    : "Marca por detectar";
  const numeroEnmascarado = enmascararNumero(datos.numero);
  const titularVisible = datos.titular.trim() || "Nombre del titular";
  const vencimientoVisible = formatearVencimiento(datos.vencimiento) || "MM/AA";

  return (
    <section aria-labelledby="tarjeta-titulo">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="tarjeta-titulo"
            className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]"
          >
            <CreditCard
              className="h-4 w-4 text-[#6e6e73]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Datos de la tarjeta
          </h2>
          <p className="mt-1.5 text-[13px] text-[#6e6e73]">
            Ingresa los datos para simular el pago de tu compra.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1 text-xs text-[#6e6e73]"
          aria-live="polite"
        >
          <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          {etiquetaMarca}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#1d1d1f] p-6 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]">
          <div
            aria-hidden="true"
            className="flex items-start justify-between"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
              InteliPro
            </span>
            <span className="grid h-7 w-9 place-items-center rounded-[6px] bg-white/10">
              <Cpu className="h-4 w-4 text-white/40" strokeWidth={1.5} />
            </span>
          </div>

          <p
            aria-hidden="true"
            className="mt-8 whitespace-nowrap text-[17px] tracking-[0.12em] text-white/90 tabular-nums"
          >
            {numeroEnmascarado}
          </p>

          <div aria-hidden="true" className="mt-8 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                Titular
              </p>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.08em] text-white/85">
                {titularVisible}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                Vence
              </p>
              <p className="mt-1 text-[11px] tracking-[0.08em] text-white/85 tabular-nums">
                {vencimientoVisible}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="titular" className="label">
                Titular de la tarjeta
              </label>
              <input
                id="titular"
                name="titular"
                type="text"
                autoComplete="cc-name"
                placeholder="Como aparece en la tarjeta"
                maxLength={60}
                value={datos.titular}
                onChange={(evento) => onCambiar("titular", evento.target.value)}
                disabled={deshabilitado}
                aria-invalid={Boolean(errores.titular)}
                aria-describedby={errores.titular ? "titular-error" : "titular-hint"}
                className={claseCampo(errores.titular)}
              />
              {errores.titular ? (
                <p id="titular-error" className="mt-2 text-xs text-[#d70015]">
                  {errores.titular}
                </p>
              ) : (
                <p id="titular-hint" className="mt-2 text-xs text-[#6e6e73]">
                  Nombre completo tal como figura en la tarjeta.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="numero-tarjeta" className="label">
                Número de tarjeta
              </label>
              <div className="relative">
                <CreditCard
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <input
                  id="numero-tarjeta"
                  name="numero-tarjeta"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  maxLength={23}
                  value={formatearNumeroTarjeta(datos.numero)}
                  onChange={(evento) =>
                    onCambiar(
                      "numero",
                      soloDigitos(evento.target.value).slice(0, 19)
                    )
                  }
                  disabled={deshabilitado}
                  aria-invalid={Boolean(errores.numero)}
                  aria-describedby={errores.numero ? "numero-error" : "numero-hint"}
                  className={`${claseCampo(errores.numero)} pl-11`}
                />
              </div>
              {errores.numero ? (
                <p id="numero-error" className="mt-2 text-xs text-[#d70015]">
                  {errores.numero}
                </p>
              ) : (
                <p id="numero-hint" className="mt-2 text-xs text-[#6e6e73]">
                  Tarjeta de prueba: 4242 4242 4242 4242.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="vencimiento" className="label">
                Vencimiento
              </label>
              <input
                id="vencimiento"
                name="vencimiento"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                maxLength={5}
                value={formatearVencimiento(datos.vencimiento)}
                onChange={(evento) =>
                  onCambiar(
                    "vencimiento",
                    soloDigitos(evento.target.value).slice(0, 4)
                  )
                }
                disabled={deshabilitado}
                aria-invalid={Boolean(errores.vencimiento)}
                aria-describedby={
                  errores.vencimiento ? "vencimiento-error" : "vencimiento-hint"
                }
                className={claseCampo(errores.vencimiento)}
              />
              {errores.vencimiento ? (
                <p id="vencimiento-error" className="mt-2 text-xs text-[#d70015]">
                  {errores.vencimiento}
                </p>
              ) : (
                <p id="vencimiento-hint" className="mt-2 text-xs text-[#6e6e73]">
                  Formato MM/AA. Debe ser una fecha futura.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="label">
                CVV
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder={marca === "amex" ? "1234" : "123"}
                  maxLength={4}
                  value={datos.cvv}
                  onChange={(evento) =>
                    onCambiar("cvv", soloDigitos(evento.target.value).slice(0, 4))
                  }
                  disabled={deshabilitado}
                  aria-invalid={Boolean(errores.cvv)}
                  aria-describedby={errores.cvv ? "cvv-error" : "cvv-hint"}
                  className={`${claseCampo(errores.cvv)} pl-11`}
                />
              </div>
              {errores.cvv ? (
                <p id="cvv-error" className="mt-2 text-xs text-[#d70015]">
                  {errores.cvv}
                </p>
              ) : (
                <p id="cvv-hint" className="mt-2 text-xs text-[#6e6e73]">
                  {marca === "amex"
                    ? "4 dígitos al frente de la tarjeta."
                    : "3 dígitos al reverso de la tarjeta."}
                </p>
              )}
            </div>
          </div>

          {onUsarPrueba && (
            <button
              type="button"
              onClick={onUsarPrueba}
              disabled={deshabilitado}
              className="mt-4 rounded-full text-xs font-medium text-[#0071e3] transition-colors duration-300 hover:text-[#0062c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Usar tarjeta de prueba
            </button>
          )}

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#f5f5f7] px-4 py-3.5 text-xs leading-relaxed text-[#6e6e73]">
            <Lock
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6e6e73]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p>
              <span className="font-medium text-[#1d1d1f]">Pago simulado.</span>{" "}
              No se realizan cargos reales y solo se guardan los últimos 4
              dígitos de la tarjeta en el comprobante.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TarjetaForm;
