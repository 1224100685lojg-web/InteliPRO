import type { Comprobante, Producto } from "../types";
import { productos as productosSemilla } from "../mock/productos";
import { comprobantesSemilla, FOLIO_INICIAL } from "../mock/ventas";
import { clonar } from "./client";

/**
 * Estado mutable en memoria de la API simulada. Los mocks originales quedan
 * intactos: aquí se trabaja sobre copias para poder descontar stock y guardar
 * comprobantes durante la sesión del navegador.
 */
const productosDb: Producto[] = productosSemilla.map((producto) => ({ ...producto }));
const comprobantesDb: Comprobante[] = comprobantesSemilla.map((comprobante) =>
  clonar(comprobante)
);

let folioActual = FOLIO_INICIAL;

export function productosEnMemoria(): Producto[] {
  return productosDb;
}

export function productoEnMemoria(id: string): Producto | null {
  return productosDb.find((producto) => producto.id === id) ?? null;
}

export function descontarStock(productoId: string, cantidad: number): void {
  const producto = productoEnMemoria(productoId);
  if (!producto) return;
  producto.stock = Math.max(0, producto.stock - cantidad);
}

export function comprobantesEnMemoria(): Comprobante[] {
  return comprobantesDb;
}

export function comprobanteEnMemoria(folio: string): Comprobante | null {
  const buscado = folio.trim().toUpperCase();
  return (
    comprobantesDb.find((comprobante) => comprobante.folio.toUpperCase() === buscado) ?? null
  );
}

export function guardarComprobanteEnMemoria(comprobante: Comprobante): void {
  comprobantesDb.unshift(comprobante);
}

/** Genera folios incrementales con el formato IP-AAAA-000000. */
export function generarFolio(): string {
  folioActual += 1;
  const anio = new Date().getFullYear();
  return `IP-${anio}-${String(folioActual).padStart(6, "0")}`;
}
