import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "Thiếu mã định danh đơn hàng" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            select: { status: true, orderCode: true },
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
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
