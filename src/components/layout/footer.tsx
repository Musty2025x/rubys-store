import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#343b32] px-6 py-16 text-[#f8f5ef]">

      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">

        <div className="md:col-span-2">
          <h2 className="text-4xl tracking-[0.2em]">
            RUBYS
          </h2>

          <p className="mt-5 max-w-sm text-sm leading-8 text-[#d5cabe]">
            Premium African haircare, inspired by the
            richness of nature and the beauty of self-care.
          </p>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em]">
            EXPLORE
          </h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-[#d5cabe]">
            <Link href="/shop">Shop All</Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#ingredients">Ingredients</Link>
            <Link href="/#journal">Haircare Journal</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.2em]">
            CUSTOMER CARE
          </h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-[#d5cabe]">
            <Link href="/contact">Contact Us</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/20 pt-8 text-xs text-[#d5cabe]">
        © {new Date().getFullYear()} RUBYS. All rights reserved.
      </div>

    </footer>
  );
}