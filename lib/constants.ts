export const IMPUESTO = 0.043;
export const COMISION = 0.05;
export const MONEDA = "MXN";

export const STORAGE_KEYS = {
  sesion: "intelipro.sesion",
  carrito: "intelipro.carrito",
  comprobantes: "intelipro.comprobantes",
} as const;

const formateadorMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: MONEDA,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(n: number): string {
  const valor = Number.isFinite(n) ? n : 0;
  return formateadorMoneda.format(valor);
}

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
});

export function formatFecha(fecha: string | number | Date): string {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "Fecha no disponible";
  return formateadorFecha.format(valor);
}

export function redondear2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
