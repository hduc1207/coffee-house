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
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer border-r-4 border-transparent transition-colors ${
                status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                        status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
            }`}
        >
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Hủy đơn</option>
        </select>
    );
}