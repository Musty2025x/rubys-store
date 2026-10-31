
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import {
  createGuestOrder,
  type CheckoutResult,
} from "@/app/checkout/actions";
import { getShippingQuote } from "@/lib/shipping";

const inputClass =
  "mt-2 w-full border border-[#d9cec2] bg-white px-4 py-3 text-sm text-[#49382f] outline-none transition placeholder:text-[#a99b8e] focus:border-[#a0805c]";

const labelClass =
  "block text-xs font-medium tracking-[0.08em] text-[#49382f]";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function CheckoutForm() {
  const { items, subtotal, isReady, clearCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CheckoutResult | null>(null);
  const [selectedState, setSelectedState] = useState("");

  const shippingQuote = selectedState
    ? getShippingQuote(selectedState)
    : null;

  const estimatedTotal = subtotal + (shippingQuote?.fee ?? 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your shopping bag is empty. Please add a product first.");
      return;
    }

    if (!shippingQuote) {
      setError("Please select Lagos or Abuja as your delivery state.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const optionalValue = (name: string) => {
      const value = String(formData.get(name) ?? "").trim();
      return value || undefined;
    };

    setIsSubmitting(true);

    try {
      const result = await createGuestOrder({
        customerName: String(formData.get("customerName") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        shippingAddress: String(formData.get("shippingAddress") ?? ""),
        shippingAddress2: optionalValue("shippingAddress2"),
        shippingCity: String(formData.get("shippingCity") ?? ""),
        shippingState: selectedState,
        shippingPostalCode: optionalValue("shippingPostalCode"),
        deliveryNotes: optionalValue("deliveryNotes"),
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      clearCart();
      setOrder(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-7xl px-6 py-20">
        <p className="text-center text-sm text-[#76675d]">
          Preparing your checkout...
        </p>
      </main>
    );
  }

  if (order?.success) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-xs tracking-[0.25em] text-[#a0805c]">
          RUBYS — ORDER RECEIVED
        </p>

        <h1 className="mt-5 text-3xl text-[#49382f] md:text-4xl">
          Thank you for your order.
        </h1>

        <p className="mt-5 max-w-lg text-sm leading-7 text-[#76675d]">
          Your order has been created successfully. Please keep your order
          number for reference. Our team will follow up with you about payment
          and delivery.
        </p>

        <div className="mt-9 w-full border border-[#e9e0d6] bg-[#f4ede3] p-7 text-left">
          <p className="text-xs tracking-[0.15em] text-[#a0805c]">
            YOUR ORDER NUMBER
          </p>
          <p className="mt-2 text-xl font-semibold text-[#49382f]">
            {order.orderNumber}
          </p>

          <div className="mt-7 space-y-4 border-t border-[#d9cec2] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#76675d]">Subtotal</span>
              <span className="text-[#49382f]">
                {formatNaira(order.subtotal ?? 0)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#76675d]">Delivery</span>
              <span className="text-[#49382f]">
                {formatNaira(order.shippingFee ?? 0)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#d9cec2] pt-4 font-semibold">
              <span className="text-[#49382f]">Total</span>
              <span className="text-[#49382f]">
                {formatNaira(order.total ?? 0)}
              </span>
            </div>
          </div>

          <p className="mt-6 border-t border-[#d9cec2] pt-5 text-xs leading-6 text-[#76675d]">
            Payment status: Unpaid. Your order is pending payment confirmation.
          </p>
        </div>

        <Link
          href="/shop"
          className="mt-9 bg-[#49382f] px-8 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#343b32]"
        >
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-3xl text-[#49382f]">
          Your shopping bag is empty.
        </h1>
        <p className="mt-4 text-sm text-[#76675d]">
          Add your favourite RUBYS essentials before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-[#49382f] px-8 py-4 text-xs tracking-[0.2em] text-white"
        >
          EXPLORE THE COLLECTION
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="mb-12">
        <p className="text-xs tracking-[0.25em] text-[#a0805c]">
          COMPLETE YOUR SELECTION
        </p>
        <h1 className="mt-4 text-4xl text-[#49382f] md:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-[#76675d]">
          Enter your details so we can arrange your delivery.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-12 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-10">
          <section>
            <h2 className="text-xl text-[#49382f]">
              Contact information
            </h2>
            <p className="mt-2 text-sm text-[#76675d]">
              We will use these details to contact you about your order.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                FULL NAME *
                <input
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                PHONE NUMBER *
                <input
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={7}
                  maxLength={25}
                  placeholder="e.g. 08012345678"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                EMAIL ADDRESS *
                <input
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl text-[#49382f]">
              Delivery information
            </h2>
            <p className="mt-2 text-sm text-[#76675d]">
              Delivery is currently available in Lagos and Abuja.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                STREET ADDRESS *
                <input
                  name="shippingAddress"
                  type="text"
                  autoComplete="address-line1"
                  required
                  minLength={5}
                  maxLength={250}
                  placeholder="House number and street name"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                APARTMENT, SUITE OR LANDMARK
                <input
                  name="shippingAddress2"
                  type="text"
                  autoComplete="address-line2"
                  maxLength={250}
                  placeholder="Optional"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                CITY *
                <input
                  name="shippingCity"
                  type="text"
                  autoComplete="address-level2"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Your city"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                STATE *
                <select
                  name="shippingState"
                  required
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select your state</option>
                  <option value="Lagos">Lagos</option>
                  <option value="FCT">Abuja (FCT)</option>
                </select>
              </label>

              <label className={labelClass}>
                POSTAL CODE
                <input
                  name="shippingPostalCode"
                  type="text"
                  autoComplete="postal-code"
                  maxLength={20}
                  placeholder="Optional"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                DELIVERY NOTES
                <textarea
                  name="deliveryNotes"
                  rows={3}
                  maxLength={500}
                  placeholder="Any directions or useful delivery information? (Optional)"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
            >
              {error}
            </div>
          )}

          <div className="border-t border-[#e9e0d6] pt-6">
            <p className="text-xs leading-6 text-[#76675d]">
              By placing your order, you confirm that your contact and
              delivery information is correct. Payment arrangements will
              be communicated separately.
            </p>

            <button
              type="submit"
              disabled={isSubmitting || !shippingQuote}
              className="mt-6 w-full bg-[#49382f] px-6 py-5 text-xs tracking-[0.2em] text-white transition hover:bg-[#343b32] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-72"
            >
              {isSubmitting ? "PLACING YOUR ORDER..." : "PLACE ORDER"}
            </button>
          </div>
        </div>

        <aside className="h-fit bg-[#f4ede3] p-7 md:p-8">
          <h2 className="text-xl text-[#49382f]">
            Your order
          </h2>

          <div className="mt-7 divide-y divide-[#d9cec2]">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="text-[#49382f]">{item.name}</p>
                  <p className="mt-1 text-xs text-[#76675d]">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-[#49382f]">
                  {formatNaira(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-4 border-t border-[#d9cec2] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#76675d]">Subtotal</span>
              <span className="text-[#49382f]">
                {formatNaira(subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#76675d]">Delivery</span>
              <span className="text-right text-[#49382f]">
                {shippingQuote
                  ? formatNaira(shippingQuote.fee)
                  : "Select a state"}
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t border-[#d9cec2] pt-5 text-base font-semibold">
              <span className="text-[#49382f]">Total</span>
              <span className="text-[#49382f]">
                {formatNaira(estimatedTotal)}
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs leading-6 text-[#76675d]">
            Prices and stock are checked again securely when you place
            your order. Delivery is currently limited to Lagos and Abuja.
          </p>
        </aside>
      </form>
    </main>
  );
}
