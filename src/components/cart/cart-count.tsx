"use client";

import { useCart } from "@/context/cart-context";

export default function CartCount() {
  const { itemCount, isReady } = useCart();

  return (
    <span className="hidden sm:inline">
      Bag ({isReady ? itemCount : "…"})
    </span>
  );
}