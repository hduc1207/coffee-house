"use client";

import Link from "next/link";
import { useState } from "react";
import Cart from "@/components/layout/Cart";
import { useCart } from "@/lib/CartContext";

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { cartItems } = useCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <header className="border-b border-aesop-border/50 bg-aesop-bg sticky top-0 z-50">
                <div className="flex items-center justify-between px-6 py-5 md:px-10">

                    <nav className="hidden md:flex gap-6 text-xs uppercase tracking-[0.15em] text-aesop-text">
                        <Link href="/menu" className="hover:text-aesop-accent transition-colors">Thực đơn</Link>
                        <Link href="/story" className="hover:text-aesop-accent transition-colors">Câu chuyện</Link>
                        <Link href="/stores" className="hover:text-aesop-accent transition-colors">Cửa hàng</Link>
                    </nav>

                    <div className="relative md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-xs uppercase tracking-widest text-aesop-text"
                        >
                            {isMobileMenuOpen ? "Đóng ✕" : "Menu"}
                        </button>

                        <div
                            className={`absolute top-full left-0 mt-6 w-48 bg-aesop-bg border border-aesop-border/30 shadow-xl p-6 flex flex-col gap-6 transition-all duration-300 origin-top-left ${
                                isMobileMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                            }`}
                        >
                            <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-serif text-aesop-text hover:text-aesop-accent transition-colors">Thực đơn</Link>
                            <Link href="/story" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-serif text-aesop-text hover:text-aesop-accent transition-colors">Câu chuyện</Link>
                            <Link href="/stores" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-serif text-aesop-text hover:text-aesop-accent transition-colors">Cửa hàng</Link>
                        </div>

                    </div>

                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-2xl font-serif tracking-wide text-aesop-accent">The Bamboo</h1>
                    </Link>

                    <div className="flex gap-6 text-xs uppercase tracking-[0.15em] text-aesop-text">
                        <button className="hover:text-aesop-accent transition-colors hidden md:block">Đăng nhập</button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="hover:text-aesop-accent transition-colors"
                        >
                            Giỏ hàng ({totalItems})
                        </button>
                    </div>

                </div>
            </header>

            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}