
import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: {
    default: "RUBYS | Premium African Haircare",
    template: "%s | RUBYS",
  },
  description:
    "Discover premium African haircare products from RUBYS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
