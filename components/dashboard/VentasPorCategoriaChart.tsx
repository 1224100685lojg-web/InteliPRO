"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/constants";
import type { ResumenCategoria } from "@/lib/types";

// Paleta monocroma con azul como acento único.
const COLORES = ["#1d1d1f", "#6e6e73", "#a1a1a6", "#d2d2d7", "#0071e3"];

const formateadorCompacto = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  maximumFractionDigits: 1,
});

interface VentasPorCategoriaChartProps {
  datos: ResumenCategoria[];
}

export function VentasPorCategoriaChart({
  datos,
}: VentasPorCategoriaChartProps) {
  if (!datos || datos.length === 0) {
    return (
      <div className="grid h-72 w-full place-items-center rounded-2xl bg-[#f5f5f7] px-6 text-center text-sm text-[#6e6e73] sm:h-80">
        Sin ventas por categoría en este periodo.
      </div>
    );
  }

  return (
    <figure className="m-0">
      <div className="h-72 w-full sm:h-80" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 8"
              stroke="#ededf0"
              vertical={false}
            />
            <XAxis
              dataKey="categoriaNombre"
              tick={{ fill: "#86868b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={64}
            />
            <YAxis
              tick={{ fill: "#86868b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(valor: number) =>
                `$${formateadorCompacto.format(valor)}`
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                background: "#ffffff",
                boxShadow: "0 12px 32px -16px rgba(0, 0, 0, 0.25)",
                fontSize: 12,
                padding: "10px 12px",
              }}
              labelStyle={{ color: "#1d1d1f", fontWeight: 600 }}
              itemStyle={{ color: "#6e6e73" }}
              formatter={(valor) => [formatMoney(Number(valor)), "Monto"]}
            />
            <Bar
              dataKey="monto"
              name="Monto"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              {datos.map((categoria, indice) => (
                <Cell
                  key={categoria.categoriaId}
                  fill={COLORES[indice % COLORES.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="sr-only">
        Monto de ventas por categoría.{" "}
        {datos
          .map(
            (categoria) =>
              `${categoria.categoriaNombre}: ${formatMoney(
                categoria.monto
              )} en ${categoria.cantidad} unidades.`
          )
          .join(" ")}
      </figcaption>
    </figure>
  );
}

export default VentasPorCategoriaChart;
