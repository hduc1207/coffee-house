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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Voucher</h1>
                    <p className="text-sm text-gray-500 mt-1">{vouchers.length} mã giảm giá</p>
                </div>
                <button
                    onClick={() => { setEditVoucher(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm rounded-lg font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Tạo Voucher
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
                {(["all", "active", "inactive"] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === f ? "bg-[#6F4E37] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {f === "all" ? "Tất cả" : f === "active" ? "Đang hoạt động" : "Đã tắt"}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : vouchers.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có voucher nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Mã</th>
                                    <th className="px-4 py-3 text-left">Giảm giá</th>
                                    <th className="px-4 py-3 text-left">Điều kiện</th>
                                    <th className="px-4 py-3 text-center">Đã dùng</th>
                                    <th className="px-4 py-3 text-left">Hết hạn</th>
                                    <th className="px-4 py-3 text-center">Kích hoạt</th>
                                    <th className="px-4 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {vouchers.map((v) => (
                                    <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${isExpired(v) ? "opacity-60" : ""}`}>
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">{v.code}</span>
                                            {isExpired(v) && <span className="ml-2 text-xs text-red-500">Hết hạn</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-amber-700">
                                                {v.type === "PERCENT" ? `${v.value}%` : `${v.value.toLocaleString("vi-VN")}đ`}
                                            </p>
                                            {v.maxDiscount && <p className="text-xs text-gray-400">Tối đa {v.maxDiscount.toLocaleString("vi-VN")}đ</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {v.minOrder ? `Đơn từ ${v.minOrder.toLocaleString("vi-VN")}đ` : "Không yêu cầu"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">
                                            {v.usedCount}{v.usageLimit ? `/${v.usageLimit}` : ""}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {v.expiresAt
                                                ? new Date(v.expiresAt).toLocaleDateString("vi-VN")
                                                : <span className="text-gray-300">Không giới hạn</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleActive(v)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${v.isActive ? "bg-green-500" : "bg-gray-300"}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${v.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => { setEditVoucher(v); setShowForm(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-[#6F4E37] hover:bg-amber-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(v)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
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
                <VoucherForm
                    voucher={editVoucher}
                    onClose={() => { setShowForm(false); setEditVoucher(null); }}
                    onSaved={fetchVouchers}
                />
            )}
        </div>
    );
}
