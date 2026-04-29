"use client";
import AppShell from "@/components/AppShell";
import VideoPlayer from "@/components/VideoPlayer";
import { Button, Loader, PillTab } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { campaignAPI, opportunityAPI, postAPI } from "@/lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function FeedPage() {
    const { user } = useAuth();
    const router = useRouter();
    const showToast = useToast();
    const [posts, setPosts] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All Posts");
    const [postContent, setPostContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentsMap, setCommentsMap] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [submittingComment, setSubmittingComment] = useState({});
    const [sharedPosts, setSharedPosts] = useState(new Set());
    const [openMenuId, setOpenMenuId] = useState(null);
    const [carouselIndex, setCarouselIndex] = useState({});
    const [lightbox, setLightbox] = useState(null);
    const photoInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const openLightbox = (images, index) => setLightbox({ images, index });
    const closeLightbox = () => setLightbox(null);
    const lightboxPrev = () => setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }));
    const lightboxNext = () => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }));

    const carouselPrev = (postId, len) =>
        setCarouselIndex(prev => ({ ...prev, [postId]: ((prev[postId] ?? 0) - 1 + len) % len }));
    const carouselNext = (postId, len) =>
        setCarouselIndex(prev => ({ ...prev, [postId]: ((prev[postId] ?? 0) + 1) % len }));

    useEffect(() => {
        if (!lightbox) return;
        const handler = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxPrev();
            if (e.key === 'ArrowRight') lightboxNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox]);

    const filters = ["All Posts", "Performances", "Crafts", "Workshops"];
    const filterTypeMap = {
        "Performances": "performances",
        "Crafts": "crafts",
        "Workshops": "workshops",
    };

    useEffect(() => {
        async function loadSidebar() {
            try {
                const [oppsRes, campsRes] = await Promise.allSettled([
                    opportunityAPI.getTrending(),
                    campaignAPI.getTopFunded(),
                ]);
                if (oppsRes.status === "fulfilled") setOpportunities(oppsRes.value.data?.opportunities || []);
                if (campsRes.status === "fulfilled") setCampaigns(campsRes.value.data?.campaigns || []);
            } catch (e) { if (e?.status !== 401) console.error(e); }
        }
        loadSidebar();
    }, []);

    useEffect(() => {
        async function loadPosts() {
            setPostsLoading(true);
            try {
                const params = filterTypeMap[activeFilter] ? { type: filterTypeMap[activeFilter] } : {};
                const res = await postAPI.getPosts(params);
                setPosts(res.data?.posts || []);
            } catch (e) { if (e?.status !== 401) console.error(e); }
            setLoading(false);
            setPostsLoading(false);
        }
        loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    const handleCreatePost = async () => {
        if (!postContent.trim() && selectedFiles.length === 0 && !selectedVideoFile) return;
        setPosting(true);
        try {
            const form = new FormData();
            form.append('text', postContent);
            selectedFiles.forEach(f => form.append('media', f));
            if (selectedVideoFile) form.append('media', selectedVideoFile);
            const res = await postAPI.createPost(form);
            const newPost = res.data?.post || res.data;
            if (newPost) setPosts(prev => [newPost, ...prev]);
            setPostContent("");
            setSelectedFiles([]);
            setSelectedVideoFile(null);
        } catch (e) {
            if (e?.status !== 401) console.error(e);
            showToast("Failed to create post.", "error");
        }
        setPosting(false);
    };

    const toggleLike = async (id) => {
        try {
            const res = await postAPI.toggleLike(id);
            setPosts(prev => prev.map(p => p._id === id
                ? { ...p, likeCount: res.data.likeCount, isLiked: res.data.isLiked }
                : p
            ));
        } catch (e) { if (e?.status !== 401) console.error(e); }
    };

    const toggleComments = async (postId) => {
        const next = new Set(expandedComments);
        if (next.has(postId)) {
            next.delete(postId);
        } else {
            next.add(postId);
            if (!commentsMap[postId]) {
                try {
                    const res = await postAPI.getComments(postId);
                    setCommentsMap(prev => ({ ...prev, [postId]: res.data?.comments || [] }));
                } catch (e) { if (e?.status !== 401) console.error(e); }
            }
        }
        setExpandedComments(next);
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
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
        } catch (e) { if (e?.status !== 401) console.error(e); }
        setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    };

    const sharePost = async (postId) => {
        try {
            await postAPI.sharePost(postId);
            setSharedPosts(prev => new Set([...prev, postId]));
        } catch (e) { if (e?.status !== 401) console.error(e); }
    };

    const applyToOpportunity = (opp) => {
        router.push(`/opportunities`);
    };

    const handleDeletePost = async (postId) => {
        setOpenMenuId(null);
        try {
            await postAPI.deletePost(postId);
            setPosts(prev => prev.filter(p => p._id !== postId));
            showToast("Post deleted.", "success");
        } catch (e) {
            if (e?.status !== 401) console.error(e);
            showToast("Failed to delete post.", "error");
        }
    };

    const handleSavePost = async (postId) => {
        setOpenMenuId(null);
        try {
            await postAPI.savePost(postId);
            showToast("Post saved.", "success");
        } catch (e) {
            if (e?.status !== 401) console.error(e);
            showToast("Failed to save post.", "error");
        }
    };

    const handleReportPost = async (postId) => {
        setOpenMenuId(null);
        try {
            await postAPI.reportPost(postId);
            showToast("Post reported. We'll review it shortly.", "info");
        } catch (e) {
            if (e?.status !== 401) console.error(e);
            showToast("Failed to report post.", "error");
        }
    };

    const handleCopyLink = (postId) => {
        setOpenMenuId(null);
        navigator.clipboard.writeText(`${window.location.origin}/feed?post=${postId}`);
        showToast("Link copied!", "success");
    };

    function timeAgo(dateStr) {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    if (loading) {
        return (
            <AppShell>
                <Loader />
            </AppShell>
        );
    }

    return (
        <AppShell>
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    <Button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </Button>
                    {lightbox.images.length > 1 && (
                        <>
                            <Button
                                onClick={e => { e.stopPropagation(); lightboxPrev(); }}
                                className="absolute left-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_left</span>
                            </Button>
                            <Button
                                onClick={e => { e.stopPropagation(); lightboxNext(); }}
                                className="absolute right-4 text-white/80 hover:text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_right</span>
                            </Button>
                        </>
                    )}
                    <Image
                        src={lightbox.images[lightbox.index]}
                        alt=""
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        width={1600}
                        height={1200}
                        unoptimized
                        onClick={e => e.stopPropagation()}
                    />
                    {lightbox.images.length > 1 && (
                        <div className="absolute bottom-6 flex gap-2">
                            {lightbox.images.map((_, i) => (
                                <Button
                                    key={i}
                                    onClick={e => { e.stopPropagation(); setLightbox(lb => ({ ...lb, index: i })); }}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        i === lightbox.index ? 'bg-white scale-125' : 'bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <main className="lg:col-span-2 space-y-6">
                    {/* make post */}
                    <div className="bg-[var(--surface-color)] rounded-xl shadow-sm p-4 border border-orange-100">
                        <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <Image alt="User" className="w-full h-full object-cover" src={user?.avatar || "/avatar-placeholder.svg"} width={48} height={48} unoptimized />
                            </div>
                            <textarea
                                className="w-full bg-stone-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-[var(--secondary-color)] resize-none"
                                placeholder="Share your latest craft, performance, or update..."
                                rows={2}
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                        </div>
                        {/* files */}
                        {(selectedFiles.length > 0 || selectedVideoFile) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedFiles.map((f, i) => (
                                    <div key={i} className="relative">
                                        <Image src={URL.createObjectURL(f)} className="w-16 h-16 rounded-lg object-cover" alt="preview" width={64} height={64} unoptimized loader={({ src }) => src} />
                                        <Button onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</Button>
                                    </div>
                                ))}
                                {selectedVideoFile && (
                                    <div className="relative flex items-center gap-2 bg-stone-100 rounded-lg px-3 py-2 text-xs text-stone-600">
                                        <span className="material-symbols-outlined text-sm">movie</span>{selectedVideoFile.name}
                                        <Button onClick={() => setSelectedVideoFile(null)} className="ml-1 text-red-500 font-bold">✕</Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
                        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setSelectedVideoFile(e.target.files[0] || null)} />
                        <div className="flex flex-wrap items-center justify-between border-t border-stone-100 pt-3 gap-3">
                            <div className="flex gap-3 sm:gap-4">
                                <Button onClick={() => photoInputRef.current?.click()} className="flex items-center gap-1 sm:gap-2 text-stone-500 hover:text-[var(--secondary-color)] text-sm"><span className="material-symbols-outlined text-xl">image</span> Photo</Button>
                                <Button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-1 sm:gap-2 text-stone-500 hover:text-[var(--secondary-color)] text-sm"><span className="material-symbols-outlined text-xl">movie</span> Video</Button>
                            </div>
                            <Button
                                onClick={handleCreatePost}
                                disabled={posting || (!postContent.trim() && selectedFiles.length === 0 && !selectedVideoFile)}
                                className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >{posting ? "Posting..." : "Post"}</Button>
                        </div>
                    </div>

                    {/* filters */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {filters.map((filter) => (
                            <PillTab
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                active={activeFilter === filter}
                                className="px-4 py-1.5"
                                activeClassName="bg-[var(--text-primary)] text-white border-[var(--text-primary)]"
                                inactiveClassName="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                            >
                                {filter}
                            </PillTab>
                        ))}
                    </div>

                    {/* posts */}
                    {postsLoading && (
                        <div className="flex justify-center py-8">
                            <Loader inline size="text-3xl" />
                        </div>
                    )}
                    {!postsLoading && posts.length === 0 && !loading && (
                        <div className="text-center py-12 text-stone-400">
                            <span className="material-symbols-outlined text-5xl mb-2 block">dynamic_feed</span>
                            <p>{activeFilter === "All Posts" ? "No posts yet. Be the first to share!" : `No ${activeFilter.toLowerCase()} posts yet.`}</p>
                        </div>
                    )}
                    {!postsLoading && posts.map(post => (
                        <article key={post._id} className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"><Image alt="Artist" className="w-full h-full object-cover" src={post.author?.avatar || "/avatar-placeholder.svg"} width={40} height={40} unoptimized /></div>
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)] text-sm cursor-pointer hover:underline">{post.author?.fullName || "Unknown"}</h4>
                                        <p className="text-xs text-stone-500">{post.author?.title || post.author?.role || ""} • {timeAgo(post.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="relative z-20">
                                    <Button
                                        onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                                        className="text-stone-400 hover:text-[var(--primary-color)]"
                                    >
                                        <span className="material-symbols-outlined">more_horiz</span>
                                    </Button>
                                    {openMenuId === post._id && (
                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 z-20 overflow-hidden text-sm">
                                            <Button onClick={() => handleCopyLink(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50 text-stone-700">
                                                <span className="material-symbols-outlined text-base">link</span>Copy Link
                                            </Button>
                                            <Button onClick={() => handleSavePost(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50 text-stone-700">
                                                <span className="material-symbols-outlined text-base">bookmark</span>Save Post
                                            </Button>
                                            {String(post.author?._id) === String(user?._id) ? (
                                                <Button onClick={() => handleDeletePost(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-500 border-t border-stone-100">
                                                    <span className="material-symbols-outlined text-base">delete</span>Delete Post
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handleReportPost(post._id)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-500 border-t border-stone-100">
                                                    <span className="material-symbols-outlined text-base">flag</span>Report Post
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-4 pb-3">
                                <p className="text-[var(--text-secondary)] text-sm mb-2">{post.text || post.content} {post.hashtags && <span className="text-[var(--secondary-color)]">{post.hashtags}</span>}</p>
                            </div>
                            {post.media?.some(m => m.type === 'video') && (
                                <div className="px-4 pb-4 ">
                                    <VideoPlayer src={post.media.find(m => m.type === 'video').url} />
                                </div>
                            )}
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
                                            {!single && (
                                                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {idx + 1} / {images.length}
                                                </span>
                                            )}
                                        </div>
                                        {!single && (
                                            <>
                                                <Button
                                                    onClick={() => carouselPrev(post._id, images.length)}
                                                    className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                                </Button>
                                                <Button
                                                    onClick={() => carouselNext(post._id, images.length)}
                                                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                </Button>
                                                <div className="flex justify-center gap-1.5 mt-2">
                                                    {images.map((_, i) => (
                                                        <Button
                                                            key={i}
                                                            onClick={() => setCarouselIndex(prev => ({ ...prev, [post._id]: i }))}
                                                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                                i === idx
                                                                    ? 'bg-[var(--secondary-color)] scale-125'
                                                                    : 'bg-stone-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                            {post.event && (
                                <div className="mx-4 mb-4 bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-[var(--primary-color)] rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                                        <span className="text-xs font-medium uppercase">{post.event.month}</span>
                                        <span className="text-2xl font-bold">{post.event.date}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-[var(--text-primary)]">{post.event.title}</h5>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1"><span className="material-symbols-outlined align-middle text-sm">location_on</span> {post.event.location}</p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5"><span className="material-symbols-outlined align-middle text-sm">schedule</span> {post.event.time}</p>
                                    </div>
                                    <Button onClick={() => router.push(post.event._id ? `/opportunities?event=${post.event._id}` : '/opportunities')} className="bg-white border border-[var(--primary-color)] text-[var(--primary-color)] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[var(--primary-color)] hover:text-white transition-colors">Details</Button>
                                </div>
                            )}
                            <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <Button onClick={() => toggleLike(post._id)} className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${post.isLiked ? "text-red-500" : "text-stone-600 hover:text-red-500"}`}><span className={`material-symbols-outlined${post.isLiked ? " filled" : ""}`}>favorite</span><span className="text-sm font-medium">{(post.likeCount ?? 0).toLocaleString()}</span></Button>
                                    <Button onClick={() => toggleComments(post._id)} className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${expandedComments.has(post._id) ? "text-[var(--secondary-color)]" : "text-stone-600 hover:text-[var(--secondary-color)]"}`}><span className="material-symbols-outlined">chat_bubble</span><span className="text-sm font-medium">{commentsMap[post._id]?.length ?? post.commentCount ?? 0}</span></Button>
                                    <Button onClick={() => sharePost(post._id)} className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${sharedPosts.has(post._id) ? "text-green-600" : "text-stone-600 hover:text-[var(--secondary-color)]"}`}><span className="material-symbols-outlined">share</span>{sharedPosts.has(post._id) && <span className="text-xs">Shared!</span>}</Button>
                                </div>
                                <div className="flex gap-2">
                                    {post.showBuy && (
                                        <Button onClick={() => router.push('/marketplace')} className="flex items-center gap-1.5 bg-orange-50 text-[var(--primary-color)] px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-100 transition-colors border border-orange-200">
                                            <span className="material-symbols-outlined text-lg">shopping_bag</span> Buy
                                        </Button>
                                    )}
                                    <Button onClick={() => router.push('/crowdfunding')} className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-100 transition-colors border border-green-200">
                                        <span className="material-symbols-outlined text-lg filled">volunteer_activism</span> Support
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
                                    {(commentsMap[post._id] || []).length === 0 && (
                                        <p className="text-xs text-stone-400">No comments yet. Be the first!</p>
                                    )}
                                    <div className="flex gap-2 items-center">
                                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                                            <Image src={user?.avatar || "/avatar-placeholder.svg"} alt="" className="w-full h-full object-cover" width={28} height={28} unoptimized />
                                        </div>
                                        <input
                                            className="flex-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 text-xs focus:ring-1 focus:ring-[var(--secondary-color)]"
                                            placeholder="Add a comment..."
                                            value={commentInputs[post._id] || ""}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                            onKeyDown={(e) => e.key === "Enter" && submitComment(post._id)}
                                        />
                                        <Button
                                            onClick={() => submitComment(post._id)}
                                            disabled={submittingComment[post._id] || !commentInputs[post._id]?.trim()}
                                            className="text-[var(--primary-color)] disabled:opacity-40"
                                        >
                                            <span className="material-symbols-outlined text-xl">send</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </main>


                {/* right sidebar */}
                <aside className="hidden lg:block space-y-6">
                    <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-orange-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[var(--text-primary)] text-md serif-font">Trending Opportunities</h3>
                            <a className="text-xs text-[var(--secondary-color)] font-semibold hover:underline" href="/opportunities">View All</a>
                        </div>
                        <div className="space-y-4">
                            {opportunities.map((opp, i) => (
                                <div key={opp._id || i} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                                    <p className={`text-xs font-bold mb-1 uppercase tracking-wide ${opp.type === "Event" ? "text-blue-600" : opp.type === "Exhibition" ? "text-purple-600" : "text-green-600"}`}>{opp.type || "Open Call"}</p>
                                    <h4 className="font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--secondary-color)] cursor-pointer">{opp.title}</h4>
                                    <p className="text-xs text-stone-500 mt-1">{opp.organization || opp.org} • {opp.deadline ? new Date(opp.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded-full">{opp.compensation || opp.tag || "Open"}</span>
                                        <Button onClick={() => applyToOpportunity(opp)} className="text-xs text-[var(--primary-color)] font-medium hover:underline">Apply</Button>
                                    </div>
                                </div>
                            ))}
                            {opportunities.length === 0 && <p className="text-xs text-stone-400 text-center py-2">No opportunities yet</p>}
                        </div>
                    </div>

                    <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-orange-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[var(--text-primary)] text-md serif-font">Top Funded</h3>
                            <a className="text-xs text-[var(--secondary-color)] font-semibold hover:underline" href="/crowdfunding">See All</a>
                        </div>
                        <div className="space-y-4">
                            {campaigns.map((c, i) => {
                                const percent = c.goalAmount ? Math.round(((c.raisedAmount || c.currentAmount || 0) / c.goalAmount) * 100) : 0;
                                const raised = c.raisedAmount || c.currentAmount || 0;
                                return (
                                    <div key={c._id || i} className="flex gap-3 items-start">
                                        <Image className="w-12 h-12 rounded-lg object-cover bg-stone-200" src={c.img || c.image || c.coverImage || "/placeholder.png"} alt={c.title} width={48} height={48} unoptimized />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-tight">{c.title}</h4>
                                            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-stone-500">₹{(raised / 1000).toFixed(0)}k raised</span>
                                                <span className="text-[10px] font-bold text-green-600">{percent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {campaigns.length === 0 && <p className="text-xs text-stone-400 text-center py-2">No campaigns yet</p>}
                        </div>
                        <Button onClick={() => router.push('/crowdfunding/create')} className="w-full mt-4 border border-[var(--primary-color)] text-[var(--primary-color)] text-xs font-semibold py-2 rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors">
                            Start a Campaign
                        </Button>
                    </div>

                    <div className="text-[10px] text-stone-400 flex flex-wrap gap-x-3 gap-y-1 px-2">
                        <a className="hover:underline" href="#">About</a>
                        <a className="hover:underline" href="#">Privacy</a>
                        <a className="hover:underline" href="#">Terms</a>
                        <a className="hover:underline" href="#">Careers</a>
                        <a className="hover:underline" href="#">Help</a>
                        <span>© 2026 KalaSetu</span>
                    </div>
                </aside>
            </div>
        </AppShell>
    );
}
