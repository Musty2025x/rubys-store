"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { updateProduct } from "@/app/admin/(dashboard)/products/actions";

type EditableProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  imageUrl: string;
  badge: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
};

export default function EditProductForm({
  product,
}: {
  product: EditableProduct;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateProduct(product.id, formData);

      setMessage(result.message);
      setSuccess(result.success);

      if (result.success) {
        router.refresh();
        router.push("/admin/products");
      }
    });
  }

  return (
    <main className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="mb-5 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-500">
          PRODUCT MANAGEMENT
        </p>

        <h1 className="text-3xl font-serif text-neutral-900">
          Edit Product
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Update the details of {product.name}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">
            Product Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Name *
              </label>

              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={product.name}
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product URL Slug *
              </label>

              <input
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                defaultValue={product.slug}
                className="admin-input"
              />

              <p className="mt-2 text-xs text-neutral-500">
                Lowercase letters, numbers and hyphens only.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Description *
              </label>

              <textarea
                name="description"
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                defaultValue={product.description}
                className="admin-input resize-y"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category *
              </label>

              <select
                name="category"
                required
                defaultValue={product.category}
                className="admin-input bg-white"
              >
                <option value="Hair Oils">Hair Oils</option>
                <option value="Shampoo">Shampoo</option>
                <option value="Conditioner">Conditioner</option>
                <option value="Accessories">Accessories</option>
                <option value="Hair Treatments">Hair Treatments</option>
                <option value="Hair Masks">Hair Masks</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Badge
              </label>

              <input
                name="badge"
                maxLength={50}
                defaultValue={product.badge ?? ""}
                placeholder="e.g. BESTSELLER"
                className="admin-input"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">
            Pricing and Inventory
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Selling Price (₦) *
              </label>

              <input
                name="price"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={product.price}
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Compare-at Price (₦)
              </label>

              <input
                name="compareAtPrice"
                type="number"
                min="1"
                step="1"
                defaultValue={product.compareAtPrice ?? ""}
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                SKU
              </label>

              <input
                name="sku"
                maxLength={50}
                defaultValue={product.sku ?? ""}
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Stock Quantity *
              </label>

              <input
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={product.stockQuantity}
                className="admin-input"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold">
            Product Image
          </h2>

          <p className="mb-5 text-sm text-neutral-500">
            Replace the existing image by entering another public image URL.
          </p>

          <div className="mb-4">
            <p className="mb-2 text-xs text-neutral-500">
              Current image URL
            </p>

            <p className="break-all text-sm text-neutral-700">
              {product.imageUrl}
            </p>
          </div>

          <label className="mb-2 block text-sm font-medium">
            Image URL *
          </label>

          <input
            name="imageUrl"
            type="url"
            required
            defaultValue={product.imageUrl}
            className="admin-input"
          />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Storefront Settings
          </h2>

          <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-neutral-100 py-4">
            <div>
              <p className="text-sm font-medium">Featured Product</p>
              <p className="mt-1 text-xs text-neutral-500">
                Highlight this product on the homepage.
              </p>
            </div>

            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product.isFeatured}
              className="h-5 w-5 accent-neutral-900"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">Active Product</p>
              <p className="mt-1 text-xs text-neutral-500">
                Make this product visible on the storefront.
              </p>
            </div>

            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product.isActive}
              className="h-5 w-5 accent-neutral-900"
            />
          </label>
        </section>

        {message && (
          <div
            role="alert"
            className={`rounded-lg p-4 text-sm ${
              success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            href="/admin/products"
            className="rounded-lg border border-neutral-300 px-6 py-3 text-center text-sm font-medium hover:bg-neutral-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-7 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}