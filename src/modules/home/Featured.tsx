export default function Featured() {
    return (
        <section className="py-24 px-6 md:px-16 lg:px-24 bg-aesop-bg flex flex-col md:flex-row items-center gap-12 lg:gap-24">

            {/* Nửa bên trái: Hình ảnh sản phẩm */}
            <div className="w-full md:w-1/2">
                <img
                    src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1000&auto=format&fit=crop"
                    alt="Signature Cold Brew"
                    className="w-full aspect-[4/5] object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                />
            </div>

            {/* Nửa bên phải: Nội dung văn bản */}
            <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
        <span className="text-xs uppercase tracking-[0.15em] text-gray-500">
          Dòng sản phẩm thủ công
        </span>

                <h2 className="text-4xl lg:text-5xl font-serif text-aesop-text leading-tight">
                    Cold Brew <br /> Signature
                </h2>

                <p className="text-base text-gray-600 leading-relaxed max-w-md font-light">
                    Những hạt Arabica Cầu Đất hảo hạng được ủ lạnh kiên nhẫn trong 16 giờ đồng hồ.
                    Kết quả mang lại là một ly cà phê mượt mà, triệt tiêu độ đắng gắt, lưu giữ trọn vẹn hương hoa cỏ
                    và vị ngọt hậu tự nhiên.
                </p>
                <button className="mt-4 border-b border-aesop-text pb-1 text-sm uppercase tracking-widest hover:text-aesop-accent hover:border-aesop-accent transition-colors">
                    Thêm vào giỏ — 65.000đ
                </button>
            </div>

        </section>
    );
}