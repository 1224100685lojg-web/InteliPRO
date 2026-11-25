import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | InteliPro",
  description:
    "Accede a tu cuenta de InteliPro para comprar en línea o consultar las estadísticas de tu tienda.",
};

function LoginFallback() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4">
      <div
        className="card flex w-full items-center gap-3 p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <Loader2
          className="h-6 w-6 shrink-0 animate-spin text-brand-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Preparando el inicio de sesión…
          </p>
          <p className="text-xs text-slate-500">Un momento, por favor.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
