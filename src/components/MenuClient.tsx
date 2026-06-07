"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@prisma/client";
import { getImageUrl } from "@/lib/utils";

export default function MenuClient({ initialProducts }: { initialProducts: Product[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
    const [sortBy, setSortBy] = useState("featured");

    const [isCategoryVisible, setIsCategoryVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
                setIsCategoryVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setIsCategoryVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const categories = ["Tất cả", ...Array.from(new Set(initialProducts.map(p => p.category)))];

    let filteredProducts = initialProducts.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
        return matchSearch && matchCategory;
    });

    if (sortBy === "price-asc") {
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
    }

    return (
        <div className="min-h-screen bg-[#faf8f5] py-24 px-6 md:px-10 lg:px-24">
            <div className="max-w-[1200px] mx-auto">
                <header className="mb-10">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-2 font-bold">Customer Menu</p>
                    <h1 className="text-4xl font-serif text-[#333] mb-4">Thực đơn</h1>
                    <p className="text-sm text-gray-600 font-light max-w-2xl leading-relaxed">
                        Danh sách món và xem chi tiết sản phẩm.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border border-gray-200 bg-white p-6 md:p-8 mb-12 gap-6 lg:gap-0">
                    <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-gray-500 mb-2 font-medium">Menu hiện tại</p>
                        <p className="text-base text-[#333]">{filteredProducts.length} món đang sẵn sàng</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-[400px] border border-gray-300 px-4 py-3 text-[13px] text-[#333] outline-none focus:border-black transition-colors placeholder-gray-400 bg-transparent"
                        />

                        <div className="relative w-full sm:w-[140px] shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full h-full border border-gray-300 px-4 py-3 text-[13px] text-[#333] outline-none appearance-none cursor-pointer pr-8 focus:border-black transition-colors bg-white"
                            >
                                <option value="featured">Nổi bật</option>
                                <option value="price-asc">Giá: Thấp lên cao</option>
                                <option value="price-desc">Giá: Cao xuống thấp</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-600">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-start">

                    <aside
                        className={`w-full md:w-56 shrink-0 sticky bg-[#faf8f5] z-30 pt-2 pb-4 md:py-0 mb-6 md:mb-0 border-b border-gray-200 md:border-none transition-all duration-300 ease-in-out md:top-24 ${
                            isCategoryVisible ? "top-[70px]" : "-top-32"
                        }`}
                    >
                        <div>
                            <h3 className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-6 font-bold hidden md:block">Danh mục</h3>

                            <ul className="flex md:flex-col gap-6 md:gap-0 overflow-x-auto no-scrollbar text-sm text-gray-600 md:border-b border-gray-200 md:pb-8">
                                {categories.map(cat => (
                                    <li key={cat} className="shrink-0">
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`hover:text-black transition-colors whitespace-nowrap w-full text-left py-2 border-b-2 md:border-b md:border-b-1 ${
                                                selectedCategory === cat
                                                    ? "text-black border-black font-medium"
                                                    : "border-transparent hover:border-gray-300"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="hidden md:block mt-12">
                            <h3 className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-4 font-bold">Lưu ý</h3>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                                Giá hiển thị đã bao gồm VAT.<br />
                                Một số món có thể tạm hết trong khung giờ cao điểm.
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Danh sách này ưu tiên những món dễ đặt qua giao hàng.
                            </p>
                        </div>
                    </aside>

                    <main className="flex-1 w-full">
                        <div className="md:hidden mb-6 bg-white border border-gray-200 p-4">
                            <h3 className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-2 font-bold">Lưu ý</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Giá hiển thị đã bao gồm VAT. Một số món có thể tạm hết trong khung giờ cao điểm. Danh sách ưu tiên các món dễ đặt qua giao hàng.
                            </p>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 border border-gray-200 bg-white">
                                <p className="text-gray-500 text-sm">Không tìm thấy món nào phù hợp với tìm kiếm của bạn.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((item) => (
                                    <div key={item.id} className="border border-gray-200 bg-white p-5 flex flex-col group hover:shadow-md transition-shadow">

                                        <Link href={`/menu/${item.slug}`} className="block overflow-hidden mb-4 bg-[#f5f5f5] relative aspect-[4/3]">
                                            <Image
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        </Link>

                                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
                                            {item.category}
                                        </p>

                                        <Link href={`/menu/${item.slug}`}>
                                            <h3 className="text-lg font-serif text-[#333] mb-3 hover:text-gray-500 transition-colors line-clamp-1">
                                                {item.name}
                                            </h3>
                                        </Link>

                                        <p className="text-xs text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                            {item.description}
                                        </p>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                            <span className="text-sm font-medium text-[#333]">
                                                {item.price.toLocaleString('vi-VN')} ₫
                                            </span>

                                            <div className="scale-90 origin-right">
                                                <AddToCartButton product={item} variant="mini" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}