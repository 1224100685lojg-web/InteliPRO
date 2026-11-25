import { formatMoney } from "@/lib/constants";
import type { ResumenCategoria } from "@/lib/types";

const formateadorEntero = new Intl.NumberFormat("es-MX");

interface TablaCategoriasProps {
  categorias: ResumenCategoria[];
  /** Venta global entregada por la API; se usa como denominador del porcentaje. */
  total: number;
}

export function TablaCategorias({ categorias, total }: TablaCategoriasProps) {
  const denominador = Number.isFinite(total) && total > 0 ? total : 0;

  return (
    <section
      aria-labelledby="titulo-tabla-categorias"
      className="flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.06]"
    >
      <div className="px-6 pb-4 pt-6">
        <h2
          id="titulo-tabla-categorias"
          className="text-base font-semibold tracking-tight text-[#1d1d1f]"
        >
          Detalle por categoría
        </h2>
        <p className="mt-1 text-sm text-[#6e6e73]">
          Monto, unidades y participación sobre la venta global.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">
            Ventas por categoría con monto en pesos mexicanos, unidades vendidas
            y porcentaje del total.
          </caption>
          <thead className="text-left">
            <tr className="border-y border-black/[0.06] text-[10px] uppercase tracking-[0.12em] text-[#86868b]">
              <th scope="col" className="px-6 py-3 font-medium">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-right font-medium">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-right font-medium">
                Unidades
              </th>
              <th scope="col" className="px-6 py-3 text-right font-medium">
                % del total
              </th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => {
              const porcentaje =
                denominador > 0 ? (categoria.monto / denominador) * 100 : 0;
              const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje));

              return (
                <tr
                  key={categoria.categoriaId}
                  className="border-b border-black/[0.06] transition-colors duration-300 last:border-b-0 hover:bg-[#f5f5f7]/60"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 text-left font-medium text-[#1d1d1f]"
                  >
                    {categoria.categoriaNombre}
                  </th>
                  <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-[#6e6e73]">
                    {formatMoney(categoria.monto)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-[#6e6e73]">
                    {formateadorEntero.format(categoria.cantidad)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-[#1d1d1f]">
                    <div className="flex items-center justify-end gap-2.5">
                      <span
                        aria-hidden="true"
                        className="hidden h-1 w-16 overflow-hidden rounded-full bg-[#e8e8ed] sm:block"
                      >
                        <span
                          className="block h-full rounded-full bg-[#0071e3]"
                          style={{ width: `${porcentajeSeguro}%` }}
                        />
                      </span>
                      <span>
                        {porcentaje.toLocaleString("es-MX", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {categorias.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-[#6e6e73]">
          Sin categorías con ventas en este periodo.
        </p>
      )}
    </section>
  );
}

export default TablaCategorias;
