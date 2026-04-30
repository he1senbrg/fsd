"use client";
import AppShell from "@/components/AppShell";
import { Button, EmptyState, Loader } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { campaignAPI, wishlistAPI } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CrowdfundingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backingActive, setBackingActive] = useState(new Set());
    const [backingAmounts, setBackingAmounts] = useState({});
    const [backingLoading, setBackingLoading] = useState({});
    const showToast = useToast();

    const toggleBackingForm = (campaignId) => {
        setBackingActive(prev => {
            const next = new Set(prev);
            if (next.has(campaignId)) next.delete(campaignId); else next.add(campaignId);
            return next;
        });
    };

    const backCampaign = async (campaign, amount) => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) { showToast("Please enter a valid amount.", "warning"); return; }
        // redirect to payment page
        router.push(
            `/payment?type=campaign&id=${campaign._id}&title=${encodeURIComponent(campaign.title || "Campaign")}&amount=${parsedAmount}&campaignAmount=${parsedAmount}`
        );
    };

    const handleDeleteCampaign = async (id) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await campaignAPI.deleteCampaign(id);
            setCampaigns(prev => prev.filter(c => c._id !== id));
            showToast('Campaign deleted successfully', 'success');
        } catch (err) {
            if (err?.status !== 401) console.error(err);
            showToast('Failed to delete campaign', 'error');
        }
    };

    useEffect(() => {
        async function load() {
            try {
                const [campsRes, statsRes] = await Promise.allSettled([
                    campaignAPI.getCampaigns(),
                    campaignAPI.getStats(),
                ]);
                if (campsRes.status === "fulfilled") setCampaigns(campsRes.value.data?.campaigns || []);
                if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
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
            <div className="py-2">
                {/* header */}
                <div className="text-center mb-12">
                    <span className="material-symbols-outlined text-4xl text-[var(--secondary-color)] mb-2 block">savings</span>
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3 font-display">Crowdfunding & Sponsorship Hub</h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Empower artists to preserve heritage, fund grand performances, and sustain traditional crafts. Every contribution makes a difference.
                    </p>
                </div>

                {/* campaign grid */}
                {campaigns.length === 0 && (
                    <EmptyState className="mb-8" icon="savings" description="No campaigns yet. Start one!" />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {[...campaigns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((c, i) => {
                        const raised = c.raisedAmount || c.currentAmount || 0;
                        const goal = c.goalAmount || 1;
                        const percent = Math.round((raised / goal) * 100);
                        return (
                            <div key={c._id || i} className="bg-white rounded-2xl overflow-hidden card-shadow hover:-translate-y-1 transition-transform duration-300 group relative">
                                    {user && c.creator?._id === user._id && (
                                        <button
                                            onClick={() => handleDeleteCampaign(c._id)}
                                            className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-red-50 text-red-500 p-1.5 rounded-lg shadow-sm transition-colors backdrop-blur-sm border border-red-100 flex items-center justify-center leading-none"
                                            title="Delete Campaign"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    )}
                                <div className="relative h-72 overflow-hidden">
                                    <Image
                                        alt={c.title}
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={c.img || c.image || c.coverImage || "/placeholder.png"}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-4 left-4 flex gap-2">
                                        {(c.tags || c.categories || []).map((tag, j) => (<span key={j} className="bg-white/90 backdrop-blur-sm text-[var(--text-primary)] text-xs px-2 py-1 rounded-full font-medium">{tag}</span>))}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-stone-400 text-lg">person</span>
                                        <span className="text-sm text-stone-600">{c.creator?.fullName || c.creator}</span>
                                        <span className="text-stone-300 mx-1">•</span>
                                        <span className="material-symbols-outlined text-stone-400 text-sm">location_on</span>
                                        <span className="text-xs text-stone-500">{c.location}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mb-2">{c.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2">{c.description}</p>

                                    {/* progress bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-[var(--primary-color)]">₹{(raised / 1000).toFixed(0)}k raised</span>
                                            <span className="text-stone-500">of ₹{(goal / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-full rounded-full ${percent >= 70 ? "bg-green-500" : percent >= 40 ? "bg-[var(--secondary-color)]" : "bg-[var(--gold)]"}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex gap-4 text-stone-500">
                                            <span><strong className="text-[var(--text-primary)]">{c.backerCount ?? c.backersCount ?? 0}</strong> backers</span>
                                            <span><strong className="text-[var(--text-primary)]">{c.daysLeft ?? 0}</strong> days left</span>
                                        </div>
                                        {user && c.creator?._id !== user._id && (
                                            <Button onClick={() => toggleBackingForm(c._id)} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md">
                                                {backingActive.has(c._id) ? 'Cancel' : 'Back This Project'}
                                            </Button>
                                        )}
                                    </div>
                                    {backingActive.has(c._id) && (
                                        <div className="mt-3 flex gap-2 items-center">
                                            <span className="text-stone-500 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Enter amount..."
                                                value={backingAmounts[c._id] || ""}
                                                onChange={(e) => setBackingAmounts(prev => ({ ...prev, [c._id]: e.target.value }))}
                                                className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"
                                            />
                                            <Button
                                                onClick={() => backCampaign(c, backingAmounts[c._id])}
                                                disabled={backingLoading[c._id]}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >{backingLoading[c._id] ? 'Processing...' : 'Contribute'}</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {user?.role === 'artist' && (
                    <div className="text-center mb-12">
                        <Link href="/crowdfunding/create" className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-lg inline-flex items-center gap-2">
                            <span className="material-symbols-outlined">add_circle</span>
                            Start Your Campaign
                        </Link>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
