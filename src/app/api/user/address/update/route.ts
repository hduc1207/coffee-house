import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

        const body = await req.json();
        const { id, name, phone, street } = body;

        if (!id) {
            return NextResponse.json({ message: "Thiếu ID địa chỉ" }, { status: 400 });
        }

        // Verify the address belongs to the user
        const address = await prisma.address.findUnique({ where: { id } });
        if (!address || address.userId !== user.id) {
            return NextResponse.json({ message: "Không có quyền cập nhật địa chỉ này" }, { status: 403 });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                name: name || address.name,
                phone: phone || address.phone,
                street: street || address.street,
            }
        });

        return NextResponse.json({ message: "Cập nhật thành công", address: updatedAddress }, { status: 200 });
    } catch (error) {
        console.error("Lỗi cập nhật địa chỉ:", error);
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        return NextResponse.json({ message: `Lỗi Server: ${errorMessage}` }, { status: 500 });
    }
}

