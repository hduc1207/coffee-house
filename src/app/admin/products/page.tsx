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
    description: string;
    origin: string;
    roast: string;
}

const CATEGORIES = ["Tất cả", "Cà phê", "Trà", "Nước ép", "Bánh", "Đồ ăn vặt", "Khác"];

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
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} sản phẩm</p>
                </div>
                <button
                    onClick={() => { setEditProduct(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm rounded-lg font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6F4E37] text-gray-700"
                />
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${category === c ? "bg-[#6F4E37] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có sản phẩm nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                                    <th className="px-4 py-3 text-left">Danh mục</th>
                                    <th className="px-4 py-3 text-right">Giá</th>
                                    <th className="px-4 py-3 text-center">Tồn kho</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image src={getImageUrl(product.image)} alt={product.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{product.category}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-800">{product.price.toLocaleString("vi-VN")}đ</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock <= 0 ? "bg-red-100 text-red-700" : product.stock <= 10 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                                                {product.stock <= 0 ? "Hết hàng" : product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleAvailable(product)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${product.isAvailable ? "bg-green-500" : "bg-gray-300"}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${product.isAvailable ? "translate-x-4.5" : "translate-x-0.5"}`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { setEditProduct(product); setShowForm(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-[#6F4E37] hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
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
