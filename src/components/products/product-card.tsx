import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import AddToCartButton from "@/components/cart/add-to-cart-button";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eee7dd]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          {product.badge && (
            <span className="absolute left-3 top-3 bg-[#f8f5ef] px-3 py-2 text-[9px] uppercase tracking-widest">
              {product.badge}
            </span>
          )}

          {product.stockQuantity === 0 && (
            <span className="absolute bottom-3 left-3 bg-[#49382f] px-3 py-2 text-[9px] uppercase tracking-widest text-white">
              Out of stock
            </span>
          )}
        </div>

        <div className="pt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0805c]">
            {product.category}
          </p>

          <h3 className="mt-2 text-lg text-[#49382f]">
            {product.name}
          </h3>

          <p className="mt-2 text-sm text-[#76675d]">
            ₦{product.price.toLocaleString("en-NG")}
          </p>
        </div>
      </Link>

      <div className="mt-4">
        <AddToCartButton product={product} />
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="mt-4 inline-block border-b border-[#49382f] pb-1 text-xs tracking-widest hover:text-[#b99a75]"
      >
        VIEW PRODUCT
      </Link>
    </article>
  );
}