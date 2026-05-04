"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cart from "@/components/layout/Cart";
import { useCart } from "@/lib/CartContext";

export default function Header() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const { cartItems } = useCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <header className={`border-b border-aesop-border/50 bg-aesop-bg fixed w-full top-0 z-50 transition-transform duration-300 ease-in-out ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}>
                <div className="flex items-center justify-between px-6 py-5 md:px-10">

                    <nav className="hidden md:flex gap-6 text-xs font-sans font-semibold uppercase tracking-wider text-aesop-text">
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
                            <div className="w-full h-[1px] bg-gray-300"></div>
                            <button className="text-left text-base font-serif text-aesop-text hover:text-aesop-accent transition-colors">
                                Đăng nhập
                            </button>
                        </div>
                    </div>

                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-2xl font-serif tracking-wide text-aesop-accent">The Bamboo</h1>
                    </Link>

                    <div className="flex gap-6 text-xs font-sans font-semibold uppercase tracking-wider text-aesop-text items-center">
                        <button className="hover:text-aesop-accent transition-colors hidden md:block">Đăng nhập</button>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="hover:text-aesop-accent transition-colors flex items-center normal-case"
                        >
                            <span className="hidden md:inline-block">
                                Giỏ hàng ({totalItems})
                            </span>
                            <div className="relative md:hidden flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                                    <path d="M3 6h18"/>
                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>

                                <span className="absolute -top-1.5 -right-2 bg-aesop-text text-aesop-bg text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                                    {totalItems}
                                </span>
                            </div>
                        </button>

                    </div>
                </div>
            </header>

            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}