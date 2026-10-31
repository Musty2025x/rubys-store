import Link from "next/link";
import { Package, PlusCircle, Warehouse, ArrowUpRight } from "lucide-react";

const sections = [
  {
    title: "Products",
    description: "View and manage your store products.",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Add Product",
    description: "Add a new product to the RUBYS catalogue.",
    icon: PlusCircle,
    href: "/admin/products/new",
  },
  {
    title: "Inventory",
    description: "Monitor and update product stock.",
    icon: Warehouse,
    href: "/admin/products",
  },
];

export default function AdminDashboard() {
  return (
    <main>
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-500">
          STORE MANAGEMENT
        </p>

        <h1 className="text-3xl font-serif text-neutral-900">
          Welcome to RUBYS Admin
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Manage your products, inventory and storefront.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.title}
              href={section.href}
              className="group rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <Icon className="h-7 w-7 text-neutral-700" />
                <ArrowUpRight className="h-5 w-5 text-neutral-400 transition group-hover:text-neutral-900" />
              </div>

              <h2 className="text-lg font-semibold">
                {section.title}
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
