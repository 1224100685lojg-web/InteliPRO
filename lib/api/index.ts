import type {
  Categoria,
  CheckoutPayload,
  Comprobante,
  Credenciales,
  Estadisticas,
  FiltrosProducto,
  Producto,
  Sesion,
  Tienda,
  Usuario,
} from "../types";
import { IMPUESTO, STORAGE_KEYS } from "../constants";
import { categorias } from "../mock/categorias";
import { estadisticas } from "../mock/estadisticas";
import { tiendas } from "../mock/tiendas";
import { usuarios } from "../mock/usuarios";
import { ApiError, clonar, delay } from "./client";
import {
  comprobanteEnMemoria,
  descontarStock,
  generarFolio,
  guardarComprobanteEnMemoria,
  productoEnMemoria,
  productosEnMemoria,
} from "./store";

export { ApiError, esApiError, esErrorDeSesion, mensajeDeError } from "./client";

/* -------------------------------------------------------------------------- */
/* Tiendas                                                                     */
/* -------------------------------------------------------------------------- */

export async function getTiendas(): Promise<Tienda[]> {
  await delay();
  return clonar(tiendas);
}

export async function getTienda(id: string): Promise<Tienda | null> {
  await delay();
  const tienda = tiendas.find((item) => item.id === id) ?? null;
  return tienda ? clonar(tienda) : null;
}

/* -------------------------------------------------------------------------- */
/* Catálogo                                                                    */
/* -------------------------------------------------------------------------- */

export async function getCategorias(): Promise<Categoria[]> {
  await delay();
  return clonar(categorias);
}

export async function getProductos(filtros: FiltrosProducto = {}): Promise<Producto[]> {
  await delay();

  const tiendaId = filtros.tiendaId?.trim();
  const categoriaId = filtros.categoriaId?.trim();
  const q = filtros.q?.trim().toLowerCase() ?? "";

  const resultados = productosEnMemoria().filter((producto) => {
    if (tiendaId && producto.tiendaId !== tiendaId) return false;
    if (categoriaId && producto.categoriaId !== categoriaId) return false;
    if (q) {
      const texto =
        `${producto.nombre} ${producto.descripcion} ${producto.categoriaNombre}`.toLowerCase();
      if (!texto.includes(q)) return false;
    }
    return true;
  });

  return clonar(resultados);
}

export async function getProducto(id: string): Promise<Producto | null> {
  await delay();
  const producto = productoEnMemoria(id);
  return producto ? clonar(producto) : null;
}

/* -------------------------------------------------------------------------- */
/* Sesión                                                                      */
/* -------------------------------------------------------------------------- */

export async function login(credenciales: Credenciales): Promise<Sesion> {
  await delay();

  const email = (credenciales?.email ?? "").trim().toLowerCase();
  const password = credenciales?.password ?? "";

  const encontrado = usuarios.find(
    (usuario) => usuario.email.toLowerCase() === email && usuario.password === password
  );

  if (!encontrado) {
    throw new ApiError(401, "Credenciales incorrectas");
  }

  const usuario: Usuario = {
    id: encontrado.id,
    nombre: encontrado.nombre,
    email: encontrado.email,
    rol: encontrado.rol,
    tiendaId: encontrado.tiendaId,
    avatarIniciales: encontrado.avatarIniciales,
  };

  return clonar({
    usuario,
    token: `mock-${usuario.id}-${Date.now().toString(36)}`,
  });
}

export async function logout(): Promise<void> {
  await delay();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.sesion);
    } catch {
      // Almacenamiento no disponible: la sesión en memoria se limpia igual.
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Comprobantes locales (localStorage)                                         */
/* -------------------------------------------------------------------------- */

export function obtenerComprobantesLocales(): Comprobante[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEYS.comprobantes);
    if (!crudo) return [];
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as Comprobante[]) : [];
  } catch {
    return [];
  }
}

export function guardarComprobanteLocal(comprobante: Comprobante): void {
  if (typeof window === "undefined") return;
  try {
    const actuales = obtenerComprobantesLocales().filter(
      (item) => item.folio !== comprobante.folio
    );
    const lista = [comprobante, ...actuales].slice(0, 100);
    window.localStorage.setItem(STORAGE_KEYS.comprobantes, JSON.stringify(lista));
  } catch {
    // Sin espacio o almacenamiento bloqueado: se conserva en memoria.
  }
}

/* -------------------------------------------------------------------------- */
/* Checkout                                                                    */
/* -------------------------------------------------------------------------- */

export async function checkout(payload: CheckoutPayload): Promise<Comprobante> {
  await delay();

  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ApiError(400, "El carrito está vacío. Agrega productos antes de pagar.");
  }

  const tienda = tiendas.find((item) => item.id === payload.tiendaId);
  if (!tienda) {
    throw new ApiError(404, "La tienda seleccionada no existe.");
  }

  // Valida cantidades y existencias antes de modificar el estado.
  for (const item of payload.items) {
    if (!item || !Number.isFinite(item.cantidad) || item.cantidad < 1) {
      throw new ApiError(400, `Cantidad inválida para "${item?.nombre ?? "producto"}".`);
    }

    const producto = productoEnMemoria(item.productoId);
    if (!producto) {
      throw new ApiError(404, `El producto "${item.nombre}" ya no está disponible.`);
    }
    if (item.cantidad > producto.stock) {
      throw new ApiError(
        409,
        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}.`
      );
    }
  }

  // Descuenta existencias en el estado en memoria.
  for (const item of payload.items) {
    descontarStock(item.productoId, item.cantidad);
  }

  const usuario = usuarios.find((item) => item.id === payload.usuarioId);

  const subtotalCalculado = payload.items.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );
  const subtotal = Number.isFinite(payload.subtotal) ? payload.subtotal : subtotalCalculado;
  const impuesto = Number.isFinite(payload.impuesto)
    ? payload.impuesto
    : subtotal * IMPUESTO;
  const total = Number.isFinite(payload.total) ? payload.total : subtotal + impuesto;

  const ultimos4 = payload.pago?.ultimos4?.trim() || "****";

  const comprobante: Comprobante = {
    folio: generarFolio(),
    fecha: new Date().toISOString(),
    tiendaId: tienda.id,
    tiendaNombre: tienda.nombre,
    clienteNombre: usuario?.nombre ?? "Cliente",
    clienteEmail: usuario?.email ?? "",
    items: payload.items.map((item) => ({ ...item })),
    subtotal,
    impuesto,
    total,
    estado: "pagada",
    metodoPago: `Tarjeta terminación ${ultimos4}`,
  };

  guardarComprobanteEnMemoria(comprobante);
  guardarComprobanteLocal(comprobante);

  return clonar(comprobante);
}

export async function getComprobante(folio: string): Promise<Comprobante | null> {
  await delay();
  if (!folio || !folio.trim()) return null;

  const enMemoria = comprobanteEnMemoria(folio);
  if (enMemoria) return clonar(enMemoria);

  const buscado = folio.trim().toUpperCase();
  const local = obtenerComprobantesLocales().find(
    (item) => item.folio.toUpperCase() === buscado
  );

  return local ? clonar(local) : null;
}

/* -------------------------------------------------------------------------- */
/* Estadísticas                                                                */
/* -------------------------------------------------------------------------- */

export async function getEstadisticas(
  tiendaId: string,
  periodo?: string
): Promise<Estadisticas> {
  await delay();

  const resumen = estadisticas.find((item) => item.tiendaId === tiendaId);
  if (!resumen) {
    throw new ApiError(404, "No encontramos estadísticas para la tienda solicitada.");
  }

  const resultado = periodo ? { ...resumen, periodo } : resumen;
  return clonar(resultado);
}
