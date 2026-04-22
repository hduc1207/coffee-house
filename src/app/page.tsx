import Hero from "@/modules/home/Hero";
import Featured from "@/modules/home/Featured";
import Story from "@/modules/home/Story";
import Menu from "@/modules/home/Menu";

export default function Home() {
    return (
        <div className="flex flex-col">
            <Hero />
            <Featured />
            <Story />
            <Menu />

        </div>
    );
}