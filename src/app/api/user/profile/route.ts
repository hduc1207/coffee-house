import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { name: name },
        });

        return NextResponse.json({ message: "Thành công", user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Lỗi:", error);
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}