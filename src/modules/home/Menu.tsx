import Link from "next/link";

const products = [
    {
        id: "1",
        name: "Pour Over Ethiopia",
        price: "85.000đ",
        image: "/images/pour-over-ethopia.jpg",
        description: "Hương hoa nhài, cam chanh và vị ngọt hậu của mật ong rừng."
    },
    {
        id: "2",
        name: "Iced Flat White",
        price: "65.000đ",
        image: "/images/ice-flat-white.jpg",
        description: "Espresso đậm đà hòa quyện cùng sữa tươi đánh bọt siêu mịn."
    },
    {
        id: "3",
        name: "Matcha Espresso",
        price: "75.000đ",
        image: "/images/matcha-espresso.jpg",
        description: "Sự giao thoa tĩnh lặng giữa Matcha Uji Nhật Bản và cà phê nguyên bản."
    }
];

export default function Menu() {
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
                    <div key={item.id} className="group cursor-pointer">
                        <div className="aspect-[4/5] overflow-hidden mb-6 bg-[#E8E6E1]">
                            <img
                                src={item.image}
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
                            {item.price}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}