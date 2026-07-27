import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Appbar } from "./components/Appbar";
import { Providers } from "./providers";
import StoreProvider from './StoreProvider';
import { Toaster } from "./components/core/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0b0d12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-x-hidden px-2 pb-6">
        <StoreProvider>
        <Providers>
        <Appbar />
        {children}
        <Toaster />
        </Providers>
        </StoreProvider>
        </body>
    </html>
  );
}
