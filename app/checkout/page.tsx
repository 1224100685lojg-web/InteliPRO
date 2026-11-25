import type { Metadata } from "next";
import RequireAuth from "@/components/auth/RequireAuth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Pago | InteliPro",
  description: "Finaliza tu compra con un pago simulado y seguro.",
};

export default function CheckoutPage() {
  return (
    <RequireAuth roles={["cliente", "gerente"]}>
      <CheckoutForm />
    </RequireAuth>
  );
}
