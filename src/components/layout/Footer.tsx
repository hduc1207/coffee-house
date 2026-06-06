import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-aesop-text text-aesop-bg py-16 px-6 md:px-10 lg:px-24">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 font-light">

                {/* Cột 1: Thông tin thương hiệu */}
                <div className="space-y-6">
                    <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-gray-400">The Bamboo Coffee</h3>
                    <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                        Trải nghiệm cà phê nguyên bản, đánh thức mọi giác quan qua từng giọt pha chế tĩnh lặng và tỉ mỉ.
                    </p>
                </div>

                {/* Cột 2: Liên hệ */}
                <div className="space-y-6">
                    <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-gray-400">Liên hệ</h3>
                    <div className="text-sm opacity-80 space-y-2 flex flex-col">
                        <a href="mailto:hello@thebamboo.com" className="hover:text-aesop-accent transition-colors w-fit">hello@thebamboo.com</a>
                        <a href="tel:+84123456789" className="hover:text-aesop-accent transition-colors w-fit">+84 123 456 789</a>
                    </div>
                </div>

                {/* Cột 3: Địa chỉ */}
                <div className="space-y-6">
                    <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-gray-400">Địa chỉ</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                        123 Phố Cà Phê, Quận 1<br />
                        TP. Hồ Chí Minh, Việt Nam
                    </p>
                </div>

                {/* Cột 4: Mạng xã hội */}
                <div className="space-y-6">
                    <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-gray-400">Theo dõi</h3>
                    <div className="flex flex-col space-y-2 text-sm opacity-80">
                        <Link href="#" className="hover:text-aesop-accent transition-colors w-fit">Instagram</Link>
                        <Link href="#" className="hover:text-aesop-accent transition-colors w-fit">Facebook</Link>
                        <Link href="#" className="hover:text-aesop-accent transition-colors w-fit">Journal</Link>
                    </div>
                </div>

            </div>
            <div className="max-w-[1600px] mx-auto mt-20 pt-8 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                <p>&copy; 2026 The Bamboo Coffee.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-aesop-bg transition-colors">Bảo mật</Link>
                    <Link href="#" className="hover:text-aesop-bg transition-colors">Điều khoản</Link>
                </div>
            </div>
        </footer>
    );
}