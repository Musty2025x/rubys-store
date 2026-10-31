
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <CartProvider>
      {!isAdminRoute && <Header />}

      {children}

      {!isAdminRoute && <Footer />}
    </CartProvider>
  );
}
