"use client";
import AppShell from "@/components/AppShell";
import { Button, EmptyState, Loader } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { cartAPI, productAPI, wishlistAPI } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const craftTypes = ["All Crafts", "Textiles & Weaving", "Woodwork & Carving", "Jewelry & Ornaments", "Pottery & Ceramics", "Metal Crafts"];
const craftCategoryMap = {
    "Textiles & Weaving": "textiles",
    "Woodwork & Carving": "woodwork",
    "Jewelry & Ornaments": "jewelry",
    "Pottery & Ceramics": "pottery",
    "Metal Crafts": "metalCrafts",
};
const regions = ["Rajasthan", "Kerala", "West Bengal", "Gujarat"];

export default function MarketplacePage() {
    const router = useRouter();
    const showToast = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCraft, setActiveCraft] = useState("All Crafts");
    const [activeRegion, setActiveRegion] = useState("");
    const [wishlist, setWishlist] = useState(new Set());
    const [cartLoading, setCartLoading] = useState({});

    const toggleWishlist = async (e, productId) => {
        e.preventDefault();
        try {
            await wishlistAPI.toggleWishlist(productId);
            setWishlist(prev => {
                const next = new Set(prev);
                if (next.has(productId)) next.delete(productId); else next.add(productId);
                return next;
            });
        } catch (err) { if (err?.status !== 401) console.error(err); }
    };

    const addToCart = async (e, productId, buyNow = false) => {
        e.preventDefault();
        setCartLoading(prev => ({ ...prev, [productId]: true }));
        try {
            await cartAPI.addItem(productId);
            if (buyNow) {
                router.push('/cart');
            } else {
                showToast("Added to cart!", "success");
            }
        } catch (err) {
            if (err?.status !== 401) console.error(err);
            showToast("Failed to add to cart.", "error");
        }
        setCartLoading(prev => ({ ...prev, [productId]: false }));
    };

    useEffect(() => {
        async function load() {
            try {
                const res = await productAPI.getProducts();
                setProducts(res.data?.products || []);
            } catch (e) { if (e?.status !== 401) console.error(e); }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <AppShell>
                <Loader />
            </AppShell>
        );
    }

    return (
        <AppShell>
            <main className="flex-grow flex flex-col lg:flex-row gap-8 py-2">
                {/* filters in sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 hidden lg:block">
                    <div>
                        <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-4 pb-2 border-b border-stone-200">Craft Type</h3>
                        <div className="space-y-3">
                            {craftTypes.map((type, i) => (
                                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={activeCraft === type}
                                        onChange={() => setActiveCraft(type)}
                                        className="w-4 h-4 text-[var(--primary-color)] border-stone-300 rounded focus:ring-[var(--primary-color)]"
                                    />
                                    <span className="text-stone-700 group-hover:text-[var(--primary-color)] transition-colors">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-4 pb-2 border-b border-stone-200">Price Range</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <input className="w-20 px-2 py-1 border border-stone-300 rounded text-sm" placeholder="Min" type="number" />
                            <span className="text-stone-400">-</span>
                            <input className="w-20 px-2 py-1 border border-stone-300 rounded text-sm" placeholder="Max" type="number" />
                        </div>
                        <input className="w-full accent-[var(--primary-color)] h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer" max="10000" min="0" type="range" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-4 pb-2 border-b border-stone-200">Region</h3>
                        <div className="space-y-3">
                            {regions.map((region, i) => (
                                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={activeRegion === region}
                                        onChange={() => setActiveRegion(activeRegion === region ? "" : region)}
                                        className="w-4 h-4 text-[var(--primary-color)] border-stone-300 rounded focus:ring-[var(--primary-color)]"
                                    />
                                    <span className="text-stone-700">{region}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                <section className="flex-1 min-w-0">
                    {/* phone filter chips */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
                        {craftTypes.map((type, i) => (
                            <Button
                                key={i}
                                onClick={() => setActiveCraft(type)}
                                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${activeCraft === type ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]" : "bg-white border-stone-200 text-stone-600 hover:border-[var(--primary-color)]"}`}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <nav className="text-sm text-stone-500 mb-4 sm:mb-0">
                            <Link className="hover:text-[var(--primary-color)]" href="/">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="font-medium text-[var(--text-secondary)]">Marketplace</span>
                        </nav>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-stone-500">Sort by:</span>
                            <select className="bg-transparent border-none font-medium text-[var(--text-secondary)] focus:ring-0 cursor-pointer">
                                <option>Popularity</option>
                                <option>Newest Arrivals</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* banner */}
                    <div className="w-full bg-[#F3E5D8] rounded-xl p-6 mb-8 flex items-center justify-between relative overflow-hidden">
                        <div className="relative z-10 max-w-lg">
                            <h2 className="font-display text-3xl font-bold text-[var(--text-secondary)] mb-2">Heritage Handlooms</h2>
                            <p className="text-stone-700 mb-4">Discover the exquisite artistry of Varanasi weavers. Direct from the loom to your home.</p>
                            <a className="inline-block text-[var(--primary-color)] font-bold border-b-2 border-[var(--primary-color)] pb-0.5 hover:text-[var(--text-secondary)] transition-colors" href="#">View Collection</a>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    </div>

                    {/* pdt grid */}
                    {products.length === 0 && (
                        <EmptyState description="No products available yet." icon="storefront" />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.filter(p => activeCraft === "All Crafts" || p.category === craftCategoryMap[activeCraft]).filter(p => !activeRegion || p.region === activeRegion).map((product, i) => (
                            <div key={product._id || i} className="bg-white rounded-xl overflow-hidden card-shadow group hover:-translate-y-1 transition-transform duration-300">
                                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                                    <Image
                                        alt={product.name}
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={product.img || product.images?.[0] || "/placeholder.png"}
                                        fill
                                        sizes="(max-width: 1280px) 100vw, 33vw"
                                        unoptimized
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 cursor-pointer hover:bg-[var(--primary-color)] hover:text-white transition-colors shadow-sm" onClick={(e) => toggleWishlist(e, product._id)}>
                                        <span className={`material-symbols-outlined text-xl block ${wishlist.has(product._id) ? 'text-red-500 filled' : 'text-stone-500'}`}>favorite</span>
                                    </div>
                                    {(product.badge || product.stock <= 2) && (
                                        <span className={`absolute bottom-3 left-3 ${product.badge === 'New Arrival' ? 'bg-[var(--gold)]' : 'bg-black/60'} text-white text-xs px-2 py-1 rounded backdrop-blur-sm`}>
                                            {product.badge || (product.stock <= 2 ? `Only ${product.stock} left` : "")}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-xs font-bold text-[var(--secondary-color)] uppercase tracking-wider">{product.category}</div>
                                        {product.rating ? (
                                            <div className="flex items-center gap-1 text-xs text-stone-500">
                                                <span className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                                                {product.rating} ({product.reviews || product.reviewCount || 0})
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-stone-500"><span className="material-symbols-outlined text-stone-300 text-sm">star</span>New</div>
                                        )}
                                    </div>
                                    <h3 className="font-display text-lg font-bold text-[var(--text-secondary)] mb-1 leading-tight">{product.name}</h3>
                                    <p className="text-xs text-stone-500 mb-3">By <span className="text-stone-800 font-medium hover:underline cursor-pointer">{product.artisan || product.seller?.fullName || "Artisan"}</span></p>
                                    <div className="flex items-end justify-between mb-4">
                                        <div className="flex flex-col">
                                            {product.oldPrice && <span className="text-xs text-stone-400 line-through">{product.oldPrice}</span>}
                                            <span className="text-xl font-bold text-[var(--text-primary)]">₹ {product.price?.toLocaleString?.() || product.price}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" onClick={(e) => addToCart(e, product._id)} disabled={cartLoading[product._id]} className="text-sm flex items-center justify-center gap-1 disabled:opacity-50"><span className="material-symbols-outlined text-lg">shopping_cart</span>{cartLoading[product._id] ? "..." : "Add"}</Button>
                                        <Button variant="primary" onClick={(e) => addToCart(e, product._id, true)} disabled={cartLoading[product._id]} className="text-sm shadow-md disabled:opacity-50">Buy Now</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* pages */}
                    <div className="mt-12 flex justify-center">
                        <nav className="flex items-center gap-2">
                            <Button className="w-10 h-10 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"><span className="material-symbols-outlined">chevron_left</span></Button>
                            <Button className="w-10 h-10 flex items-center justify-center rounded bg-[var(--primary-color)] text-white shadow-md">1</Button>
                            <Button className="w-10 h-10 flex items-center justify-center rounded border border-stone-200 text-stone-600 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors">2</Button>
                            <Button className="w-10 h-10 flex items-center justify-center rounded border border-stone-200 text-stone-600 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors">3</Button>
                            <span className="px-2 text-stone-400">...</span>
                            <Button className="w-10 h-10 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"><span className="material-symbols-outlined">chevron_right</span></Button>
                        </nav>
                    </div>
                </section>
            </main>
        </AppShell>
    );
}
