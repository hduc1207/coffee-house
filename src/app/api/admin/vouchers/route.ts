import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const voucherSchema = z.object({
    code: z.string().min(3).max(30).toUpperCase(),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().int().min(1),
    maxDiscount: z.number().int().min(0).optional().nullable(),
    minOrder: z.number().int().min(0).optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
    isActive: z.boolean().default(true),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// GET /api/admin/vouchers
export async function GET(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (isActive !== null) where.isActive = isActive === "true";

    const vouchers = await prisma.voucher.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: true } } },
    });

    return NextResponse.json({ success: true, vouchers });
}

// POST /api/admin/vouchers
export async function POST(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
    }

    const parsed = voucherSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    // Validate: PERCENT phải từ 1 đến 100
    if (parsed.data.type === "PERCENT" && parsed.data.value > 100) {
        return NextResponse.json({ success: false, message: "Giảm giá theo % không thể vượt quá 100%" }, { status: 400 });
    }

    const existing = await prisma.voucher.findUnique({ where: { code: parsed.data.code } });
    if (existing) return NextResponse.json({ success: false, message: "Mã voucher đã tồn tại" }, { status: 409 });

    const data = {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    };

    const voucher = await prisma.voucher.create({ data });
    logger.info({ voucherId: voucher.id, code: voucher.code }, "[admin] Voucher created");

    return NextResponse.json({ success: true, voucher }, { status: 201 });
}
