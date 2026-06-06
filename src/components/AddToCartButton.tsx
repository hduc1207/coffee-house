"use client";

import { useCart } from "@/lib/CartContext";
import { Product } from "@prisma/client";
import { toast } from "sonner";

export default function AddToCartButton({ product, variant = "full" }: { product: Product, variant?: "full" | "mini" }) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng.`);
    };

    if (variant === "mini") {
        return (
            <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-[#333] text-white text-[13px] tracking-widest uppercase hover:bg-black transition-colors active:scale-95"
            >
                THÊM
            </button>
        );
    }

    return (
        <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-[#333] text-white text-sm tracking-widest uppercase hover:bg-black transition-colors active:scale-95"
        >
            THÊM MÓN
        </button>
    );
}