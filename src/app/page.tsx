import Hero from "@/modules/home/Hero";
import Featured from "@/modules/home/Featured";
import Story from "@/modules/home/Story";
import Menu from "@/modules/home/Menu";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSignatureProduct() {
    // 1. Try to find the dynamic best seller first
    const bestSellersGroup = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
            order: { status: "COMPLETED" },
            product: { isAvailable: true }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1
    });

    if (bestSellersGroup.length > 0) {
        const product = await prisma.product.findUnique({
            where: { id: bestSellersGroup[0].productId }
        });
        if (product) return product;
    }

    // 2. Try to get the first featured product
    let product = await prisma.product.findFirst({
        where: { isAvailable: true, isFeatured: true }
    });

    if (product) return product;

    // 3. Fallback to slug signature
    product = await prisma.product.findFirst({
        where: { isAvailable: true, slug: "cold-brew-signature" }
    });

    if (product) return product;

    // 4. Fallback to the first available product in the database
    return await prisma.product.findFirst({
        where: { isAvailable: true }
    });
}

export default async function Home() {
    const signatureProduct = await getSignatureProduct();

    return (
        <div className="flex flex-col">
            <Hero />
            <Featured product={signatureProduct} />
            <Story />
            <Menu />
        </div>
    );
}