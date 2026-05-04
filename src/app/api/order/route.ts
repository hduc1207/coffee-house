import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { customerName, phone, address, notes, deliveryMethod, paymentMethod, totalAmount, items } = body;

        const newOrder = await prisma.order.create({
            data: {
                customerName,
                phone,
                address,
                notes,
                deliveryMethod,
                paymentMethod,
                totalAmount,
                items: {
                    create: items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                },
            },
        });

        return NextResponse.json({ success: true, order: newOrder });
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        return NextResponse.json({ success: false, message: "Đã có lỗi xảy ra" }, { status: 500 });
    }
}