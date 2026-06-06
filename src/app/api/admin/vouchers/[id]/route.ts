import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const patchSchema = z.object({
    isActive: z.boolean().optional(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
    value: z.number().int().min(1).optional(),
    maxDiscount: z.number().int().min(0).optional().nullable(),
    minOrder: z.number().int().min(0).optional().nullable(),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// PATCH /api/admin/vouchers/[id]
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

    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy voucher" }, { status: 404 });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.expiresAt !== undefined) {
        data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }

    const voucher = await prisma.voucher.update({ where: { id }, data });
    logger.info({ voucherId: id }, "[admin] Voucher updated");

    return NextResponse.json({ success: true, voucher });
}

// DELETE /api/admin/vouchers/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { id } = await params;

    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy voucher" }, { status: 404 });

    // Ngắt FK trên Order trước khi xóa
    await prisma.order.updateMany({ where: { voucherId: id }, data: { voucherId: null } });
    await prisma.voucher.delete({ where: { id } });
    logger.info({ voucherId: id, code: existing.code }, "[admin] Voucher deleted");

    return NextResponse.json({ success: true });
}
