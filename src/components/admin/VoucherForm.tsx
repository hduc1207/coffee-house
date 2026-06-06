"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Voucher {
    id?: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    maxDiscount: number | null;
    minOrder: number | null;
    usageLimit: number | null;
    expiresAt: string | null;
    isActive: boolean;
}

interface VoucherFormProps {
    voucher?: Voucher | null;
    onClose: () => void;
    onSaved: () => void;
}

const INITIAL: Voucher = {
    code: "", type: "PERCENT", value: 10,
    maxDiscount: null, minOrder: null,
    usageLimit: null, expiresAt: null, isActive: true,
};

export default function VoucherForm({ voucher, onClose, onSaved }: VoucherFormProps) {
    const [form, setForm] = useState<Voucher>(voucher ?? INITIAL);
    const [isSaving, setIsSaving] = useState(false);
    const isEdit = !!voucher?.id;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setForm(voucher ?? INITIAL); }, [voucher]);



    const set = (key: keyof Voucher, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEdit ? `/api/admin/vouchers/${voucher!.id}` : "/api/admin/vouchers";
            const method = isEdit ? "PATCH" : "POST";

            const payload = {
                ...form,
                code: form.code.toUpperCase(),
                value: Number(form.value),
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                minOrder: form.minOrder ? Number(form.minOrder) : null,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(isEdit ? "Đã cập nhật voucher!" : "Đã tạo voucher mới!");
                onSaved();
                onClose();
            } else {
                toast.error(data.message ?? "Có lỗi xảy ra");
            }
        } catch {
            toast.error("Lỗi kết nối");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">
                        {isEdit ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Mã Voucher *">
                            <input
                                required
                                disabled={isEdit}
                                value={form.code}
                                onChange={(e) => set("code", e.target.value.toUpperCase())}
                                placeholder="VD: WELCOME10"
                                className={`${inputClass} ${isEdit ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""} uppercase`}
                            />
                        </Field>
                        <Field label="Loại giảm giá">
                            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass}>
                                <option value="PERCENT">Phần trăm (%)</option>
                                <option value="FIXED">Số tiền cố định (đ)</option>
                            </select>
                        </Field>
                        <Field label={form.type === "PERCENT" ? "Giảm (%) *" : "Giảm (đ) *"}>
                            <input
                                required type="number" min="1"
                                max={form.type === "PERCENT" ? 100 : undefined}
                                value={form.value || ""}
                                onChange={(e) => set("value", e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        {form.type === "PERCENT" && (
                            <Field label="Giảm tối đa (đ)">
                                <input type="number" min="0" placeholder="Không giới hạn"
                                    value={form.maxDiscount ?? ""}
                                    onChange={(e) => set("maxDiscount", e.target.value || null)}
                                    className={inputClass}
                                />
                            </Field>
                        )}
                        <Field label="Đơn tối thiểu (đ)">
                            <input type="number" min="0" placeholder="Không yêu cầu"
                                value={form.minOrder ?? ""}
                                onChange={(e) => set("minOrder", e.target.value || null)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Số lượt dùng tối đa">
                            <input type="number" min="1" placeholder="Không giới hạn"
                                value={form.usageLimit ?? ""}
                                onChange={(e) => set("usageLimit", e.target.value || null)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Ngày hết hạn">
                            <input type="datetime-local"
                                value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""}
                                onChange={(e) => set("expiresAt", e.target.value || null)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Trạng thái">
                            <select value={form.isActive ? "true" : "false"} onChange={(e) => set("isActive", e.target.value === "true")} className={inputClass}>
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Tạm tắt</option>
                            </select>
                        </Field>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                            Hủy
                        </button>
                        <button
                            type="submit" disabled={isSaving}
                            className="px-5 py-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm rounded-lg font-medium disabled:opacity-50"
                        >
                            {isSaving ? "Đang lưu..." : (isEdit ? "Lưu thay đổi" : "Tạo Voucher")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6F4E37] transition-colors text-gray-700";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    );
}
