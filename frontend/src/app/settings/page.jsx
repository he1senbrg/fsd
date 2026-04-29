"use client";
import AppShell from "@/components/AppShell";
import { Button, Loader } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useArtForms } from "@/context/ArtFormContext";
import { userAPI } from "@/lib/api";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const tabs = [
    { id: "profile", icon: "person", label: "Profile" },
    { id: "account", icon: "lock", label: "Account & Security" },
    { id: "notifications", icon: "notifications", label: "Notifications" },
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
    const { artForms, addArtForm } = useArtForms();
    const [customArtForm, setCustomArtForm] = useState("");

    const handlePricingChange = (index, field, value) => {
        const newPricing = [...(formData.pricing || [])];
        newPricing[index] = { ...newPricing[index], [field]: field === 'price' ? Number(value) : value };
        setFormData(prev => ({ ...prev, pricing: newPricing }));
    };
    const addPricing = () => setFormData(prev => ({ ...prev, pricing: [...(formData.pricing || []), { service: "", price: 0 }] }));
    const removePricing = (index) => setFormData(prev => ({ ...prev, pricing: (formData.pricing || []).filter((_, i) => i !== index) }));

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function load() {
            try {
                const res = await userAPI.getSettings();
                const raw = res.data?.user || res.data?.settings || res.data || {};
                const data = raw.fullName !== undefined ? raw : (raw.user || raw);
                const mutated = { ...data };
                if (!mutated.socialLinks) mutated.socialLinks = { website: '', instagram: '', facebook: '', youtube: '' };
                if (!mutated.notificationPrefs) mutated.notificationPrefs = { messages: true, eventReminders: true, orderUpdates: true, newFollowers: false, promotions: false };
                if (!mutated.privacySettings) mutated.privacySettings = { profileVisibility: "Public", showOnline: true, showLocation: true };
                if (!mutated.payoutDetails) mutated.payoutDetails = { bankName: '', accountNumber: '', ifscCode: '', upiId: '' };
                if (!mutated.pricing) mutated.pricing = [];
                if (!mutated.specializations) mutated.specializations = [];
                if (!mutated.languages) mutated.languages = [];
                
                if (!cancelled) {
                    setSettings(mutated);
                    setFormData(mutated);
                }
            } catch (e) {
                if (e?.status !== 401) console.error(e);
                if (!cancelled && authUser) {
                    const fallback = {
                        ...authUser,
                        socialLinks: authUser.socialLinks || { website: '', instagram: '', facebook: '', youtube: '' },
                        notificationPrefs: authUser.notificationPrefs || { messages: true, eventReminders: true, orderUpdates: true, newFollowers: false, promotions: false },
                        privacySettings: authUser.privacySettings || { profileVisibility: "Public", showOnline: true, showLocation: true },
                        payoutDetails: authUser.payoutDetails || { bankName: '', accountNumber: '', ifscCode: '', upiId: '' },
                        pricing: authUser.pricing || [],
                        specializations: authUser.specializations || [],
                        languages: authUser.languages || [],
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
        const val = type === 'checkbox' ? checked : value;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent] || {}),
                    [child]: val
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: val
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (activeTab === "profile") {
                const payload = { ...formData };
                // check if arrays are arrays
                if (typeof payload.specializations === 'string') payload.specializations = payload.specializations.split(',').map(s => s.trim()).filter(Boolean);
                if (typeof payload.languages === 'string') payload.languages = payload.languages.split(',').map(s => s.trim()).filter(Boolean);

                const res = await userAPI.updateProfile(payload);
                const updated = res.data?.user || res.data || payload;
                updateUser(updated);
                setSettings(prev => ({ ...prev, ...updated }));
                showToast("Profile updated successfully!", "success");
            } else if (activeTab === "notifications") {
                await userAPI.updateNotifications(formData.notificationPrefs);
                showToast("Notification preferences updated!", "success");
            } else if (activeTab === "billing") {
                await userAPI.updatePayout(formData.payoutDetails);
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
                            <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start sm:items-center">
                                <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-[var(--accent-color)] relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
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
                                <div className="flex flex-col gap-2 flex-1">
                                    <div>
                                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        <Button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} className="text-sm text-[var(--secondary-color)] font-semibold hover:underline disabled:opacity-50">
                                            {avatarUploading ? 'Uploading...' : 'Change Photo'}
                                        </Button>
                                        <p className="text-xs text-stone-400 mt-1">JPG, PNG, max 2MB</p>
                                    </div>
                                    <div className="w-full">
                                        <label className="text-sm font-medium text-stone-600 mb-1 block">Cover Image (URL)</label>
                                        <input name="coverImage" value={formData.coverImage ?? u.coverImage ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" placeholder="https://example.com/cover.jpg" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Full Name</label><input name="fullName" value={formData.fullName ?? u.fullName ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Title / Headline</label><input name="title" value={formData.title ?? u.title ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" placeholder="e.g. Kathak Dancer & Choreographer" /></div>
                                <div>
                                    <label className="text-sm font-medium text-stone-600 mb-1 block">Account Role</label>
                                    <select name="role" value={formData.role || u.role || "artist"} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]">
                                        <option value="artist">Artist</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="user">User / Patron</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-stone-600 mb-2 block">Verified Status</label>
                                    <div className="flex items-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="verified" checked={formData.verified !== undefined ? formData.verified : (u.verified || u.isVerified || false)} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                        <span className="ml-3 text-sm font-bold text-stone-600">
                                            {(formData.verified !== undefined ? formData.verified : (u.verified || u.isVerified)) ? "Verified" : "Unverified"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Bio</label><textarea name="bio" value={formData.bio ?? u.bio ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] resize-none" rows={3} /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Location</label><input name="location" value={formData.location ?? u.location ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                                <div>
                                    <label className="text-sm font-medium text-stone-600 mb-1 block">Primary Art Form</label>
                                    <select name="primaryArtForm" value={formData.primaryArtForm || u.primaryArtForm || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] mb-2">
                                        <option value="">Select Art Form...</option>
                                        {artForms.map(af => (
                                            <option key={af} value={af}>{af}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Add custom art form" value={customArtForm} onChange={e => setCustomArtForm(e.target.value)} className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" />
                                        <Button type="button" onClick={() => { addArtForm(customArtForm); setFormData(prev => ({...prev, primaryArtForm: customArtForm})); setCustomArtForm(""); }} className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-200">Add</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Specializations (comma separated)</label><input name="specializations" value={formData.specializations?.join(', ') || ""} onChange={e => setFormData(prev => ({...prev, specializations: e.target.value.split(',').map(s => s.trimStart())}))} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                                <div><label className="text-sm font-medium text-stone-600 mb-1 block">Languages (comma separated)</label><input name="languages" value={formData.languages?.join(', ') || ""} onChange={e => setFormData(prev => ({...prev, languages: e.target.value.split(',').map(s => s.trimStart())}))} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" /></div>
                            </div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Education</label><input name="education" value={formData.education ?? u.education ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]" placeholder="Your educational background" /></div>
                            
                            <div>
                                <label className="text-sm font-medium text-stone-600 mb-2 block">Pricing / Services</label>
                                {(formData.pricing || []).map((p, i) => (
                                    <div key={i} className="flex gap-2 mb-2 items-center">
                                        <input type="text" placeholder="Service (e.g. 1hr Session)" value={p.service || ""} onChange={e => handlePricingChange(i, 'service', e.target.value)} className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
                                        <input type="number" placeholder="Price" value={p.price || ""} onChange={e => handlePricingChange(i, 'price', e.target.value)} className="w-32 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
                                        <Button type="button" onClick={() => removePricing(i)} className="text-red-500"><span className="material-symbols-outlined text-lg">delete</span></Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addPricing} className="text-[var(--secondary-color)] text-sm font-semibold flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-base">add</span> Add Service</Button>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-stone-600 mb-2 block">Social Links</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input name="socialLinks.website" value={formData.socialLinks?.website || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" placeholder="Website URL" />
                                    <input name="socialLinks.instagram" value={formData.socialLinks?.instagram || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" placeholder="Instagram URL" />
                                    <input name="socialLinks.facebook" value={formData.socialLinks?.facebook || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" placeholder="Facebook URL" />
                                    <input name="socialLinks.youtube" value={formData.socialLinks?.youtube || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" placeholder="YouTube URL" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                                <Button className="px-5 py-2 text-sm text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50">Cancel</Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Changes"}</Button>
                            </div>
                        </div>
                    )}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Account & Security</h2>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Email</label><input name="email" value={formData.email ?? u.email ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" type="email" /></div>
                            <div><label className="text-sm font-medium text-stone-600 mb-1 block">Phone</label><input name="phone" value={formData.phone ?? u.phone ?? ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" type="tel" /></div>
                            <div className="flex justify-end gap-3 pt-2 pb-4">
                                <Button variant="primary" onClick={async (e) => {
                                    e.preventDefault();
                                    setSaving(true);
                                    try {
                                        const res = await userAPI.updateProfile({ email: formData.email, phone: formData.phone });
                                        updateUser(res.data?.user || res.data);
                                        showToast("Account details updated!", "success");
                                    } catch (err) { showToast("Failed to update account details.", "error"); }
                                    setSaving(false);
                                }} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Details"}</Button>
                            </div>
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
                                { id: "eventReminders", label: "Event reminders", desc: "Reminders for upcoming events you've booked", default: true },
                                { id: "orderUpdates", label: "Order updates", desc: "Track your purchases and bookings", default: true },
                                { id: "newFollowers", label: "New followers", desc: "When someone follows your profile", default: false },
                            ].map((pref) => (
                                <div key={pref.id} className="flex items-center justify-between py-3 border-b border-stone-50">
                                    <div>
                                        <h4 className="font-medium text-[var(--text-primary)] text-sm">{pref.label}</h4>
                                        <p className="text-xs text-stone-500">{pref.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name={`notificationPrefs.${pref.id}`} checked={formData.notificationPrefs?.[pref.id] !== undefined ? formData.notificationPrefs[pref.id] : pref.default} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[var(--primary-color)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    </label>
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm shadow-md">{saving ? "Saving..." : "Save Preferences"}</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "billing" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 serif-font">Billing & Payments</h2>
                            <div className="bg-stone-50 rounded-lg p-5">
                                <h4 className="font-medium text-[var(--text-primary)] mb-3">Payout Details (for sellers)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">Bank Name</label><input name="payoutDetails.bankName" value={formData.payoutDetails?.bankName || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="State Bank of India" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">Account Number</label><input name="payoutDetails.accountNumber" value={formData.payoutDetails?.accountNumber || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="XXXX-XXXX-XXXX" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">IFSC Code</label><input name="payoutDetails.ifscCode" value={formData.payoutDetails?.ifscCode || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="SBIN0XXXXXX" /></div>
                                    <div><label className="text-sm font-medium text-stone-600 mb-1 block">UPI ID</label><input name="payoutDetails.upiId" value={formData.payoutDetails?.upiId || ""} onChange={handleChange} className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm" placeholder="name@upi" /></div>
                                </div>
                                <Button variant="primary" onClick={handleSave} disabled={saving} className="text-sm mt-4 shadow-md">{saving ? "Saving..." : "Save Payout Details"}</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
