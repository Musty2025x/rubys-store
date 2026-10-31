
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(3000),
  category: z.string().trim().min(2).max(80),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().nullable(),
  sku: z.string().trim().max(50).nullable(),
  imageUrl: z.string().trim().url(),
  badge: z.string().trim().max(50).nullable(),
  stockQuantity: z.number().int().min(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type ProductActionResult = {
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

function parseProduct(formData: FormData) {
  return productSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    price: Number(formData.get("price")),
    compareAtPrice: String(formData.get("compareAtPrice") ?? "").trim()
      ? Number(formData.get("compareAtPrice"))
      : null,
    sku: String(formData.get("sku") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? ""),
    badge: String(formData.get("badge") ?? "").trim() || null,
    stockQuantity: Number(formData.get("stockQuantity")),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  });
}

function revalidateProductPages(productId?: string, slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function createProduct(
  formData: FormData
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return {
      success: false,
      message: "You are not authorised to perform this action.",
    };
  }

  const parsed = parseProduct(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your entries. Some fields are invalid.",
    };
  }

  try {
    const existingSlug = await prisma.product.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return {
        success: false,
        message: "This product URL slug already exists.",
      };
    }

    await prisma.product.create({
      data: parsed.data,
    });

    revalidateProductPages();

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    console.error("RUBYS product creation failed:", error);

    return {
      success: false,
      message: "Unable to create product. Check the SKU and try again.",
    };
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return {
      success: false,
      message: "You are not authorised to perform this action.",
    };
  }

  if (!productId || productId.length > 100) {
    return {
      success: false,
      message: "Invalid product identifier.",
    };
  }

  const parsed = parseProduct(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please check your entries. Some fields are invalid.",
    };
  }

  try {
    const duplicateSlug = await prisma.product.findFirst({
      where: {
        slug: parsed.data.slug,
        NOT: { id: productId },
      },
      select: { id: true },
    });

    if (duplicateSlug) {
      return {
        success: false,
        message: "Another product already uses this URL slug.",
      };
    }

    const duplicateSku = parsed.data.sku
      ? await prisma.product.findFirst({
          where: {
            sku: parsed.data.sku,
            NOT: { id: productId },
          },
          select: { id: true },
        })
      : null;

    if (duplicateSku) {
      return {
        success: false,
        message: "Another product already uses this SKU.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          slug: true,
          stockQuantity: true,
          reservedQuantity: true,
        },
      });

      if (!current) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (parsed.data.stockQuantity < current.reservedQuantity) {
        throw new Error("STOCK_BELOW_RESERVED");
      }

      const stockDifference =
        parsed.data.stockQuantity - current.stockQuantity;

      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          stockQuantity: current.stockQuantity,
          reservedQuantity: current.reservedQuantity,
        },
        data: parsed.data,
      });

      if (updated.count !== 1) {
        throw new Error("STOCK_CHANGED");
      }

      if (stockDifference !== 0) {
        await tx.inventoryMovement.create({
          data: {
            productId,
            type: stockDifference > 0 ? "RESTOCK" : "ADJUSTMENT",
            quantity: Math.abs(stockDifference),
            note: "Physical stock changed through product editing.",
          },
        });
      }

      return current.slug;
    });

    revalidateProductPages(productId, parsed.data.slug);
    revalidateProductPages(productId, result);

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return { success: false, message: "Product not found." };
      }

      if (error.message === "STOCK_BELOW_RESERVED") {
        return {
          success: false,
          message: "Physical stock cannot be lower than reserved stock.",
        };
      }

      if (error.message === "STOCK_CHANGED") {
        return {
          success: false,
          message: "Inventory changed during this update. Please try again.",
        };
      }
    }

    console.error("RUBYS product update failed:", error);

    return {
      success: false,
      message: "Unable to update product. Please try again.",
    };
  }
}

export async function deactivateProduct(
  productId: string
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return { success: false, message: "Not authorised." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    if (product.isArchived) {
      return {
        success: false,
        message: "Restore this product before changing its status.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    revalidateProductPages(productId, product.slug);

    return { success: true, message: "Product deactivated." };
  } catch (error) {
    console.error("Product deactivation failed:", error);
    return { success: false, message: "Unable to deactivate product." };
  }
}

export async function reactivateProduct(
  productId: string
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return { success: false, message: "Not authorised." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    if (product.isArchived) {
      return {
        success: false,
        message: "Restore this product before reactivating it.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: true },
    });

    revalidateProductPages(productId, product.slug);

    return { success: true, message: "Product reactivated." };
  } catch (error) {
    console.error("Product reactivation failed:", error);
    return { success: false, message: "Unable to reactivate product." };
  }
}

export async function archiveProduct(
  productId: string
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return { success: false, message: "Not authorised." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    if (product.isArchived) {
      return { success: false, message: "Product is already archived." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: false,
        isFeatured: false,
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    revalidateProductPages(productId, product.slug);

    return { success: true, message: "Product archived." };
  } catch (error) {
    console.error("Product archiving failed:", error);
    return { success: false, message: "Unable to archive product." };
  }
}

export async function restoreProduct(
  productId: string
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return { success: false, message: "Not authorised." };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    if (!product.isArchived) {
      return { success: false, message: "Product is not archived." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        isArchived: false,
        archivedAt: null,
        isActive: false,
      },
    });

    revalidateProductPages(productId, product.slug);

    return {
      success: true,
      message: "Product restored. Reactivate it when ready.",
    };
  } catch (error) {
    console.error("Product restoration failed:", error);
    return { success: false, message: "Unable to restore product." };
  }
}

export async function updateProductStock(
  productId: string,
  quantity: number
): Promise<ProductActionResult> {
  if (!(await isAdmin())) {
    return {
      success: false,
      message: "You are not authorised to update inventory.",
    };
  }

  if (
    !productId ||
    productId.length > 100 ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0 ||
    quantity > 1000000
  ) {
    return {
      success: false,
      message: "Enter a valid stock quantity between 0 and 1,000,000.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          slug: true,
          stockQuantity: true,
          reservedQuantity: true,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (quantity < product.reservedQuantity) {
        throw new Error("STOCK_BELOW_RESERVED");
      }

      const difference = quantity - product.stockQuantity;

      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          stockQuantity: product.stockQuantity,
          reservedQuantity: product.reservedQuantity,
        },
        data: {
          stockQuantity: quantity,
        },
      });

      if (updated.count !== 1) {
        throw new Error("STOCK_CHANGED");
      }

      if (difference !== 0) {
        await tx.inventoryMovement.create({
          data: {
            productId,
            type: difference > 0 ? "RESTOCK" : "ADJUSTMENT",
            quantity: Math.abs(difference),
            note: "Physical stock adjusted from the admin inventory panel.",
          },
        });
      }

      return product.slug;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/products/${result}`);

    return {
      success: true,
      message: `Stock updated successfully. New quantity: ${quantity}.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return { success: false, message: "Product not found." };
      }

      if (error.message === "STOCK_BELOW_RESERVED") {
        return {
          success: false,
          message: "Physical stock cannot be lower than reserved stock.",
        };
      }

      if (error.message === "STOCK_CHANGED") {
        return {
          success: false,
          message: "Inventory changed during this update. Please try again.",
        };
      }
    }

    console.error("RUBYS stock update failed:", error);

    return {
      success: false,
      message: "Unable to update stock. Please try again.",
    };
  }
}
