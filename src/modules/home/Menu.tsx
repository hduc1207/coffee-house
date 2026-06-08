import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getFlavorCollection() {
    // 1. Get manually featured products
    const featured = await prisma.product.findMany({
        where: { isAvailable: true, isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
    });

    if (featured.length >= 3) {
        return featured;
    }

    // 2. Get best sellers from completed orders for the remaining slots
    const needed = 3 - featured.length;
    const featuredIds = featured.map(p => p.id);

    // Group order items by product ID from COMPLETED orders
    const bestSellersGroup = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
            order: { status: "COMPLETED" },
            product: {
                isAvailable: true,
                id: { notIn: featuredIds },
            },
        },
        _sum: { quantity: true },
        orderBy: {
            _sum: { quantity: "desc" },
        },
        take: needed,
    });

    const bestSellerIds = bestSellersGroup.map(item => item.productId);
    
    let bestSellers: any[] = [];
    if (bestSellerIds.length > 0) {
        bestSellers = await prisma.product.findMany({
            where: { id: { in: bestSellerIds } },
        });
        // Sort bestSellers to match the order of bestSellerIds
        bestSellers.sort((a, b) => bestSellerIds.indexOf(a.id) - bestSellerIds.indexOf(b.id));
    }

    const currentCollection = [...featured, ...bestSellers];
    if (currentCollection.length >= 3) {
        return currentCollection;
    }

    // 3. Fallback to newest available products if still not enough
    const fillNeeded = 3 - currentCollection.length;
    const chosenIds = currentCollection.map(p => p.id);
    const fallbackProducts = await prisma.product.findMany({
        where: {
            isAvailable: true,
            id: { notIn: chosenIds },
        },
        orderBy: { createdAt: "desc" },
        take: fillNeeded,
    });

    return [...currentCollection, ...fallbackProducts];
}

export default async function Menu() {
    const products = await getFlavorCollection();

    return (
        <section className="py-24 px-6 md:px-10 lg:px-24 bg-aesop-bg max-w-[1600px] mx-auto">

            {/* Phần tiêu đề của Menu */}
            <div className="flex justify-between items-end mb-12 border-b border-aesop-border/50 pb-6">
                <h2 className="text-3xl font-serif text-aesop-text">Tuyển tập hương vị</h2>
                <Link href="/menu" className="text-xs uppercase tracking-widest text-aesop-text hover:text-aesop-accent transition-colors">
                    XEM TOÀN BỘ
                </Link>
            </div>

            {/* Lưới danh sách sản phẩm */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                {products.map((item) => (
                    <Link href={`/menu/${item.slug}`} key={item.id} className="group cursor-pointer block">
                        <div className="aspect-[4/5] overflow-hidden mb-6 bg-[#E8E6E1] relative">
                            <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                            />
                        </div>
                        {/* Thông tin món nước */}
                        <h3 className="text-xl font-serif text-aesop-text mb-2 group-hover:text-aesop-accent transition-colors">
                            {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-light mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                        <p className="text-sm tracking-widest text-aesop-text">
                            {item.price.toLocaleString("vi-VN")}đ
                        </p>
                    </Link>
                ))}
            </div>

        </section>
    );
}