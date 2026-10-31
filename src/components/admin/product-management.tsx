
"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Filter,
  Save,
  X,
} from "lucide-react";

import {
  deactivateProduct,
  reactivateProduct,
  archiveProduct,
  restoreProduct,
  updateProductStock,
} from "@/app/admin/(dashboard)/products/actions";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
};

type Props = {
  products: Product[];
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function ProductManagement({ products }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [message, setMessage] = useState("");

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState("");

  const [isPending, startTransition] = useTransition();

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category))),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStatus =
        status === "All" ||
        (status === "Active" && product.isActive && !product.isArchived) ||
        (status === "Inactive" && !product.isActive && !product.isArchived) ||
        (status === "Archived" && product.isArchived) ||
        (status === "Low Stock" &&
          product.stockQuantity > 0 &&
          product.stockQuantity <= 5 &&
          !product.isArchived) ||
        (status === "Out of Stock" &&
          product.stockQuantity === 0 &&
          !product.isArchived);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const activeCount = products.filter(
    (p) => p.isActive && !p.isArchived
  ).length;

  const inactiveCount = products.filter(
    (p) => !p.isActive && !p.isArchived
  ).length;

  const archivedCount = products.filter((p) => p.isArchived).length;

  const lowStockCount = products.filter(
    (p) =>
      p.stockQuantity > 0 &&
      p.stockQuantity <= 5 &&
      !p.isArchived
  ).length;

  const outOfStockCount = products.filter(
    (p) => p.stockQuantity === 0 && !p.isArchived
  ).length;

  function runAction(
    action: (id: string) => Promise<{ success: boolean; message: string }>,
    id: string,
    confirmation: string
  ) {
    if (!window.confirm(confirmation)) return;

    setMessage("");

    startTransition(async () => {
      const result = await action(id);
      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  function startStockEdit(product: Product) {
    setEditingStockId(product.id);
    setStockInput(String(product.stockQuantity));
    setMessage("");
  }

  function cancelStockEdit() {
    setEditingStockId(null);
    setStockInput("");
  }

  function saveStock(productId: string) {
    const quantity = Number(stockInput);

    if (
      stockInput.trim() === "" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 0 ||
      quantity > 1000000
    ) {
      setMessage("Enter a whole number between 0 and 1,000,000.");
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await updateProductStock(productId, quantity);
      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <main>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-500">
            STORE MANAGEMENT
          </p>

          <h1 className="text-3xl font-serif text-neutral-900">
            Products & Inventory
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Manage your RUBYS products, stock levels and availability.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Active Products" value={activeCount} />
        <StatCard label="Inactive Products" value={inactiveCount} />
        <StatCard label="Archived Products" value={archivedCount} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Low Stock (1–5)" value={lowStockCount} />
        <StatCard label="Out of Stock" value={outOfStockCount} />
      </div>

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-800"
        >
          {message}
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-neutral-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Categories" : item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm text-neutral-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <Filter className="h-4 w-4 text-neutral-400" />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-neutral-300" />

            <h2 className="font-medium text-neutral-800">
              No products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try another search or change your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="48px"
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <Package className="m-auto h-6 w-6 text-neutral-400" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-neutral-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-400">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-600">
                      {product.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {currency.format(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      {editingStockId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="1000000"
                            step="1"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveStock(product.id);
                              if (e.key === "Escape") cancelStockEdit();
                            }}
                            disabled={isPending}
                            aria-label={`Stock quantity for ${product.name}`}
                            className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                          />

                          <button
                            type="button"
                            onClick={() => saveStock(product.id)}
                            disabled={isPending}
                            aria-label="Save stock quantity"
                            className="text-green-700 hover:text-green-900 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={cancelStockEdit}
                            disabled={isPending}
                            aria-label="Cancel stock edit"
                            className="text-neutral-500 hover:text-neutral-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-2">
                          <span className="text-sm font-medium">
                            {product.stockQuantity}
                          </span>

                          {!product.isArchived && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                product.stockQuantity === 0
                                  ? "bg-red-50 text-red-700"
                                  : product.stockQuantity <= 5
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-green-50 text-green-700"
                              }`}
                            >
                              {product.stockQuantity === 0
                                ? "Out of Stock"
                                : product.stockQuantity <= 5
                                  ? "Low Stock"
                                  : "In Stock"}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => startStockEdit(product)}
                            disabled={isPending}
                            className="text-xs font-medium text-neutral-600 underline hover:text-neutral-950 disabled:opacity-50"
                          >
                            Edit stock
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.isArchived
                            ? "bg-purple-50 text-purple-700"
                            : product.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {product.isArchived
                          ? "Archived"
                          : product.isActive
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 text-sm font-medium hover:text-neutral-500"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>

                        {!product.isArchived && (
                          <>
                            {product.isActive ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  runAction(
                                    deactivateProduct,
                                    product.id,
                                    `Deactivate ${product.name}? It will disappear from your storefront.`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 disabled:opacity-50"
                              >
                                <EyeOff className="h-4 w-4" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  runAction(
                                    reactivateProduct,
                                    product.id,
                                    `Reactivate ${product.name}? It will become visible in your storefront.`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 disabled:opacity-50"
                              >
                                <Eye className="h-4 w-4" />
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                runAction(
                                  archiveProduct,
                                  product.id,
                                  `Archive ${product.name}? It will be hidden from your storefront and normal catalogue.`
                                )
                              }
                              className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </button>
                          </>
                        )}

                        {product.isArchived && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                restoreProduct,
                                product.id,
                                `Restore ${product.name}? It will return as an inactive product.`
                              )
                            }
                            className="inline-flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 disabled:opacity-50"
                          >
                            <ArchiveRestore className="h-4 w-4" />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>

      <p className="mt-3 text-3xl font-semibold text-neutral-900">
        {value}
      </p>
    </div>
  );
}
