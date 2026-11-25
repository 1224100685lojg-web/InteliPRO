export type Rol = "cliente" | "gerente";

export interface Tienda {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  gerenteId: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  /** Nombre del icono de Lucide, por ejemplo "Laptop". */
  icono: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  categoriaNombre: string;
  imagen: string;
  stock: number;
  tiendaId: string;
  destacado?: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  tiendaId?: string;
  avatarIniciales: string;
}

export interface Credenciales {
  email: string;
  password: string;
}

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface ItemVenta {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface PagoTarjeta {
  titular: string;
  numero: string;
  vencimiento: string;
  cvv: string;
}

export interface CheckoutPayload {
  tiendaId: string;
  usuarioId: string;
  items: ItemVenta[];
  pago: {
    titular: string;
    ultimos4: string;
  };
  subtotal: number;
  impuesto: number;
  total: number;
}

export interface Comprobante {
  folio: string;
  fecha: string;
  tiendaId: string;
  tiendaNombre: string;
  clienteNombre: string;
  clienteEmail: string;
  items: ItemVenta[];
  subtotal: number;
  impuesto: number;
  total: number;
  estado: "pagada";
  metodoPago: string;
}

export interface ResumenCategoria {
  categoriaId: string;
  categoriaNombre: string;
  monto: number;
  cantidad: number;
}

export interface ProductoEstadistica {
  productoId: string;
  nombre: string;
  cantidad: number;
  monto: number;
}

export interface Estadisticas {
  tiendaId: string;
  tiendaNombre: string;
  periodo: string;
  ventaGlobal: number;
  comision: number;
  impuesto: number;
  cantidadVentas: number;
  promedioVenta: number;
  productoMasVendido: ProductoEstadistica;
  productoMenosVendido: ProductoEstadistica;
  ventasPorCategoria: ResumenCategoria[];
}

export interface FiltrosProducto {
  tiendaId?: string;
  categoriaId?: string;
  q?: string;
}
