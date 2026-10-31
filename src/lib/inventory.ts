
import { prisma } from "@/lib/prisma";

const RESERVATION_MINUTES = 30;

/**
 * Release reservations that have expired.
 *
 * Each order is processed transactionally. The conditional order update
 * ensures that two concurrent cleanup requests cannot release the same
 * reservation twice.
 */
export async function releaseExpiredReservations() {
  const expiredOrders = await prisma.order.findMany({
    where: {
      stockReserved: true,
      reservationExpiresAt: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
    take: 100,
    orderBy: {
      reservationExpiresAt: "asc",
    },
  });

  let releasedCount = 0;

  for (const order of expiredOrders) {
    try {
      const released = await prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: {
            id: order.id,
            stockReserved: true,
            reservationExpiresAt: {
              lte: new Date(),
            },
          },
          data: {
            stockReserved: false,
            reservationExpiresAt: null,
          },
        });

        if (claimed.count !== 1) {
          return false;
        }

        for (const item of order.items) {
          const productUpdate = await tx.product.updateMany({
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

          if (productUpdate.count !== 1) {
            throw new Error("RESERVED_STOCK_INCONSISTENCY");
          }

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: "RELEASE",
              quantity: item.quantity,
              note: "Expired 30-minute stock reservation released.",
            },
          });
        }

        return true;
      });

      if (released) {
        releasedCount += 1;
      }
    } catch (error) {
      console.error(
        `Failed to release reservation for order ${order.id}:`,
        error
      );
    }
  }

  return releasedCount;
}

/**
 * Return the reservation expiry timestamp for a new order.
 */
export function getReservationExpiry() {
  return new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
}
