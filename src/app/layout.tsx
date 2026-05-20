import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/CartContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: "The Bamboo Coffee",
    description: "Trải nghiệm cà phê nguyên bản",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
        <body
            className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}
        >
        <Providers>
            <CartProvider>
                <ConditionalLayout
                    header={<Header />}
                    footer={<Footer />}
                >
                    <main className="flex-grow">
                        {children}
                    </main>
                </ConditionalLayout>
            </CartProvider>
        </Providers>
        <Toaster position="top-right" richColors />
        </body>
        </html>
    );
}