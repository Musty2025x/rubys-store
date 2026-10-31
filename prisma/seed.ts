import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString =
  process.env.APP_DATABASE_URL ??
  process.env.DATABASE_URL_POOLED ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    id: "rubys-hair-oil",
    slug: "rubys-hair-oil",
    name: "Nourishing Hair Oil",
    category: "Hair Oils",
    description: "A premium hair oil collection.",
    price: 18500,
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",
    badge: "Bestseller",
    stockQuantity: 20,
    isActive: true,
    isFeatured: true,
  },
  {
    id: "rubys-shampoo",
    slug: "rubys-shampoo",
    name: "Gentle Cleansing Shampoo",
    category: "Shampoo",
    description: "A gentle hair cleansing essential.",
    price: 22000,
    imageUrl:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
    badge: "New",
    stockQuantity: 11,
    isActive: true,
    isFeatured: false,
  },
  {
    id: "rubys-conditioner",
    slug: "rubys-conditioner",
    name: "Hydrating Conditioner",
    category: "Conditioner",
    description: "An everyday conditioning essential.",
    price: 20000,
    imageUrl:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=85",
    stockQuantity: 13,
    isActive: true,
    isFeatured: false,
  },
  {
    id: "rubys-hair-accessory",
    slug: "rubys-hair-accessory",
    name: "Luxury Haircare Essentials",
    category: "Accessories",
    description:
      "Thoughtful accessories for your haircare routine.",
    price: 12500,
    imageUrl:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85",
    stockQuantity: 3,
    isActive: true,
    isFeatured: false,
  },
];

async function main() {
  console.log("Starting RUBYS product seed...");

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        badge: product.badge,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      },
      create: product,
    });

    console.log(`Seeded: ${product.name}`);
  }

  console.log("RUBYS product catalogue seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
