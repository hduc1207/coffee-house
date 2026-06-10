import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-aesop-text">
            <img
                src="/images/nền-1.png"
                alt="Coffee Brewing"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70 grayscale-[20%]"
            />
            <div className="relative z-10 text-center text-aesop-bg px-4 space-y-6 flex flex-col items-center mt-10">
        <span className="text-xs uppercase tracking-[0.2em] opacity-80">
          Trải nghiệm nguyên bản
        </span>

                <h2 className="text-5xl md:text-7xl font-serif tracking-wide">
                    The Morning Ritual
                </h2>

                <p className="max-w-md text-sm md:text-base font-light opacity-90 leading-relaxed">
                    Đánh thức giác quan với những hạt cà phê rang mộc được tuyển chọn khắt khe nhất, pha chế bằng sự tĩnh lặng và tỉ mỉ.
                </p>

                <Link
                    href="/menu"
                    className="mt-8 inline-block border border-aesop-bg px-8 py-3 text-xs uppercase tracking-widest hover:bg-aesop-bg hover:text-aesop-text transition-colors duration-500"
                >
                    Khám phá thực đơn
                </Link>
            </div>
        </section>
    );
}