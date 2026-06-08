import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone } = UpdateProfileSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name, phone },
        });

        return NextResponse.json({
            message: "Thành công",
            user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone },
        }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message, field: error.issues[0].path.join(".") },
                { status: 400 },
            );
        }
        logger.error({ err: error }, "Lỗi cập nhật profile");
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}