import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Không tìm thấy user" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get("id");

        if (!addressId) {
            return NextResponse.json({ message: "Thiếu ID địa chỉ" }, { status: 400 });
        }

        // Verify the address belongs to the user
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== user.id) {
            return NextResponse.json({ message: "Không có quyền xóa địa chỉ này" }, { status: 403 });
        }

        await prisma.address.delete({ where: { id: addressId } });

        return NextResponse.json({ message: "Xóa thành công" }, { status: 200 });
    } catch (error) {
        logger.error({ err: error }, "Lỗi xóa địa chỉ");
        return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
    }
}

