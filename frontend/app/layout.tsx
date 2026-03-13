import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MiniCartDrawer from "@/components/layout/MiniCartDrawer";
import { DatasetProvider } from "@/context/DatasetContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Study Nook MBA Engine",
  description: "Smart school supplies recommendations that boost basket value, improve promos, and support faster cashier decisions.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${ibmPlexMono.variable} antialiased`}>
        <ThemeProvider>
          <DatasetProvider>
            <CartProvider>
              <ToastProvider>
                <MiniCartDrawer />
                <div className="min-h-screen app-bg flex overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 min-w-0">
                    <Header />
                    <main className="p-4 md:p-6">{children}</main>
                  </div>
                </div>
              </ToastProvider>
            </CartProvider>
          </DatasetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
