import type { Estadisticas } from "../types";

const PERIODO = "Últimos 30 días";

/**
 * Estadísticas simuladas por tienda. Los importes son coherentes entre sí:
 * comision = ventaGlobal * 0.05, impuesto = ventaGlobal * 0.043,
 * promedioVenta = ventaGlobal / cantidadVentas y las ventas por categoría
 * suman la venta global de la tienda.
 */
export const estadisticas: Estadisticas[] = [
  {
    tiendaId: "t-01",
    tiendaNombre: "InteliPro Centro",
    periodo: PERIODO,
    ventaGlobal: 486500,
    comision: 24325,
    impuesto: 20919.5,
    cantidadVentas: 128,
    promedioVenta: 3800.78,
    productoMasVendido: {
      productoId: "p-02",
      nombre: "Monitor 27\" 4K UHD",
      cantidad: 12,
      monto: 107988,
    },
    productoMenosVendido: {
      productoId: "p-14",
      nombre: "Hub USB-C 7 en 1",
      cantidad: 5,
      monto: 3245,
    },
    ventasPorCategoria: [
      { categoriaId: "c-01", categoriaNombre: "Cómputo", monto: 198000, cantidad: 34 },
      { categoriaId: "c-02", categoriaNombre: "Audio", monto: 72500, cantidad: 22 },
      { categoriaId: "c-03", categoriaNombre: "Telefonía", monto: 96000, cantidad: 18 },
      { categoriaId: "c-04", categoriaNombre: "Accesorios", monto: 43000, cantidad: 30 },
      { categoriaId: "c-05", categoriaNombre: "Hogar Inteligente", monto: 35000, cantidad: 14 },
      { categoriaId: "c-06", categoriaNombre: "Gaming", monto: 42000, cantidad: 10 },
    ],
  },
  {
    tiendaId: "t-02",
    tiendaNombre: "InteliPro Norte",
    periodo: PERIODO,
    ventaGlobal: 612800,
    comision: 30640,
    impuesto: 26350.4,
    cantidadVentas: 156,
    promedioVenta: 3928.21,
    productoMasVendido: {
      productoId: "p-08",
      nombre: "Smartphone 5G 256GB",
      cantidad: 14,
      monto: 209986,
    },
    productoMenosVendido: {
      productoId: "p-15",
      nombre: "Foco Inteligente RGB",
      cantidad: 6,
      monto: 2094,
    },
    ventasPorCategoria: [
      { categoriaId: "c-01", categoriaNombre: "Cómputo", monto: 142000, cantidad: 30 },
      { categoriaId: "c-02", categoriaNombre: "Audio", monto: 118000, cantidad: 26 },
      { categoriaId: "c-03", categoriaNombre: "Telefonía", monto: 215800, cantidad: 42 },
      { categoriaId: "c-04", categoriaNombre: "Accesorios", monto: 52000, cantidad: 28 },
      { categoriaId: "c-05", categoriaNombre: "Hogar Inteligente", monto: 38000, cantidad: 16 },
      { categoriaId: "c-06", categoriaNombre: "Gaming", monto: 47000, cantidad: 14 },
    ],
  },
  {
    tiendaId: "t-03",
    tiendaNombre: "InteliPro Sur",
    periodo: PERIODO,
    ventaGlobal: 398400,
    comision: 19920,
    impuesto: 17131.2,
    cantidadVentas: 104,
    promedioVenta: 3830.77,
    productoMasVendido: {
      productoId: "p-03",
      nombre: "Tablet 11\" WiFi 128GB",
      cantidad: 9,
      monto: 58491,
    },
    productoMenosVendido: {
      productoId: "p-12",
      nombre: "Cable USB-C 2m",
      cantidad: 8,
      monto: 1592,
    },
    ventasPorCategoria: [
      { categoriaId: "c-01", categoriaNombre: "Cómputo", monto: 98000, cantidad: 24 },
      { categoriaId: "c-02", categoriaNombre: "Audio", monto: 61500, cantidad: 18 },
      { categoriaId: "c-03", categoriaNombre: "Telefonía", monto: 112000, cantidad: 26 },
      { categoriaId: "c-04", categoriaNombre: "Accesorios", monto: 34400, cantidad: 20 },
      { categoriaId: "c-05", categoriaNombre: "Hogar Inteligente", monto: 42500, cantidad: 10 },
      { categoriaId: "c-06", categoriaNombre: "Gaming", monto: 50000, cantidad: 6 },
    ],
  },
];
