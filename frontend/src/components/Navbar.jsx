"use client";

import { Avatar, Button, CountBadge } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { cartAPI, conversationAPI, notificationAPI } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/crowdfunding", label: "Crowdfunding" },
];

const NOTIF_ICON_MAP = {
    like: { icon: "favorite", bg: "bg-red-100/80", color: "text-red-500" },
    comment: { icon: "chat_bubble", bg: "bg-blue-100/80", color: "text-blue-500" },
    follow: { icon: "person_add", bg: "bg-purple-100/80", color: "text-purple-500" },
    event: { icon: "event", bg: "bg-green-100/80", color: "text-green-500" },
    order: { icon: "local_shipping", bg: "bg-orange-100/80", color: "text-orange-500" },
};

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const isLanding = pathname === "/";

    useEffect(() => {
        if (!user) return;
        notificationAPI.getNotifications()
            .then(res => setNotifications(res.data?.notifications || []))
            .catch(() => {});
        notificationAPI.getUnreadCount()
            .then(res => setUnreadCount(res.data?.unreadCount || 0))
            .catch(() => {});
        conversationAPI.getUnreadCount()
            .then(res => setUnreadMessages(res.data?.unreadCount || 0))
            .catch(() => {});
        cartAPI.getCart()
            .then(res => setCartCount(res.data?.cart?.items?.length || 0))
            .catch(() => {});
    }, [user]);

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const handleMarkRead = async (notif) => {
        if (notif.read) return;
        try {
            await notificationAPI.markRead(notif._id);
            setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationAPI.deleteNotification(id);
            setNotifications(prev => {
                const deleted = prev.find(n => n._id === id);
                if (deleted && !deleted.read) setUnreadCount(c => Math.max(0, c - 1));
                return prev.filter(n => n._id !== id);
            });
        } catch (e) { console.error(e); }
    };

    const handleClearAll = async () => {
        try {
            await notificationAPI.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    function timeAgo(dateStr) {
        if (!dateStr) return "";
        // eslint-disable-next-line react-hooks/purity
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLanding) {
        return (
            <nav className="sticky top-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b border-[var(--deep-teal)]/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-4xl text-[var(--terracotta)]">temple_hindu</span>
                            <span className="text-3xl font-bold text-[var(--deep-teal)] tracking-tight font-display">KalaSetu</span>
                        </Link>
                        <div className="hidden md:flex space-x-8 items-center">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="text-[var(--deep-teal)] hover:text-[var(--terracotta)] font-medium transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/login" className="text-[var(--deep-teal)] font-bold hover:text-[var(--terracotta)] transition-colors">Log In</Link>
                            <Link href="/login" className="bg-[var(--deep-teal)] text-[var(--cream)] px-5 py-2 rounded-full font-bold hover:bg-[var(--terracotta)] transition-colors shadow-md">
                                Sign Up
                            </Link>
                        </div>
                        <div className="md:hidden flex items-center">
                            <Button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[var(--deep-teal)] hover:text-[var(--terracotta)] focus:outline-none">
                                <span className="material-symbols-outlined text-3xl">{mobileMenuOpen ? "close" : "menu"}</span>
                            </Button>
                        </div>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden pb-4 space-y-2">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="block py-2 text-[var(--deep-teal)] hover:text-[var(--terracotta)] font-medium">
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="/login" className="block py-2 text-[var(--deep-teal)] font-bold">Log In / Sign Up</Link>
                        </div>
                    )}
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 bg-[var(--surface-color)] border-b border-orange-100 shadow-sm h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl text-[var(--terracotta)]">temple_hindu</span>
                    <span className="text-2xl font-bold text-[var(--primary-color)] serif-font tracking-tight">KalaSetu</span>
                </Link>
                <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full bg-orange-50 border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] placeholder-stone-400 text-stone-700 shadow-inner"
                        placeholder="Search artists, crafts, or events..."
                        type="text"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-2.5 text-stone-400">search</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
                    <Link href="/cart" className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        <CountBadge count={cartCount} />
                    </Link>
                    <Link href="/messages" className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                        <span className="material-symbols-outlined">chat</span>
                        <CountBadge count={unreadMessages} colorClassName="bg-red-500" />
                    </Link>

                    <div className="relative" ref={notifRef}>
                        <Button
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <CountBadge count={unreadCount} colorClassName="bg-red-500" />
                        </Button>

                        {notifOpen && (
                            <div className="fixed left-4 right-4 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50 bg-white/80 backdrop-blur-xl">
                                <div className="px-5 py-4 border-b border-white/30 bg-white/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-base text-[var(--text-primary)] font-display">Notifications</h3>
                                        <div className="flex items-center gap-3">
                                            <Button onClick={handleMarkAllRead} className="text-xs text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-medium transition-colors">
                                                Mark all read
                                            </Button>
                                            {notifications.length > 0 && (
                                                <Button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                                                    Clear all
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 && (
                                        <div className="text-center py-8 text-stone-400 text-sm">
                                            <span className="material-symbols-outlined text-3xl mb-2 block">notifications_none</span>
                                            <p>No notifications yet</p>
                                        </div>
                                    )}
                                    {notifications.map((notif, i) => {
                                        const kind = NOTIF_ICON_MAP[notif.type] || NOTIF_ICON_MAP.event;
                                        return (
                                            <div
                                                key={notif._id || i}
                                                onClick={() => handleMarkRead(notif)}
                                                className={`group flex items-start gap-3 px-5 py-3.5 hover:bg-white/60 transition-colors cursor-pointer border-b border-stone-100/50 last:border-b-0 ${!notif.read ? 'bg-orange-50/40' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${kind.bg}`}>
                                                    <span className={`material-symbols-outlined text-base ${kind.color}`}>{kind.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[var(--text-primary)] leading-snug">{notif.message}</p>
                                                    <span className="text-[11px] text-stone-400 mt-0.5 block">{timeAgo(notif.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                                                    {!notif.read && <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>}
                                                    <Button
                                                        onClick={(e) => handleDeleteNotification(e, notif._id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700"
                                                        aria-label="Delete notification"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={profileRef}>
                        <Button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--accent-color)] cursor-pointer focus:outline-none"
                        >
                            <Avatar src={user?.avatar} alt="Profile" sizeClassName="w-full h-full" />
                        </Button>
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border border-orange-100 overflow-hidden z-50 bg-white">
                                <div className="px-4 py-3 border-b border-stone-100 bg-orange-50/60">
                                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user?.fullName || "Guest"}</p>
                                    <p className="text-xs text-stone-500 capitalize truncate">{user?.title || user?.role || ""}</p>
                                </div>
                                <Link href="/profile" onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-orange-50 transition-colors">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    View Profile
                                </Link>
                                <Link href="/settings" onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-orange-50 transition-colors">
                                    <span className="material-symbols-outlined text-base">settings</span>
                                    Settings
                                </Link>
                                <Button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors w-full border-t border-stone-100"
                                >
                                    <span className="material-symbols-outlined text-base">logout</span>
                                    Log Out
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="md:hidden">
                        <Button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-600">
                            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
                        </Button>
                    </div>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-orange-100 p-4 space-y-2">
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-3 mb-1 bg-orange-50 rounded-xl">
                            <Avatar src={user.avatar} alt="Profile" sizeClassName="w-9 h-9" className="border-2 border-[var(--accent-color)]" />
                            <div>
                                <p className="font-semibold text-sm text-[var(--text-primary)]">{user.fullName}</p>
                                <p className="text-xs text-stone-500 capitalize">{user.title || user.role || ""}</p>
                            </div>
                        </div>
                    )}
                    <Link href="/feed" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">feed</span>Feed</Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">person</span>Profile</Link>
                    <Link href="/opportunities" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">event</span>Events & Gigs</Link>
                    <Link href="/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">storefront</span>Marketplace</Link>
                    <Link href="/cart" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        My Cart
                        {cartCount > 0 && (
                            <span className="ml-auto bg-[var(--primary-color)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                        )}
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">confirmation_number</span>My Bookings</Link>
                    <Link href="/crowdfunding" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">savings</span>Funding</Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50"><span className="material-symbols-outlined">settings</span>Settings</Link>
                    <Button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full border-t border-stone-100 mt-1">
                        <span className="material-symbols-outlined">logout</span>Log Out
                    </Button>
                </div>
            )}
        </nav>
    );
}