import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAdminPage = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");
    const isUserPage = pathname.startsWith("/account");
    const isUserApi = pathname.startsWith("/api/user");
    
    const isProtected = isAdminPage || isAdminApi || isUserPage || isUserApi;

    if (!isProtected) { return NextResponse.next(); }

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        if (isAdminApi || isUserApi) {
            return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });
        }
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if ((isAdminPage || isAdminApi) && token.role !== "admin") {
        if (isAdminApi) {
            return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*", 
        "/api/admin/:path*",
        "/account/:path*",
        "/api/user/:path*"
    ],
};
