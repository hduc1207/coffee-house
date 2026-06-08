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

        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!existingOrder) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        let updatedOrder;

        if (existingOrder.status !== "CANCELLED" && status === "CANCELLED") {
            // Chuyển sang CANCELLED -> Hoàn lại tồn kho
            updatedOrder = await prisma.$transaction(async (tx) => {
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: { status: "CANCELLED" },
                });

                for (const item of existingOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
                return updated;
            });
        } else if (existingOrder.status === "CANCELLED" && status !== "CANCELLED") {
            // Khôi phục từ CANCELLED -> Trừ bớt tồn kho
            updatedOrder = await prisma.$transaction(async (tx) => {
                // Kiểm tra xem sản phẩm có đủ tồn kho không
                for (const item of existingOrder.items) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product || product.stock < item.quantity) {
                        throw new Error(`Sản phẩm "${product?.name || item.productId}" không đủ tồn kho để khôi phục đơn hàng.`);
                    }
                }

                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: { status: status as OrderStatus },
                });

                for (const item of existingOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }
                return updated;
            });
        } else {
            updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: { status: status as OrderStatus },
            });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        logger.error({ err: error }, "Lỗi cập nhật trạng thái đơn hàng");
        const errorMessage = error instanceof Error ? error.message : "Lỗi server";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: errorMessage.includes("tồn kho") ? 409 : 500 }
        );
    }
}