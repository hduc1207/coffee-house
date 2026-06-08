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
                    className="bg-[#333] text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors rounded-none shadow-none"
                >
                    + Thêm địa chỉ mới
                </button>
            ) : (
                <form onSubmit={handleAddAddress} className="p-6 md:p-8 bg-white border border-gray-200 rounded-none shadow-none mt-4 animate-fade-in max-w-2xl">
                    <h3 className="text-lg font-serif mb-6 text-[#333] font-semibold border-b border-gray-100 pb-3 uppercase tracking-wider text-sm">Thêm địa chỉ giao hàng mới</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input name="name" required type="text" placeholder="Họ và tên người nhận" className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black bg-transparent transition-all" />
                        <input name="phone" required type="tel" placeholder="Số điện thoại" className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black bg-transparent transition-all font-mono" />
                    </div>

                    <div className="mb-6">
                        <textarea
                            name="street"
                            required
                            placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện...)"
                            rows={3}
                            className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black bg-transparent transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 text-xs tracking-widest uppercase font-semibold">
                        <button type="submit" disabled={isLoading} className="bg-[#333] text-white px-6 py-3 rounded-none hover:bg-black transition-colors disabled:bg-gray-400">
                            {isLoading ? "Đang lưu..." : "Lưu địa chỉ"}
                        </button>
                        <button type="button" onClick={() => setIsAdding(false)} className="border border-gray-200 text-gray-500 px-6 py-3 rounded-none hover:bg-gray-50 transition-colors">
                            Hủy
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}