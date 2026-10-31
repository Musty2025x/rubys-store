
"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const existingItem = items.find(
    (item) => item.id === product.id
  );

  const quantityInCart = existingItem?.quantity ?? 0;

  const unavailable =
    !product.isActive ||
    product.isArchived ||
    product.stockQuantity <= 0;

  const reachedStockLimit =
    quantityInCart >= product.stockQuantity;

  const disabled = unavailable || reachedStockLimit;

  function handleAddToCart() {
    if (disabled) return;

    addToCart(product);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      className="w-full bg-[#49382f] px-5 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:bg-[#b9aa9b]"
    >
      {unavailable
        ? "UNAVAILABLE"
        : reachedStockLimit
          ? "MAXIMUM STOCK REACHED"
          : added
            ? "ADDED TO BAG ✓"
            : "ADD TO BAG"}
    </button>
  );
}
