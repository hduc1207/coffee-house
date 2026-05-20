import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#faf8f5] flex justify-center py-20 px-4 md:px-10 font-sans text-[#333]">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                <LoginForm />
                <RegisterForm />
            </div>
        </div>
    );
}