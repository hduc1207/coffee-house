"use client";

import { useState } from "react";
import Link from "next/link";
import MiniAddToCartButton from "@/components/MiniAddToCartButton";
import type { Product } from "@prisma/client";

export default function MenuClient({ initialProducts }: { initialProducts: Product[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredProducts = initialProducts.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const coffees = filteredProducts.filter((item) => item.category === "Cà phê");
    const teas = filteredProducts.filter((item) => item.category === "Trà");

    return (
        <div className="max-w-6xl mx-auto pt-32 px-10 pb-20">
            <h1 className="text-4xl font-serif mb-8 text-center text-aesop-text border-b pb-4">
                Thực đơn The Bamboo
            </h1>

            <div className="mb-12">
                <input
                    type="text"
                    placeholder="Tìm kiếm đồ uống... (VD: Cold Brew)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 lg:w-1/3 border border-aesop-border/50 bg-white/50 px-5 py-3 outline-none focus:border-aesop-accent focus:ring-1 focus:ring-aesop-accent transition-all text-[15px] shadow-sm"
                />
            </div>

            {coffees.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-2xl font-bold font-serif mb-6 text-aesop-text flex items-center gap-3">
                        <span className="w-2 h-8 bg-aesop-accent inline-block"></span>
                        Cà Phê
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {coffees.map((item) => (
                            <div key={item.id} className="border border-aesop-border/50 p-5 shadow-sm hover:shadow-md transition-shadow bg-aesop-bg flex flex-col">
                                <Link href={`/menu/${item.slug}`} className="block group">
                                    <img src={item.image} alt={item.name} className="w-full h-56 object-cover mb-4 rounded cursor-pointer group-hover:opacity-90 transition-opacity" />
                                    <h2 className="text-xl font-bold font-serif mb-2 cursor-pointer group-hover:text-aesop-accent transition-colors">
                                        {item.name}
                                    </h2>
                                </Link>

                                <p className="text-gray-600 text-sm mb-4 min-h-[40px] flex-grow">{item.description}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-aesop-accent font-semibold text-lg">{item.price.toLocaleString('vi-VN')} đ</span>
                                    <MiniAddToCartButton product={item} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {teas.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold font-serif mb-6 text-aesop-text flex items-center gap-3">
                        <span className="w-2 h-8 bg-green-600 inline-block"></span>
                        Trà
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teas.map((item) => (
                            <div key={item.id} className="border border-aesop-border/50 p-5 shadow-sm hover:shadow-md transition-shadow bg-aesop-bg flex flex-col">
                                <Link href={`/menu/${item.slug}`} className="block group">
                                    <img src={item.image} alt={item.name} className="w-full h-56 object-cover mb-4 rounded cursor-pointer group-hover:opacity-90 transition-opacity" />
                                    <h2 className="text-xl font-bold font-serif mb-2 cursor-pointer group-hover:text-aesop-accent transition-colors">
                                        {item.name}
                                    </h2>
                                </Link>

                                <p className="text-gray-600 text-sm mb-4 min-h-[40px] flex-grow">{item.description}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-aesop-accent font-semibold text-lg">{item.price.toLocaleString('vi-VN')} đ</span>
                                    <MiniAddToCartButton product={item} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {coffees.length === 0 && teas.length === 0 && (
                <div className="text-center text-gray-500 py-16 text-lg">
                    Không tìm thấy đồ uống nào phù hợp với từ khóa <span className="font-bold text-[#333]">"{searchTerm}"</span>
                </div>
            )}
        </div>
    );
}