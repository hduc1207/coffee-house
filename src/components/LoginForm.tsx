"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

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

    return (
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
    );
}
