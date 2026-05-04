import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const { orderId, status } = await req.json();

        // Lệnh yêu cầu Prisma cập nhật trạng thái đơn hàng
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status },
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}