import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditProductForm from "@/components/admin/edit-product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Product | RUBYS Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !session?.user?.email ||
    session.user.email.toLowerCase() !== adminEmail
  ) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        imageUrl: product.imageUrl,
        badge: product.badge,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      }}
    />
  );
}