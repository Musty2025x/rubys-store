import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/products/product-card";
import { getFeaturedProducts } from "@/lib/products";
import {
  ArrowRight,
  Leaf,
  Heart,
  Sparkles,
} from "lucide-react";

const collections = [
  {
    name: "Hair Oils",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Hair Treatments",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Hair Accessories",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getFeaturedProducts();
  return (
    <main className="bg-[#f8f5ef]">

      {/* HERO */}

      <section className="grid min-h-[650px] md:grid-cols-2">

        <div className="flex items-center px-7 py-20 md:px-16 lg:px-24">

          <div className="max-w-xl">

            <p className="text-xs tracking-[0.35em] text-[#a0805c]">
              THE RUBYS EXPERIENCE
            </p>

            <h1 className="mt-8 font-serif text-5xl leading-[1.15] text-[#49382f] md:text-7xl">
              A beautiful ritual begins with your hair.
            </h1>

            <p className="mt-7 max-w-md text-sm leading-8 text-[#76675d]">
              Discover premium African-inspired haircare
              essentials thoughtfully curated for your
              everyday beauty ritual.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                href="/shop"
                className="bg-[#49382f] px-8 py-4 text-xs tracking-widest text-white transition hover:bg-[#343b32]"
              >
                SHOP THE COLLECTION
              </Link>

              <Link
                href="/#story"
                className="border border-[#49382f] px-8 py-4 text-xs tracking-widest text-[#49382f] transition hover:bg-[#49382f] hover:text-white"
              >
                OUR STORY
              </Link>

            </div>

          </div>

        </div>

        <div className="relative min-h-[450px] bg-[#e9ded0]">

          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=90"
            alt="Beauty and natural hair editorial photography"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />

        </div>

      </section>

      {/* BRAND INTRODUCTION */}

      <section
        id="story"
        className="px-6 py-24 text-center"
      >

        <p className="text-xs tracking-[0.35em] text-[#a0805c]">
          WELCOME TO RUBYS
        </p>

        <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-[#49382f] md:text-5xl">
          Where the richness of African beauty meets
          thoughtful haircare.
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-[#76675d]">
          We believe haircare should be more than a routine.
          It should be an experience rooted in care,
          confidence and appreciation for natural beauty.
        </p>

        <Link
          href="/#ingredients"
          className="mt-8 inline-flex items-center gap-2 border-b border-[#49382f] pb-2 text-xs tracking-widest"
        >
          DISCOVER OUR PHILOSOPHY
          <ArrowRight size={14} />
        </Link>

      </section>

      {/* COLLECTIONS */}

      <section className="bg-[#eee7dd] px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">

            <div>
              <p className="text-xs tracking-[0.3em] text-[#a0805c]">
                EXPLORE RUBYS
              </p>

              <h2 className="mt-4 font-serif text-4xl text-[#49382f] md:text-5xl">
                Shop by collection
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-xs tracking-widest text-[#49382f]"
            >
              VIEW ALL PRODUCTS →
            </Link>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {collections.map((collection) => (

              <Link
                href="/shop"
                key={collection.name}
                className="group relative"
              >

                <div className="relative aspect-[4/5] overflow-hidden">

                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/35" />

                  <div className="absolute bottom-8 left-8 text-white">

                    <h3 className="font-serif text-3xl">
                      {collection.name}
                    </h3>

                    <p className="mt-3 text-xs tracking-widest">
                      EXPLORE COLLECTION →
                    </p>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* BEST SELLERS */}

      <section className="px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-xs tracking-[0.3em] text-[#a0805c]">
              THE RUBYS EDIT
            </p>

            <h2 className="mt-5 font-serif text-4xl text-[#49382f] md:text-5xl">
              Discover our collection
            </h2>

            <p className="mt-4 text-sm text-[#76675d]">
              Explore our haircare and beauty essentials.
            </p>

          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-[#76675d]">
                Our featured collection is being prepared.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block text-xs tracking-widest text-[#49382f] underline underline-offset-4"
              >
                EXPLORE ALL PRODUCTS
              </Link>
            </div>
          )}

          <div className="mt-14 text-center">

            <Link
              href="/shop"
              className="inline-block bg-[#49382f] px-10 py-4 text-xs tracking-widest text-white transition hover:bg-[#343b32]"
            >
              SHOP ALL PRODUCTS
            </Link>

          </div>

        </div>

      </section>

      {/* BRAND VALUES */}

      <section
        id="ingredients"
        className="bg-[#343b32] px-6 py-24 text-[#f8f5ef]"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-xs tracking-[0.3em] text-[#c9ae8b]">
              THE RUBYS PHILOSOPHY
            </p>

            <h2 className="mt-5 font-serif text-4xl md:text-5xl">
              Beauty in every ritual.
            </h2>

          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3">

            <div className="text-center">

              <Leaf className="mx-auto h-9 w-9 text-[#c9ae8b]" />

              <h3 className="mt-6 font-serif text-2xl">
                Nature Inspired
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#d5cabe]">
                An appreciation for African beauty traditions
                and thoughtfully selected ingredients.
              </p>

            </div>

            <div className="text-center">

              <Heart className="mx-auto h-9 w-9 text-[#c9ae8b]" />

              <h3 className="mt-6 font-serif text-2xl">
                Thoughtful Care
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#d5cabe]">
                Making self-care a meaningful part of
                your everyday routine.
              </p>

            </div>

            <div className="text-center">

              <Sparkles className="mx-auto h-9 w-9 text-[#c9ae8b]" />

              <h3 className="mt-6 font-serif text-2xl">
                Premium Experience
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#d5cabe]">
                A considered approach to product presentation,
                service and customer experience.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* EDITORIAL IMAGE SECTION */}

      <section className="grid md:grid-cols-2">

        <div className="relative min-h-[400px]">

          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
            alt="Beauty editorial portrait"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />

        </div>

        <div className="flex items-center px-8 py-20 md:px-20">

          <div>

            <p className="text-xs tracking-[0.3em] text-[#a0805c]">
              YOUR BEAUTY, YOUR RITUAL
            </p>

            <h2 className="mt-6 font-serif text-4xl leading-tight text-[#49382f] md:text-5xl">
              Make every day a little more beautiful.
            </h2>

            <p className="mt-6 text-sm leading-8 text-[#76675d]">
              Explore a collection designed to make your
              haircare experience feel intentional,
              effortless and special.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block border-b border-[#49382f] pb-2 text-xs tracking-widest"
            >
              EXPLORE THE COLLECTION →
            </Link>

          </div>

        </div>

      </section>

      {/* JOURNAL */}

      <section id="journal" className="px-6 py-24">

        <div className="mx-auto max-w-7xl text-center">

          <p className="text-xs tracking-[0.3em] text-[#a0805c]">
            THE RUBYS JOURNAL
          </p>

          <h2 className="mt-5 font-serif text-4xl text-[#49382f] md:text-5xl">
            A little more about haircare.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#76675d]">
            Discover educational stories, haircare routines
            and inspiration for your everyday beauty rituals.
          </p>

          <Link
            href="/journal"
            className="mt-8 inline-block border-b border-[#49382f] pb-2 text-xs tracking-widest"
          >
            EXPLORE THE JOURNAL →
          </Link>

        </div>

      </section>

      {/* NEWSLETTER */}

      <section className="bg-[#eee7dd] px-6 py-20 text-center">

        <p className="text-xs tracking-[0.3em] text-[#a0805c]">
          STAY CONNECTED
        </p>

        <h2 className="mt-5 font-serif text-4xl text-[#49382f]">
          A little beauty in your inbox.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#76675d]">
          Be the first to discover new collections,
          brand stories and haircare inspiration.
        </p>

        <Link
          href="/contact"
          className="mt-8 inline-block bg-[#49382f] px-9 py-4 text-xs tracking-widest text-white"
        >
          CONNECT WITH RUBYS
        </Link>

      </section>

    </main>
  );
}