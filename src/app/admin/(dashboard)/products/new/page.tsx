import ProductForm from "@/components/admin/product-form";

export const metadata = {
  title: "Add Product | RUBYS Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewProductPage() {
  return <ProductForm />;
}