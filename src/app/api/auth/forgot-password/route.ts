import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerRatelimit, safeRatelimit, getClientIp } from "@/lib/ratelimit";
import { sendPasswordResetEmail } from "@/lib/mailer";

const ForgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ").transform((v) => v.trim().toLowerCase()),
});

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const { success } = await safeRatelimit(registerRatelimit, ip);
        if (!success) {
            return NextResponse.json(
                { message: "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau." },
                { status: 429 },
            );
        }

        const body = await req.json();
        const { email } = ForgotPasswordSchema.parse(body);

        const user = await prisma.user.findUnique({ where: { email } });

        // Luôn trả về thành công để chống enumeration attack
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.",
            });
        }

        // Xóa token cũ của email này
        await prisma.passwordResetToken.deleteMany({ where: { email } });

        // Tạo token mới (48 ký tự hex)
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        await prisma.passwordResetToken.create({
            data: { email, token, expiresAt },
        });

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail(email, resetUrl);

        return NextResponse.json({
            success: true,
            message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: error.issues[0].message },
                { status: 400 },
            );
        }
        console.error("[forgot-password] Error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi hệ thống. Vui lòng thử lại sau." },
            { status: 500 },
        );
    }
}
