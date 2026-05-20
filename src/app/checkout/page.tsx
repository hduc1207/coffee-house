"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const finalTotal = totalPrice + (deliveryMethod === "pickup" ? 0 : 30000);
    const handleCheckout = async () => {
        if (!customerName || !phone) {
            toast.error("Vui lòng điền Tên và Số điện thoại để quán liên hệ nhé!");
            return;
        }
        if (deliveryMethod === "delivery" && !address) {
            toast.error("Vui lòng điền Địa chỉ giao hàng!");
            return;
        }

        setIsSubmitting(true);
        const orderData = {
            customerName,
            phone,
            address: deliveryMethod === "pickup" ? "Lấy tại quán" : address,
            notes,
            deliveryMethod,
            paymentMethod,
            totalAmount: finalTotal,
            items: cartItems,
        };

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || "Đặt hàng thành công! The Bamboo sẽ liên hệ với bạn sớm nhất.");
                clearCart();
                router.push("/menu");
            } else {
                // Hiển thị error message từ backend validation
                toast.error(result.message || "Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            toast.error("Lỗi kết nối mạng! Vui lòng kiểm tra kết nối internet và thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-serif text-[#333] mb-6">Chưa có sản phẩm nào để thanh toán</h1>
                <Link href="/menu" className="px-8 py-4 bg-[#333] text-white text-xs tracking-[0.2em] uppercase">
                    Quay lại Thực Đơn
                </Link>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#F9F8F4] pt-32 px-6 lg:px-10 pb-24">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
                <div className="w-full lg:w-3/5">
                    <h1 className="text-4xl font-serif text-[#333] mb-12">Thanh Toán</h1>

                    <div className="flex gap-4 mb-10 border-b border-gray-200 pb-2">
                        <button onClick={() => setDeliveryMethod("delivery")} className={`pb-4 px-2 text-sm tracking-widest uppercase transition-colors ${deliveryMethod === "delivery" ? "border-b-2 border-[#333] text-[#333]" : "text-gray-400"}`}>Giao Tận Nơi</button>
                        <button onClick={() => setDeliveryMethod("pickup")} className={`pb-4 px-2 text-sm tracking-widest uppercase transition-colors ${deliveryMethod === "pickup" ? "border-b-2 border-[#333] text-[#333]" : "text-gray-400"}`}>Lấy Tại Quán</button>
                    </div>

                    <div className="space-y-6 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} type="text" placeholder="Tên người nhận *" className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-[#333] text-[15px]" />
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Số điện thoại *" className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-[#333] text-[15px]" />
                        </div>

                        {deliveryMethod === "delivery" && (
                            <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Địa chỉ giao hàng chi tiết *" className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-[#333] text-[15px]" />
                        )}

                        <input value={notes} onChange={(e) => setNotes(e.target.value)} type="text" placeholder="Ghi chú cho quán (Ví dụ: Ít đá, không đường...)" className="w-full border-b border-gray-300 py-3 bg-transparent outline-none focus:border-[#333] text-[15px]" />
                    </div>

                    <h3 className="text-xl font-serif text-[#333] mb-6">Phương thức thanh toán</h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-4 h-4 accent-[#333]" />
                            <span className="text-[15px] text-gray-700">Thanh toán tiền mặt khi nhận hàng (COD)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="payment" checked={paymentMethod === "momo"} onChange={() => setPaymentMethod("momo")} className="w-4 h-4 accent-[#333]" />
                            <span className="text-[15px] text-gray-700">Thanh toán qua Ví MoMo</span>
                        </label>
                    </div>
                </div>

                <div className="w-full lg:w-2/5">
                    <div className="bg-white p-8 lg:p-10 border border-gray-100 shadow-sm sticky top-32">
                        <h2 className="text-xl font-serif text-[#333] mb-6 border-b border-gray-100 pb-4">Đơn Hàng ({cartItems.length} món)</h2>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-start text-[14px]">
                                    <div className="flex gap-3"><span className="font-medium text-gray-500">{item.quantity}x</span><span className="text-[#333]">{item.name}</span></div>
                                    <span className="text-gray-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-6 space-y-4 text-[15px] mb-8">
                            <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{totalPrice.toLocaleString('vi-VN')}đ</span></div>
                            <div className="flex justify-between text-gray-600"><span>Phí giao hàng</span><span>{deliveryMethod === "pickup" ? "0đ" : "30.000đ"}</span></div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mb-10">
                            <span className="text-lg text-[#333] font-medium">Tổng thanh toán</span>
                            <span className="text-2xl font-serif text-[#333]">{finalTotal.toLocaleString('vi-VN')}đ</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white text-xs tracking-[0.2em] uppercase transition-colors ${isSubmitting ? "bg-gray-400 cursor-wait" : "bg-[#333] hover:bg-black"}`}
                        >
                            {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}