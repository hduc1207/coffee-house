"use client";

import { useCart } from "@/lib/CartContext";
import { Product } from "@prisma/client";
import { toast } from "sonner";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng.`);
    };

    return (
        <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-[#333] text-white text-sm tracking-widest uppercase hover:bg-black transition-colors active:scale-95"
        >
            THÊM MÓN
        </button>
    );
}