import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations";
import { registerRatelimit, safeRatelimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        // Rate-limit theo IP: 3 lần đăng ký / giờ
        const ip = getClientIp(req);
        const { success, reset } = await safeRatelimit(registerRatelimit, ip);
        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
            return NextResponse.json(
                { message: "Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau." },
                { status: 429, headers: { "Retry-After": String(retryAfter) } },
            );
        }

        const body = await req.json();
        const { firstName, lastName, email, password } = RegisterSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email này đã được sử dụng. Vui lòng đăng nhập!" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstName} ${lastName}`.trim();
        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "Tạo tài khoản thành công!",
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0].message, field: error.issues[0].path.join(".") },
                { status: 400 },
            );
        }
        logger.error({ err: error }, "Lỗi khi đăng ký");
        return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." }, { status: 500 });
    }
}