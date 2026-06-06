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
            select: {
                id: true,
                orderCode: true,
                totalAmount: true,
                paymentMethod: true,
                status: true,
                payosQrCode: true,
                payosAccountNumber: true,
                payosAccountName: true,
                payosBin: true,
                payosCheckoutUrl: true,
            },
        });

        if (!order) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đơn hàng" }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("[api-order-payment-details] GET error", error);
        return NextResponse.json({ success: false, message: "Lỗi hệ thống khi lấy thông tin đơn hàng" }, { status: 500 });
    }
}
