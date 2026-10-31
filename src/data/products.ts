export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "rubys-hair-oil",
    name: "Nourishing Hair Oil",
    category: "Hair Oils",
    description: "A premium hair oil collection.",
    price: 18500,
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",
    badge: "Bestseller",
  },
  {
    id: "rubys-shampoo",
    name: "Gentle Cleansing Shampoo",
    category: "Shampoo",
    description: "A gentle hair cleansing essential.",
    price: 22000,
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
    badge: "New",
  },
  {
    id: "rubys-conditioner",
    name: "Hydrating Conditioner",
    category: "Conditioner",
    description: "An everyday conditioning essential.",
    price: 20000,
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "rubys-hair-accessory",
    name: "Luxury Haircare Essentials",
    category: "Accessories",
    description: "Thoughtful accessories for your haircare routine.",
    price: 12500,
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85",
  },
];