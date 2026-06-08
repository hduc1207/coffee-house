import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("@/lib/authOptions", () => ({
    authOptions: {},
}));

vi.mock("fs/promises", () => ({
    writeFile: vi.fn(),
    mkdir: vi.fn(),
}));

import { POST } from "./route";
import { getServerSession } from "next-auth/next";
import { writeFile, mkdir } from "fs/promises";

describe("POST /api/admin/upload", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

    it("upload thành công khi gửi file hợp lệ", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);

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
        expect(json.url).toMatch(/^\/uploads\/\d+\.png$/);
        expect(mkdir).toHaveBeenCalled();
        expect(writeFile).toHaveBeenCalled();
    });

    it("upload thành công khi gửi file ở dạng Blob (không có name)", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { role: "admin" },
        } as any);

        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);

        const blob = new Blob(["fake-image-content-raw-blob"], { type: "image/png" });

        const formData = new FormData();
        formData.append("file", blob); // standard Blob appended to form-data

        const req = new Request("http://localhost/api/admin/upload", {
            method: "POST",
            body: formData,
        });

        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.url).toMatch(/^\/uploads\/\d+\.jpg$/); // defaults to .jpg
        expect(mkdir).toHaveBeenCalled();
        expect(writeFile).toHaveBeenCalled();
    });
});
