import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Thiếu token"),
    password: z
        .string()
        .min(8, "Mật khẩu phải ít nhất 8 ký tự")
        .max(100, "Mật khẩu tối đa 100 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ hoa")
        .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ thường")
        .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
        .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, password } = ResetPasswordSchema.parse(body);

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { success: false, message: "Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng." },
                { status: 400 },
            );
        }

        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return NextResponse.json(
                { success: false, message: "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại." },
                { status: 400 },
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });

        if (!user) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return NextResponse.json(
                { success: false, message: "Không tìm thấy tài khoản." },
                { status: 404 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Xóa tất cả token của email này sau khi đổi mật khẩu thành công
        await prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

        return NextResponse.json({
            success: true,
            message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: error.issues[0].message },
                { status: 400 },
            );
        }
        console.error("[reset-password] Error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống. Vui lòng thử lại sau." },
            { status: 500 },
        );
    }
}
