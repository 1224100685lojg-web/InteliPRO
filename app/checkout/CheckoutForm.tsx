"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Store,
} from "lucide-react";
import {
  checkout,
  getTienda,
  guardarComprobanteLocal,
  mensajeDeError,
} from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { useSession } from "@/lib/session-context";
import { formatMoney } from "@/lib/constants";
import type { CheckoutPayload, Comprobante, Tienda } from "@/lib/types";
import { CarritoResumen } from "@/components/carrito/CarritoResumen";
import {
  TarjetaForm,
  type DatosTarjeta,
  type ErroresTarjeta,
} from "@/components/carrito/TarjetaForm";
import {
  detectarMarca,
  soloDigitos,
  validarCVV,
  validarNumeroTarjeta,
  validarVencimiento,
} from "@/lib/validacion-tarjeta";

const DATOS_INICIALES: DatosTarjeta = {
  titular: "",
  numero: "",
  vencimiento: "",
  cvv: "",
};

const BOTON_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 py-3.5 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-[#0077ed] active:bg-[#0066cc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

function CheckoutEsqueleto() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-28 rounded-full bg-[#e8e8ed]" />
        <div className="h-11 w-64 rounded-2xl bg-[#f5f5f7]" />
        <div className="h-4 w-80 max-w-full rounded-full bg-[#f5f5f7]" />
        <div className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-96 rounded-3xl bg-[#f5f5f7]" />
          <div className="space-y-4">
            <div className="h-28 rounded-3xl bg-[#f5f5f7]" />
            <div className="h-72 rounded-3xl bg-[#f5f5f7]" />
          </div>
        </div>
      </div>
      <span className="sr-only">Preparando el pago…</span>
    </div>
  );
}

function PantallaExito({ comprobante }: { comprobante: Comprobante }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-5 py-16 animate-fade-up">
      <div className="w-full text-center" role="status" aria-live="polite">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#1d1d1f] text-white">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">
          Pago aprobado
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
          Tu compra se registró correctamente. Te llevamos al comprobante…
        </p>

        <div className="mt-8 rounded-2xl bg-[#f5f5f7] px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
            Folio
          </p>
          <p className="mt-1 text-[15px] font-medium tracking-[0.04em] text-[#1d1d1f]">
            {comprobante.folio}
          </p>
          <p className="mt-2 text-sm text-[#6e6e73]">
            Total pagado:{" "}
            <strong className="font-semibold tabular-nums text-[#1d1d1f]">
              {formatMoney(comprobante.total)}
            </strong>
          </p>
        </div>

        <Link
          href={`/comprobante/${encodeURIComponent(comprobante.folio)}`}
          className={`${BOTON_PRIMARIO} mt-6 w-full`}
        >
          Ver comprobante
        </Link>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#6e6e73]">
          <Loader2
            className="h-3.5 w-3.5 animate-spin"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Redirigiendo…
        </p>
      </div>
    </div>
  );
}

function PantallaVariasTiendas({ cantidad }: { cantidad: number }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-5 py-16 text-center animate-fade-in">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
        <AlertTriangle className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-4xl">
        Una venta corresponde a una sola tienda
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
        Tu carrito tiene productos de {cantidad} tiendas distintas. Quita los
        productos de las otras tiendas para poder pagar en una sola venta.
      </p>
      <Link href="/carrito" className={`${BOTON_PRIMARIO} mt-8`}>
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Volver al carrito
      </Link>
    </div>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, impuesto, total, vaciar, listo } = useCart();
  const { usuario } = useSession();

  const [datos, setDatos] = useState<DatosTarjeta>(DATOS_INICIALES);
  const [errores, setErrores] = useState<ErroresTarjeta>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState<Comprobante | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);

  const enviandoRef = useRef(false);
  const completadoRef = useRef(false);
  const titularInicializadoRef = useRef(false);

  const tiendas = useMemo(
    () => Array.from(new Set(items.map((item) => item.producto.tiendaId))),
    [items]
  );
  const variasTiendas = tiendas.length > 1;
  const tiendaId = items[0]?.producto.tiendaId ?? "";

  // Precarga el nombre del titular una sola vez.
  useEffect(() => {
    if (!usuario || titularInicializadoRef.current) return;
    titularInicializadoRef.current = true;
    setDatos((previos) =>
      previos.titular ? previos : { ...previos, titular: usuario.nombre }
    );
  }, [usuario]);

  // Carga el nombre de la tienda de la venta.
  useEffect(() => {
    if (!tiendaId) return;
    let activo = true;

    getTienda(tiendaId)
      .then((resultado) => {
        if (activo) setTienda(resultado);
      })
      .catch(() => {
        if (activo) setTienda(null);
      });

    return () => {
      activo = false;
    };
  }, [tiendaId]);

  // Si el carrito queda vacío, regresa al carrito (salvo tras un pago exitoso).
  useEffect(() => {
    if (!listo || completadoRef.current) return;
    if (items.length === 0) router.replace("/carrito");
  }, [listo, items.length, router]);

  // Después de mostrar el éxito, navega al comprobante.
  useEffect(() => {
    if (!exito) return;
    const temporizador = window.setTimeout(() => {
      router.push(`/comprobante/${encodeURIComponent(exito.folio)}`);
    }, 1100);
    return () => window.clearTimeout(temporizador);
  }, [exito, router]);

  function cambiarCampo(campo: keyof DatosTarjeta, valor: string) {
    setDatos((previos) => ({ ...previos, [campo]: valor }));
    setErrores((previos) =>
      previos[campo] ? { ...previos, [campo]: undefined } : previos
    );
    if (errorGeneral) setErrorGeneral(null);
  }

  function usarTarjetaPrueba() {
    if (procesando || exito) return;
    setDatos({
      titular: datos.titular.trim() || usuario?.nombre || "Cliente InteliPro",
      numero: "4242424242424242",
      vencimiento: "1230",
      cvv: "123",
    });
    setErrores({});
    setErrorGeneral(null);
  }

  function validarFormulario(): ErroresTarjeta {
    const nuevos: ErroresTarjeta = {};
    const titular = datos.titular.trim();

    if (!titular) {
      nuevos.titular = "Ingresa el nombre del titular.";
    } else if (titular.length < 3) {
      nuevos.titular = "El nombre del titular es demasiado corto.";
    }

    const errorNumero = validarNumeroTarjeta(datos.numero);
    if (errorNumero) nuevos.numero = errorNumero;

    const errorVencimiento = validarVencimiento(datos.vencimiento);
    if (errorVencimiento) nuevos.vencimiento = errorVencimiento;

    const errorCvv = validarCVV(datos.cvv, detectarMarca(datos.numero));
    if (errorCvv) nuevos.cvv = errorCvv;

    return nuevos;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviandoRef.current || exito) return;
    setErrorGeneral(null);

    if (!usuario) {
      setErrorGeneral("Tu sesión no está disponible. Inicia sesión de nuevo.");
      return;
    }
    if (items.length === 0) {
      setErrorGeneral("Tu carrito está vacío. Agrega productos antes de pagar.");
      return;
    }
    if (variasTiendas) {
      setErrorGeneral("Una venta corresponde a una sola tienda.");
      return;
    }

    const nuevosErrores = validarFormulario();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    enviandoRef.current = true;
    setProcesando(true);

    try {
      const payload: CheckoutPayload = {
        tiendaId,
        usuarioId: usuario.id,
        items: items.map(({ producto, cantidad }) => ({
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad,
        })),
        pago: {
          titular: datos.titular.trim(),
          ultimos4: soloDigitos(datos.numero).slice(-4),
        },
        subtotal,
        impuesto,
        total,
      };

      const comprobante = await checkout(payload);

      // Respaldo local: permite abrir el comprobante aunque se recargue la app.
      guardarComprobanteLocal(comprobante);

      completadoRef.current = true;
      vaciar();
      setProcesando(false);
      setExito(comprobante);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      enviandoRef.current = false;
      setProcesando(false);
    }
  }

  if (!listo) return <CheckoutEsqueleto />;
  if (!usuario) return null;
  if (exito) return <PantallaExito comprobante={exito} />;
  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md items-center justify-center px-5">
        <div
          className="flex w-full items-center gap-3 rounded-3xl bg-[#f5f5f7] px-5 py-5"
          aria-live="polite"
        >
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin text-[#6e6e73]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-sm text-[#6e6e73]">
            Tu carrito está vacío. Te llevamos al carrito…
          </p>
        </div>
      </div>
    );
  }
  if (variasTiendas) return <PantallaVariasTiendas cantidad={tiendas.length} />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        href="/carrito"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#0071e3] transition-colors duration-300 hover:text-[#0062c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        Volver al carrito
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.02em] text-[#1d1d1f] sm:text-5xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            Revisa tu pedido e ingresa los datos de pago.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1 text-xs text-[#6e6e73]">
          <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          Pago seguro simulado
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-5">
          {errorGeneral && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] px-5 py-4 text-sm"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#d70015]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-medium text-[#1d1d1f]">
                  No se pudo completar el pago
                </p>
                <p className="mt-1 leading-relaxed text-[#6e6e73]">
                  {errorGeneral}
                </p>
                <Link
                  href="/carrito"
                  className="mt-2 inline-flex text-xs font-medium text-[#0071e3] transition-colors duration-300 hover:text-[#0062c4]"
                >
                  Revisar el carrito
                </Link>
              </div>
            </div>
          )}

          <form
            onSubmit={enviar}
            noValidate
            className="rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-8"
          >
            <TarjetaForm
              datos={datos}
              errores={errores}
              deshabilitado={procesando}
              onCambiar={cambiarCampo}
              onUsarPrueba={usarTarjetaPrueba}
            />

            <button
              type="submit"
              className={`${BOTON_PRIMARIO} mt-8 w-full`}
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Procesando pago…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  Pagar {formatMoney(total)}
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#6e6e73]">
              Al confirmar aceptas que este es un pago simulado con fines
              académicos.
            </p>
          </form>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-[#f5f5f7] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#6e6e73]">
              <Store className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Tienda de la venta
            </div>
            {tienda ? (
              <>
                <p className="mt-2 text-[15px] font-medium text-[#1d1d1f]">
                  {tienda.nombre}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#6e6e73]">
                  {tienda.ciudad} · {tienda.direccion}
                </p>
              </>
            ) : (
              <div className="mt-3 space-y-2" aria-hidden="true">
                <div className="h-4 w-32 animate-pulse rounded-full bg-[#e8e8ed]" />
                <div className="h-3 w-44 animate-pulse rounded-full bg-[#e8e8ed]" />
              </div>
            )}
          </div>

          <CarritoResumen titulo="Resumen del pedido" mostrarItems />
        </aside>
      </div>
    </div>
  );
}

export default CheckoutForm;
