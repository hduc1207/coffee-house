import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateStoreCache } from "@/lib/cache";

const patchSchema = z.object({
    name: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    hours: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    image: z.string().min(1).optional(),
    desc: z.string().min(1).optional(),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// PATCH /api/admin/stores/[id]
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

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy cửa hàng" }, { status: 404 });

    const store = await prisma.store.update({ where: { id }, data: parsed.data });
    await invalidateStoreCache();
    logger.info({ storeId: id }, "[admin] Store updated");

    return NextResponse.json({ success: true, store });
}

// DELETE /api/admin/stores/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { id } = await params;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Không tìm thấy cửa hàng" }, { status: 404 });

    await prisma.store.delete({ where: { id } });
    await invalidateStoreCache();
    logger.info({ storeId: id }, "[admin] Store deleted");

    return NextResponse.json({ success: true });
}
