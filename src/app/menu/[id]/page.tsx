import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { slug: id },
    });

    if (!product) return notFound();

    return (
        <div className="max-w-6xl mx-auto pt-32 px-10 pb-24 flex flex-col md:flex-row gap-16">
            <div className="w-full md:w-1/2">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-auto object-cover"
                />
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="text-[10px] tracking-[0.2em] uppercase mb-8 text-[#666]">
                    <Link href="/menu" className="hover:text-black transition-colors">THỰC ĐƠN</Link>
                    <span className="mx-3">/</span>
                    <span className="text-[#333]">{product.name.toUpperCase()}</span>
                </div>

                <h1 className="text-5xl font-serif text-[#333] mb-5">
                    {product.name}
                </h1>

                <p className="text-[15px] text-gray-600 mb-12">
                    {product.description}
                </p>

                <div className="border-t border-b border-gray-200 py-6 space-y-6 mb-12">
                    <div className="flex justify-between items-center text-[15px]">
                        <span className="text-gray-500">Nguồn gốc</span>
                        <span className="text-[#333]">{product.origin}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px]">
                        <span className="text-gray-500">Độ rang</span>
                        <span className="text-[#333]">{product.roast}</span>
                    </div>
                    <div className="flex justify-between items-center text-[15px]">
                        <span className="text-gray-500">Giá</span>
                        <span className="text-[#333]">{product.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                <AddToCartButton product={product} />
            </div>

        </div>
    );
}