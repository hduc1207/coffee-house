export default function StoryPage() {
    return (
        <div className="bg-aesop-bg min-h-screen pt-16 md:pt-24 pb-20">
            <section className="px-6 md:px-10 lg:px-24 max-w-[1400px] mx-auto mb-24 md:mb-40">
                <h1 className="text-4xl md:text-6xl font-serif text-aesop-text mb-12 text-center max-w-4xl mx-auto leading-tight">
                    Tôn trọng nguyên bản, <br className="hidden md:block" /> nâng niu từng giọt tĩnh lặng.
                </h1>
                <div className="w-full h-[50vh] md:h-[70vh] overflow-hidden bg-[#E8E6E1]">
                    <img
                        src="/images/nền-1.png"
                        alt="Coffee pouring"
                        className="w-full h-full object-cover grayscale-[15%] hover:scale-105 transition-transform duration-[20s] ease-out"
                    />
                </div>
            </section>

            <section className="px-6 md:px-10 lg:px-24 max-w-[1200px] mx-auto flex flex-col md:flex-row gap-16 md:gap-24 mb-24 md:mb-40 items-center">
                <div className="md:w-1/2 space-y-6">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Khởi nguồn</h2>
                    <h3 className="text-3xl font-serif text-aesop-text">Từ những nông trại mù sương.</h3>
                    <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                        The Bamboo Coffee bắt đầu từ một chuyến đi dọc vùng cao nguyên đất đỏ. Chúng tôi tin rằng, hạt cà phê ngon nhất không đến từ những nhà máy công nghiệp ồn ào, mà lớn lên dưới bàn tay thô ráp của người nông dân và được tắm mình trong lớp sương sớm mờ ảo.
                    </p>
                </div>
                <div className="md:w-1/2 w-full aspect-square bg-[#E8E6E1] overflow-hidden">
                    <img
                        src="/images/ảnh-1.jpg"
                        alt="Coffee farm"
                        className="w-full h-full object-cover grayscale-[20%]"
                    />
                </div>
            </section>

            <section className="px-6 md:px-10 lg:px-24 max-w-[1200px] mx-auto flex flex-col-reverse md:flex-row gap-16 md:gap-24 items-center">
                <div className="md:w-1/2 w-full aspect-[4/5] bg-[#E8E6E1] overflow-hidden">
                    <img
                        src="/images/ảnh-2.jpg"
                        alt="Architecture space"
                        className="w-full h-full object-cover grayscale-[20%]"
                    />
                </div>
                <div className="md:w-1/2 space-y-6">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Không gian</h2>
                    <h3 className="text-3xl font-serif text-aesop-text">Ngôn ngữ của sự chiêm nghiệm.</h3>
                    <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                        Kiến trúc tại The Bamboo được chắt lọc từ sự thô mộc. Không hào nhoáng, không dư thừa. Chúng tôi sử dụng bê tông trần, vật liệu tự nhiên và ánh sáng hắt bóng để tạo ra một vùng đệm tĩnh lặng — nơi bạn có thể tách mình khỏi nhịp sống vội vã bên ngoài.
                    </p>
                </div>
            </section>

        </div>
    );
}