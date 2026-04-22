"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
    const { cartItems, totalPrice } = useCart();

    return (
        <div className="min-h-screen bg-aesop-bg py-24 px-6 md:px-10 lg:px-24">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                    <header className="space-y-2">
                        <h1 className="text-3xl font-serif text-aesop-text">Thanh toán</h1>
                        <p className="text-sm text-gray-500 font-light">Vui lòng điền thông tin gửi hàng bên dưới.</p>
                    </header>

                    <form className="space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Thông tin nhận hàng</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    className="bg-transparent border-b border-aesop-border/50 py-3 text-sm focus:border-aesop-accent outline-none transition-colors font-light"
                                />
                                <input
                                    type="tel"
                                    placeholder="Số điện thoại"
                                    className="bg-transparent border-b border-aesop-border/50 py-3 text-sm focus:border-aesop-accent outline-none transition-colors font-light"
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Email (không bắt buộc)"
                                className="w-full bg-transparent border-b border-aesop-border/50 py-3 text-sm focus:border-aesop-accent outline-none transition-colors font-light"
                            />

                            <input
                                type="text"
                                placeholder="Địa chỉ giao hàng"
                                className="w-full bg-transparent border-b border-aesop-border/50 py-3 text-sm focus:border-aesop-accent outline-none transition-colors font-light"
                            />

                            <textarea
                                placeholder="Ghi chú thêm (ví dụ: cửa hàng màu xanh, gọi trước khi giao...)"
                                rows={3}
                                className="w-full bg-transparent border-b border-aesop-border/50 py-3 text-sm focus:border-aesop-accent outline-none transition-colors font-light resize-none"
                            />
                        </div>

                        <div className="space-y-6 pt-6">
                            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Phương thức thanh toán</h2>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="payment" defaultChecked className="accent-aesop-accent" />
                                    <span className="text-sm font-light text-aesop-text group-hover:text-aesop-accent">Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="payment" className="accent-aesop-accent" />
                                    <span className="text-sm font-light text-aesop-text group-hover:text-aesop-accent">Chuyển khoản ngân hàng</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="lg:sticky lg:top-32 h-fit bg-[#E8E6E1] p-8 md:p-12 space-y-8">
                    <h2 className="text-xl font-serif text-aesop-text border-b border-aesop-border pb-4">Đơn hàng của bạn</h2>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-16 bg-white shrink-0 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-serif text-aesop-text">{item.name}</h4>
                                        <p className="text-xs text-gray-500 font-light">Số lượng: {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-aesop-text">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </span>
                            </div>
                        ))}
                        {cartItems.length === 0 && (
                            <p className="text-sm text-gray-500 font-light text-center py-4">Chưa có sản phẩm nào.</p>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-aesop-border">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính</span>
                            <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>
                        <div className="flex justify-between text-lg font-serif text-aesop-text pt-4 border-t border-aesop-border">
                            <span>Tổng cộng</span>
                            <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                        </div>
                    </div>

                    <button
                        disabled={cartItems.length === 0}
                        className="w-full bg-aesop-text text-aesop-bg py-5 text-xs uppercase tracking-[0.2em] hover:bg-aesop-accent transition-all duration-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Xác nhận đặt hàng
                    </button>

                    <div className="text-center">
                        <Link href="/menu" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-aesop-text transition-colors">
                            Quay lại thực đơn
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}