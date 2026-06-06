"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

interface Store {
    id?: string;
    name: string;
    city: string;
    address: string;
    hours: string;
    phone: string;
    image: string;
    desc: string;
}

interface StoreFormProps {
    store?: Store | null;
    onClose: () => void;
    onSaved: () => void;
}

const INITIAL: Store = { name: "", city: "", address: "", hours: "07:00 - 22:00", phone: "", image: "", desc: "" };

export default function StoreForm({ store, onClose, onSaved }: StoreFormProps) {
    const [form, setForm] = useState<Store>(store ?? INITIAL);
    const [isSaving, setIsSaving] = useState(false);
    const isEdit = !!store?.id;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setForm(store ?? INITIAL); }, [store]);



    const set = (key: keyof Store, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.image) { toast.error("Vui lòng thêm ảnh cửa hàng"); return; }

        setIsSaving(true);
        try {
            const url = isEdit ? `/api/admin/stores/${store!.id}` : "/api/admin/stores";
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(isEdit ? "Đã cập nhật cửa hàng!" : "Đã thêm cửa hàng mới!");
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">
                        {isEdit ? "Chỉnh sửa Cửa hàng" : "Thêm Cửa hàng mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <ImageUploader value={form.image} onChange={(url) => set("image", url)} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Tên cửa hàng *">
                            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="VD: Bamboo Coffee Đà Lạt" />
                        </Field>
                        <Field label="Thành phố *">
                            <input required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} placeholder="VD: Đà Lạt" />
                        </Field>
                        <Field label="Số điện thoại *">
                            <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} placeholder="0901 234 567" />
                        </Field>
                        <Field label="Giờ mở cửa *">
                            <input required value={form.hours} onChange={(e) => set("hours", e.target.value)} className={inputClass} placeholder="07:00 - 22:00" />
                        </Field>
                    </div>
                    <Field label="Địa chỉ *">
                        <input required value={form.address} onChange={(e) => set("address", e.target.value)} className={inputClass} placeholder="Số nhà, đường, phường/xã..." />
                    </Field>
                    <Field label="Mô tả">
                        <textarea rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} className={`${inputClass} resize-none`} placeholder="Không gian, đặc điểm nổi bật..." />
                    </Field>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                            Hủy
                        </button>
                        <button
                            type="submit" disabled={isSaving}
                            className="px-5 py-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-sm rounded-lg font-medium disabled:opacity-50"
                        >
                            {isSaving ? "Đang lưu..." : (isEdit ? "Lưu thay đổi" : "Thêm cửa hàng")}
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
