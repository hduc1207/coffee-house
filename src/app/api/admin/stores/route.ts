import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateStoreCache } from "@/lib/cache";

const storeSchema = z.object({
    name: z.string().min(1, "Tên cửa hàng không được để trống"),
    city: z.string().min(1, "Thành phố không được để trống"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    hours: z.string().min(1, "Giờ mở cửa không được để trống"),
    phone: z.string().min(1, "Số điện thoại không được để trống"),
    image: z.string().min(1, "Ảnh không được để trống"),
    desc: z.string().min(1, "Mô tả không được để trống"),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// GET /api/admin/stores
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, stores });
}

// POST /api/admin/stores
export async function POST(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
    }

    const parsed = storeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const store = await prisma.store.create({ data: parsed.data });
    await invalidateStoreCache();
    logger.info({ storeId: store.id }, "[admin] Store created");

    return NextResponse.json({ success: true, store }, { status: 201 });
}
