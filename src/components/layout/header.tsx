import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import CartCount from "@/components/cart/cart-count";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Our Story", href: "/#story" },
  { name: "Ingredients", href: "/#ingredients" },
  { name: "Journal", href: "/#journal" },
];

export default function Header() {
  return (
    <>
      <div className="bg-[#343b32] px-4 py-3 text-center text-[10px] tracking-[0.2em] text-white sm:text-xs">
        DISCOVER THE BEAUTY OF PREMIUM AFRICAN HAIRCARE
      </div>

      <header className="sticky top-0 z-50 border-b border-[#e9e0d6] bg-[#f8f5ef]/95 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="text-3xl font-semibold tracking-[0.22em]">
            RUBYS
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs tracking-widest text-[#49382f] transition hover:text-[#b99a75]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="flex items-center gap-2 text-sm"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <CartCount />
            </Link>

            <details className="relative md:hidden">
              <summary className="list-none cursor-pointer">
                <Menu size={23} />
              </summary>

              <div className="absolute right-0 top-10 w-56 border border-[#e9e0d6] bg-[#f8f5ef] p-5 shadow-lg">
                <div className="flex flex-col gap-5">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </nav>
      </header>
    </>
  );
}