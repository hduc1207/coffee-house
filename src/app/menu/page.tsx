"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";

export default function MenuPage() {
    const { addToCart } = useCart();

    const categories = [
        {
            name: "Cà Phê Nguyên Bản",
            items: [
                {
                    id: "cb-sig",
                    name: "Cold Brew Signature",
                    price: "65.000đ",
                    image: "/images/cold-brew.jpg",
                    desc: "Ủ lạnh 16 giờ, mượt mà, lưu giữ trọn vẹn hương hoa cỏ."
                },
                {
                    id: "po-eth",
                    name: "Pour Over Ethiopia",
                    price: "85.000đ",
                    image: "/images/pour-over-ethopia.jpg",
                    desc: "Hương hoa nhài, cam chanh và vị ngọt hậu của mật ong."
                },
                {
                    id: "ic-fw",
                    name: "Iced Flat White",
                    price: "65.000đ",
                    image: "/images/ice-flat-white.jpg",
                    desc: "Espresso đậm đà hòa quyện cùng sữa tươi đánh bọt siêu mịn."
                }
            ]
        },
        {
            name: "Trà & Thảo Mộc",
            items: [
                {
                    id: "ma-uji",
                    name: "Matcha Uji Latte",
                    price: "75.000đ",
                    image: "/images/matcha-uji-latte.jpg",
                    desc: "Sự giao thoa tĩnh lặng giữa Matcha Nhật Bản và sữa yến mạch."
                },
                {
                    id: "te-ear",
                    name: "Trà Đen Bá Tước",
                    price: "55.000đ",
                    image: "/images/basilur-tea.jpg",
                    desc: "Trà đen ủ lạnh kết hợp tinh dầu cam Bergamot thanh mát."
                }
            ]
        }
    ];

    return (
        <div className="py-24 px-6 md:px-10 lg:px-24 max-w-[1000px] mx-auto min-h-screen">

            <h1 className="text-4xl md:text-5xl font-serif text-aesop-text mb-20 text-center">
                Thực đơn
            </h1>

            <div className="space-y-20">
                {categories.map((category, index) => (
                    <section key={index}>

                        <h2 className="text-2xl font-serif text-aesop-text border-b border-aesop-border/50 pb-4 mb-8 inline-block pr-16">
                            {category.name}
                        </h2>

                        <div className="flex flex-col gap-6">
                            {category.items.map((item, i) => (
                                <Link
                                    href={`/menu/${item.id}`}
                                    key={i}
                                    className="flex items-center gap-6 group cursor-pointer border-b border-aesop-border/20 pb-6 last:border-0 last:pb-0"
                                >

                                    <div className="w-20 h-24 md:w-24 md:h-28 shrink-0 overflow-hidden bg-[#E8E6E1]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                        />
                                    </div>

                                    <div className="flex-grow space-y-1 md:space-y-2">
                                        <h3 className="text-lg md:text-xl font-serif text-aesop-text group-hover:text-aesop-accent transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-500 font-light max-w-md line-clamp-2">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="text-sm tracking-widest text-aesop-text">
                                            {item.price}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(item);
                                            }}
                                            className="text-xs uppercase tracking-widest text-gray-500 hover:text-aesop-accent transition-colors"
                                        >
                                            + Thêm
                                        </button>
                                    </div>

                                </Link>
                            ))}
                        </div>

                    </section>
                ))}
            </div>

        </div>
    );
}