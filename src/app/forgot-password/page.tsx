"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setSent(true);
            } else {
                setError(data.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
            }
        } catch {
            setError("Lỗi kết nối mạng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8f5] flex justify-center py-20 px-4 md:px-10 font-sans text-[#333]">
            <div className="max-w-md w-full">
                {sent ? (
                    <div>
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                            ✓
                        </div>
                        <h1 className="text-2xl font-medium text-center mb-4">Kiểm tra email của bạn</h1>
                        <p className="text-sm text-gray-600 text-center leading-relaxed mb-8">
                            Nếu tài khoản với email <strong>{email}</strong> tồn tại,
                            chúng tôi đã gửi một link đặt lại mật khẩu. Vui lòng kiểm tra
                            hộp thư (và thư mục Spam).
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-6">
                            Link sẽ hết hạn sau 15 phút.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full text-center bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors"
                        >
                            Quay lại đăng nhập
                        </Link>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-3xl mb-4 font-medium">Quên mật khẩu</h1>
                        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                            Nhập email đăng ký tài khoản của bạn. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <p className="text-red-500 text-sm bg-red-50 p-3">{error}</p>}

                            <input
                                type="email"
                                placeholder="Email address*"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm underline hover:text-gray-600">
                                ← Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
