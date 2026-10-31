import Link from "next/link";
import AdminLoginForm from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login | RUBYS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
        <Link
          href="/"
          className="mb-10 block text-center text-3xl font-serif tracking-[0.25em]"
        >
          RUBYS
        </Link>

        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-neutral-500">
            PRIVATE ACCESS
          </p>

          <h1 className="text-2xl font-serif text-neutral-900">
            Administrator Login
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Sign in to manage your RUBYS store.
          </p>
        </div>

        <AdminLoginForm />

        <p className="mt-8 text-center text-xs text-neutral-400">
          RUBYS · Luxury Organic Haircare
        </p>
      </div>
    </main>
  );
}
