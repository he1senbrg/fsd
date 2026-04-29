"use client";

import { Avatar } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
    { href: "/feed", icon: "feed", label: "Feed" },
    { href: "/profile", icon: "person", label: "Profile" },
    { href: "/opportunities", icon: "event", label: "Events & Gigs" },
    { href: "/marketplace", icon: "storefront", label: "My Shop" },
    { href: "/cart", icon: "shopping_cart", label: "My Cart" },
    { href: "/orders", icon: "confirmation_number", label: "My Bookings" },
    { href: "/crowdfunding", icon: "savings", label: "Funding" },
    { href: "/help", icon: "help", label: "Help & Support" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <aside className="col-span-3 hidden lg:block space-y-6 overflow-y-auto h-full pb-6 scrollbar-hide">
            {/* profile */}
            <div className="bg-[var(--surface-color)] rounded-xl shadow-sm p-6 border border-orange-100 flex flex-col items-center text-center">
                <Avatar src={user?.avatar} alt="User" sizeClassName="w-20 h-20" className="mb-4 border-2 border-[var(--accent-color)]" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.fullName || "Ananya Sharma"}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{user?.title || user?.role || "Kathak Dancer & Mentor"}</p>
                <div className="flex w-full justify-between border-t border-orange-50 pt-4 text-center">
                    <div>
                        <span className="block font-bold text-lg">{user?.followerCount ?? "—"}</span>
                        <span className="text-xs text-stone-500">Followers</span>
                    </div>
                    <div>
                        <span className="block font-bold text-lg">{user?.performanceCount ?? "—"}</span>
                        <span className="text-xs text-stone-500">Events</span>
                    </div>
                    <div>
                        <span className="block font-bold text-lg">{user?.rating ?? "—"}</span>
                        <span className="text-xs text-stone-500">Rating</span>
                    </div>
                </div>
            </div>

            {/* nav */}
            <div className="bg-[var(--surface-color)] rounded-xl shadow-sm overflow-hidden border border-orange-100">
                <nav className="flex flex-col text-[var(--text-secondary)] font-medium">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-6 py-4 transition-colors ${isActive
                                    ? "bg-orange-50 text-[var(--primary-color)] border-l-4 border-[var(--primary-color)]"
                                    : "hover:bg-orange-50 hover:text-[var(--primary-color)]"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

        </aside>
    );
}
