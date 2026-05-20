import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 1. ĐỊNH NGHĨA SCHEMA VALIDATION BẰNG ZOD
const OrderItemSchema = z.object({
    id: z.string().uuid("ID sản phẩm không hợp lệ").optional(),
    name: z.string().min(1, "Tên sản phẩm không được trống").max(200),
    price: z.number().int("Giá phải là số nguyên").positive("Giá phải > 0"),
    quantity: z.number().int("Số lượng phải là số nguyên").positive("Số lượng phải >= 1"),
});

const CreateOrderSchema = z.object({
    customerName: z.string()
        .min(2, "Tên khách hàng phải ít nhất 2 ký tự")
        .max(100, "Tên khách hàng tối đa 100 ký tự")
        .trim(),

    phone: z.string()
        .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (VN format)")
        .trim(),

    address: z.string()
        .min(5, "Địa chỉ phải ít nhất 5 ký tự")
        .max(500, "Địa chỉ tối đa 500 ký tự")
        .trim(),

    notes: z.string()
        .max(500, "Ghi chú tối đa 500 ký tự")
        .trim()
        .optional()
        .default(""),

    deliveryMethod: z.enum(["delivery", "pickup"]),

    paymentMethod: z.enum(["cod", "momo"]),

    totalAmount: z.number()
        .int("Tổng tiền phải là số nguyên")
        .positive("Tổng tiền phải > 0"),

    items: z.array(OrderItemSchema)
        .min(1, "Giỏ hàng phải có ít nhất 1 sản phẩm"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedOrder = CreateOrderSchema.parse(body);
        const calculatedSubtotal = validatedOrder.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        const deliveryFee = validatedOrder.deliveryMethod === "pickup" ? 0 : 30000;
        const expectedTotal = calculatedSubtotal + deliveryFee;

        if (validatedOrder.totalAmount !== expectedTotal) {
            console.warn(
                `⚠️ Price mismatch detected! User: ${validatedOrder.totalAmount}, Expected: ${expectedTotal}`,
                { customerName: validatedOrder.customerName }
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Tổng tiền không khớp. Có thể bạn đã sửa giá? Vui lòng tải lại trang.",
                },
                { status: 400 }
            );
        }

        // 5. TẠO ĐƠN HÀNG VỚI DỮ LIỆU ĐÃ VALIDATE
        const newOrder = await prisma.order.create({
            data: {
                customerName: validatedOrder.customerName,
                phone: validatedOrder.phone,
                address: validatedOrder.address,
                notes: validatedOrder.notes,
                deliveryMethod: validatedOrder.deliveryMethod,
                paymentMethod: validatedOrder.paymentMethod,
                totalAmount: expectedTotal,
                items: {
                    create: validatedOrder.items.map((item) => ({
                        productId: item.id || "",
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { items: true },
        });

        return NextResponse.json({
            success: true,
            message: "Đặt hàng thành công! The Bamboo sẽ liên hệ với bạn sớm nhất.",
            order: newOrder,
        });

    } catch (error) {
        // 6. XỬ LÝ VALIDATION ERRORS
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            console.warn("Validation error:", firstError);

            return NextResponse.json(
                {
                    success: false,
                    message: firstError.message || "Dữ liệu không hợp lệ",
                    field: firstError.path.join("."),
                },
                { status: 400 }
            );
        }
        if (error instanceof Error) {
            console.error("Lỗi khi tạo đơn hàng:", error.message);
        }

        return NextResponse.json(
            { success: false, message: "Lỗi server. Vui lòng thử lại sau." },
            { status: 500 }
        );
    }
}