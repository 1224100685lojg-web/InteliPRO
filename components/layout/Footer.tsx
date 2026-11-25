import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md bg-[#f5f5f7] text-[#1d1d1f]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-tight text-[#1d1d1f]">
              InteliPro
            </p>
            <p className="text-[11px] text-[#6e6e73]">
              Catálogo, compras en línea y estadísticas por tienda.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#86868b]">
          <Link
            href="/"
            className="rounded font-medium text-[#6e6e73] transition-colors hover:text-[#0071e3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40"
          >
            Catálogo
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-3 w-px bg-black/[0.08] sm:block"
          />
          <span>
            © {new Date().getFullYear()} Comercializadora InteliPro. Todos los
            derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
