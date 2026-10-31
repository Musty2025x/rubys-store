import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import AddToCartButton from "@/components/cart/add-to-cart-button";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  return {
    title: product?.name ?? "Product Not Found",
    description: product?.description ?? "RUBYS haircare collection",
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/shop"
          className="text-xs tracking-widest text-[#76675d]"
        >
          ← BACK TO SHOP
        </Link>

        <div className="mt-10 grid gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] bg-[#eee7dd]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-[0.3em] text-[#a0805c]">
              {product.category}
            </p>

            <h1 className="mt-5 font-serif text-5xl text-[#49382f]">
              {product.name}
            </h1>

            <p className="mt-6 text-xl text-[#49382f]">
              ₦{product.price.toLocaleString("en-NG")}
            </p>

            <p className="mt-7 text-sm leading-8 text-[#76675d]">
              {product.description}
            </p>

            <div className="mt-10 border-y border-[#e9e0d6] py-6">
              <p className="text-sm leading-7 text-[#76675d]">
                Product details, ingredients, usage instructions
                and available sizes will be added using verified
                RUBYS product information.
              </p>

              <p className="mt-3 text-xs text-[#76675d]">
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} available`
                  : "Currently out of stock"}
              </p>
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <Link
              href="/contact"
              className="mt-5 border border-[#49382f] px-8 py-5 text-center text-xs tracking-widest text-[#49382f] transition hover:bg-[#49382f] hover:text-white"
            >
              CONTACT RUBYS ABOUT THIS PRODUCT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}