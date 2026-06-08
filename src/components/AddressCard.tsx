"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddressCardProps {
    id: string;
    name: string;
    phone: string;
    street: string;
}

export default function AddressCard({ id, name, phone, street }: AddressCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editPhone, setEditPhone] = useState(phone);
    const [editStreet, setEditStreet] = useState(street);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/user/address/delete?id=${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Xóa địa chỉ thành công");
                router.refresh();
            } else {
                toast.error(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
            toast.error("Lỗi kết nối mạng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/address/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    name: editName,
                    phone: editPhone,
                    street: editStreet,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Cập nhật địa chỉ thành công");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("Lỗi kết nối mạng");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="p-6 border border-gray-200 bg-white rounded-none">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-4">Chỉnh sửa địa chỉ</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên người nhận"
                        className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-black bg-transparent"
                    />
                    <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Số điện thoại"
                        className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-black bg-transparent font-mono"
                    />
                    <textarea
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        placeholder="Địa chỉ chi tiết"
                        rows={3}
                        className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-black bg-transparent resize-none"
                    />
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3 text-xs tracking-widest uppercase font-semibold">
                    <button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="bg-[#333] text-white px-5 py-2.5 rounded-none hover:bg-black disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditName(name);
                            setEditPhone(phone);
                            setEditStreet(street);
                        }}
                        className="border border-gray-200 px-5 py-2.5 rounded-none hover:bg-gray-50 transition-colors text-gray-500"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border border-gray-200 bg-white rounded-none flex flex-col justify-between min-h-[160px]">
            <div>
                <div className="mb-3">
                    <h3 className="font-semibold text-gray-800 text-base leading-tight">{name}</h3>
                </div>

                <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <p className="font-mono">{phone}</p>
                    <p className="leading-relaxed">{street}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-4 text-[11px] tracking-wider uppercase font-semibold">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-black transition-colors"
                >
                    Sửa
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                </button>
            </div>
        </div>
    );
}

