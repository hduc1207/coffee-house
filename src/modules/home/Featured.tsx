"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { getImageUrl } from "@/lib/utils";
import type { Product } from "@prisma/client";

export default function Featured({ product }: { product: Product | null }) {
    const { addToCart } = useCart();

    if (!product) return null;

    return (
        <section className="py-24 px-6 md:px-16 lg:px-24 bg-aesop-bg flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-1/2">
                <Link href={`/menu/${product.slug}`} className="block w-full">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full aspect-[4/5] object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 cursor-pointer"
                    />
                </Link>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
                <span className="text-xs uppercase tracking-[0.15em] text-gray-500">
                    Dòng sản phẩm thủ công
                </span>

                <Link href={`/menu/${product.slug}`} className="hover:text-aesop-accent transition-colors">
                    <h2 className="text-4xl lg:text-5xl font-serif text-aesop-text leading-tight">
                        {product.name}
                    </h2>
                </Link>

                <p className="text-base text-gray-600 leading-relaxed max-w-md font-light">
                    {product.description}
                </p>

                <button
                    onClick={() => addToCart(product)}
                    className="mt-4 border-b border-aesop-text pb-1 text-sm uppercase tracking-widest hover:text-aesop-accent hover:border-aesop-accent transition-colors cursor-pointer"
                >
                    Thêm vào giỏ — {product.price.toLocaleString("vi-VN")}đ
                </button>
            </div>

        </section>
    );
}