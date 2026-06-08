import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock TRƯỚC khi import route handler để các `import` của route
// dùng đúng phiên bản đã mock.
vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            update: vi.fn(),
        },
    },
}));

// Tránh phụ thuộc vào next-auth options khi test profile handler
vi.mock("@/lib/authOptions", () => ({
    authOptions: {},
}));

import { PUT } from "./route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const makeRequest = (body: unknown) =>
    new Request("http://localhost/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

describe("PUT /api/user/profile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("trả 401 khi chưa đăng nhập", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const res = await PUT(makeRequest({ name: "Anh A", phone: "0987654321" }));
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toMatch(/đăng nhập/i);
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("trả 400 khi name rỗng", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { email: "a@b.com" },
        } as never);

        const res = await PUT(makeRequest({ name: "", phone: "0987654321" }));
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.field).toBe("name");
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("trả 400 khi name vượt 100 ký tự", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { email: "a@b.com" },
        } as never);

        const res = await PUT(makeRequest({ name: "A".repeat(101), phone: "0987654321" }));
        expect(res.status).toBe(400);
    });

    it("trả 400 khi phone sai định dạng", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { email: "a@b.com" },
        } as never);

        const res = await PUT(makeRequest({ name: "Hợp lệ", phone: "12345" }));
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.field).toBe("phone");
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("update thành công và trả về 200 với name đã sanitize", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { email: "a@b.com" },
        } as never);

        vi.mocked(prisma.user.update).mockResolvedValueOnce({
            id: "u1",
            email: "a@b.com",
            name: "Nguyễn Văn A",
            phone: "0987654321",
        } as never);

        // Tên có HTML tag - sẽ bị sanitizeText() loại bỏ
        const res = await PUT(makeRequest({ name: "<script>Nguyễn Văn A</script>", phone: "0987654321" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.message).toBe("Thành công");
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { email: "a@b.com" },
            data: { name: "Nguyễn Văn A", phone: "0987654321" }, // tag bị strip
        });
    });

    it("trả 500 khi prisma throw", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { email: "a@b.com" },
        } as never);
        vi.mocked(prisma.user.update).mockRejectedValueOnce(new Error("DB down"));

        const res = await PUT(makeRequest({ name: "Hợp lệ", phone: "0987654321" }));
        expect(res.status).toBe(500);
    });
});
