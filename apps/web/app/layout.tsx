import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "../components/AppLayout";
import { MockStoreProvider } from "../contexts/MockStoreContext";

export const metadata: Metadata = {
  title: "LaunderERP - Laundry Management System",
  description: "Enterprise QR-Based Laundry Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MockStoreProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </MockStoreProvider>
      </body>
    </html>
  );
}
