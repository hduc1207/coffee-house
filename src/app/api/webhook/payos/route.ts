import { payos } from "@/lib/payos";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Body không phải JSON hợp lệ" },
                { status: 400 }
            );
        }

        if (!payos) {
            return NextResponse.json(
                { success: false, message: "Cổng thanh toán payOS chưa được cấu hình" },
                { status: 500 }
            );
        }

        let webhookData;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            webhookData = await payos.webhooks.verify(body as any);
        } catch (verifyError) {
            console.error("[payos-webhook] Signature verification failed:", verifyError);
            return NextResponse.json(
                { success: false, message: "Mã kiểm tra chữ ký signature không hợp lệ" },
                { status: 400 }
            );
        }

        console.log("[payos-webhook] Received verified webhook data:", webhookData);

        const order = await prisma.order.findUnique({
            where: { orderCode: webhookData.orderCode },
            include: { items: true },
        });

        if (!order) {
            console.warn(`[payos-webhook] Không tìm thấy đơn hàng với orderCode: ${webhookData.orderCode}. Có thể đây là giao dịch thử nghiệm hoặc đơn hàng đã bị xóa.`);
            // Trả về 200 OK để PayOS xác nhận webhook hoạt động (đặc biệt khi PayOS gửi request test ping)
            return NextResponse.json({ success: true, message: "Nhận webhook thành công nhưng không tìm thấy đơn hàng tương ứng trong hệ thống" });
        }

        if (order.status !== "PENDING") {
            console.log(`[payos-webhook] Đơn hàng ${order.id} đã có trạng thái ${order.status}. Bỏ qua.`);
            return NextResponse.json({ success: true, message: "Đơn hàng đã được xử lý trước đó" });
        }

        const rawBody = body as { code?: string; success?: boolean };

        if (rawBody.code === "00") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "PROCESSING" },
            });
            console.log(`[payos-webhook] Cập nhật đơn hàng ${order.id} thành công sang PROCESSING.`);
        } else {
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
            console.log(`[payos-webhook] Giao dịch thất bại cho đơn hàng ${order.id}. Đã hủy đơn và hoàn trả tồn kho.`);
        }

        return NextResponse.json({ success: true, message: "Xử lý webhook payOS thành công" });
    } catch (error) {
        console.error("[payos-webhook] Lỗi xử lý webhook:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi xử lý webhook" },
            { status: 500 }
        );
    }
}
