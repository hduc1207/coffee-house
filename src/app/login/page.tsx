"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [regFirstName, setRegFirstName] = useState("");
    const [regLastName, setRegLastName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regConfirmEmail, setRegConfirmEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setLoginError(res.error);
        } else {
            window.location.href = "/";
        }
    };

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
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8f5] flex justify-center py-20 px-4 md:px-10 font-sans text-[#333]">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                <div>
                    <h1 className="text-3xl mb-6 font-medium">Sign in</h1>
                    <p className="text-sm mb-6">Required fields are marked with an (*).</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {loginError && <p className="text-red-500 text-sm bg-red-50 p-3">{loginError}</p>}

                        <input type="email" placeholder="Email address*" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />
                        <input type="password" placeholder="Password*" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-400 bg-transparent py-3 px-4 text-sm focus:outline-none focus:border-black transition-colors" />

                        <div className="flex justify-between items-center text-sm py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-black" /> Stay signed in
                            </label>
                            <button type="button" className="underline hover:text-gray-600">Forgotten password?</button>
                        </div>

                        <button type="submit" className="w-full bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors">
                            Sign in
                        </button>
                    </form>

                    <div className="flex items-center my-8 text-sm text-gray-500">
                        <div className="flex-1 border-t border-gray-300"></div><span className="px-4">or</span><div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <div>
                        <p className="text-sm mb-4">Sign In With One Click</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="border border-gray-400 py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm font-medium">Facebook</button>
                            <button onClick={() => signIn("google", { callbackUrl: "/" })} type="button" className="border border-gray-400 py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm font-medium">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl mb-6 font-medium">Create an account</h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {regError && <p className="text-red-500 text-sm bg-red-50 p-3">{regError}</p>}
                        {regSuccess && <p className="text-green-600 text-sm bg-green-50 p-3">{regSuccess}</p>}

                        <div className="flex gap-6 mb-2 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" defaultChecked className="accent-black" /> Miss</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" className="accent-black" /> Mrs</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" className="accent-black" /> Mr</label>
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

                        <button type="submit" className="bg-[#333] text-white px-8 py-4 text-sm font-medium hover:bg-black transition-colors mt-4">
                            Create account
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}