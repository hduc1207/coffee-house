"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này?")) return;
        
        setIsUpdating(true);
        const prevStatus = status;
        setStatus(newStatus);

        try {
            const res = await fetch("/api/order/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            if (!res.ok) throw new Error("API error");
            toast.success("Cập nhật trạng thái thành công!");
            router.refresh();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật!");
            setStatus(prevStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-none text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer border transition-colors ${
                status === "PENDING" ? "bg-[#FFF9E6] text-[#805B00] border-[#FFE7A3]" :
                    status === "PROCESSING" ? "bg-[#EBF3FF] text-[#00409E] border-[#C2DBFF]" :
                        status === "COMPLETED" ? "bg-[#EBFDF5] text-[#006039] border-[#B6F5D9]" :
                            "bg-[#FFF0F0] text-[#B80000] border-[#FFD1D1]"
            }`}
        >
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đã thanh toán</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Hủy đơn</option>
        </select>
    );
}