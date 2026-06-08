"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import VoucherForm from "@/components/admin/VoucherForm";

interface Voucher {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    maxDiscount: number | null;
    minOrder: number | null;
    usageLimit: number | null;
    usedCount: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
    _count: { orders: number };
}

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

    const fetchVouchers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter === "active") params.set("isActive", "true");
            if (filter === "inactive") params.set("isActive", "false");
            const res = await fetch(`/api/admin/vouchers?${params}`);
            const data = await res.json();
            if (data.success) setVouchers(data.vouchers);
        } catch { toast.error("Lỗi tải danh sách voucher"); }
        finally { setIsLoading(false); }
    }, [filter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchVouchers();
    }, [fetchVouchers]);

    const handleToggleActive = async (v: Voucher) => {
        const res = await fetch(`/api/admin/vouchers/${v.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !v.isActive }),
        });
        if (res.ok) {
            toast.success(v.isActive ? "Đã tắt voucher" : "Đã bật voucher");
            await fetchVouchers();
        }
    };


    const handleDelete = async (v: Voucher) => {
        if (!confirm(`Xóa voucher "${v.code}"?`)) return;
        const res = await fetch(`/api/admin/vouchers/${v.id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Đã xóa voucher");
            await fetchVouchers();
        }
        else toast.error("Xóa thất bại");
    };

    const isExpired = (v: Voucher) => v.expiresAt && new Date(v.expiresAt) < new Date();

    return (
        <div className="p-8 max-w-7xl mx-auto text-[#333]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-serif mb-2">Quản lý Voucher</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{vouchers.length} mã giảm giá</p>
                </div>
                <button
                    onClick={() => { setEditVoucher(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Tạo Voucher
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
                {(["all", "active", "inactive"] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border rounded-none transition-colors ${
                            filter === f
                                ? "bg-[#6F4E37] border-[#6F4E37] text-white"
                                : "bg-white border-gray-200 text-gray-650 hover:bg-[#faf8f5] hover:border-gray-300"
                        }`}
                    >
                        {f === "all" ? "Tất cả" : f === "active" ? "Đang hoạt động" : "Đã tắt"}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-none border border-gray-200 shadow-none overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : vouchers.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có voucher nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#faf8f5]/40 border-b border-gray-200">
                                <tr className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="px-4 py-3.5 text-left font-semibold">Mã</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Giảm giá</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Điều kiện</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Đã dùng</th>
                                    <th className="px-4 py-3.5 text-left font-semibold">Hết hạn</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Kích hoạt</th>
                                    <th className="px-4 py-3.5 text-center font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vouchers.map((v) => (
                                    <tr key={v.id} className={`hover:bg-[#faf8f5]/30 transition-colors ${isExpired(v) ? "opacity-60" : ""}`}>
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-gray-800 bg-[#F5F5F5] border border-gray-200 px-2 py-0.5 rounded-none text-xs">{v.code}</span>
                                            {isExpired(v) && <span className="ml-2 text-xs text-red-500">Hết hạn</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-[#805B00]">
                                                {v.type === "PERCENT" ? `${v.value}%` : `${v.value.toLocaleString("vi-VN")}đ`}
                                            </p>
                                            {v.maxDiscount && <p className="text-xs text-gray-400">Tối đa {v.maxDiscount.toLocaleString("vi-VN")}đ</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                            {v.minOrder ? `Đơn từ ${v.minOrder.toLocaleString("vi-VN")}đ` : "Không yêu cầu"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600 font-semibold">
                                            {v.usedCount}{v.usageLimit ? `/${v.usageLimit}` : ""}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                            {v.expiresAt
                                                ? new Date(v.expiresAt).toLocaleDateString("vi-VN")
                                                : <span className="text-gray-300">Không giới hạn</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleActive(v)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-none border transition-colors cursor-pointer ${
                                                    v.isActive
                                                        ? "bg-[#EBFDF5] border-[#B6F5D9]"
                                                        : "bg-gray-100 border-gray-300"
                                                }`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-none transition-transform ${
                                                    v.isActive
                                                        ? "translate-x-5 bg-[#006039]"
                                                        : "translate-x-1 bg-gray-400"
                                                }`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => { setEditVoucher(v); setShowForm(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-black border border-transparent hover:border-gray-200 rounded-none transition-colors" title="Chỉnh sửa">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(v)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 border border-transparent hover:border-red-100 hover:bg-[#FFF0F0] rounded-none transition-colors" title="Xóa">
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
                <VoucherForm
                    voucher={editVoucher}
                    onClose={() => { setShowForm(false); setEditVoucher(null); }}
                    onSaved={fetchVouchers}
                />
            )}
        </div>
    );
}
