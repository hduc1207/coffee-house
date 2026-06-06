/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        order: {
            findUnique: vi.fn(),
        },
    },
}));

describe("GET /api/order/payment-details", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when id is missing", async () => {
        const req = new Request("http://localhost/api/order/payment-details");
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it("returns 404 when order is not found", async () => {
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);
        const req = new Request("http://localhost/api/order/payment-details?id=ghost-id");
        const res = await GET(req);
        expect(res.status).toBe(404);
    });

    it("returns payment details when successful", async () => {
        const orderData = {
            id: "o1",
            orderCode: 123,
            totalAmount: 50000,
            paymentMethod: "payos",
            status: "PENDING",
            payosQrCode: "vietqr-string",
            payosAccountNumber: "123456",
            payosAccountName: "Bamboo",
            payosBin: "970415",
            payosCheckoutUrl: "http://checkout",
        };
        vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(orderData as any);
        const req = new Request("http://localhost/api/order/payment-details?id=o1");
        const res = await GET(req);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.order).toEqual(orderData);
    });
});
