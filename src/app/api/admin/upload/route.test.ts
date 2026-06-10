import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("@/lib/authOptions", () => ({
    authOptions: {},
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "./route";
import { getServerSession } from "next-auth/next";

describe("POST /api/admin/upload (Supabase Storage)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = {
            ...originalEnv,
            NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY: "service-role-key-test",
            SUPABASE_BUCKET: "coffee-images-test",
        };
    });

    it("trả 403 khi chưa đăng nhập hoặc không phải admin", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const formData = new FormData();
        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json.success).toBe(false);
    });

    it("trả 400 khi không gửi file", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        const formData = new FormData();
        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.message).toMatch(/Không có file/);
    });

    it("trả 500 khi chưa cấu hình biến môi trường Supabase", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        delete (process.env as any).NEXT_PUBLIC_SUPABASE_URL;

        const blob = new Blob(["fake-image-content"], { type: "image/png" });
        const file = new File([blob], "test-image.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);

        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.message).toMatch(/Chưa cấu hình Supabase URL/);
    });

    it("upload thành công khi gửi file hợp lệ", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ Key: "coffee-images-test/1780934168137.png" })
        });

        const blob = new Blob(["fake-image-content"], { type: "image/png" });
        const file = new File([blob], "test-image.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);

        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.url).toMatch(/^https:\/\/project\.supabase\.co\/storage\/v1\/object\/public\/coffee-images-test\/\d+\.png$/);
        expect(mockFetch).toHaveBeenCalled();
    });

    it("upload thành công khi gửi file ở dạng Blob (không có name)", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ Key: "coffee-images-test/1780934168137.jpg" })
        });

        const blob = new Blob(["fake-image-content-raw-blob"], { type: "image/png" });

        const formData = new FormData();
        formData.append("file", blob);

        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.url).toMatch(/^https:\/\/project\.supabase\.co\/storage\/v1\/object\/public\/coffee-images-test\/\d+\.jpg$/);
        expect(mockFetch).toHaveBeenCalled();
    });
});
