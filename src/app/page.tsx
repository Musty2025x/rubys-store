import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* Announcement Bar */}
      <div className="bg-[#343b32] px-4 py-3 text-center text-xs tracking-widest text-white">
        PREMIUM AFRICAN HAIRCARE · SHOP RUBYS
      </div>

      {/* Navigation */}
      <header className="border-b border-[#e8dfd3]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

          <Link
            href="/"
            className="text-3xl font-semibold tracking-[0.2em]"
          >
            RUBYS
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/shop">Shop</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/ingredients">Ingredients</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <Link
            href="/cart"
            className="border border-[#49382f] px-5 py-2 text-sm"
          >
            Shopping Bag
          </Link>

        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">

        <div>
          <p className="mb-6 text-xs tracking-[0.3em] text-[#a0805c]">
            THE BEAUTY OF NATURAL HAIR
          </p>

          <h1 className="max-w-xl text-5xl leading-tight md:text-7xl">
            Nature meets the art of beautiful hair.
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-[#76675d]">
            Discover thoughtfully crafted African haircare
            essentials designed to nourish, protect and
            celebrate your natural beauty.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-[#49382f] px-8 py-4 text-sm text-white hover:bg-[#343b32]"
            >
              Shop Collection
            </Link>

            <Link
              href="/about"
              className="border border-[#49382f] px-8 py-4 text-sm"
            >
              Discover RUBYS
            </Link>
          </div>
        </div>

        <div className="flex min-h-[420px] items-center justify-center bg-[#eee4d8] p-12">
          <div className="text-center">
            <p className="text-5xl tracking-[0.2em]">RUBYS</p>
            <p className="mt-4 text-xs tracking-[0.3em]">
              BEAUTY ROOTED IN NATURE
            </p>
          </div>
        </div>

      </section>

      {/* Brand Values */}
      <section className="bg-[#343b32] px-6 py-16 text-center text-white">

        <p className="text-xs tracking-[0.3em]">
          THE RUBYS PHILOSOPHY
        </p>

        <h2 className="mt-5 text-3xl">
          Care. Nourish. Celebrate.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#e0d8cc]">
          Bringing the richness of African-inspired haircare
          into your everyday beauty ritual.
        </p>

      </section>

      {/* Footer */}
      <footer className="px-6 py-12 text-center">

        <h2 className="text-2xl tracking-[0.2em]">
          RUBYS
        </h2>

        <p className="mt-3 text-sm text-[#76675d]">
          Premium African Haircare.
        </p>

        <p className="mt-8 text-xs text-[#76675d]">
          © {new Date().getFullYear()} RUBYS. All rights reserved.
        </p>

      </footer>

    </main>
  );
}