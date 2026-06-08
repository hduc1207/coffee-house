"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export default function Cart({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
    const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") onCloseAction();
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => {
                document.body.style.overflow = "unset";
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen, onCloseAction]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
                    isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
                }`}
                onClick={onCloseAction}
            ></div>

            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-aesop-bg z-[70] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col ${
                    isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
                }`}
            >
                <div className="flex justify-between items-center p-8 border-b border-aesop-border/50 shrink-0">
                    <h2 className="text-xl font-serif text-aesop-text">
                        Giỏ hàng {cartItems.length > 0 ? `(${cartItems.length})` : ""}
                    </h2>
                    <button
                        onClick={onCloseAction}
                        aria-label="Đóng giỏ hàng"
                        className="text-xs tracking-widest text-gray-500 hover:text-aesop-text uppercase transition-colors"
                    >
                        Đóng ✕
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-8">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-5">
                            <p className="text-sm text-gray-500 font-light">Giỏ hàng của bạn đang trống.</p>
                            <button
                                onClick={onCloseAction}
                                className="text-xs uppercase tracking-widest border-b border-aesop-text pb-1 hover:text-aesop-accent hover:border-aesop-accent transition-colors"
                            >
                                Tiếp tục khám phá
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-6 group">

                                    <div className="w-20 h-24 shrink-0 bg-[#E8E6E1] overflow-hidden">
                                        <Image src={getImageUrl(item.image)} alt={item.name} width={80} height={96} className="w-full h-full object-cover grayscale-[20%]" />
                                    </div>

                                    <div className="flex-grow flex flex-col justify-between py-1">
                                        <div>
                                            <h4 className="text-base font-serif text-aesop-text">{item.name}</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    aria-label={`Giảm số lượng ${item.name}`}
                                                    className="w-6 h-6 flex items-center justify-center border border-aesop-border text-gray-500 hover:bg-aesop-text hover:text-aesop-bg transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    aria-label={`Tăng số lượng ${item.name}`}
                                                    className="w-6 h-6 flex items-center justify-center border border-aesop-border text-gray-500 hover:bg-aesop-text hover:text-aesop-bg transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-700 text-left transition-colors w-fit mt-3"
                                        >
                                            Xóa món
                                        </button>
                                    </div>

                                    <span className="text-sm tracking-widest text-aesop-text py-1">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-aesop-border/50 bg-[#E8E6E1] shrink-0 space-y-6">
                    <div className="flex justify-between text-aesop-text font-serif text-lg">
                        <span>Tổng cộng:</span>
                        <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                    </div>

                    <Link
                        href="/checkout"
                        onClick={onCloseAction}
                        className={`block w-full py-4 text-xs uppercase tracking-widest text-center transition-colors ${
                            cartItems.length === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                                : "bg-aesop-text text-aesop-bg hover:bg-aesop-accent"
                        }`}
                    >
                        Thanh toán
                    </Link>
                </div>
            </div>
        </>
    );
}