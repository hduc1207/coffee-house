"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FloatingInputProps {
    label: string;
    type?: string;
    defaultValue?: string;
    bgColor?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
}

interface PasswordInputProps {
    label: string;
    name?: string;
    required?: boolean;
}

const FloatingInput = ({ label, type = "text", defaultValue = "", bgColor = "bg-[#faf8f5]", name, required, disabled }: FloatingInputProps) => (
    <div className="relative mt-5">
        <input
            type={type}
            name={name}
            defaultValue={defaultValue}
            required={required}
            disabled={disabled}
            placeholder={label}
            className="peer w-full border border-gray-400 p-3.5 text-sm focus:border-black outline-none bg-transparent placeholder-transparent transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
        />
        <label className={`absolute left-3 -top-2.5 ${bgColor} px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-black`}>
            {label}
        </label>
    </div>
);

const PasswordInput = ({ label, name, required }: PasswordInputProps) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative mt-5">
            <input
                type={show ? "text" : "password"}
                name={name}
                required={required}
                placeholder={label}
                className="peer w-full border border-gray-400 p-3.5 text-sm focus:border-black outline-none bg-transparent placeholder-transparent pr-10"
            />
            <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-black">
                {label}
            </label>
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-3.5 text-gray-400 hover:text-black">
                {show ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                )}
            </button>
        </div>
    );
};
export default function ProfileManager({ currentName, currentEmail, currentPhone }: { currentName: string, currentEmail: string, currentPhone: string }) {
    const [activeView, setActiveView] = useState<"default" | "edit">("default");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const router = useRouter();

    const nameParts = currentName.split(" ");
    const firstName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : currentName;
    const lastName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const newFirstName = formData.get("firstName");
        const newLastName = formData.get("lastName");
        const phone = formData.get("phone");

        const fullName = `${newLastName} ${newFirstName}`.trim();

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: fullName, phone }),
            });

            if (res.ok) {
                toast.success("Cập nhật thông tin thành công");
                router.refresh();
                setActiveView("default");
            } else {
                const data = await res.json();
                toast.error(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
            toast.error("Lỗi kết nối mạng.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
            setPasswordError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordSuccess(data.message);
                e.currentTarget.reset();
                setTimeout(() => setIsPasswordModalOpen(false), 1500);
            } else {
                setPasswordError(data.message || "Có lỗi xảy ra.");
            }
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            setPasswordError("Lỗi kết nối mạng.");
        } finally {
            setIsLoading(false);
        }
    };

    if (activeView === "edit") {
        return (
            <div className="animate-fade-in">
                <button onClick={() => setActiveView("default")} className="text-sm mb-8 flex items-center gap-2 hover:text-gray-500 transition-colors">
                    <span className="text-lg pb-1">‹</span> Quay lại tài khoản của bạn
                </button>

                <h2 className="text-2xl font-serif mb-2 text-[#333]">Chỉnh sửa thông tin</h2>
                <p className="text-sm mb-6 text-gray-600">Các trường bắt buộc được đánh dấu bằng (*).</p>

                <form className="space-y-2 max-w-2xl" onSubmit={handleUpdateProfile}>
                    <div className="flex gap-6 mb-4 text-sm mt-8">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" className="accent-black w-4 h-4" defaultChecked /> Cô</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" className="accent-black w-4 h-4" /> Bà</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="title" className="accent-black w-4 h-4" /> Ông</label>
                    </div>

                    <FloatingInput name="firstName" label="Tên*" defaultValue={firstName} required bgColor="bg-[#faf8f5]" />
                    <FloatingInput name="lastName" label="Họ*" defaultValue={lastName} required bgColor="bg-[#faf8f5]" />
                    <FloatingInput label="Địa chỉ Email*" defaultValue={currentEmail} type="email" disabled bgColor="bg-[#faf8f5]" />
                    <FloatingInput name="phone" label="Số điện thoại*" defaultValue={currentPhone} required type="tel" bgColor="bg-[#faf8f5]" />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#333] text-white hover:bg-black px-8 py-4 text-sm font-medium mt-8 w-64 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <section className="mb-12 animate-fade-in">
            <h2 className="text-xl mb-6">Thông tin tài khoản</h2>

            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveView("edit")} className="flex-1 border border-[#333] py-4 text-sm font-medium hover:bg-[#333] hover:text-white transition-all bg-[#333] text-white">
                    Chỉnh sửa thông tin
                </button>
                <button onClick={() => setIsPasswordModalOpen(true)} className="flex-1 border border-[#333] py-4 text-sm font-medium hover:bg-[#333] hover:text-white transition-all">
                    Đổi mật khẩu
                </button>
            </div>

            <div className="space-y-6 text-sm border-t border-gray-200 pt-6">
                <div>
                    <p className="font-bold uppercase text-[10px] tracking-widest mb-1 text-gray-500">Tên</p>
                    <p className="text-base text-[#333]">{currentName || "Chưa cập nhật"}</p>
                </div>
                <div>
                    <p className="font-bold uppercase text-[10px] tracking-widest mb-1 text-gray-500">Địa chỉ Email</p>
                    <p className="text-base text-[#333]">{currentEmail || "Chưa có email"}</p>
                </div>
                <div>
                    <p className="font-bold uppercase text-[10px] tracking-widest mb-1 text-gray-500">Số điện thoại</p>
                    <p className="text-base text-[#333]">{currentPhone || "Chưa cập nhật"}</p>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[500px] p-8 md:p-10 relative shadow-2xl animate-fade-in">
                        <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-3xl font-serif mb-2">Đổi mật khẩu</h2>
                        <p className="text-sm mb-6 text-gray-600">Các trường bắt buộc được đánh dấu bằng (*).</p>

                        <form className="space-y-2" onSubmit={handlePasswordChange}>
                            {passwordError && <p className="text-red-500 text-sm bg-red-50 p-3">{passwordError}</p>}
                            {passwordSuccess && <p className="text-green-600 text-sm bg-green-50 p-3">{passwordSuccess}</p>}
                            <PasswordInput name="currentPassword" label="Mật khẩu hiện tại*" required />
                            <PasswordInput name="newPassword" label="Mật khẩu mới*" required />
                            <PasswordInput name="confirmPassword" label="Xác nhận mật khẩu mới*" required />

                            <button type="submit" className="w-full bg-[#333] text-white py-4 text-sm font-medium hover:bg-black transition-colors !mt-8">
                                Áp dụng
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}