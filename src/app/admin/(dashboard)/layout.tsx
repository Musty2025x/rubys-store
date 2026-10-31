
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Store,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Products & Inventory",
    href: "/admin/products",
    icon: Package,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !session?.user?.email ||
    session.user.email.toLowerCase() !== adminEmail
  ) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link
            href="/admin"
            className="text-2xl font-serif tracking-[0.2em] text-[#49382f]"
          >
            RUBYS
            <span className="ml-3 align-middle text-[10px] font-sans tracking-[0.2em] text-neutral-400">
              ADMIN
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-950"
            >
              <Store size={16} />
              <span>View storefront</span>
            </Link>

            <div className="hidden border-l border-neutral-200 pl-4 text-right sm:block">
              <p className="text-xs font-semibold tracking-wider text-neutral-800">
                ADMINISTRATOR
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-neutral-200 bg-white p-4 lg:min-h-[calc(100vh-73px)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <p className="mb-4 px-3 text-[10px] font-semibold tracking-[0.2em] text-neutral-400">
            MANAGEMENT
          </p>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition hover:bg-[#f5f1eb] hover:text-[#49382f]"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden border-t border-neutral-100 pt-6 lg:block">
            <p className="px-3 text-xs leading-6 text-neutral-400">
              RUBYS Store Management
              <br />
              Premium African Haircare
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
