import { prisma } from "@/lib/prisma";
import MenuClient from "@/components/MenuClient";

export default async function MenuPage() {
    const products = await prisma.product.findMany();
    return <MenuClient initialProducts={products} />;
}