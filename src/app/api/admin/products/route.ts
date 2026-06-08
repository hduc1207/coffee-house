import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateMenuCache } from "@/lib/cache";

const productSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
    price: z.number().int().min(1000, "Giá tối thiểu 1.000đ"),
    image: z.string().url("Ảnh phải là URL hợp lệ").or(z.string().startsWith("/uploads/")),
    description: z.string().min(1),
    origin: z.string().min(1),
    roast: z.string().min(1),
    category: z.string().min(1),
    stock: z.number().int().min(0).default(100),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
});

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return null;
    return session;
}

// GET /api/admin/products
export async function GET(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isAvailable = searchParams.get("isAvailable");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (isAvailable !== null) where.isAvailable = isAvailable === "true";

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return NextResponse.json({ success: true, products, total, page, limit });
}

// POST /api/admin/products
export async function POST(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });

    let body: unknown;
    try { body = await req.json(); } catch {
        return NextResponse.json({ success: false, message: "Body không hợp lệ" }, { status: 400 });
    }

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
        return NextResponse.json({ success: false, message: "Slug đã tồn tại, vui lòng chọn slug khác" }, { status: 409 });
    }

    const product = await prisma.product.create({ data: parsed.data });
    await invalidateMenuCache([product.slug]);
    logger.info({ productId: product.id }, "[admin] Product created");

    return NextResponse.json({ success: true, product }, { status: 201 });
}
