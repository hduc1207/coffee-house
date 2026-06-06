/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        voucher: {
            findUnique: vi.fn(),
        },
    },
}));

const makeRequest = (body: unknown) =>
    new Request("http://localhost/api/voucher/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

describe("POST /api/voucher/validate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when missing parameters", async () => {
        const res = await POST(makeRequest({ code: "" }));
        expect(res.status).toBe(400);
    });

    it("returns 404 when voucher not found or inactive", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce(null);
        const res = await POST(makeRequest({ code: "INVALID", subtotal: 100000 }));
        expect(res.status).toBe(404);
    });

    it("returns 400 when voucher is expired", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce({
            id: "v1",
            code: "EXPIRED",
            isActive: true,
            expiresAt: new Date(Date.now() - 100000),
            usageLimit: null,
            usedCount: 0,
            minOrder: null,
            value: 10000,
            type: "FIXED",
        } as any);
        const res = await POST(makeRequest({ code: "EXPIRED", subtotal: 100000 }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when usage limit is reached", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce({
            id: "v1",
            code: "LIMIT",
            isActive: true,
            expiresAt: null,
            usageLimit: 5,
            usedCount: 5,
            minOrder: null,
            value: 10,
            type: "PERCENT",
        } as any);
        const res = await POST(makeRequest({ code: "LIMIT", subtotal: 100000 }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when minOrder is not met", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce({
            id: "v1",
            code: "MINORDER",
            isActive: true,
            expiresAt: null,
            usageLimit: null,
            usedCount: 0,
            minOrder: 150000,
            value: 20000,
            type: "FIXED",
        } as any);
        const res = await POST(makeRequest({ code: "MINORDER", subtotal: 100000 }));
        expect(res.status).toBe(400);
    });

    it("calculates PERCENT discount successfully", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce({
            id: "v1",
            code: "PERCENT20",
            isActive: true,
            expiresAt: null,
            usageLimit: null,
            usedCount: 0,
            minOrder: 100000,
            value: 20,
            type: "PERCENT",
            maxDiscount: 15000,
        } as any);
        const res = await POST(makeRequest({ code: "PERCENT20", subtotal: 100000 }));
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.discountAmount).toBe(15000); // 20% of 100000 is 20000, but capped at 15000
    });

    it("calculates FIXED discount successfully", async () => {
        vi.mocked(prisma.voucher.findUnique).mockResolvedValueOnce({
            id: "v1",
            code: "FIXED30",
            isActive: true,
            expiresAt: null,
            usageLimit: null,
            usedCount: 0,
            minOrder: 50000,
            value: 30000,
            type: "FIXED",
            maxDiscount: null,
        } as any);
        const res = await POST(makeRequest({ code: "FIXED30", subtotal: 50000 }));
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.discountAmount).toBe(30000);
    });
});
