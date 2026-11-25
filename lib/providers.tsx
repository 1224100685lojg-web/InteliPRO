"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./session-context";
import { CartProvider } from "./cart-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}

export default AppProviders;
