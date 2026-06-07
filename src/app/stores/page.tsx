export const dynamic = "force-dynamic";

import { getStores } from "@/lib/cache";
import { Store } from "@prisma/client";
import { getImageUrl } from "@/lib/utils";

export default async function StoresPage() {
    const stores: Store[] = await getStores();

    return (
        <div className="min-h-screen bg-[#faf8f5] py-24 px-6 md:px-10 lg:px-24">
            <div className="max-w-[1200px] mx-auto">
                <header className="mb-16">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-2 font-bold">Stores</p>
                    <h1 className="text-4xl font-serif text-[#333] mb-4">Cửa hàng</h1>
                    <p className="text-sm text-gray-600 font-light max-w-2xl leading-relaxed">
                        Danh sách các cửa hàng và điểm đến.
                    </p>
                </header>

                {stores.length === 0 ? (
                    <div className="p-8 border border-gray-300 bg-white text-center">
                        <p className="text-gray-500">Hiện chưa có cửa hàng nào. Hãy quay lại sau nhé!</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-16">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-4 font-bold">Phân bố cửa hàng</p>
                            <div className="border border-gray-300 flex flex-col md:flex-row bg-white">
                                {stores.slice(0, 3).map((store: Store, index: number) => (
                                    <div key={`dist-${store.id}`} className={`flex-1 p-6 ${index !== stores.slice(0, 3).length - 1 ? 'border-b md:border-b-0 md:border-r border-gray-300' : ''}`}>
                                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#333] mb-2 font-bold">{store.city}</p>
                                        <p className="text-xs text-gray-600">{store.address}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                            {stores.map((store: Store) => (
                                <section key={store.id} className="group cursor-default">
                                    <div className="w-full aspect-[16/9] overflow-hidden bg-[#E8E6E1] mb-6 border border-gray-200">
                                        <img
                                            src={getImageUrl(store.image)}
                                            alt={store.name}
                                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[8s] ease-out"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">{store.city}</h2>
                                        <h3 className="text-2xl font-serif text-[#333] mb-4">{store.name}</h3>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-6">
                                            {store.desc}
                                        </p>

                                        <div className="space-y-1 text-[11px] text-[#333] font-medium">
                                            <p>{store.address}</p>
                                            <p>{store.hours}</p>
                                            <p>{store.phone}</p>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}