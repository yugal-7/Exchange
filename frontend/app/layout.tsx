import { Inter } from "next/font/google";
import "./globals.css";
import { Appbar } from "./components/Appbar";
import { Providers } from "./providers";
import StoreProvider from './StoreProvider';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="px-2 pb-6">
        <StoreProvider>
        <Providers>
        <Appbar />
        {children}
        </Providers>
        </StoreProvider>
        </body>
    </html>
  );
}
