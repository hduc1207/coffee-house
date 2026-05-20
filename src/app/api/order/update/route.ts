import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["PENDING", "CONFIRMED", "DELIVERED", "COMPLETED", "CANCELLED"] as const;

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
        }

        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: "Thiếu orderId hoặc status" }, { status: 400 });
        }

        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
    }
}