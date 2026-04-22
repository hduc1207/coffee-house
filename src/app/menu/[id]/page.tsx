"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useParams } from "next/navigation";
const allProducts = [
    { id: "cb-sig", name: "Cold Brew Signature", price: "65.000đ", image: "/images/cold-brew.jpg", desc: "Ủ lạnh 16 giờ, mượt mà, lưu giữ trọn vẹn hương hoa cỏ.", origin: "Cầu Đất, Đà Lạt", roast: "Light / Rất nhạt" },
    { id: "po-eth", name: "Pour Over Ethiopia", price: "85.000đ", image: "/images/pour-over-ethopia.jpg", desc: "Hương hoa nhài, cam chanh và vị ngọt hậu của mật ong.", origin: "Yirgacheffe, Ethiopia", roast: "Light Medium / Nhạt vừa" },
    { id: "ic-fw", name: "Iced Flat White", price: "65.000đ", image: "", desc: "/images/ice-flat-white.jpg", origin: "Blend: Brazil & Vietnam", roast: "Medium Dark / Đậm vừa" },
    { id: "ma-uji", name: "Matcha Uji Latte", price: "75.000đ", image: "/images/matcha-uji-latte.jpg", desc: "Sự giao thoa tĩnh lặng giữa Matcha Nhật Bản và sữa yến mạch.", origin: "Uji, Kyoto, Nhật Bản", roast: "Không rang" },
    { id: "te-ear", name: "Trà Đen Bá Tước", price: "55.000đ", image: "/images/basilur-tea.jpg", desc: "Trà đen ủ lạnh kết hợp tinh dầu cam Bergamot thanh mát.", origin: "Sri Lanka", roast: "Sấy khô" }
];

export default function ProductDetail() {
    const params = useParams();
    const { addToCart } = useCart();
    const product = allProducts.find(p => p.id === params.id);
    if (!product) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
                <h1 className="text-2xl font-serif text-aesop-text">Không tìm thấy sản phẩm</h1>
                <Link href="/menu" className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-500 pb-1 hover:text-aesop-text hover:border-aesop-text">Quay lại thực đơn</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aesop-bg">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2">
                <div className="h-[50vh] md:h-auto md:min-h-[85vh] bg-[#E8E6E1]">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale-[10%]"
                    />
                </div>
                <div className="flex flex-col justify-center px-8 py-16 md:px-16 lg:px-24">
                    <nav className="mb-12 text-[10px] uppercase tracking-[0.2em] text-gray-400 flex gap-2">
                        <Link href="/menu" className="hover:text-aesop-text transition-colors">Thực đơn</Link>
                        <span>/</span>
                        <span className="text-aesop-text">{product.name}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-serif text-aesop-text mb-6">
                        {product.name}
                    </h1>

                    <p className="text-base text-gray-600 font-light leading-relaxed mb-12 max-w-md">
                        {product.desc}
                    </p>

                    <div className="space-y-6 border-t border-b border-aesop-border/50 py-8 mb-12">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-light text-gray-500">Nguồn gốc</span>
                            <span className="text-aesop-text">{product.origin}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-light text-gray-500">Độ rang</span>
                            <span className="text-aesop-text">{product.roast}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-light text-gray-500">Giá</span>
                            <span className="tracking-widest text-aesop-text">{product.price}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        className="w-full md:w-auto px-12 py-5 bg-aesop-text text-aesop-bg text-xs uppercase tracking-[0.2em] hover:bg-aesop-accent transition-colors"
                    >
                        Thêm vào giỏ hàng
                    </button>

                </div>

            </div>
        </div>
    );
}