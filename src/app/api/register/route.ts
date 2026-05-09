import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, password } = body;
        if (!firstName || !email || !password) {
            return NextResponse.json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." }, { status: 400 });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email này đã được sử dụng. Vui lòng đăng nhập!" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstName} ${lastName}`.trim();
        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email: email,
                password: hashedPassword,
            }
        });

        return NextResponse.json({ message: "Tạo tài khoản thành công!", user: newUser }, { status: 201 });

    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        return NextResponse.json({ message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." }, { status: 500 });
    }
}