
"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getShippingQuote } from "@/lib/shipping";
import {
  getReservationExpiry,
  releaseExpiredReservations,
} from "@/lib/inventory";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().min(7).max(25),
  shippingAddress: z.string().trim().min(5).max(250),
  shippingAddress2: z.string().trim().max(250).optional(),
  shippingCity: z.string().trim().min(2).max(100),
  shippingState: z.string().trim().min(2).max(100),
  shippingPostalCode: z.string().trim().max(20).optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1).max(100),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1).max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult = {
  success: boolean;
  message: string;
  orderNumber?: string;
  subtotal?: number;
  shippingFee?: number;
  total?: number;
  reservationExpiresAt?: string;
};

export async function createGuestOrder(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your contact and delivery information.",
    };
  }

  const data = parsed.data;

  const shippingQuote = getShippingQuote(data.shippingState);

  if (!shippingQuote) {
    return {
      success: false,
      message:
        "Delivery is currently available in Lagos and Abuja only. Please contact RUBYS for other locations.",
    };
  }

  // Release expired reservations before checking available stock.
  await releaseExpiredReservations();

  // Combine repeated product IDs.
  const quantities = new Map<string, number>();

  for (const item of data.items) {
    const nextQuantity =
      (quantities.get(item.productId) ?? 0) + item.quantity;

    if (nextQuantity > 100) {
      return {
        success: false,
        message: "The requested quantity is too large.",
      };
    }

    quantities.set(item.productId, nextQuantity);
  }

  const orderItems = [...quantities.entries()].map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    })
  );

  const orderNumber =
    `RUB-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  const reservationExpiresAt = getReservationExpiry();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: orderItems.map((item) => item.productId),
          },
          isActive: true,
          isArchived: false,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stockQuantity: true,
          reservedQuantity: true,
        },
      });

      if (products.length !== orderItems.length) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }

      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      let subtotal = 0;

      const verifiedItems = orderItems.map((item) => {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_UNAVAILABLE");
        }

        const availableStock =
          product.stockQuantity - product.reservedQuantity;

        if (availableStock < item.quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const lineTotal = product.price * item.quantity;

        if (!Number.isSafeInteger(lineTotal)) {
          throw new Error("INVALID_ORDER_TOTAL");
        }

        subtotal += lineTotal;

        return {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          quantity: item.quantity,
          unitPrice: product.price,
          lineTotal,
        };
      });

      const total = subtotal + shippingQuote.fee;

      if (!Number.isSafeInteger(total)) {
        throw new Error("INVALID_ORDER_TOTAL");
      }

      // Reserve stock atomically.
      // The snapshot values prevent two concurrent orders from
      // reserving the same available units.
      for (const item of verifiedItems) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error("PRODUCT_UNAVAILABLE");
        }

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            isArchived: false,
            stockQuantity: product.stockQuantity,
            reservedQuantity: product.reservedQuantity,
          },
          data: {
            reservedQuantity: {
              increment: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new Error("STOCK_CHANGED");
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail.toLowerCase(),
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          shippingAddress2: data.shippingAddress2 || null,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingPostalCode: data.shippingPostalCode || null,
          deliveryNotes: data.deliveryNotes || null,
          currency: "NGN",
          subtotal,
          shippingFee: shippingQuote.fee,
          total,
          status: "PENDING",
          paymentStatus: "UNPAID",
          stockReserved: true,
          reservationExpiresAt,
          items: {
            create: verifiedItems,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          subtotal: true,
          shippingFee: true,
          total: true,
        },
      });

      // Record each reservation for inventory auditing.
      await tx.inventoryMovement.createMany({
        data: verifiedItems.map((item) => ({
          productId: item.productId,
          orderId: order.id,
          type: "RESERVATION" as const,
          quantity: item.quantity,
          note: "30-minute checkout stock reservation.",
        })),
      });

      return order;
    });

    return {
      success: true,
      message:
        "Your order has been created. Your selected items are reserved for 30 minutes while payment is arranged.",
      orderNumber: result.orderNumber,
      subtotal: result.subtotal,
      shippingFee: result.shippingFee,
      total: result.total,
      reservationExpiresAt: reservationExpiresAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_UNAVAILABLE") {
        return {
          success: false,
          message:
            "One or more products are no longer available. Please review your shopping bag.",
        };
      }

      if (
        error.message === "INSUFFICIENT_STOCK" ||
        error.message === "STOCK_CHANGED"
      ) {
        return {
          success: false,
          message:
            "Stock availability has changed. Please review your shopping bag and try again.",
        };
      }
    }

    console.error("RUBYS guest order creation failed:", error);

    return {
      success: false,
      message: "We could not create your order. Please try again.",
    };
  }
}
