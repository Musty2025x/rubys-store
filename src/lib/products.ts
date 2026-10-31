
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

function formatProduct(product: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  badge: string | null;
  stockQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  archivedAt: Date | null;
}): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    image: product.imageUrl,
    badge: product.badge,
    stockQuantity: Math.max(
      0,
      product.stockQuantity - product.reservedQuantity
    ),
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isArchived: product.isArchived,
    archivedAt: product.archivedAt,
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isArchived: false,
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
  });

  return products.map(formatProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isArchived: false,
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map(formatProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      isArchived: false,
    },
  });

  return product ? formatProduct(product) : null;
}
