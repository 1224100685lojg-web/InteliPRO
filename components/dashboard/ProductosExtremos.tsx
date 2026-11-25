import { Package, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/constants";
import type { ProductoEstadistica } from "@/lib/types";

const formateadorEntero = new Intl.NumberFormat("es-MX");

interface ProductosExtremosProps {
  masVendido: ProductoEstadistica;
  menosVendido: ProductoEstadistica;
}

interface TarjetaProductoProps {
  etiqueta: string;
  producto: ProductoEstadistica;
  tipo: "alto" | "bajo";
}

function TarjetaProducto({ etiqueta, producto, tipo }: TarjetaProductoProps) {
  const esAlto = tipo === "alto";
  const Icono = esAlto ? TrendingUp : TrendingDown;

  return (
    <article className="flex h-full flex-col rounded-3xl bg-[#f5f5f7] p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868b]">
          <Icono
            className="h-3.5 w-3.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {etiqueta}
        </span>
        <Package
          className="h-5 w-5 shrink-0 text-[#1d1d1f]/60"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[#1d1d1f]">
        {producto?.nombre ?? "Sin información"}
      </h3>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
            Unidades
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-[#1d1d1f]">
            {formateadorEntero.format(producto?.cantidad ?? 0)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
            Monto
          </dt>
          <dd className="mt-1 text-base font-semibold tabular-nums text-[#1d1d1f]">
            {formatMoney(producto?.monto ?? 0)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function ProductosExtremos({
  masVendido,
  menosVendido,
}: ProductosExtremosProps) {
  return (
    <section
      aria-label="Productos más y menos vendidos del periodo"
      className="grid gap-4 sm:grid-cols-2"
    >
      <TarjetaProducto
        etiqueta="Producto más vendido"
        producto={masVendido}
        tipo="alto"
      />
      <TarjetaProducto
        etiqueta="Producto menos vendido"
        producto={menosVendido}
        tipo="bajo"
      />
    </section>
  );
}

export default ProductosExtremos;
