"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
                alert("Xóa địa chỉ thành công");
                router.refresh();
            } else {
                alert(`Lỗi: ${data.message}`);
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
            alert("Lỗi kết nối mạng");
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
                alert("Cập nhật địa chỉ thành công");
                setIsEditing(false);
                router.refresh();
            } else {
                alert(`Lỗi: ${data.message}`);
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Lỗi kết nối mạng");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="p-6 border border-gray-200 bg-white">
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên người nhận"
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Số điện thoại"
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <textarea
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        placeholder="Địa chỉ chi tiết"
                        rows={3}
                        className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
                    />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
                    <button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="bg-[#333] text-white px-4 py-2 hover:bg-black disabled:bg-gray-400"
                    >
                        {isLoading ? "Đang l��u..." : "Lưu"}
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="border border-gray-300 px-4 py-2 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border border-gray-200 bg-white">
            <h3 className="font-medium text-base mb-2">{name}</h3>
            <p className="text-sm text-gray-600 mb-1">{phone}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{street}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-black"
                >
                    Sửa
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                </button>
            </div>
        </div>
    );
}

