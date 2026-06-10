"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import ProductForm from "@/components/admin/ProductForm";
import { getImageUrl } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    isAvailable: boolean;
    isFeatured: boolean;
    description: string;
    origin: string;
    roast: string;
}

const CATEGORIES = ["Tất cả", "Cà phê", "Trà", "Bánh ngọt", "Khác"];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState("Tất cả");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (category !== "Tất cả") params.set("category", category);
            const res = await fetch(`/api/admin/products?${params}`);
            const data = await res.json();
            if (data.success) { setProducts(data.products); setTotal(data.total); }
        } catch { toast.error("Lỗi tải danh sách sản phẩm"); }
        finally { setIsLoading(false); }
    }, [category]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchProducts();
    }, [fetchProducts]);


    const handleToggleAvailable = async (product: Product) => {
        const res = await fetch(`/api/admin/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: !product.isAvailable }),
        });
        if (res.ok) {
            toast.success(product.isAvailable ? "Đã ẩn sản phẩm" : "Đã hiện sản phẩm");
            await fetchProducts();
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`)) return;
        const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
            toast.success("Đã xóa sản phẩm");
            await fetchProducts();
        } else {
            toast.error(data.message);
        }
    };

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto text-[#333]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-serif mb-2">Quản lý Sản phẩm</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{total} sản phẩm</p>
                </div>
                <button
                    onClick={() => { setEditProduct(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Thêm sản phẩm
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-none focus:outline-none focus:border-black text-gray-700 bg-white"
                />
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border rounded-none transition-colors ${
                                category === c
                                    ? "bg-[#6F4E37] border-[#6F4E37] text-white"
                                    : "bg-white border-gray-200 text-gray-650 hover:bg-[#faf8f5] hover:border-gray-300"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-none border border-gray-200 shadow-none overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có sản phẩm nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#faf8f5]/40 border-b border-gray-200">
                                <tr className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="px-4 py-3.5 text-left font-semibold">Sản phẩm</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Danh mục</th>
                                    <th className="px-4 py-3.5 text-right font-semibold">Giá</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Tồn kho</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#faf8f5]/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-none border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                    <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-semibold text-gray-800">{product.name}</p>
                                                        {product.isFeatured && (
                                                            <span className="text-[9px] font-bold bg-[#FFF9E6] text-[#805B00] border border-[#FFE7A3] px-1 py-0.2 uppercase tracking-wide">Nổi bật</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 font-medium">{product.category}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-850">{product.price.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-widest border ${
                                                product.stock <= 0
                                                    ? "bg-[#FFF0F0] text-[#B80000] border-[#FFD1D1]"
                                                    : product.stock <= 10
                                                        ? "bg-[#FFF9E6] text-[#805B00] border-[#FFE7A3]"
                                                        : "bg-[#EBFDF5] text-[#006039] border-[#B6F5D9]"
                                            }`}>
                                                {product.stock <= 0 ? "Hết hàng" : product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleAvailable(product)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-none border transition-colors cursor-pointer ${
                                                    product.isAvailable
                                                        ? "bg-[#EBFDF5] border-[#B6F5D9]"
                                                        : "bg-gray-100 border-gray-300"
                                                }`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-none transition-transform ${
                                                    product.isAvailable
                                                        ? "translate-x-5 bg-[#006039]"
                                                        : "translate-x-1 bg-gray-400"
                                                }`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => { setEditProduct(product); setShowForm(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-black border border-transparent hover:border-gray-200 rounded-none transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 border border-transparent hover:border-red-150 hover:bg-[#FFF0F0] rounded-none transition-colors"
                                                    title="Xóa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <ProductForm
                    product={editProduct}
                    onClose={() => { setShowForm(false); setEditProduct(null); }}
                    onSaved={fetchProducts}
                />
            )}
        </div>
    );
}
