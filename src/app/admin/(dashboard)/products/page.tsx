import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductManagement from "@/components/admin/product-management";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !session?.user?.email ||
    session.user.email.toLowerCase() !== adminEmail
  ) {
    redirect("/admin/login");
  }

  const databaseProducts = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const products = databaseProducts.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    image: product.imageUrl,
    badge: product.badge,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isArchived: product.isArchived,
    archivedAt: product.archivedAt,
  }));

  return <ProductManagement products={products} />;
}