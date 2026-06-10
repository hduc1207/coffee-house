import { NextResponse } from "next/server";
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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const bucketName = process.env.SUPABASE_BUCKET || "coffee-images";

        if (!supabaseUrl || !supabaseKey) {
            logger.error("[upload] Missing Supabase configurations in environment variables");
            return NextResponse.json({ 
                success: false, 
                message: "Chưa cấu hình Supabase URL hoặc Service Role Key trên máy chủ." 
            }, { status: 500 });
        }

        const filename = (file as any).name || "image.jpg";
        const parts = filename.split(".");
        const ext = parts.length > 1 ? parts.pop()?.toLowerCase() ?? "jpg" : "jpg";
        
        const timestamp = Date.now();
        const safeName = `${timestamp}.${ext}`;

        const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${safeName}`;

        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": file.type || "image/jpeg",
            },
            body: file,
        });

        const uploadData = await uploadRes.json();
        
        if (uploadRes.ok) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${safeName}`;
            logger.info({ filename: safeName, size: file.size, url: publicUrl }, "[upload] File uploaded to Supabase Storage");
            return NextResponse.json({ success: true, url: publicUrl });
        } else {
            logger.error({ err: uploadData }, "[upload] Supabase Storage upload failed");
            return NextResponse.json({ 
                success: false, 
                message: `Lỗi upload lên Supabase Storage: ${uploadData.message || "Unknown error"}` 
            }, { status: 500 });
        }
    } catch (error) {
        logger.error({ err: error }, "[upload] Upload failed");
        return NextResponse.json({ success: false, message: "Lỗi server khi upload" }, { status: 500 });
    }
}
