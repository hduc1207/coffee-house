import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
        .string()
        .min(8, "Mật khẩu mới phải ít nhất 8 ký tự")
        .max(100, "Mật khẩu mới tối đa 100 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = ChangePasswordSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { message: "Tài khoản không hỗ trợ đổi mật khẩu (đăng nhập bằng Google)" },
                { status: 400 },
            );
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ message: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Đổi mật khẩu thành công" }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message, field: error.issues[0].path.join(".") },
                { status: 400 },
            );
        }
        console.error("Lỗi đổi mật khẩu:", error);
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}
