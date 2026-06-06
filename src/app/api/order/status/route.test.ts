/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        order: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        product: {
            update: vi.fn(),
        },
        $transaction: vi.fn(async (cb: (tx: any) => any) => {
            const tx = {
                order: {
                    update: vi.fn(),
                },
                product: {
                    update: vi.fn(),
                },
            };
            return cb(tx);
        }),
    },
}));

describe("GET /api/order/status", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when id is missing", async () => {
        const req = new Request("http://localhost/api/order/status");
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it("returns 404 when order is not found", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);
        const req = new Request("http://localhost/api/order/status?id=ghost-id");
        const res = await GET(req);
        expect(res.status).toBe(404);
    });

    it("returns status and orderCode when successful", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            status: "PENDING",
            orderCode: 123,
        } as any);
        const req = new Request("http://localhost/api/order/status?id=o1");
        const res = await GET(req);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.status).toBe("PENDING");
        expect(json.orderCode).toBe(123);
    });
});

describe("POST /api/order/status (Cancel action)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid action", async () => {
        const req = new Request("http://localhost/api/order/status", {
            method: "POST",
            body: JSON.stringify({ id: "o1", action: "INVALID" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns 404 when order to cancel is not found", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);
        const req = new Request("http://localhost/api/order/status", {
            method: "POST",
            body: JSON.stringify({ id: "ghost-id", action: "CANCEL" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(404);
    });

    it("returns 400 when order to cancel is not PENDING", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            status: "PROCESSING",
        } as any);
        const req = new Request("http://localhost/api/order/status", {
            method: "POST",
            body: JSON.stringify({ id: "o1", action: "CANCEL" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("cancels order and refunds stock on cancel action", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce({
            id: "o1",
            status: "PENDING",
            items: [{ productId: "p1", quantity: 2 }],
        } as any);
        const req = new Request("http://localhost/api/order/status", {
            method: "POST",
            body: JSON.stringify({ id: "o1", action: "CANCEL" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(prisma.$transaction).toHaveBeenCalled();
    });
});
