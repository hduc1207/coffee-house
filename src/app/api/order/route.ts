import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { orderRatelimit, safeRatelimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import { CreateOrderSchema } from "@/lib/validations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { DELIVERY_FEE } from "@/lib/constants";
import { payos } from "@/lib/payos";

class OrderError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = "OrderError";
    }
}

function computeDiscount(
    voucher: { type: "PERCENT" | "FIXED"; value: number; maxDiscount: number | null },
    subtotal: number,
): number {
    let raw: number;
    if (voucher.type === "PERCENT") {
        raw = Math.floor((subtotal * voucher.value) / 100);
        if (voucher.maxDiscount !== null) {
            raw = Math.min(raw, voucher.maxDiscount);
        }
    } else {
        raw = voucher.value;
    }
    return Math.min(raw, subtotal);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        const ip = getClientIp(req);
        const { success, reset } = await safeRatelimit(orderRatelimit, ip);
        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
            return NextResponse.json(
                {
                    success: false,
                    message: "Bạn đặt hàng quá nhanh. Vui lòng thử lại sau ít phút.",
                },
                { status: 429, headers: { "Retry-After": String(retryAfter) } },
            );
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Body không phải JSON hợp lệ" },
                { status: 400 },
            );
        }
        const validatedOrder = CreateOrderSchema.parse(body);
        const deliveryFee = validatedOrder.deliveryMethod === "pickup" ? 0 : DELIVERY_FEE;

        try {
            const newOrder = await prisma.$transaction(async (tx) => {
                const productIds = validatedOrder.items.map((i) => i.id);
                const products = await tx.product.findMany({
                    where: { id: { in: productIds } },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        stock: true,
                        isAvailable: true,
                    },
                });

                const productMap = new Map(products.map((p) => [p.id, p]));

                let trueSubtotal = 0;
                for (const item of validatedOrder.items) {
                    const product = productMap.get(item.id);

                    if (!product) {
                        throw new OrderError(
                            `Sản phẩm "${item.name}" không tồn tại`,
                            400,
                        );
                    }
                    if (!product.isAvailable) {
                        throw new OrderError(
                            `Sản phẩm "${product.name}" hiện không còn bán`,
                            400,
                        );
                    }
                    if (product.price !== item.price) {
                        logger.warn(
                            {
                                productId: product.id,
                                givenPrice: item.price,
                                truePrice: product.price,
                            },
                            "Price mismatch",
                        );
                        throw new OrderError(
                            `Giá "${product.name}" đã thay đổi. Vui lòng tải lại trang.`,
                            400,
                        );
                    }
                    if (product.stock < item.quantity) {
                        throw new OrderError(
                            `Sản phẩm "${product.name}" chỉ còn ${product.stock} (bạn đặt ${item.quantity})`,
                            409,
                        );
                    }

                    trueSubtotal += product.price * item.quantity;
                }

                let voucherId: string | null = null;
                let discountAmount = 0;

                if (validatedOrder.voucherCode) {
                    const voucher = await tx.voucher.findUnique({
                        where: { code: validatedOrder.voucherCode },
                    });

                    if (!voucher || !voucher.isActive) {
                        throw new OrderError(
                            "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hoá.",
                            400,
                        );
                    }
                    if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) {
                        throw new OrderError("Mã giảm giá đã hết hạn.", 400);
                    }
                    if (
                        voucher.usageLimit !== null &&
                        voucher.usedCount >= voucher.usageLimit
                    ) {
                        throw new OrderError("Mã giảm giá đã hết lượt sử dụng.", 400);
                    }
                    if (voucher.minOrder !== null && trueSubtotal < voucher.minOrder) {
                        throw new OrderError(
                            `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString("vi-VN")}đ để áp dụng mã này.`,
                            400,
                        );
                    }

                    discountAmount = computeDiscount(voucher, trueSubtotal);
                    voucherId = voucher.id;
                }

                const expectedTotal = trueSubtotal - discountAmount + deliveryFee;
                if (validatedOrder.totalAmount !== expectedTotal) {
                    logger.warn(
                        {
                            given: validatedOrder.totalAmount,
                            expected: expectedTotal,
                            subtotal: trueSubtotal,
                            discountAmount,
                            deliveryFee,
                        },
                        "Total amount mismatch",
                    );
                    throw new OrderError(
                        "Tổng tiền không khớp. Có thể bạn đã sửa giá hoặc giá đã thay đổi. Vui lòng tải lại trang.",
                        400,
                    );
                }

                if (voucherId) {
                    const voucherUpdate = await tx.voucher.updateMany({
                        where: {
                            id: voucherId,
                            isActive: true,
                            OR: [
                                { usageLimit: null },
                                { usedCount: { lt: tx.voucher.fields.usageLimit } as never },
                            ],
                        },
                        data: { usedCount: { increment: 1 } },
                    });
                    if (voucherUpdate.count !== 1) {
                        throw new OrderError(
                            "Mã giảm giá vừa hết lượt sử dụng. Vui lòng thử mã khác.",
                            409,
                        );
                    }
                }

                for (const item of validatedOrder.items) {
                    const updated = await tx.product.updateMany({
                        where: {
                            id: item.id,
                            stock: { gte: item.quantity },
                            isAvailable: true,
                        },
                        data: { stock: { decrement: item.quantity } },
                    });

                    if (updated.count !== 1) {
                        const product = productMap.get(item.id)!;
                        throw new OrderError(
                            `Sản phẩm "${product.name}" vừa hết hàng. Vui lòng giảm số lượng.`,
                            409,
                        );
                    }
                }

                return tx.order.create({
                    data: {
                        userId,
                        customerName: validatedOrder.customerName,
                        phone: validatedOrder.phone,
                        address: validatedOrder.address,
                        notes: validatedOrder.notes,
                        deliveryMethod: validatedOrder.deliveryMethod,
                        paymentMethod: validatedOrder.paymentMethod,
                        totalAmount: expectedTotal,
                        items: {
                            create: validatedOrder.items.map((item) => {
                                const product = productMap.get(item.id)!;
                                return {
                                    productId: item.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: item.quantity,
                                };
                            }),
                        },
                    },
                    include: { items: true },
                });
            });

            if (validatedOrder.paymentMethod === "payos") {
                if (!payos) {
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id: newOrder.id },
                            data: { status: "CANCELLED" },
                        });
                        for (const item of newOrder.items) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { increment: item.quantity } },
                            });
                        }
                    });

                    return NextResponse.json(
                        { success: false, message: "Cổng thanh toán payOS chưa được cấu hình. Vui lòng chọn phương thức khác!" },
                        { status: 500 }
                    );
                }

                try {
                    const paymentLink = await payos.paymentRequests.create({
                        orderCode: newOrder.orderCode,
                        amount: newOrder.totalAmount,
                        description: `Thanh toan Bamboo #${newOrder.orderCode}`,
                        cancelUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout/cancel?orderCode=${newOrder.orderCode}`,
                        returnUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout/success?orderCode=${newOrder.orderCode}`,
                    });

                    await prisma.order.update({
                        where: { id: newOrder.id },
                        data: {
                            paymentLinkId: paymentLink.paymentLinkId,
                            payosQrCode: paymentLink.qrCode,
                            payosAccountNumber: paymentLink.accountNumber,
                            payosAccountName: paymentLink.accountName,
                            payosBin: paymentLink.bin,
                            payosCheckoutUrl: paymentLink.checkoutUrl,
                        },
                    });

                    return NextResponse.json({
                        success: true,
                        message: "Đặt hàng thành công! Đang tải thông tin thanh toán...",
                        order: newOrder,
                        paymentPageUrl: `/checkout/payment?orderId=${newOrder.id}`,
                    });
                } catch (payosError) {
                    console.error("Lỗi khi tạo payment link payos:", payosError);
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id: newOrder.id },
                            data: { status: "CANCELLED" },
                        });
                        for (const item of newOrder.items) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { increment: item.quantity } },
                            });
                        }
                    });

                    return NextResponse.json(
                        { success: false, message: "Không thể khởi tạo thanh toán payOS. Vui lòng thử lại!" },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json({
                success: true,
                message: "Đặt hàng thành công! The Bamboo sẽ liên hệ với bạn sớm nhất.",
                order: newOrder,
            });
        } catch (txError) {
            if (txError instanceof OrderError) {
                return NextResponse.json(
                    { success: false, message: txError.message },
                    { status: txError.status },
                );
            }
            throw txError;
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            logger.warn({ field: firstError.path.join("."), msg: firstError.message }, "Order validation error");

            return NextResponse.json(
                {
                    success: false,
                    message: firstError.message || "Dữ liệu không hợp lệ",
                    field: firstError.path.join("."),
                },
                { status: 400 }
            );
        }
        logger.error({ err: error }, "Lỗi khi tạo đơn hàng");

        return NextResponse.json(
            { success: false, message: "Lỗi server. Vui lòng thử lại sau." },
            { status: 500 }
        );
    }
}