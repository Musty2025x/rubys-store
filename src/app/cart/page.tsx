
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

type InventoryStatus = "checking" | "verified" | "failed";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    isReady,
    updateQuantity,
    removeFromCart,
    refreshInventory,
  } = useCart();

  const [inventoryStatus, setInventoryStatus] =
    useState<InventoryStatus>("checking");

  const hasCheckedInventory = useRef(false);

  useEffect(() => {
    if (!isReady || hasCheckedInventory.current) {
      return;
    }

    hasCheckedInventory.current = true;

    async function checkInventory() {
      setInventoryStatus("checking");

      const verified = await refreshInventory();

      setInventoryStatus(verified ? "verified" : "failed");
    }

    void checkInventory();
  }, [isReady, refreshInventory]);

  const formattedSubtotal = subtotal.toLocaleString("en-NG");

  if (!isReady) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-6 py-20">
        <p className="text-center text-sm text-[#76675d]">
          Loading your shopping bag...
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-xs tracking-[0.25em] text-[#a0805c]">
          YOUR SHOPPING BAG
        </p>

        <h1 className="mt-5 text-3xl text-[#49382f] md:text-4xl">
          Your bag is waiting to be filled.
        </h1>

        <p className="mt-4 max-w-md text-sm leading-7 text-[#76675d]">
          Discover our premium haircare essentials and find the right
          products for your haircare routine.
        </p>

        <Link
          href="/shop"
          className="mt-8 bg-[#49382f] px-8 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#343b32]"
        >
          EXPLORE THE COLLECTION
        </Link>
      </main>
    );
  }

  const unavailableItems = items.filter(
    (item) =>
      !item.isActive ||
      item.isArchived ||
      item.stockQuantity <= 0
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-12">
        <p className="text-xs tracking-[0.25em] text-[#a0805c]">
          YOUR RUBYS SELECTION
        </p>

        <h1 className="mt-4 text-4xl text-[#49382f] md:text-5xl">
          Shopping Bag
        </h1>

        <p className="mt-3 text-sm text-[#76675d]">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
        </p>
      </div>

      {inventoryStatus === "checking" && (
        <div
          role="status"
          className="mb-8 border border-[#d9cec2] bg-[#f4ede3] p-4 text-sm text-[#76675d]"
        >
          Checking current product availability...
        </div>
      )}

      {inventoryStatus === "failed" && (
        <div
          role="alert"
          className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          We could not verify current product availability. Please try
          again before proceeding with your order.

          <button
            type="button"
            onClick={async () => {
              setInventoryStatus("checking");

              const verified = await refreshInventory();

              setInventoryStatus(
                verified ? "verified" : "failed"
              );
            }}
            className="ml-2 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {inventoryStatus === "verified" &&
        unavailableItems.length > 0 && (
          <div
            role="alert"
            className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            Some products in your bag are no longer available.
            Please remove them before continuing.
          </div>
        )}

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="hidden grid-cols-[1fr_120px_120px] border-b border-[#e9e0d6] pb-4 text-[10px] tracking-[0.2em] text-[#76675d] md:grid">
            <span>PRODUCT</span>
            <span>QUANTITY</span>
            <span className="text-right">TOTAL</span>
          </div>

          <div className="divide-y divide-[#e9e0d6]">
            {items.map((item) => {
              const outOfStock =
                item.stockQuantity <= 0 ||
                !item.isActive ||
                item.isArchived;

              const reachedStockLimit =
                item.quantity >= item.stockQuantity;

              const lowStock =
                !outOfStock &&
                item.stockQuantity <= 5;

              return (
                <article
                  key={item.id}
                  className="grid gap-5 py-7 sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_120px_120px] md:items-center"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative aspect-[4/5] w-full overflow-hidden bg-[#eee7dd] sm:w-[120px]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </Link>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0805c]">
                      {item.category}
                    </p>

                    <Link
                      href={`/products/${item.slug}`}
                      className="mt-2 block text-lg text-[#49382f] hover:text-[#a0805c]"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-2 text-sm text-[#76675d]">
                      ₦{item.price.toLocaleString("en-NG")}
                    </p>

                    {outOfStock ? (
                      <p className="mt-3 text-xs font-medium text-red-700">
                        This product is unavailable. Please remove it
                        from your bag.
                      </p>
                    ) : lowStock ? (
                      <p className="mt-3 text-xs font-medium text-amber-700">
                        Only {item.stockQuantity} units available.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="mt-4 text-xs text-[#9b7460] underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-4 md:justify-center">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center border border-[#d9cec2] text-lg"
                    >
                      −
                    </button>

                    <span className="min-w-5 text-center text-sm">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={
                        inventoryStatus !== "verified" ||
                        outOfStock ||
                        reachedStockLimit
                      }
                      className="flex h-8 w-8 items-center justify-center border border-[#d9cec2] text-lg disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm text-[#49382f] md:text-right">
                    ₦{(item.price * item.quantity).toLocaleString("en-NG")}
                  </p>
                </article>
              );
            })}
          </div>

          <Link
            href="/shop"
            className="mt-8 inline-block text-xs tracking-[0.15em] text-[#49382f] underline underline-offset-4"
          >
            CONTINUE SHOPPING
          </Link>
        </section>

        <aside className="h-fit bg-[#f4ede3] p-7 md:p-8">
          <h2 className="text-xl text-[#49382f]">
            Order Summary
          </h2>

          <div className="mt-8 flex justify-between border-b border-[#d9cec2] pb-5 text-sm">
            <span className="text-[#76675d]">Subtotal</span>
            <span className="font-medium text-[#49382f]">
              ₦{formattedSubtotal}
            </span>
          </div>

          <div className="mt-5 flex justify-between text-sm">
            <span className="text-[#76675d]">Shipping</span>
            <span className="text-[#76675d]">
              Calculated at checkout
            </span>
          </div>

          <div className="mt-8 border-t border-[#d9cec2] pt-6">
            <div className="flex justify-between text-base">
              <span className="text-[#49382f]">Estimated total</span>
              <span className="font-semibold text-[#49382f]">
                ₦{formattedSubtotal}
              </span>
            </div>

            <p className="mt-3 text-xs leading-6 text-[#76675d]">
              Shipping costs and any applicable taxes will be calculated
              before payment.
            </p>
          </div>

          <Link
            href="/checkout"
            className="mt-8 block w-full bg-[#49382f] px-5 py-4 text-center text-xs tracking-[0.2em] text-white transition hover:bg-[#343b32]"
          >
            PROCEED TO CHECKOUT
          </Link>
        </aside>
      </div>
    </main>
  );
}
