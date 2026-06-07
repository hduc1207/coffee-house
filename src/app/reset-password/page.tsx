"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    ✕
                </div>
                <h1 className="text-2xl font-medium mb-4">Link không hợp lệ</h1>
                <p className="text-sm text-gray-600 mb-8">
                    Link đặt lại mật khẩu bị thiếu hoặc không hợp lệ. Vui lòng yêu cầu gửi lại.
                </p>
                <Link
                    href="/forgot-password"
                    className="block w-full text-center bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors"
                >
                    Yêu cầu link mới
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    ✓
                </div>
                <h1 className="text-2xl font-medium mb-4">Đặt lại mật khẩu thành công!</h1>
                <p className="text-sm text-gray-600 mb-8">
                    Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
                <Link
                    href="/login"
                    className="block w-full text-center bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password, confirmPassword }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
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
        <div>
            <h1 className="text-3xl mb-4 font-medium">Đặt mật khẩu mới</h1>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm bg-red-50 p-3">{error}</p>}

                <div>
                    <input
                        type="password"
                        placeholder="Mật khẩu mới*"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới*"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                </div>

                <div className="bg-gray-50 p-3 text-xs text-gray-500 leading-relaxed">
                    Mật khẩu phải có 8-100 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm underline hover:text-gray-600">
                    ← Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#faf8f5] flex justify-center py-20 px-4 md:px-10 font-sans text-[#333]">
            <div className="max-w-md w-full">
                <Suspense fallback={
                    <div className="text-center py-16">
                        <p className="text-sm text-gray-400">Đang tải...</p>
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
