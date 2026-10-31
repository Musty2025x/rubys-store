
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";

const statusSchema = z.enum([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export type OrderActionResult = {
  success: boolean;
  message: string;
};

async function isAdmin() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(
    session?.user?.email &&
      session.user.email.toLowerCase() === adminEmail
  );
}

function refreshOrderPages(orderId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");

  if (orderId) {
    revalidatePath(`/admin/orders/${orderId}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateOrderStatus(
  formData: FormData
): Promise<OrderActionResult> {
  if (!(await isAdmin())) {
    return {
      success: false,
      message: "You are not authorised to update orders.",
    };
  }

  const orderId = String(formData.get("orderId") ?? "");

  const parsedStatus = statusSchema.safeParse(
    String(formData.get("status") ?? "")
  );

  if (
    !z.string().min(1).max(100).safeParse(orderId).success ||
    !parsedStatus.success
  ) {
    return {
      success: false,
      message: "Invalid order or status.",
    };
  }

  const nextStatus = parsedStatus.data;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          stockReserved: true,
          reservationExpiresAt: true,
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (
        nextStatus !== OrderStatus.CANCELLED &&
        order.paymentStatus !== PaymentStatus.PAID
      ) {
        throw new Error("PAYMENT_REQUIRED");
      }

      if (
        nextStatus === OrderStatus.CANCELLED &&
        order.paymentStatus === PaymentStatus.PAID
      ) {
        throw new Error("REFUND_REQUIRED");
      }

      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [
          OrderStatus.CONFIRMED,
          OrderStatus.CANCELLED,
        ],
        CONFIRMED: [
          OrderStatus.PROCESSING,
          OrderStatus.CANCELLED,
        ],
        PROCESSING: [
          OrderStatus.SHIPPED,
        ],
        SHIPPED: [
          OrderStatus.DELIVERED,
        ],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!allowedTransitions[order.status].includes(nextStatus)) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      // Claim the status change. A concurrent update cannot
      // claim the same previous order state.
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: order.status,
          stockReserved: order.stockReserved,
        },
        data: {
          status: nextStatus,
          ...(nextStatus === OrderStatus.CANCELLED
            ? {
                stockReserved: false,
                reservationExpiresAt: null,
              }
            : {}),
        },
      });

      if (updated.count !== 1) {
        throw new Error("ORDER_CHANGED");
      }

      if (nextStatus === OrderStatus.CANCELLED) {
        // Check whether this order ever used the reservation system.
        const reservationHistory =
          await tx.inventoryMovement.findFirst({
            where: {
              orderId: order.id,
              type: "RESERVATION",
            },
            select: {
              id: true,
            },
          });

        for (const item of order.items) {
          if (order.stockReserved) {
            // Active reservation: release reserved stock.
            const released = await tx.product.updateMany({
              where: {
                id: item.productId,
                reservedQuantity: {
                  gte: item.quantity,
                },
              },
              data: {
                reservedQuantity: {
                  decrement: item.quantity,
                },
              },
            });

            if (released.count !== 1) {
              throw new Error("RESERVED_STOCK_INCONSISTENCY");
            }

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                orderId: order.id,
                type: "RELEASE",
                quantity: item.quantity,
                note: "Stock released after order cancellation.",
              },
            });
          } else if (!reservationHistory) {
            // Genuine legacy order: physical stock was deducted
            // during checkout, so restore it.
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                orderId: order.id,
                type: "RESTOCK",
                quantity: item.quantity,
                note:
                  "Legacy order cancelled; previously deducted stock restored.",
              },
            });
          }

          // If reservation history exists but stockReserved is false,
          // the reservation was already released (for example, expiry).
          // Do not restore physical stock a second time.
        }
      }
    });

    refreshOrderPages(orderId);

    return {
      success: true,
      message:
        nextStatus === OrderStatus.CANCELLED
          ? "Order cancelled and its inventory released or restored."
          : "Order status updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "ORDER_NOT_FOUND":
          return {
            success: false,
            message: "Order not found.",
          };

        case "PAYMENT_REQUIRED":
          return {
            success: false,
            message:
              "Payment must be successfully verified before this order can be confirmed or fulfilled.",
          };

        case "REFUND_REQUIRED":
          return {
            success: false,
            message:
              "This order has been paid. Process and verify the refund before cancelling it.",
          };

        case "INVALID_STATUS_TRANSITION":
          return {
            success: false,
            message:
              "This order cannot move to the selected status.",
          };

        case "ORDER_CHANGED":
          return {
            success: false,
            message:
              "This order was updated elsewhere. Refresh and try again.",
          };

        case "RESERVED_STOCK_INCONSISTENCY":
          return {
            success: false,
            message:
              "The reserved inventory does not match this order. No changes were committed. Please investigate the inventory records.",
          };
      }
    }

    console.error("RUBYS order status update failed:", error);

    return {
      success: false,
      message: "Unable to update this order. Please try again.",
    };
  }
}
