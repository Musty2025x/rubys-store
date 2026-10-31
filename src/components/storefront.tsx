import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { collections, products } from "@/lib/store-data";

function Header() {
  return (
    <>
      <div className="bg-[#343b32] px-4 py-3 text-center text-[10px] tracking-[0.2em] text-white">
        DISCOVER THE BEAUTY OF AFRICAN HAIRCARE
      </div>

      <header className="sticky top-0 z-50 border-b border-[#e9e0d5] bg-[#f8f5ef]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <Link href="/" className="font-serif text-3xl tracking-[0.2em]">
            RUBYS
          </Link>

          <div className="hidden items-center gap-8 text-xs tracking-wider md:flex">
            <Link href="#collections">COLLECTIONS</Link>
            <Link href="#bestsellers">BESTSELLERS</Link>
            <Link href="#story">OUR STORY</Link>
            <Link href="#journal">JOURNAL</Link>
          </div>

          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="flex items-center gap-2 text-sm"
          >
            <ShoppingBag size={19} />
            <span className="hidden sm:inline">BAG</span>
          </Link>

        </nav>
      </header>
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-[#e9dfd1]">

      <Image
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1800&q=90"
        alt="Beauty editorial photography"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-20">

        <div className="max-w-2xl text-white">

          <p className="text-xs tracking-[0.35em]">
            PREMIUM AFRICAN HAIRCARE
          </p>

          <h1 className="mt-7 font-serif text-6xl leading-[1.1] md:text-8xl">
            A beautiful ritual.
            <br />
            Naturally yours.
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-8 text-white/90">
            Discover thoughtfully curated haircare essentials
            inspired by the richness of African beauty.
          </p>

          <Link
            href="#bestsellers"
            className="mt-9 inline-flex items-center gap-4 bg-[#f4ede3] px-9 py-4 text-xs tracking-widest text-[#49382f] hover:bg-white"
          >
            EXPLORE THE COLLECTION
            <ArrowRight size={16} />
          </Link>

        </div>
      </div>
    </section>
  );
}

function CollectionSection() {
  return (
    <section id="collections" className="mx-auto max-w-7xl px-6 py-24">

      <div className="mb-12 text-center">
        <p className="text-xs tracking-[0.3em] text-[#a0805c]">
          DISCOVER RUBYS
        </p>

        <h2 className="mt-4 font-serif text-4xl md:text-5xl">
          Explore our collections
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {collections.map((collection) => (
          <Link
            href="#bestsellers"
            key={collection.name}
            className="group"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e9dfd1]">

              <Image
                src={collection.image}
                alt={collection.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

            </div>

            <h3 className="mt-5 font-serif text-2xl">
              {collection.name}
            </h3>

            <p className="mt-2 text-sm text-[#76675d]">
              {collection.description}
            </p>

          </Link>
        ))}

      </div>
    </section>
  );
}

function ProductCard({
  product,
}: {
  product: (typeof products)[number];
}) {
  return (
    <article className="group">

      <div className="relative aspect-[4/5] overflow-hidden bg-[#eee5da]">

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />

        {product.label && (
          <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[9px] tracking-widest">
            {product.label}
          </span>
        )}

      </div>

      <div className="pt-5">

        <p className="text-[10px] tracking-widest text-[#a0805c]">
          {product.category.toUpperCase()}
        </p>

        <h3 className="mt-2 font-serif text-xl">
          {product.name}
        </h3>

        <p className="mt-2 text-sm text-[#76675d]">
          {product.description}
        </p>

        <p className="mt-4 text-sm font-medium">
          ₦{product.price.toLocaleString("en-NG")}
        </p>

      </div>
    </article>
  );
}

function BestSellers() {
  return (
    <section id="bestsellers" className="bg-[#f0e9df] px-6 py-24">

      <div className="mx-auto max-w-7xl">

        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">

          <div>
            <p className="text-xs tracking-[0.3em] text-[#a0805c]">
              THE RUBYS EDIT
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Our favourites
            </h2>
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-3 text-xs tracking-widest"
          >
            VIEW ALL PRODUCTS
            <ArrowRight size={16} />
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">

          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

        </div>

      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section id="story" className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">

      <div className="relative aspect-[4/5] overflow-hidden bg-[#eee5da]">

        <Image
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=85"
          alt="Beauty editorial portrait"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />

      </div>

      <div className="max-w-xl">

        <p className="text-xs tracking-[0.3em] text-[#a0805c]">
          THE WORLD OF RUBYS
        </p>

        <h2 className="mt-5 font-serif text-5xl leading-tight">
          Beauty rooted in nature.
        </h2>

        <p className="mt-7 text-sm leading-8 text-[#76675d]">
          RUBYS celebrates the beauty and richness of African
          haircare through thoughtfully developed products
          and meaningful everyday rituals.
        </p>

        <Link
          href="/about"
          className="mt-9 inline-flex items-center gap-3 border-b border-[#49382f] pb-2 text-xs tracking-widest"
        >
          DISCOVER OUR STORY
          <ArrowRight size={16} />
        </Link>

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#343b32] px-6 py-16 text-white">

      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">

        <div>
          <h2 className="font-serif text-4xl tracking-[0.2em]">
            RUBYS
          </h2>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/70">
            Premium African haircare, inspired by nature
            and designed for beautiful haircare rituals.
          </p>
        </div>

        <div>
          <h3 className="text-xs tracking-widest">EXPLORE</h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white/70">
            <Link href="#collections">Collections</Link>
            <Link href="#bestsellers">Shop</Link>
            <Link href="#story">Our Story</Link>
            <Link href="#journal">Journal</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-widest">CUSTOMER CARE</h3>

          <div className="mt-6 flex flex-col gap-4 text-sm text-white/70">
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/20 pt-7 text-xs text-white/60">
        © {new Date().getFullYear()} RUBYS. All rights reserved.
      </div>

    </footer>
  );
}

export default function Storefront() {
  return (
    <>
      <Header />
      <Hero />
      <CollectionSection />
      <BestSellers />
      <BrandStory />
      <Footer />
    </>
  );
}