"use client";
import AppShell from "@/components/AppShell";
import VideoPlayer from "@/components/VideoPlayer";
import { Button, EmptyState, Loader, PillTab } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { conversationAPI, postAPI, userAPI } from "@/lib/api";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProfileContent() {
    const { user: authUser } = useAuth();
    const showToast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramId = searchParams.get("id");
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [portfolioFilter, setPortfolioFilter] = useState("All");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [commentsMap, setCommentsMap] = useState({});
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentInputs, setCommentInputs] = useState({});
    const [submittingComment, setSubmittingComment] = useState({});
    const [sharedPosts, setSharedPosts] = useState(new Set());
    const [carouselIndex, setCarouselIndex] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const [lightbox, setLightbox] = useState(null);

    const portfolioTabs = ["All", "Performances", "Workshops", "Media"];

    useEffect(() => {
        async function load() {
            const currentId = paramId || authUser?._id;
            if (!currentId) { setLoading(false); return; }
            try {
                const [profileRes, portfolioRes, reviewsRes] = await Promise.allSettled([
                    userAPI.getProfile(currentId),
                    userAPI.getPortfolio(currentId),
                    userAPI.getReviews(currentId),
                ]);
                if (profileRes.status === "fulfilled") {
                    const data = profileRes.value.data;
                    setProfile(data?.user || data);
                    setIsFollowing(data?.isFollowing || false);
                }
                if (portfolioRes.status === "fulfilled") setPortfolio(portfolioRes.value.data?.posts || portfolioRes.value.data?.portfolio || []);
                if (reviewsRes.status === "fulfilled") setReviews(reviewsRes.value.data?.reviews || []);
            } catch (e) { if (e?.status !== 401) console.error(e); }
            setLoading(false);
        }
        load();
    }, [authUser, paramId]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft') setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null);
            if (e.key === 'ArrowRight') setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox]);

    if (loading) {
        return (
            <AppShell>
                <Loader />
            </AppShell>
        );
    }

    const u = profile || authUser || {};
    const memberSince = u.createdAt ? new Date(u.createdAt).getFullYear() : "2022";
    const isOwnProfile = !paramId || paramId === authUser?._id;
    const isArtLoverProfile = u.role === "artLover";
    const socialLinks = [
        { key: "website", label: "Website", icon: "language" },
        { key: "instagram", label: "Instagram", icon: "photo_camera" },
        { key: "facebook", label: "Facebook", icon: "thumb_up" },
        { key: "youtube", label: "YouTube", icon: "play_circle" },
    ].filter((item) => u.socialLinks?.[item.key]);

    const normalizeUrl = (url) => {
        if (!url) return "#";
        return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    };

    const handleFollow = async () => {
        if (!u._id) return;
        setFollowLoading(true);
        try {
            const res = await userAPI.toggleFollow(u._id);
            setIsFollowing(res.data?.isFollowing ?? !isFollowing);
            setProfile(prev => prev ? {
                ...prev,
                followerCount: (prev.followerCount || 0) + (res.data?.isFollowing ? 1 : -1),
            } : prev);
        } catch (e) { if (e?.status !== 401) console.error(e); }
        setFollowLoading(false);
    };

    const handleMessage = async () => {
        if (!u._id) return;
        setMsgLoading(true);
        try {
            const res = await conversationAPI.startConversation(u._id);
            const convId = res.data?.conversation?._id;
            router.push(convId ? `/messages?conv=${convId}` : '/messages');
        } catch (e) {
            if (e?.status !== 401) console.error(e);
            router.push('/messages');
        }
        setMsgLoading(false);
    };

    const handleSubmitReview = async () => {
        if (!u._id || reviewRating === 0) return;
        setSubmittingReview(true);
        try {
            const res = await userAPI.addReview(u._id, reviewRating, reviewText);
            setReviews(prev => [res.data.review, ...prev.filter(r => r.reviewer?._id !== authUser?._id)]);
            setReviewRating(0);
            setReviewText("");
            // update local rating
            const profileRes = await userAPI.getProfile(u._id);
            setProfile(profileRes.data.user || profileRes.data);
        } catch (e) {
            console.error(e);
        }
        setSubmittingReview(false);
    };

    function timeAgo(dateStr) {
        if (!dateStr) return "";
        // eslint-disable-next-line react-hooks/purity
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    const toggleLike = async (postId) => {
        const post = portfolio.find(p => p._id === postId);
        if (!post) return;
        const wasLiked = post.isLiked;
        setPortfolio(prev => prev.map(p => p._id === postId ? { ...p, isLiked: !wasLiked, likeCount: (p.likeCount || 0) + (wasLiked ? -1 : 1) } : p));
        try { await postAPI.toggleLike(postId); } catch (e) {
            setPortfolio(prev => prev.map(p => p._id === postId ? { ...p, isLiked: wasLiked, likeCount: (p.likeCount || 0) + (wasLiked ? 1 : -1) } : p));
        }
    };

    const toggleComments = async (postId) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            next.has(postId) ? next.delete(postId) : next.add(postId);
            return next;
        });
        if (!commentsMap[postId]) {
            try {
                const res = await postAPI.getComments(postId);
                setCommentsMap(prev => ({ ...prev, [postId]: res.data?.comments || [] }));
            } catch (e) { if (e?.status !== 401) console.error(e); }
        }
    };

    const submitComment = async (postId) => {
        const text = commentInputs[postId]?.trim();
        if (!text) return;
        setSubmittingComment(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await postAPI.addComment(postId, text);
            const newComment = res.data?.comment || res.data;
            setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
            setPortfolio(prev => prev.map(p => p._id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
        } catch (e) { if (e?.status !== 401) console.error(e); }
        setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    };

    const sharePost = async (postId) => {
        try {
            const postUrl = `${window.location.origin}/feed?post=${postId}`;
            await Promise.all([
                postAPI.sharePost(postId),
                navigator.clipboard.writeText(postUrl),
            ]);
            setSharedPosts(prev => new Set([...prev, postId]));
            setTimeout(() => {
                setSharedPosts(prev => {
                    const next = new Set(prev);
                    next.delete(postId);
                    return next;
                });
            }, 5000);
            setPortfolio(prev => prev.map(p => p._id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p));
            showToast("Post link copied!", "success");
        } catch (e) { if (e?.status !== 401) console.error(e); }
    };

    const handleDeletePost = async (postId) => {
        setOpenMenuId(null);
        try {
            await postAPI.deletePost(postId);
            setPortfolio(prev => prev.filter(p => p._id !== postId));
        } catch (e) { if (e?.status !== 401) console.error(e); }
    };

    const handleCopyLink = (postId) => { setOpenMenuId(null); navigator.clipboard.writeText(`${window.location.origin}/feed?post=${postId}`); };

    const openLightbox = (images, index) => setLightbox({ images, index });
    const closeLightbox = () => setLightbox(null);
    const lightboxPrev = () => setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null);
    const lightboxNext = () => setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null);
    const carouselPrev = (id, len) => setCarouselIndex(prev => ({ ...prev, [id]: ((prev[id] ?? 0) - 1 + len) % len }));
    const carouselNext = (id, len) => setCarouselIndex(prev => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % len }));

    return (
        <AppShell>
            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
                    <Button onClick={closeLightbox} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </Button>
                    {lightbox.images.length > 1 && (<>
                        <Button onClick={e => { e.stopPropagation(); lightboxPrev(); }} className="absolute left-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">chevron_left</span></Button>
                        <Button onClick={e => { e.stopPropagation(); lightboxNext(); }} className="absolute right-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">chevron_right</span></Button>
                    </>)}
                    <Image src={lightbox.images[lightbox.index]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" width={1600} height={1200} unoptimized onClick={e => e.stopPropagation()} />
                    {lightbox.images.length > 1 && (
                        <div className="absolute bottom-6 flex gap-2">
                            {lightbox.images.map((_, i) => (
                                <Button key={i} onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: i })); }} className={`w-2 h-2 rounded-full transition-all ${i === lightbox.index ? 'bg-white scale-125' : 'bg-white/40'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}
            <div className="py-2">
                {/* Cover, photo */}
                <div className="mb-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                        {/* cover image / gradient */}
                        <div className="h-36 sm:h-48 md:h-72 bg-gradient-to-r from-[var(--deep-teal)] via-[var(--primary-color)] to-[var(--secondary-color)] relative overflow-hidden">
                            {u.coverImage ? (
                                <Image src={u.coverImage} alt="Cover" className="w-full h-full object-cover" width={1200} height={400} unoptimized />
                            ) : (
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            )}
                        </div>
                        {/* desktop part (hidden mobile) */}
                        <div className="absolute bottom-0 left-0 right-0 px-8 py-6 bg-gradient-to-t from-black/50 to-transparent hidden md:flex items-end gap-6">
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl -mb-2">
                                <Image alt={u.fullName || "User"} className="w-full h-full object-cover" src={u.avatar || "/avatar-placeholder.svg"} width={128} height={128} unoptimized />
                            </div>
                            <div className="text-white flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-bold font-display">{u.fullName || "Your Name"}</h1>
                                    {u.isVerified && <span className="material-symbols-outlined text-blue-400 text-xl filled">verified</span>}
                                </div>
                                <p className="text-white/80 text-lg">{u.title || u.primaryArtForm || ""}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{u.location || "India"}</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>Member since {memberSince}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {!isOwnProfile && (
                                    <>
                                        <Button
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className={`px-6 py-2.5 rounded-full font-bold transition shadow-lg flex items-center gap-2 ${isFollowing ? 'bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30' : 'bg-[var(--terracotta)] text-white hover:bg-[var(--secondary-color)]'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">{isFollowing ? 'person_check' : 'person_add'}</span>
                                            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                                        </Button>
                                        <Button
                                            onClick={handleMessage}
                                            disabled={msgLoading}
                                            className="bg-white/20 backdrop-blur text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/30 transition border border-white/30 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">chat</span>
                                            {msgLoading ? '...' : 'Message'}
                                        </Button>
                                    </>
                                )}
                                {isOwnProfile && (
                                    <Button onClick={() => router.push('/settings')} className="bg-white/20 backdrop-blur text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/30 transition border border-white/30 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">edit</span>Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* profile card mobile*/}
                    <div className="md:hidden -mt-12 relative z-10 mx-4">
                        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 px-5 pt-14 pb-5 text-center relative">
                            {/* avatar*/}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg">
                                    <Image alt={u.fullName || "User"} className="w-full h-full object-cover" src={u.avatar || "/avatar-placeholder.svg"} width={80} height={80} unoptimized />
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <h1 className="text-xl font-bold font-display text-[var(--text-primary)]">{u.fullName || "Your Name"}</h1>
                                {u.isVerified && <span className="material-symbols-outlined text-blue-500 text-lg filled">verified</span>}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm mb-2">{u.title || u.primaryArtForm || ""}</p>
                            <div className="flex items-center justify-center gap-4 text-xs text-stone-500 mb-4">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{u.location || "India"}</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>Since {memberSince}</span>
                            </div>
                            <div className="flex gap-2 justify-center">
                                {!isOwnProfile && (
                                    <>
                                        <Button
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className={`px-5 py-2 rounded-full font-bold transition shadow-md flex items-center gap-1.5 text-sm ${isFollowing ? 'bg-[var(--deep-teal)] text-white border border-[var(--deep-teal)] hover:bg-[var(--primary-color)]' : 'bg-[var(--terracotta)] text-white hover:bg-[var(--secondary-color)]'}`}
                                        >
                                            <span className="material-symbols-outlined text-base">{isFollowing ? 'person_check' : 'person_add'}</span>
                                            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                                        </Button>
                                        <Button
                                            onClick={handleMessage}
                                            disabled={msgLoading}
                                            className="bg-[var(--deep-teal)] text-white px-5 py-2 rounded-full font-bold hover:bg-[var(--primary-color)] transition shadow-md border border-[var(--deep-teal)] flex items-center gap-1.5 text-sm"
                                        >
                                            <span className="material-symbols-outlined text-base">chat</span>
                                            {msgLoading ? '...' : 'Message'}
                                        </Button>
                                    </>
                                )}
                                {isOwnProfile && (
                                    <Button onClick={() => router.push('/settings')} className="bg-[var(--deep-teal)] text-white px-5 py-2 rounded-full font-bold hover:bg-[var(--primary-color)] transition shadow-md flex items-center gap-1.5 text-sm">
                                        <span className="material-symbols-outlined text-base">edit</span>Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* left col */}
                    <div className="space-y-6">
                        {/* stats */}
                        <div className={`bg-white rounded-xl shadow-sm border border-orange-100 p-6 grid gap-4 text-center ${isArtLoverProfile ? "grid-cols-1" : "grid-cols-3"}`}>
                            <div><span className="text-2xl font-bold text-[var(--primary-color)] block">{u.followerCount ?? u.followersCount ?? u.stats?.followers ?? "0"}</span><span className="text-xs text-stone-500">Followers</span></div>
                            {!isArtLoverProfile && <div><span className="text-2xl font-bold text-[var(--primary-color)] block">{u.performanceCount ?? u.performancesCount ?? u.stats?.performances ?? "0"}</span><span className="text-xs text-stone-500">Events</span></div>}
                            {!isArtLoverProfile && <div><span className="text-2xl font-bold text-[var(--primary-color)] block">{u.rating ?? u.stats?.rating ?? "0"}</span><span className="text-xs text-stone-500">Rating</span></div>}
                        </div>

                        {/* abt */}
                        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 serif-font">About</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {u.bio || "No bio yet."}
                            </p>
                        </div>

                        {isArtLoverProfile && (
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 serif-font">Social Links</h3>
                                <div className="space-y-3">
                                    {socialLinks.map((item) => (
                                        <a
                                            key={item.key}
                                            href={normalizeUrl(u.socialLinks?.[item.key])}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[var(--primary-color)]">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </a>
                                    ))}
                                    {socialLinks.length === 0 && <p className="text-sm text-stone-400">No social links added.</p>}
                                </div>
                            </div>
                        )}

                        {/* specializations */}
                        {!isArtLoverProfile && (
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 serif-font">Specializations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(u.specializations || []).map(tag => (
                                        <span key={tag} className="bg-orange-50 text-[var(--primary-color)] px-3 py-1 rounded-full text-sm border border-orange-200">{tag}</span>
                                    ))}
                                    {(!u.specializations || u.specializations.length === 0) && <p className="text-sm text-stone-400">No specializations listed.</p>}
                                </div>
                            </div>
                        )}

                        {/* Availability */}
                        {!isArtLoverProfile && (
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 serif-font">Availability & Pricing</h3>
                                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                                    {(u.pricing || []).map((p, i) => (
                                        <div key={i} className="flex justify-between"><span>{p.service}:</span><span className="font-bold text-[var(--text-primary)]">₹ {p.amount?.toLocaleString() || p.price?.toLocaleString()}</span></div>
                                    ))}
                                    {(!u.pricing || u.pricing.length === 0) && <p className="text-stone-400">Pricing not listed.</p>}
                                </div>
                                <Button
                                    onClick={isOwnProfile ? () => router.push('/settings') : handleMessage}
                                    disabled={msgLoading}
                                    className="w-full mt-4 bg-[var(--primary-color)] text-white py-2 rounded-lg font-bold hover:bg-[var(--secondary-color)] transition-colors disabled:opacity-60"
                                >
                                    {msgLoading ? 'Opening...' : isOwnProfile ? 'Edit Pricing' : 'Book Now'}
                                </Button>
                            </div>
                        )}

                        {!isArtLoverProfile && (
                            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] mb-3 serif-font">Social Links</h3>
                                <div className="space-y-3">
                                    {socialLinks.map((item) => (
                                        <a
                                            key={item.key}
                                            href={normalizeUrl(u.socialLinks?.[item.key])}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 text-sm text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[var(--primary-color)]">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </a>
                                    ))}
                                    {socialLinks.length === 0 && <p className="text-sm text-stone-400">No social links added.</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* right col */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* portfolio */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display">{isArtLoverProfile ? "Posts" : "Portfolio"}</h2>
                                {!isArtLoverProfile && (
                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                        {portfolioTabs.map((tab) => (
                                            <PillTab
                                                key={tab}
                                                active={portfolioFilter === tab}
                                                onClick={() => setPortfolioFilter(tab)}
                                                className="px-4 py-1.5"
                                                inactiveClassName="bg-white border-stone-200 text-stone-600 hover:border-[var(--primary-color)]"
                                            >
                                                {tab}
                                            </PillTab>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {portfolio.length === 0 && (
                                <EmptyState className="py-8" icon="photo_library" iconClassName="text-4xl" description={isArtLoverProfile ? "No posts yet." : "No portfolio items yet."} />
                            )}
                            <div className="space-y-4">
                                {portfolio.filter(item => {
                                    if (isArtLoverProfile) return true;
                                    if (portfolioFilter === "All") return true;
                                    const pt = item.postType || "general";
                                    if (portfolioFilter === "Performances") return pt === "performance";
                                    if (portfolioFilter === "Workshops") return pt === "workshop";
                                    if (portfolioFilter === "Media") return item.media?.length > 0;
                                    return true;
                                }).map((post, i) => (
                                    <article key={post._id || i} className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                                        {/* header */}
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    <Image alt={u.fullName} className="w-full h-full object-cover" src={u.avatar || "/avatar-placeholder.svg"} width={40} height={40} unoptimized />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{u.fullName || "Unknown"}</h4>
                                                    <p className="text-xs text-stone-500">
                                                        <span className="capitalize">{post.postType || "general"}</span> • {timeAgo(post.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="relative z-20">
                                                <Button onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)} className="text-stone-400 hover:text-[var(--primary-color)]">
                                                    <span className="material-symbols-outlined">more_horiz</span>
                                                </Button>
                                                {openMenuId === post._id && (
                                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 z-20 overflow-hidden text-sm">
                                                        <Button onClick={() => handleCopyLink(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50 text-stone-700">
                                                            <span className="material-symbols-outlined text-base">link</span>Copy Link
                                                        </Button>
                                                        {isOwnProfile && (
                                                            <Button onClick={() => handleDeletePost(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-500 border-t border-stone-100">
                                                                <span className="material-symbols-outlined text-base">delete</span>Delete Post
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* txt */}
                                        {post.text && (
                                            <div className="px-4 pb-3">
                                                <p className="text-[var(--text-secondary)] text-sm">{post.text}</p>
                                            </div>
                                        )}
                                        {/* vid */}
                                        {post.media?.some(m => m.type === 'video') && (
                                            <div className="px-4 pb-4">
                                                <VideoPlayer src={post.media.find(m => m.type === 'video').url} />
                                            </div>
                                        )}
                                        {/* carousel */}
                                        {(() => {
                                            const images = post.media?.filter(m => m.type === 'image') ?? [];
                                            if (images.length === 0) return null;
                                            const idx = carouselIndex[post._id] ?? 0;
                                            const single = images.length === 1;
                                            return (
                                                <div className="relative px-4 pb-4 select-none">
                                                    <div className="relative h-72 overflow-hidden rounded-lg">
                                                        <Image
                                                            src={images[idx].url}
                                                            alt={`Media ${idx + 1}`}
                                                            className="object-cover cursor-zoom-in hover:brightness-95 transition-all"
                                                            fill
                                                            sizes="(max-width: 1024px) 100vw, 66vw"
                                                            unoptimized
                                                            onClick={() => openLightbox(images.map(m => m.url), idx)}
                                                        />
                                                        {!single && <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{idx + 1} / {images.length}</span>}
                                                    </div>
                                                    {!single && (<>
                                                        <Button onClick={() => carouselPrev(post._id, images.length)} className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                                        </Button>
                                                        <Button onClick={() => carouselNext(post._id, images.length)} className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                        </Button>
                                                        <div className="flex justify-center gap-1.5 mt-2">
                                                            {images.map((_, di) => (
                                                                <Button key={di} onClick={() => setCarouselIndex(prev => ({ ...prev, [post._id]: di }))}
                                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${di === idx ? 'bg-[var(--secondary-color)] scale-125' : 'bg-stone-300'}`} />
                                                            ))}
                                                        </div>
                                                    </>)}
                                                </div>
                                            );
                                        })()}
                                        {/* events */}
                                        {post.embeddedEvent?.title && (
                                            <div className="mx-4 mb-4 bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-[var(--primary-color)] rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                                                    <span className="text-xs font-medium uppercase">{post.embeddedEvent.month}</span>
                                                    <span className="text-2xl font-bold">{post.embeddedEvent.date}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-[var(--text-primary)]">{post.embeddedEvent.title}</h5>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-1"><span className="material-symbols-outlined align-middle text-sm">location_on</span> {post.embeddedEvent.location}</p>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5"><span className="material-symbols-outlined align-middle text-sm">schedule</span> {post.embeddedEvent.time}</p>
                                                </div>
                                            </div>
                                        )}
                                        {/* placeholder */}
                                        {!post.text && !post.media?.length && !post.embeddedEvent?.title && (
                                            <div className="px-4 pb-4 text-stone-400 text-sm italic">No content.</div>
                                        )}
                                        {/* actions */}
                                        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                                            <div className="flex items-center gap-4">
                                                <Button onClick={() => toggleLike(post._id)} className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? "text-red-500" : "text-stone-600 hover:text-red-500"}`}>
                                                    <span className={`material-symbols-outlined${post.isLiked ? " filled" : ""}`}>favorite</span>
                                                    <span className="text-sm font-medium">{(post.likeCount ?? 0).toLocaleString()}</span>
                                                </Button>
                                                <Button onClick={() => toggleComments(post._id)} className={`flex items-center gap-1.5 transition-colors ${expandedComments.has(post._id) ? "text-[var(--secondary-color)]" : "text-stone-600 hover:text-[var(--secondary-color)]"}`}>
                                                    <span className="material-symbols-outlined">chat_bubble</span>
                                                    <span className="text-sm font-medium">{commentsMap[post._id]?.length ?? post.commentCount ?? 0}</span>
                                                </Button>
                                                <Button onClick={() => sharePost(post._id)} className={`flex items-center gap-1.5 transition-colors ${sharedPosts.has(post._id) ? "text-green-600" : "text-stone-600 hover:text-[var(--secondary-color)]"}`}>
                                                    <span className="material-symbols-outlined">share</span>
                                                    <span className="text-sm font-medium">{(post.shareCount ?? 0).toLocaleString()}</span>
                                                    {sharedPosts.has(post._id) && <span className="text-xs">Shared!</span>}
                                                </Button>
                                            </div>
                                        </div>
                                        {/* comments */}
                                        {expandedComments.has(post._id) && (
                                            <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3 bg-stone-50">
                                                {(commentsMap[post._id] || []).map((c, ci) => (
                                                    <div key={c._id || ci} className="flex gap-2 items-start">
                                                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-stone-200">
                                                            <Image src={c.author?.avatar || "/avatar-placeholder.svg"} alt="" className="w-full h-full object-cover" width={28} height={28} unoptimized />
                                                        </div>
                                                        <div className="bg-white rounded-xl px-3 py-2 text-xs flex-1 border border-stone-100">
                                                            <span className="font-bold text-[var(--text-primary)] mr-1">{c.author?.fullName || "User"}</span>
                                                            {c.text || c.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {(commentsMap[post._id] || []).length === 0 && <p className="text-xs text-stone-400">No comments yet.</p>}
                                                <div className="flex gap-2 items-center">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                                                        <Image src={authUser?.avatar || "/avatar-placeholder.svg"} alt="" className="w-full h-full object-cover" width={28} height={28} unoptimized />
                                                    </div>
                                                    <input
                                                        className="flex-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 text-xs focus:ring-1 focus:ring-[var(--secondary-color)]"
                                                        placeholder="Add a comment..."
                                                        value={commentInputs[post._id] || ""}
                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === "Enter" && submitComment(post._id)}
                                                    />
                                                    <Button onClick={() => submitComment(post._id)} disabled={submittingComment[post._id] || !commentInputs[post._id]?.trim()} className="text-[var(--primary-color)] disabled:opacity-40">
                                                        <span className="material-symbols-outlined text-xl">send</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </div>

                        {/* review */}
                        {!isArtLoverProfile && (
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 font-display">Reviews</h2>
                                
                                {!isOwnProfile && (
                                    <div className="bg-white border border-orange-100 rounded-xl p-6 shadow-sm mb-6">
                                        <h3 className="font-bold mb-2">Leave a Review</h3>
                                        <div className="flex gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span 
                                                    key={star} 
                                                    onClick={() => setReviewRating(star)}
                                                    className={`material-symbols-outlined cursor-pointer text-xl ${reviewRating >= star ? 'text-yellow-400 filled' : 'text-stone-300'}`}
                                                >
                                                    star
                                                </span>
                                            ))}
                                        </div>
                                        <textarea 
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--secondary-color)] mb-3 resize-none"
                                            rows="3"
                                            placeholder="Write your review..."
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                        />
                                        <Button 
                                            onClick={handleSubmitReview} 
                                            disabled={reviewRating === 0 || submittingReview}
                                            className="bg-[var(--primary-color)] text-white px-5 py-2 rounded-full font-bold hover:bg-[var(--secondary-color)] transition shadow-sm text-sm flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">send</span>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                    </div>
                                )}

                                {reviews.length === 0 && (
                                    <EmptyState className="py-8" icon="rate_review" iconClassName="text-4xl" description="No reviews yet." />
                                )}
                                <div className="space-y-4">
                                    {reviews.map((review, i) => (
                                        <div key={review._id || i} className="bg-white border border-orange-100 rounded-xl p-6 shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-[var(--text-primary)]">{review.name || review.reviewer?.fullName || "Reviewer"}</h4>
                                                    <div className="flex gap-0.5 mt-1">
                                                        {[...Array(review.rating || 5)].map((_, j) => (
                                                            <span key={j} className="material-symbols-outlined text-yellow-400 text-sm filled">star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">&ldquo;{review.comment || review.text}&rdquo;</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
