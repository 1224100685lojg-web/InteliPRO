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
import type { ItemCarrito, Producto } from "./types";
import { IMPUESTO, STORAGE_KEYS } from "./constants";

export interface CartContextValue {
  items: ItemCarrito[];
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
  subtotal: number;
  impuesto: number;
  total: number;
  cantidadTotal: number;
  listo: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function normalizarCantidad(cantidad: number, stock: number): number {
  const solicitada = Number.isFinite(cantidad) ? Math.floor(cantidad) : 1;
  return Math.min(Math.max(1, solicitada), Math.max(0, stock));
}

function leerCarritoGuardado(): ItemCarrito[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEYS.carrito);
    if (!crudo) return [];
    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];

    const vistos = new Set<string>();
    const items: ItemCarrito[] = [];

    for (const entrada of datos as Partial<ItemCarrito>[]) {
      const producto = entrada?.producto;
      if (!producto?.id || vistos.has(producto.id)) continue;
      if (!Number.isFinite(producto.stock) || producto.stock <= 0) continue;

      const cantidad = normalizarCantidad(Number(entrada?.cantidad), producto.stock);
      if (cantidad < 1) continue;

      vistos.add(producto.id);
      items.push({ producto, cantidad });
    }

    return items;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [listo, setListo] = useState(false);

  // Hidratación segura: el carrito se restaura después del montaje.
  useEffect(() => {
    setItems(leerCarritoGuardado());
    setListo(true);
  }, []);

  // Persiste solo cuando la hidratación ya terminó.
  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.carrito, JSON.stringify(items));
    } catch {
      // Sin almacenamiento: el carrito sigue funcionando en memoria.
    }
  }, [items, listo]);

  const agregar = useCallback((producto: Producto, cantidad = 1) => {
    if (!producto || producto.stock <= 0) return;

    setItems((previos) => {
      const existente = previos.find((item) => item.producto.id === producto.id);

      if (existente) {
        const nuevaCantidad = normalizarCantidad(
          existente.cantidad + Math.max(1, Math.floor(cantidad)),
          producto.stock
        );
        return previos.map((item) =>
          item.producto.id === producto.id
            ? { producto, cantidad: nuevaCantidad }
            : item
        );
      }

      const inicial = normalizarCantidad(cantidad, producto.stock);
      if (inicial < 1) return previos;
      return [...previos, { producto, cantidad: inicial }];
    });
  }, []);

  const quitar = useCallback((productoId: string) => {
    setItems((previos) => previos.filter((item) => item.producto.id !== productoId));
  }, []);

  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((previos) =>
      previos.flatMap((item) => {
        if (item.producto.id !== productoId) return [item];
        if (item.producto.stock <= 0) return [];
        const ajustada = normalizarCantidad(cantidad, item.producto.stock);
        return ajustada < 1 ? [] : [{ ...item, cantidad: ajustada }];
      })
    );
  }, []);

  const vaciar = useCallback(() => {
    setItems([]);
  }, []);

  const { subtotal, impuesto, total, cantidadTotal } = useMemo(() => {
    const sub = items.reduce(
      (acumulado, item) => acumulado + item.producto.precio * item.cantidad,
      0
    );
    return {
      subtotal: sub,
      impuesto: sub * IMPUESTO,
      total: sub * (1 + IMPUESTO),
      cantidadTotal: items.reduce((acumulado, item) => acumulado + item.cantidad, 0),
    };
  }, [items]);

  const valor = useMemo<CartContextValue>(
    () => ({
      items,
      agregar,
      quitar,
      cambiarCantidad,
      vaciar,
      subtotal,
      impuesto,
      total,
      cantidadTotal,
      listo,
    }),
    [items, agregar, quitar, cambiarCantidad, vaciar, subtotal, impuesto, total, cantidadTotal, listo]
  );

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return contexto;
}
