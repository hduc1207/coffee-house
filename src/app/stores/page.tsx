export default function StoresPage() {
    const stores = [
        {
            city: "Hà Nội",
            name: "The Bamboo - Tràng Tiền",
            address: "15 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
            hours: "Thứ Hai - Chủ Nhật | 07:00 - 22:00",
            phone: "+84 24 1234 5678",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop",
            desc: "Nằm nép mình trong khu phố cổ kính, không gian mang đậm nét kiến trúc Đông Dương giao thoa cùng sự tối giản đương đại."
        },
        {
            city: "TP. Hồ Chí Minh",
            name: "The Bamboo - Đồng Khởi",
            address: "42 Đồng Khởi, Quận 1, TP. Hồ Chí Minh",
            hours: "Thứ Hai - Chủ Nhật | 07:00 - 22:30",
            phone: "+84 28 8765 4321",
            image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop",
            desc: "Một chốn dừng chân tĩnh lặng giữa trung tâm đô thị nhộn nhịp. Thiết kế sử dụng tông màu xi măng xám và nội thất gỗ nguyên bản."
        }
    ];

    return (
        <div className="bg-aesop-bg min-h-screen py-24 px-6 md:px-10 lg:px-24">
            <div className="max-w-[1200px] mx-auto">
                <header className="mb-20 md:mb-32 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-aesop-text mb-6">Không gian của chúng tôi</h1>
                    <p className="text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
                        Khám phá các điểm dừng chân tĩnh lặng của The Bamboo Coffee. Mỗi cửa hàng là một câu chuyện kiến trúc riêng biệt.
                    </p>
                </header>

                <div className="space-y-32">
                    {stores.map((store, index) => (
                        <section key={index} className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                            <div className={`w-full md:w-1/2 aspect-[4/3] bg-[#E8E6E1] overflow-hidden ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                                <img
                                    src={store.image}
                                    alt={store.name}
                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[10s] ease-out"
                                />
                            </div>

                            {/* Cột Thông tin */}
                            <div className={`w-full md:w-1/2 space-y-6 ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">{store.city}</h2>
                                <h3 className="text-3xl font-serif text-aesop-text">{store.name}</h3>
                                <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                                    {store.desc}
                                </p>

                                <div className="space-y-3 pt-6 border-t border-aesop-border/50 text-sm font-light text-aesop-text">
                                    <p><strong className="font-normal text-gray-500 mr-2">Địa chỉ:</strong> {store.address}</p>
                                    <p><strong className="font-normal text-gray-500 mr-2">Mở cửa:</strong> {store.hours}</p>
                                    <p><strong className="font-normal text-gray-500 mr-2">Liên hệ:</strong> {store.phone}</p>
                                </div>

                                <div className="pt-6">
                                    <button className="text-[10px] uppercase tracking-[0.2em] text-aesop-text border-b border-aesop-text pb-1 hover:text-aesop-accent hover:border-aesop-accent transition-colors">
                                        Xem trên bản đồ
                                    </button>
                                </div>
                            </div>

                        </section>
                    ))}
                </div>

            </div>
        </div>
    );
}