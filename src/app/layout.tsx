import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RUBYS | Premium African Haircare",
    template: "%s | RUBYS",
  },
  description:
    "Discover premium organic African haircare products from RUBYS. Shop our haircare collection in Nigeria and internationally.",
  applicationName: "RUBYS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}