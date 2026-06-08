import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { payos } from "@/lib/payos";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Thiếu mã định danh đơn hàng" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            select: { status: true, orderCode: true, paymentMethod: true, items: { select: { productId: true, quantity: true } } },
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        // Fallback: nếu đơn PayOS vẫn PENDING, chủ động hỏi PayOS API
        if (order.status === "PENDING" && order.paymentMethod === "payos" && payos) {
            try {
                const payosInfo = await payos.paymentRequests.get(order.orderCode);

                if (payosInfo.status === "PAID") {
                    await prisma.order.update({
                        where: { id },
                        data: { status: "PROCESSING" },
                    });
                    console.log(`[status-poll] Đơn hàng ${id} đã được thanh toán qua PayOS. Cập nhật sang PROCESSING.`);
                    return NextResponse.json({ success: true, status: "PROCESSING", orderCode: order.orderCode });
                }

                if (payosInfo.status === "CANCELLED" || payosInfo.status === "EXPIRED") {
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id },
                            data: { status: "CANCELLED" },
                        });
                        for (const item of order.items) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { increment: item.quantity } },
                            });
                        }
                    });
                    console.log(`[status-poll] Đơn hàng ${id} đã bị hủy/hết hạn trên PayOS. Cập nhật sang CANCELLED.`);
                    return NextResponse.json({ success: true, status: "CANCELLED", orderCode: order.orderCode });
                }
            } catch (payosError) {
                console.warn("[status-poll] Không thể kiểm tra PayOS API, trả về trạng thái DB:", payosError);
            }
        }

        return NextResponse.json({ success: true, status: order.status, orderCode: order.orderCode });
    } catch (error) {
        console.error("[api-order-status] GET error", error);
        return NextResponse.json({ success: false, message: "Lỗi hệ thống khi lấy trạng thái" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Body không phải JSON hợp lệ" }, { status: 400 });
        }

        if (typeof body !== "object" || body === null) {
            return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
        }

        const { id, action } = body as { id?: string; action?: string };

        if (!id || action !== "CANCEL") {
            return NextResponse.json({ success: false, message: "Dữ liệu hoặc hành động không hợp lệ" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        if (order.status !== "PENDING") {
            return NextResponse.json({ success: false, message: "Đơn hàng đã rời trạng thái chờ, không thể hủy" }, { status: 400 });
        }

        // Thực hiện hủy đơn hàng và hoàn lại tồn kho atomically
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: { status: "CANCELLED" },
            });

            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
        });

        return NextResponse.json({ success: true, message: "Đã hủy giao dịch đơn hàng thành công" });
    } catch (error) {
        console.error("[api-order-status] POST error", error);
        return NextResponse.json({ success: false, message: "Lỗi hệ thống khi thực hiện hủy đơn" }, { status: 500 });
    }
}
