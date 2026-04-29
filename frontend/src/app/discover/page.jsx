"use client";
import AppShell from "@/components/AppShell";
import { Button, EmptyState, Loader, PageHeader } from "@/components/ui";
import { artistAPI } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useArtForms } from "@/context/ArtFormContext";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";
    const { artForms } = useArtForms();

    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    // filter states
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [artForm, setArtForm] = useState("All Art Forms");
    const [location, setLocation] = useState("All Locations");

    useEffect(() => {
        async function load() {
            try {
                const res = await artistAPI.getArtists();
                setArtists(res.data?.artists || []);
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
                <PageHeader
                    title="Discover Artists & Artisans"
                    subtitle="Browse, filter, and book talented traditional artists and craftspeople."
                />

                {/* search and filter */}
                <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400">search</span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-stone-50 border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"
                            placeholder="Search by name, skill, or location..."
                            type="text"
                        />
                    </div>
                    <select
                        className="bg-stone-50 border-none rounded-lg px-4 py-3 text-sm"
                        value={artForm}
                        onChange={(e) => setArtForm(e.target.value)}
                    >
                        <option value="All Art Forms">All Art Forms</option>
                        {artForms.map(form => (
                            <option key={form} value={form}>{form}</option>
                        ))}
                    </select>
                    <select
                        className="bg-stone-50 border-none rounded-lg px-4 py-3 text-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option>All Locations</option><option>Delhi</option><option>Jaipur</option><option>Mumbai</option><option>Kolkata</option>
                    </select>
                </div>

                {/* artist grid */}
                {artists.length === 0 && (
                    <EmptyState description="No artists found." icon="person_search" />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.filter(artist => {
                        const searchLower = searchQuery.toLowerCase();
                        const matchesQuery = searchQuery === "" ||
                            (artist.name || artist.fullName)?.toLowerCase().includes(searchLower) ||
                            artist.role?.toLowerCase().includes(searchLower) ||
                            artist.title?.toLowerCase().includes(searchLower) ||
                            artist.primaryArtForm?.toLowerCase().includes(searchLower);
                        const matchesArtForm = artForm === "All Art Forms" || 
                            artist.role === artForm || 
                            artist.title === artForm || 
                            artist.primaryArtForm === artForm || 
                            (artist.tags || []).includes(artForm);
                        const matchesLocation = location === "All Locations" || artist.location === location;
                        return matchesQuery && matchesArtForm && matchesLocation;
                    }).map((artist, i) => (
                        <Link key={artist._id || i} href={artist._id ? `/profile?id=${artist._id}` : "/profile"} className="bg-white rounded-xl overflow-hidden card-shadow hover:-translate-y-1 transition-transform group block">
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    alt={artist.name || artist.fullName}
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    src={artist.img || artist.avatar || "/placeholder.png"}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    unoptimized
                                />
                                {(artist.verified || artist.isVerified) && (
                                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-xs filled">verified</span>Verified</span>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">{artist.name || artist.fullName}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{artist.role || artist.title || artist.primaryArtForm}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-xs">
                                        <span className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                                        <span className="font-bold">{artist.rating || "N/A"}</span>
                                        <span className="text-stone-400">({artist.reviews || artist.reviewCount || 0})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                                    <span className="material-symbols-outlined text-sm">location_on</span>{artist.location}
                                    <span className="mx-1">•</span>
                                    <span className="font-bold text-[var(--primary-color)]">{artist.price || artist.startingPrice || ""}</span>
                                </div>
                                <div className="flex gap-2 flex-wrap mb-4">
                                    {(artist.tags || artist.specializations || []).map(tag => (
                                        <span key={tag} className="bg-orange-50 text-[var(--primary-color)] text-xs px-2 py-0.5 rounded-full border border-orange-200">{tag}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2" onClick={(e) => e.preventDefault()}>
                                    <Button variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(artist._id ? `/profile?id=${artist._id}` : '/profile'); }} className="text-xs">View Profile</Button>
                                    <Button variant="primary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(artist._id ? `/profile?id=${artist._id}&book=true` : '/profile'); }} className="text-xs shadow-md">Book Now</Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DiscoverContent />
        </Suspense>
    );
}
