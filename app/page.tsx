import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo } from "@/components/tienda/Catalogo";
import { CatalogoSkeleton } from "@/components/tienda/Skeletons";

export const metadata: Metadata = {
  title: "Catálogo | InteliPro",
  description:
    "Explora el catálogo de InteliPro: tecnología, audio, telefonía, accesorios, hogar inteligente y gaming por tienda.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<CatalogoSkeleton />}>
      <Catalogo />
    </Suspense>
  );
}
