"use client";
import AppShell from "@/components/AppShell";
import { Button, Loader } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { userAPI } from "@/lib/api";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const tabs = [
    { id: "profile", icon: "person", label: "Profile" },
    { id: "account", icon: "lock", label: "Account & Security" },
    { id: "notifications", icon: "notifications", label: "Notifications" },
    { id: "privacy", icon: "shield", label: "Privacy" },
    { id: "billing", icon: "payments", label: "Billing" },
];

export default function SettingsPage() {
    const { user: authUser, updateUser } = useAuth();
    const showToast = useToast();
    const [activeTab, setActiveTab] = useState("profile");
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
    const [pwSaving, setPwSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef(null);

    const [formData, setFormData] = useState({});

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function load() {
            try {
                const res = await userAPI.getSettings();
                const raw = res.data?.user || res.data?.settings || res.data || {};
                const data = raw.fullName !== undefined ? raw : (raw.user || raw);
                const mutated = { ...data };
                if (mutated.fullName && !mutated.firstName) {
                    const parts = mutated.fullName.split(" ");
                    mutated.firstName = parts[0] || "";
                    mutated.lastName = parts.slice(1).join(" ") || "";
                }
                if (!cancelled) {
                    setSettings(mutated);
                    setFormData(mutated);
                }
            } catch (e) {
                if (e?.status !== 401) console.error(e);
                if (!cancelled && authUser) {
                    const parts = (authUser.fullName || "").split(" ");
                    const fallback = {
                        ...authUser,
                        firstName: parts[0] || "",
                        lastName: parts.slice(1).join(" ") || "",
                    };
                    setSettings(fallback);
                    setFormData(fallback);
                }
            }
            if (!cancelled) setLoading(false);
        }
        load();
        return () => { cancelled = true; };
    // refetch when changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser?._id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (activeTab === "profile") {
                const payload = { ...formData };
                if (payload.firstName !== undefined || payload.lastName !== undefined) {
                    payload.fullName = `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim();
                }
                if (payload.artForm !== undefined) {
                    payload.primaryArtForm = payload.artForm;
                }
                const res = await userAPI.updateProfile(payload);
                // sync the updated user into AuthContext
                const updated = res.data?.user || res.data || payload;
                updateUser(updated);
                setSettings(prev => ({ ...prev, ...updated }));
                showToast("Profile updated successfully!", "success");
            } else if (activeTab === "notifications") {
                await userAPI.updateNotifications(formData);
                showToast("Notification preferences updated!", "success");
            } else if (activeTab === "privacy") {
                await userAPI.updatePrivacy(formData);
                showToast("Privacy settings updated!", "success");
            } else if (activeTab === "billing") {
                await userAPI.updatePayout(formData);
                showToast("Payout details updated!", "success");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to update settings.", "error");
        }
        setSaving(false);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const form = new FormData();
            form.append('avatar', file);
            const res = await userAPI.updateAvatar(form);
            const updated = res.data?.user || res.data;
            updateUser(updated);
            setSettings(prev => ({ ...prev, avatar: updated.avatar }));
            showToast('Profile photo updated!', 'success');
        } catch (err) {
            console.error(err);
            showToast(err?.message || 'Failed to upload photo.', 'error');
        }
        setAvatarUploading(false);
        e.target.value = '';
    };

    const handlePasswordSave = async () => {
        if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
            showToast("Please fill in all password fields.", "warning");
            return;
        }
        if (pwForm.newPw !== pwForm.confirm) {
            showToast("New passwords do not match.", "error");
            return;
        }
        if (pwForm.newPw.length < 8) {
            showToast("Password must be at least 8 characters.", "warning");
            return;
        }
        setPwSaving(true);
        try {
            await userAPI.updatePassword(pwForm.current, pwForm.newPw);
            showToast("Password updated successfully!", "success");
            setPwForm({ current: "", newPw: "", confirm: "" });
        } catch (error) {
            console.error(error);
            showToast(error?.message || "Failed to update password.", "error");
        }
        setPwSaving(false);
    };

    if (loading) {
        return (
            <AppShell>
                <Loader />
            </AppShell>
        );
    }

    // default user data if settings empty
    const u = settings || authUser || {};
    const firstName = u.firstName || (u.fullName ? u.fullName.split(" ")[0] : "");
    const lastName = u.lastName || (u.fullName?.includes(" ") ? u.fullName.split(" ").slice(1).join(" ") : "");

    return (
        <AppShell>
            <div className="flex flex-col md:flex-row gap-8 py-2">
                {/* sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-display">Settings</h1>
                    <nav className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                        {tabs.map(tab => (
                            <Button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors text-left ${activeTab === tab.id ? "bg-orange-50 text-[var(--primary-color)] border-l-4 border-[var(--primary-color)]" : "text-stone-600 hover:bg-stone-50"}`}>
                                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                {tab.label}
                            </Button>
                        ))}
                    </nav>
                </aside>

                {/* content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-orange-100 p-4 sm:p-6 md:p-8">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Edit Profile</h2>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--accent-color)] relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                    <Image
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        src={settings?.avatar || u.avatar || "/avatar-placeholder.svg"}
                                        width={80}
                                        height={80}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {avatarUploading
                                            ? <span className="material-symbols-outlined text-white text-xl animate-spin">progress_activity</span>
                                            : <span className="material-symbols-outlined text-white text-xl">photo_camera</span>}
                                    </div>
                                </div>
                                <div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    <Button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} className="text-sm text-[var(--secondary-color)] font-semibold hover:underline disabled:opacity-50">
                                        {avatarUploading ? 'Uploading...' : 'Change Photo'}
                                    </Button>
                                    <p className="text-xs text-stone-400 mt-1">JPG, PNG, max 2MB</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">First Name</label><input name="firstName" value={formData.firstName ?? firstName} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Last Name</label><input name="lastName" value={formData.lastName ?? lastName} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                            </div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Bio</label><textarea name="bio" value={formData.bio ?? u.bio ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] resize-none" rows={3} /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Location</label><input name="location" value={formData.location ?? u.location ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Art Form</label><select name="artForm" value={formData.artForm || u.primaryArtForm || "Kathak"} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"><option>Kathak</option><option>Bharatanatyam</option><option>Classical Music</option></select></div>
                            </div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Website / Portfolio</label><input name="website" value={formData.website || u.website || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" placeholder="https://your-website.com" /></div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                                <Button className="px-5 py-2 text-sm text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50">Cancel</Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Changes"}</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Account & Security</h2>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Email</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" defaultValue={u.email || ""} type="email" /></div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Phone</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" defaultValue={u.phone || ""} type="tel" /></div>
                            <hr className="border-stone-100" />
                            <h3 className="font-bold text-[var(--text-primary)]">Change Password</h3>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Current Password</label><input value={pwForm.current} onChange={(e) => setPwForm(prev => ({ ...prev, current: e.target.value }))} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" type="password" placeholder="Enter current password" /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">New Password</label><input value={pwForm.newPw} onChange={(e) => setPwForm(prev => ({ ...prev, newPw: e.target.value }))} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" type="password" placeholder="Min. 8 characters" /></div>
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Confirm Password</label><input value={pwForm.confirm} onChange={(e) => setPwForm(prev => ({ ...prev, confirm: e.target.value }))} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" type="password" placeholder="Re-enter new password" /></div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                                <Button variant="primary" onClick={handlePasswordSave} disabled={pwSaving} className="text-sm shadow-md disabled:opacity-60">{pwSaving ? "Updating..." : "Update Password"}</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Notification Preferences</h2>
                            {[
                                { id: "notifyMessages", label: "New messages", desc: "Get notified when someone sends you a message", default: true },
                                { id: "notifyEvents", label: "Event reminders", desc: "Reminders for upcoming events you've booked", default: true },
                                { id: "notifyOrders", label: "Order updates", desc: "Track your purchases and bookings", default: true },
                                { id: "notifyFollowers", label: "New followers", desc: "When someone follows your profile", default: false },
                                { id: "notifyPromos", label: "Promotional emails", desc: "Offers, featured artists, and newsletters", default: false },
                            ].map((pref) => (
                                <div key={pref.id} className="flex items-center justify-between py-3 border-b border-stone-50">
                                    <div>
                                        <h4 className="font-medium text-[var(--text-primary)] text-sm">{pref.label}</h4>
                                        <p className="text-xs text-stone-500">{pref.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name={pref.id} checked={formData[pref.id] !== undefined ? formData[pref.id] : pref.default} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--primary-color)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </label>
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Preferences"}</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "privacy" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Privacy Settings</h2>
                            <div className="flex items-center justify-between py-3 border-b border-stone-50">
                                <div>
                                    <h4 className="font-medium text-[var(--text-primary)] text-sm">Profile visibility</h4>
                                    <p className="text-xs text-stone-500">Who can see your profile</p>
                                </div>
                                <select name="profileVisibility" value={formData.profileVisibility || "Public"} onChange={handleChange} className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm">
                                    <option>Public</option>
                                    <option>Followers Only</option>
                                    <option>Private</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-stone-50">
                                <div>
                                    <h4 className="font-medium text-[var(--text-primary)] text-sm">Show online status</h4>
                                    <p className="text-xs text-stone-500">Let others see when you&apos;re online</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="showOnlineStatus" checked={formData.showOnlineStatus !== undefined ? formData.showOnlineStatus : true} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--primary-color)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-stone-50">
                                <div>
                                    <h4 className="font-medium text-[var(--text-primary)] text-sm">Show location</h4>
                                    <p className="text-xs text-stone-500">Display your location on your profile</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="showLocation" checked={formData.showLocation !== undefined ? formData.showLocation : true} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[var(--primary-color)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Privacy Settings"}</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "billing" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Billing & Payments</h2>
                            <div className="bg-stone-50 rounded-lg p-5 flex items-center gap-4">
                                <span className="material-symbols-outlined text-3xl text-stone-400">credit_card</span>
                                <div className="flex-1">
                                    <h4 className="font-medium text-[var(--text-primary)]">No payment method added</h4>
                                    <p className="text-xs text-stone-500">Add a payment method to make purchases and receive payouts.</p>
                                </div>
                                <Button variant="primary" className="text-sm">Add Method</Button>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-5">
                                <h4 className="font-medium text-[var(--text-primary)] mb-3">Payout Details (for sellers)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">Bank Name</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="State Bank of India" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">Account Number</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="XXXX-XXXX-XXXX" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">IFSC Code</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="SBIN0XXXXXX" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">UPI ID</label><input className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="name@upi" /></div>
                                </div>
                                <Button variant="primary" className="text-sm mt-4 shadow-md">Save Payout Details</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
