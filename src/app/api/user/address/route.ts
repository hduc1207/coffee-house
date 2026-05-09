import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

        const body = await req.json();
        const { name, phone, street } = body;
        const newAddress = await prisma.address.create({
            data: {
                userId: user.id,
                name,
                phone,
                street
            }
        });

        return NextResponse.json({ message: "Thêm thành công", address: newAddress }, { status: 200 });

    } catch (error) {
        console.error("Lỗi thêm địa chỉ:", error);
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        return NextResponse.json({ message: `Lỗi Server: ${errorMessage}` }, { status: 500 });
    }
}