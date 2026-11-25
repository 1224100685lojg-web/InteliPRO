import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/lib/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "InteliPro | Gestión de Cadena de Tiendas",
  description:
    "Comercializadora InteliPro: catálogo, compras en línea y estadísticas por tienda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
