"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import StoreForm from "@/components/admin/StoreForm";
import { getImageUrl } from "@/lib/utils";

interface Store {
    id: string;
    name: string;
    city: string;
    address: string;
    hours: string;
    phone: string;
    image: string;
    desc: string;
    createdAt: string;
}

export default function AdminStoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editStore, setEditStore] = useState<Store | null>(null);

    const fetchStores = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/stores");
            const data = await res.json();
            if (data.success) setStores(data.stores);
        } catch { toast.error("Lỗi tải danh sách cửa hàng"); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchStores();
    }, [fetchStores]);




    const handleDelete = async (store: Store) => {
        if (!confirm(`Xóa cửa hàng "${store.name}"?`)) return;
        const res = await fetch(`/api/admin/stores/${store.id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Đã xóa cửa hàng");
            await fetchStores();
        }
        else toast.error("Xóa thất bại");
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-[#333]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-serif mb-2">Quản lý Cửa hàng</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{stores.length} chi nhánh</p>
                </div>
                <button
                    onClick={() => { setEditStore(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Thêm cửa hàng
                </button>
            </div>

            {isLoading ? (
                <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : stores.length === 0 ? (
                <div className="bg-white rounded-none border border-gray-200 py-16 text-center text-gray-400 text-sm shadow-none">
                    Chưa có cửa hàng nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white rounded-none border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors shadow-none flex flex-col">
                            <div className="h-40 relative bg-gray-100 border-b border-gray-200">
                                <Image src={getImageUrl(store.image)} alt={store.name} fill className="object-cover" unoptimized />
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="mb-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-serif font-bold text-gray-800 text-base">{store.name}</h3>
                                        <span className="bg-[#EBF3FF] text-[#00409E] border border-[#C2DBFF] rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                            {store.city}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-xs text-gray-500 mt-3">
                                        <p className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            <span className="truncate" title={store.address}>{store.address}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            <span>{store.hours}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.67 4.87 2 2 0 0 1 3.64 2.67h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.22-1.22a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            <span className="font-mono">{store.phone}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => { setEditStore(store); setShowForm(true); }}
                                        className="flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 border border-gray-200 rounded-none hover:bg-gray-50 hover:border-black hover:text-black transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(store)}
                                        className="py-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-red-650 border border-red-100 hover:border-red-200 hover:bg-[#FFF0F0] rounded-none transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <StoreForm
                    store={editStore}
                    onClose={() => { setShowForm(false); setEditStore(null); }}
                    onSaved={fetchStores}
                />
            )}
        </div>
    );
}
