import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, message: "Không có file được gửi lên" }, { status: 400 });
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, message: "Chỉ chấp nhận file ảnh (jpg, png, webp, gif)" }, { status: 400 });
        }

        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeBytes) {
            return NextResponse.json({ success: false, message: "File quá lớn, tối đa 5MB" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename: giữ extension, tạo tên unique
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const timestamp = Date.now();
        const safeName = `${timestamp}.${ext}`;

        const uploadsDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        await writeFile(join(uploadsDir, safeName), buffer);

        const url = `/uploads/${safeName}`;
        logger.info({ filename: safeName, size: file.size }, "[upload] File uploaded");

        return NextResponse.json({ success: true, url });
    } catch (error) {
        logger.error({ err: error }, "[upload] Upload failed");
        return NextResponse.json({ success: false, message: "Lỗi server khi upload" }, { status: 500 });
    }
}
