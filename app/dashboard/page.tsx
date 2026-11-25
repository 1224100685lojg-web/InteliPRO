import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export const metadata: Metadata = {
  title: "Dashboard de tienda | InteliPro",
  description:
    "Consulta las ventas, comisiones, impuestos y productos destacados de cada tienda.",
};

export default function DashboardPage() {
  return (
    <RequireAuth roles={["gerente"]}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </RequireAuth>
  );
}
