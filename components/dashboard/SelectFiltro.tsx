import { ChevronDown, Lock, type LucideIcon } from "lucide-react";

interface Props {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  value: string;
  onChange: (valor: string) => void;
  opciones: { valor: string; texto: string }[];
  bloqueado?: boolean;
}

export function SelectFiltro({ id, etiqueta, icono: Icono, value, onChange, opciones, bloqueado }: Props) {
  const texto = opciones.find((o) => o.valor === value)?.texto ?? "";
  return (
    <div className="min-w-0 sm:flex-1">
      <label htmlFor={id} className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#86868b]">
        {etiqueta}
      </label>
      <div className="relative">
        <Icono className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" strokeWidth={1.5} aria-hidden="true" />
        {bloqueado ? (
          <div id={id} className="flex w-full items-center rounded-2xl bg-[#f5f5f7] py-3 pl-11 pr-10 text-[15px] text-[#1d1d1f]">
            {texto}
            <Lock className="absolute right-4 h-4 w-4 text-[#86868b]" strokeWidth={1.5} aria-label="Fijo para tu cuenta" />
          </div>
        ) : (
          <>
            <select
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-2xl border-0 bg-[#f5f5f7] py-3 pl-11 pr-10 text-[15px] text-[#1d1d1f] transition-colors duration-300 hover:bg-[#ececef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
            >
              {opciones.map((o) => (
                <option key={o.valor} value={o.valor}>{o.texto}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" strokeWidth={1.5} aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
}