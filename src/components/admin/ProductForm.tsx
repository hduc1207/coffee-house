"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

interface Product {
    id?: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    description: string;
    origin: string;
    roast: string;
    category: string;
    stock: number;
    isAvailable: boolean;
    isFeatured: boolean;
}

interface ProductFormProps {
    product?: Product | null;
    onClose: () => void;
    onSaved: () => void;
}

const CATEGORIES = ["Cà phê", "Trà", "Nước ép", "Bánh", "Đồ ăn vặt", "Khác"];

const INITIAL: Product = {
    name: "", slug: "", price: 0, image: "", description: "",
    origin: "", roast: "", category: "Cà phê", stock: 100, isAvailable: true, isFeatured: false,
};

function toSlug(str: string) {
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim().replace(/\s+/g, "-");
}

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
    const [form, setForm] = useState<Product>(product ?? INITIAL);
    const [isSaving, setIsSaving] = useState(false);
    const isEdit = !!product?.id;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(product ?? INITIAL);
    }, [product]);





    const set = (key: keyof Product, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleNameChange = (name: string) => {
        setForm((prev) => ({
            ...prev,
            name,
            slug: isEdit ? prev.slug : toSlug(name),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.image) { toast.error("Vui lòng thêm ảnh sản phẩm"); return; }

        setIsSaving(true);
        try {
            const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(isEdit ? "Đã cập nhật sản phẩm!" : "Đã thêm sản phẩm mới!");
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
                className="bg-white rounded-none border border-neutral-300 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#faf8f5]/40">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-800">
                        {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <ImageUploader value={form.image} onChange={(url) => set("image", url)} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Tên sản phẩm *">
                            <input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Slug *">
                            <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} pattern="[a-z0-9-]+" title="Chỉ chứa chữ thường, số và dấu gạch ngang" />
                        </Field>
                        <Field label="Giá (đ) *">
                            <input required type="number" min="1000" step="500" value={form.price || ""} onChange={(e) => set("price", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Tồn kho">
                            <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Danh mục">
                            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
                                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Xuất xứ">
                            <input value={form.origin} onChange={(e) => set("origin", e.target.value)} className={inputClass} placeholder="VD: Đà Lạt, Ethiopia..." />
                        </Field>
                        <Field label="Rang">
                            <input value={form.roast} onChange={(e) => set("roast", e.target.value)} className={inputClass} placeholder="VD: Medium, Dark..." />
                        </Field>
                        <Field label="Trạng thái">
                            <select value={form.isAvailable ? "true" : "false"} onChange={(e) => set("isAvailable", e.target.value === "true")} className={inputClass}>
                                <option value="true">Đang bán</option>
                                <option value="false">Tạm ẩn</option>
                            </select>
                        </Field>
                        <Field label="Tuyển tập hương vị">
                            <select value={form.isFeatured ? "true" : "false"} onChange={(e) => set("isFeatured", e.target.value === "true")} className={inputClass}>
                                <option value="false">Không hiển thị</option>
                                <option value="true">Hiển thị Trang chủ</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Mô tả">
                        <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} resize-none`} />
                    </Field>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black transition-colors rounded-none">
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-none transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Đang lưu..." : (isEdit ? "Lưu thay đổi" : "Thêm sản phẩm")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputClass = "w-full px-3 py-2 text-xs border border-gray-200 rounded-none focus:outline-none focus:border-black transition-colors text-gray-750 bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            {children}
        </div>
    );
}
