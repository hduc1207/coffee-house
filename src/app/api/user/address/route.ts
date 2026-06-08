import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { CreateAddressSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

        const body = await req.json();
        const { name, phone, street } = CreateAddressSchema.parse(body);

        const newAddress = await prisma.address.create({
            data: {
                userId: user.id,
                name,
                phone,
                street,
            },
        });

        return NextResponse.json({ message: "Thêm thành công", address: newAddress }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message, field: error.issues[0].path.join(".") },
                { status: 400 },
            );
        }
        logger.error({ err: error }, "Lỗi thêm địa chỉ");
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { addresses: { orderBy: { createdAt: "desc" } } }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Không tìm thấy user" }, { status: 404 });
        }

        return NextResponse.json({ success: true, addresses: user.addresses });
    } catch (error) {
        logger.error({ err: error }, "Lỗi lấy danh sách địa chỉ");
        return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
    }
}