
import {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  q?: string;
  status?: string;
  payment?: string;
};

const orderStatuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

const paymentStatuses: PaymentStatus[] = [
  PaymentStatus.UNPAID,
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
];

function money(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "bg-green-100 text-green-800";

    case "CANCELLED":
    case "FAILED":
      return "bg-red-100 text-red-800";

    case "PROCESSING":
    case "SHIPPED":
    case "PENDING":
      return "bg-amber-100 text-amber-800";

    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";

  const selectedStatus = orderStatuses.find(
    (status) => status === params.status
  );

  const selectedPayment = paymentStatuses.find(
    (payment) => payment === params.payment
  );

  const where = {
    ...(query
      ? {
          OR: [
            {
              orderNumber: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              customerName: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              customerEmail: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              customerPhone: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedPayment ? { paymentStatus: selectedPayment } : {}),
  };

  const [
    orders,
    totalOrders,
    pendingOrders,
    paidOrders,
    paidRevenue,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        items: {
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),

    prisma.order.count({
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Total orders",
      value: totalOrders.toLocaleString("en-NG"),
    },
    {
      label: "Pending orders",
      value: pendingOrders.toLocaleString("en-NG"),
    },
    {
      label: "Paid orders",
      value: paidOrders.toLocaleString("en-NG"),
    },
    {
      label: "Paid revenue",
      value: money(paidRevenue._sum.total ?? 0),
    },
  ];

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-500">
            STORE MANAGEMENT
          </p>

          <h1 className="text-3xl font-serif text-neutral-900">
            Orders
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            View customer orders and manage fulfilment.
          </p>
        </div>

        <Link
          href="/admin"
          className="text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-950"
        >
          Back to dashboard
        </Link>
      </div>

      {/* Orders statistics */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <p className="text-xs text-neutral-500">
              {stat.label}
            </p>

            <p className="mt-3 text-2xl font-semibold text-neutral-900">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Orders table */}
      <section className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-neutral-900">
            All orders
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Showing up to 100 matching orders, newest first.
          </p>

          {/* Search and filters */}
          <form
            method="GET"
            className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px_auto_auto]"
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search order, customer, email or phone"
              className="min-w-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />

            <select
              name="status"
              defaultValue={selectedStatus ?? ""}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">
                All order statuses
              </option>

              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>

            <select
              name="payment"
              defaultValue={selectedPayment ?? ""}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">
                All payment statuses
              </option>

              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700"
            >
              Filter
            </button>

            <Link
              href="/admin/orders"
              className="rounded-lg border border-neutral-300 px-5 py-2 text-center text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Reset
            </Link>
          </form>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-neutral-800">
              No orders found.
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Order status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50"
                  >
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-800">
                        {order.customerName}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {order.customerEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {order.createdAt.toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {order.items.length}
                    </td>

                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {money(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.paymentStatus)}`}
                      >
                        {statusLabel(order.paymentStatus)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-500"
                      >
                        View order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
