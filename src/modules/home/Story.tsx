export default function Story() {
    return (
        <section className="py-32 px-6 md:px-10 bg-[#E8E6E1] flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-8">
        Triết lý của The Ritual
      </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-aesop-text leading-snug lg:leading-normal max-w-4xl">
                &quot;Mỗi tách cà phê không chỉ là một thức uống, mà là một khoảng lặng để bạn tìm lại nhịp điệu của chính mình giữa thế giới ồn ào.&quot;
            </h2>
            <div className="mt-12 w-px h-16 bg-gray-400"></div>
            <button className="mt-10 text-xs uppercase tracking-widest text-gray-600 border-b border-transparent hover:border-gray-600 transition-colors pb-1">
                Đọc toàn bộ câu chuyện
            </button>

        </section>
    );
}