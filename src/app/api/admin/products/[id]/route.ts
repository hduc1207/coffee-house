import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateMenuCache } from "@/lib/cache";

const patchSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.number().int().min(1000).optional(),
    image: z.string().optional(),
    description: z.string().min(1).optional(),
    origin: z.string().min(1).optional(),
    roast: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// PATCH /api/admin/products/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { id } = await params;

    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" }, { status: 404 });

    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    await invalidateMenuCache([product.slug]);
    logger.info({ productId: id }, "[admin] Product updated");

    return NextResponse.json({ success: true, product });
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" }, { status: 404 });

    // Kiểm tra xem sản phẩm có trong đơn hàng nào không (FK Restrict)
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
        return NextResponse.json({
            success: false,
            message: `Không thể xóa vì sản phẩm đã có trong ${orderItemCount} đơn hàng. Hãy tắt hiển thị thay vì xóa.`,
        }, { status: 409 });
    }

    await prisma.product.delete({ where: { id } });
    await invalidateMenuCache([existing.slug]);
    logger.info({ productId: id }, "[admin] Product deleted");

    return NextResponse.json({ success: true });
}
