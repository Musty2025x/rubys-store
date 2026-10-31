
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cartSchema = z.array(
  z.object({
    productId: z.string().min(1).max(100),
  })
).max(100);

export type InventorySnapshot = {
  id: string;
  stockQuantity: number;
  isActive: boolean;
  isArchived: boolean;
  price: number;
};

export type InventoryValidationResult = {
  success: boolean;
  products: InventorySnapshot[];
  missingProductIds: string[];
  message?: string;
};

export async function validateCartInventory(
  cartItems: { productId: string }[]
): Promise<InventoryValidationResult> {
  const parsed = cartSchema.safeParse(cartItems);

  if (!parsed.success) {
    return {
      success: false,
      products: [],
      missingProductIds: [],
      message: "Invalid cart information.",
    };
  }

  const productIds = [
    ...new Set(parsed.data.map((item) => item.productId)),
  ];

  if (productIds.length === 0) {
    return {
      success: true,
      products: [],
      missingProductIds: [],
    };
  }

  try {
    const databaseProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        stockQuantity: true,
        reservedQuantity: true,
        isActive: true,
        isArchived: true,
        price: true,
      },
    });

    const products: InventorySnapshot[] = databaseProducts.map(
      (product) => ({
        id: product.id,
        stockQuantity:
          product.isActive && !product.isArchived
            ? Math.max(
                0,
                product.stockQuantity - product.reservedQuantity
              )
            : 0,
        isActive: product.isActive,
        isArchived: product.isArchived,
        price: product.price,
      })
    );

    const foundIds = new Set(products.map((product) => product.id));

    const missingProductIds = productIds.filter(
      (id) => !foundIds.has(id)
    );

    return {
      success: true,
      products,
      missingProductIds,
    };
  } catch (error) {
    console.error("RUBYS inventory validation failed:", error);

    return {
      success: false,
      products: [],
      missingProductIds: [],
      message: "Unable to verify current inventory. Please try again.",
    };
  }
}
