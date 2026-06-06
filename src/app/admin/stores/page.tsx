"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import StoreForm from "@/components/admin/StoreForm";

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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Cửa hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">{stores.length} chi nhánh</p>
                </div>
                <button
                    onClick={() => { setEditStore(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm rounded-lg font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Thêm cửa hàng
                </button>
            </div>

            {isLoading ? (
                <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : stores.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
                    Chưa có cửa hàng nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 relative bg-gray-100">
                                <Image src={store.image} alt={store.name} fill className="object-cover" unoptimized />
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{store.name}</h3>
                                        <p className="text-xs text-[#6F4E37] font-medium">{store.city}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                                    <p className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {store.address}
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        {store.hours}
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.67 4.87 2 2 0 0 1 3.64 2.67h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.22-1.22a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        {store.phone}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditStore(store); setShowForm(true); }}
                                        className="flex-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-[#6F4E37] hover:text-[#6F4E37] transition-colors"
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(store)}
                                        className="py-1.5 px-3 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
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
