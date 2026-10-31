
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import OrderStatusForm from "../order-status-form";

type Props = {
  params: Promise<{ id: string }>;
};

function money(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function badgeStyle(status: string) {
  if (status === "PAID" || status === "DELIVERED") {
    return "bg-green-100 text-green-800";
  }

  if (status === "CANCELLED" || status === "FAILED") {
    return "bg-red-100 text-red-800";
  }

  if (
    status === "PENDING" ||
    status === "PROCESSING" ||
    status === "SHIPPED"
  ) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-neutral-100 text-neutral-700";
}

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.SHIPPED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

export default async function AdminOrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productName: true,
          productSlug: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  let availableStatuses = nextStatuses[order.status];

  // Unpaid orders can only be cancelled.
  // They cannot enter fulfilment.
  if (order.paymentStatus !== PaymentStatus.PAID) {
    availableStatuses = availableStatuses.filter(
      (status) => status === OrderStatus.CANCELLED
    );
  }
  // Paid orders require a verified refund before cancellation.
  if (order.paymentStatus === PaymentStatus.PAID) {
    availableStatuses = availableStatuses.filter(
      (status) => status !== OrderStatus.CANCELLED
    );
  }

  const deliveryAddress = [
    order.shippingAddress,
    order.shippingAddress2,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main>
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-950"
        >
          ← Back to orders
        </Link>

        <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">
              ORDER DETAILS
            </p>

            <h1 className="mt-2 break-all text-2xl font-serif text-neutral-900 md:text-3xl">
              {order.orderNumber}
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Placed on{" "}
              {order.createdAt.toLocaleString("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${badgeStyle(order.status)}`}
            >
              {label(order.status)}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${badgeStyle(order.paymentStatus)}`}
            >
              {label(order.paymentStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Customer information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-500">Customer name</p>
                <p className="mt-1 font-medium text-neutral-900">
                  {order.customerName}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Phone number</p>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-1 block font-medium text-neutral-900 underline underline-offset-4"
                >
                  {order.customerPhone}
                </a>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-neutral-500">Email address</p>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="mt-1 block break-all font-medium text-neutral-900 underline underline-offset-4"
                >
                  {order.customerEmail}
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Delivery information
            </h2>

            <div className="mt-5">
              <p className="text-xs text-neutral-500">Delivery address</p>
              <p className="mt-2 text-sm leading-7 text-neutral-800">
                {deliveryAddress}
              </p>
            </div>

            {order.deliveryNotes && (
              <div className="mt-5 border-t border-neutral-100 pt-5">
                <p className="text-xs text-neutral-500">
                  Delivery notes
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-800">
                  {order.deliveryNotes}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Products ordered
            </h2>

            <div className="mt-5 divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap justify-between gap-4 py-5"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {money(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium text-neutral-900">
                    {money(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="h-fit rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Order summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium text-neutral-900">
                  {money(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-neutral-500">Delivery</span>
                <span className="font-medium text-neutral-900">
                  {money(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between gap-3 border-t border-neutral-200 pt-5 text-base">
                <span className="font-semibold text-neutral-900">
                  Total
                </span>
                <span className="font-semibold text-neutral-900">
                  {money(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-5">
              <p className="text-xs text-neutral-500">Payment status</p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${badgeStyle(order.paymentStatus)}`}
              >
                {label(order.paymentStatus)}
              </span>

              <p className="mt-4 text-xs leading-6 text-neutral-500">
                Payment updates will be handled through verified payment
                integration. No manual payment confirmation is enabled.
              </p>

              {order.paymentReference && (
                <p className="mt-3 break-all text-xs text-neutral-500">
                  Payment reference: {order.paymentReference}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Fulfilment
            </h2>

            <div className="mt-5">
              <OrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
                allowedStatuses={availableStatuses}
              />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
