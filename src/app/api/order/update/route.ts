import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const ALLOWED_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
        }

        if (typeof body !== 'object' || body === null) {
             return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
        }

        const { orderId, status } = body as { orderId?: string, status?: string };

        if (!orderId || !status) {
            return NextResponse.json({ success: false, message: "Thiếu orderId hoặc status" }, { status: 400 });
        }

        if (!ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
            return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
        }

        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
        if (!existingOrder) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: status as OrderStatus },
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        logger.error({ err: error }, "Lỗi cập nhật trạng thái đơn hàng");
        return NextResponse.json({ success: false, message: "Lỗi server" }, { status: 500 });
    }
}