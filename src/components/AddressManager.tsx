"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddressManager() {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            street: formData.get("street"),
        };

        try {
            const res = await fetch("/api/user/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();
            
            if (res.ok) {
                toast.success("Thêm địa chỉ thành công");
                router.refresh();
                setIsAdding(false);
            } else {
                toast.error(responseData.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Lỗi kết nối mạng:", error);
            toast.error("Lỗi kết nối mạng.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-[#6F4E37] text-white px-8 py-4 text-sm font-semibold hover:bg-black transition-colors rounded-xl shadow-sm flex items-center gap-2"
                >
                    <span>➕</span> Thêm địa chỉ mới
                </button>
            ) : (
                <form onSubmit={handleAddAddress} className="p-6 md:p-8 bg-white border border-gray-100 rounded-2xl shadow-md mt-4 animate-fade-in max-w-2xl">
                    <h3 className="text-lg font-serif mb-6 text-[#333] font-semibold border-b border-gray-100 pb-3">Thêm địa chỉ giao hàng mới</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input name="name" required type="text" placeholder="Họ và tên người nhận" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/20 transition-all" />
                        <input name="phone" required type="tel" placeholder="Số điện thoại" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/20 transition-all font-mono" />
                    </div>

                    <div className="mb-6">
                        <textarea
                            name="street"
                            required
                            placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện...)"
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] bg-gray-50/20 transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 text-xs tracking-wider uppercase font-semibold">
                        <button type="submit" disabled={isLoading} className="bg-[#6F4E37] text-white px-6 py-3 rounded-lg hover:bg-black transition-colors disabled:bg-gray-400">
                            {isLoading ? "Đang lưu..." : "Lưu địa chỉ"}
                        </button>
                        <button type="button" onClick={() => setIsAdding(false)} className="border border-gray-200 text-gray-500 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                            Hủy
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}