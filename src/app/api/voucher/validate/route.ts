import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        if (typeof body !== "object" || body === null) {
            return NextResponse.json(
                { success: false, message: "Dữ liệu gửi lên không hợp lệ" },
                { status: 400 }
            );
        }

        const { code, subtotal } = body as { code?: string; subtotal?: number };

        if (!code || typeof subtotal !== "number") {
            return NextResponse.json(
                { success: false, message: "Thiếu mã giảm giá hoặc tổng tiền hàng" },
                { status: 400 }
            );
        }

        const cleanCode = code.trim().toUpperCase();

        const voucher = await prisma.voucher.findUnique({
            where: { code: cleanCode },
        });

        if (!voucher || !voucher.isActive) {
            return NextResponse.json(
                { success: false, message: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hoá" },
                { status: 404 }
            );
        }

        if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) {
            return NextResponse.json(
                { success: false, message: "Mã giảm giá đã hết hạn sử dụng" },
                { status: 400 }
            );
        }

        if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
            return NextResponse.json(
                { success: false, message: "Mã giảm giá đã hết lượt sử dụng" },
                { status: 400 }
            );
        }

        if (voucher.minOrder !== null && subtotal < voucher.minOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString("vi-VN")}đ để áp dụng mã này`,
                },
                { status: 400 }
            );
        }

        // Tính toán discount
        let discountAmount = 0;
        if (voucher.type === "PERCENT") {
            discountAmount = Math.floor((subtotal * voucher.value) / 100);
            if (voucher.maxDiscount !== null) {
                discountAmount = Math.min(discountAmount, voucher.maxDiscount);
            }
        } else {
            discountAmount = voucher.value;
        }

        // Không bao giờ giảm vượt quá tiền hàng
        discountAmount = Math.min(discountAmount, subtotal);

        return NextResponse.json({
            success: true,
            message: "Áp dụng mã giảm giá thành công!",
            voucher: {
                id: voucher.id,
                code: voucher.code,
                type: voucher.type,
                value: voucher.value,
            },
            discountAmount,
        });
    } catch (error) {
        console.error("[voucher-validate] Error", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống khi kiểm tra voucher" },
            { status: 500 }
        );
    }
}
