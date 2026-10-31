import type { Metadata } from "next";
import ProductCard from "@/components/products/product-card";
import { getActiveProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Haircare",
  description: "Explore the RUBYS premium haircare collection.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] text-[#a0805c]">
            THE RUBYS COLLECTION
          </p>

          <h1 className="mt-6 font-serif text-5xl text-[#49382f]">
            Shop all products
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#76675d]">
            Discover haircare and beauty essentials selected for
            your everyday routine.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-y border-[#e9e0d6] py-5">
          <p className="text-sm text-[#76675d]">
            {products.length} products
          </p>

          <p className="text-xs tracking-widest text-[#76675d]">
            ALL COLLECTIONS
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-2xl text-[#49382f]">
              Our collection is being prepared.
            </h2>
            <p className="mt-4 text-sm text-[#76675d]">
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}