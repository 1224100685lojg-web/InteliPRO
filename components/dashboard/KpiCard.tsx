import type { LucideIcon } from "lucide-react";

export type TonoKpi = "brand" | "emerald" | "amber" | "sky" | "violet";

export interface KpiCardProps {
  titulo: string;
  valor: string;
  nota: string;
  icono: LucideIcon;
  /**
   * Se conserva por compatibilidad con el consumidor. El diseño es monocromo,
   * por lo que el tono no altera la apariencia.
   */
  tono?: TonoKpi;
}

export function KpiCard({ titulo, valor, nota, icono: Icono }: KpiCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl bg-[#f5f5f7] p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-medium leading-snug text-[#6e6e73]">
          {titulo}
        </h3>
        <Icono
          className="h-5 w-5 shrink-0 text-[#1d1d1f]/70"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#1d1d1f] tabular-nums sm:text-4xl">
        {valor}
      </p>

      <p className="mt-auto pt-3 text-xs leading-relaxed text-[#86868b]">
        {nota}
      </p>
    </article>
  );
}

export default KpiCard;
