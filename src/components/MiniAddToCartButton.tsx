"use client";

import { useCart } from "@/lib/CartContext";
import { Product } from "@prisma/client";
import { toast } from "sonner";

export default function MiniAddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart(product);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng.`);
    };

    return (
        <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-[#333] text-white text-[13px] tracking-widest uppercase hover:bg-black transition-colors active:scale-95"
        >
            THÊM
        </button>
    );
}