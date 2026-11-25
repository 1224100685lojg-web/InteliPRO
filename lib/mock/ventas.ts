import type { Comprobante } from "../types";

/** Último folio usado por los comprobantes de ejemplo. */
export const FOLIO_INICIAL = 122;

/** Comprobantes de ejemplo para poder consultar folios desde el inicio. */
export const comprobantesSemilla: Comprobante[] = [
  {
    folio: "IP-2026-000121",
    fecha: "2026-11-12T16:45:00.000Z",
    tiendaId: "t-01",
    tiendaNombre: "InteliPro Centro",
    clienteNombre: "Ana López",
    clienteEmail: "cliente@intelipro.com",
    items: [
      {
        productoId: "p-02",
        nombre: "Monitor 27\" 4K UHD",
        precio: 8999,
        cantidad: 1,
      },
      {
        productoId: "p-06",
        nombre: "Bocina Bluetooth Portátil",
        precio: 1299,
        cantidad: 2,
      },
    ],
    subtotal: 11597,
    impuesto: 498.67,
    total: 12095.67,
    estado: "pagada",
    metodoPago: "Tarjeta terminación 4242",
  },
  {
    folio: "IP-2026-000122",
    fecha: "2026-11-19T18:20:00.000Z",
    tiendaId: "t-02",
    tiendaNombre: "InteliPro Norte",
    clienteNombre: "Ana López",
    clienteEmail: "cliente@intelipro.com",
    items: [
      {
        productoId: "p-05",
        nombre: "Audífonos Noise Cancelling",
        precio: 4299,
        cantidad: 1,
      },
      {
        productoId: "p-11",
        nombre: "Mouse Ergonómico Inalámbrico",
        precio: 799,
        cantidad: 2,
      },
    ],
    subtotal: 5897,
    impuesto: 253.57,
    total: 6150.57,
    estado: "pagada",
    metodoPago: "Tarjeta terminación 1881",
  },
];
