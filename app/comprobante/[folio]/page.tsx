import type { Metadata } from "next";
import RequireAuth from "@/components/auth/RequireAuth";
import { ComprobanteView } from "./ComprobanteView";

export const metadata: Metadata = {
  title: "Comprobante de venta | InteliPro",
  description: "Detalle del comprobante de tu compra en InteliPro.",
};

interface ComprobantePageProps {
  params: { folio: string };
}

export default function ComprobantePage({ params }: ComprobantePageProps) {
  return (
    <RequireAuth roles={["cliente", "gerente"]}>
      <ComprobanteView folio={params.folio} />
    </RequireAuth>
  );
}
