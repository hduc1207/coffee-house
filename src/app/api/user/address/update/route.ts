import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { UpdateAddressSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

        const body = await req.json();
        const { id, name, phone, street } = UpdateAddressSchema.parse(body);

        const address = await prisma.address.findUnique({ where: { id } });
        if (!address || address.userId !== user.id) {
            return NextResponse.json({ message: "Không có quyền cập nhật địa chỉ này" }, { status: 403 });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: { name, phone, street },
        });

        return NextResponse.json({ message: "Cập nhật thành công", address: updatedAddress }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message, field: error.issues[0].path.join(".") },
                { status: 400 },
            );
        }
        logger.error({ err: error }, "Lỗi cập nhật địa chỉ");
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}

