"use client";

import { useState } from "react";

export default function RegisterForm() {
    const [regFirstName, setRegFirstName] = useState("");
    const [regLastName, setRegLastName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regConfirmEmail, setRegConfirmEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError("");
        setRegSuccess("");

        if (regEmail !== regConfirmEmail) {
            return setRegError("Email xác nhận không khớp.");
        }
        if (regPassword !== regConfirmPassword) {
            return setRegError("Mật khẩu xác nhận không khớp.");
        }
        if (regPassword.length < 8) {
            return setRegError("Mật khẩu phải có ít nhất 8 ký tự.");
        }
        if (!/[A-Z]/.test(regPassword)) {
            return setRegError("Mật khẩu phải chứa ít nhất 1 chữ hoa.");
        }
        if (!/[a-z]/.test(regPassword)) {
            return setRegError("Mật khẩu phải chứa ít nhất 1 chữ thường.");
        }
        if (!/[0-9]/.test(regPassword)) {
            return setRegError("Mật khẩu phải chứa ít nhất 1 số.");
        }
        if (!/[^A-Za-z0-9]/.test(regPassword)) {
            return setRegError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.");
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: regFirstName,
                    lastName: regLastName,
                    email: regEmail,
                    password: regPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setRegError(data.message);
            } else {
                setRegSuccess("Tạo tài khoản thành công! Bạn có thể đăng nhập ngay bên trái.");
                setRegFirstName(""); setRegLastName("");
                setRegEmail(""); setRegConfirmEmail("");
                setRegPassword(""); setRegConfirmPassword("");
            }
        } catch (error) {
            setRegError("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl mb-6 font-medium">Create an account</h2>

            <form onSubmit={handleRegister} className="space-y-4">
                {regError && <p className="text-red-500 text-sm bg-red-50 p-3">{regError}</p>}
                {regSuccess && <p className="text-green-600 text-sm bg-green-50 p-3">{regSuccess}</p>}

                <div className="flex gap-6 mb-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="title" defaultChecked className="accent-black" /> Miss
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="title" className="accent-black" /> Mrs
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="title" className="accent-black" /> Mr
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First name*" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                    <input type="text" placeholder="Last name*" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="email" placeholder="Email*" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                    <input type="email" placeholder="Confirm email address*" required value={regConfirmEmail} onChange={(e) => setRegConfirmEmail(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input type="password" placeholder="Password*" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                    <input type="password" placeholder="Confirm password*" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                </div>

                <div className="bg-[#f5f5f5] p-4 flex gap-3 rounded-sm mt-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="#333" stroke="#333" /><path d="M12 16v-4" stroke="white" /><path d="M12 8h.01" stroke="white" strokeWidth="3" /></svg>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Your password must contain 8-25 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                    </p>
                </div>

                <div className="flex items-start gap-3 mt-8">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-black" required />
                    <p className="text-xs text-gray-500 leading-relaxed">
                        By creating an account, I agree to The Bamboo Coffee <a href="#" className="underline">Terms of Use</a>, and have read and acknowledge the <a href="#" className="underline">Privacy Notice</a>.
                    </p>
                </div>

                <button type="submit" disabled={isLoading} className="bg-[#333] text-white px-8 py-4 text-sm font-medium hover:bg-black transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? "Đang xử lý..." : "Create account"}
                </button>
            </form>
        </div>
    );
}