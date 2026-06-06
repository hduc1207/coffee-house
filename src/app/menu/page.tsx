import MenuClient from "@/components/MenuClient";
import { getMenuProducts } from "@/lib/cache";

export default async function MenuPage() {
    const products = (await getMenuProducts()) || [];
    return <MenuClient initialProducts={products} />;
}