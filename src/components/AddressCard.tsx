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
            <div className="p-6 border border-gray-100 bg-white rounded-2xl shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-4">Chỉnh sửa địa chỉ</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Tên người nhận"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/30"
                    />
                    <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Số điện thoại"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/30 font-mono"
                    />
                    <textarea
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        placeholder="Địa chỉ chi tiết"
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/30 resize-none"
                    />
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3 text-xs tracking-wider uppercase font-semibold">
                    <button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="bg-[#6F4E37] text-white px-4 py-2.5 rounded-lg hover:bg-black disabled:bg-gray-400 transition-colors"
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
                        className="border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[160px]">
            <div>
                <div className="flex items-start gap-2.5 mb-3">
                    <span className="text-lg mt-0.5">👤</span>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-base leading-tight">{name}</h3>
                    </div>
                </div>

                <div className="space-y-2 mb-4 pl-7">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span className="font-mono">{phone}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-start gap-2 leading-relaxed">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>{street}</span>
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-4 text-xs tracking-wider uppercase font-semibold pl-7">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-[#6F4E37] transition-colors flex items-center gap-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Sửa
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    {isLoading ? "Đang xóa..." : "Xóa"}
                </button>
            </div>
        </div>
    );
}

