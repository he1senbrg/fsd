"use client";
import AppShell from "@/components/AppShell";
import { Button, FormInput, FormSelect, FormStepper, FormTextarea, SurfaceCard } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { eventAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventCreatePage() {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("performance");
    const [artForm, setArtForm] = useState("Classical Music");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [venue, setVenue] = useState("");
    const [publishing, setPublishing] = useState(false);
    const showToast = useToast();
    const router = useRouter();
    return (
        <AppShell>
            <div className="py-2">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">Create an Event</h1>
                <p className="text-[var(--text-secondary)] mb-8">Set up your performance, workshop, or exhibition in a few steps.</p>

                <FormStepper
                    currentStep={step}
                    steps={["Event Details", "Tickets & Pricing", "Preview & Publish"]}
                />

                <SurfaceCard className="p-4 sm:p-6 md:p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Event Title *</label>
                                <FormInput value={title} onChange={(e) => setTitle(e.target.value)} className="focus:border-transparent" placeholder="e.g., Evening of Ragas" type="text" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Category *</label>
                                    <FormSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="performance">Performance</option><option value="workshop">Workshop</option><option value="exhibition">Exhibition</option><option value="festival">Festival</option><option value="competition">Competition</option>
                                    </FormSelect>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Art Form *</label>
                                    <FormSelect value={artForm} onChange={(e) => setArtForm(e.target.value)}>
                                        <option value="Classical Music">Classical Music</option><option value="Folk Dance">Folk Dance</option><option value="Painting">Painting</option><option value="Pottery">Pottery</option><option value="Theatre">Theatre</option>
                                    </FormSelect>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Description *</label>
                                <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Tell attendees what to expect..." />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Date *</label>
                                    <FormInput value={date} onChange={(e) => setDate(e.target.value)} type="date" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Time *</label>
                                    <FormInput value={time} onChange={(e) => setTime(e.target.value)} type="time" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Venue / Location *</label>
                                <FormInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue name, Address, City" type="text" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">Cover Image</label>
                                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-4xl text-stone-400 mb-2 block">image</span>
                                    <p className="text-sm text-stone-500">Upload event banner</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Event Type *</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" className="text-[var(--primary-color)]" defaultChecked /><span>Paid</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" className="text-[var(--primary-color)]" /><span>Free</span></label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" className="text-[var(--primary-color)]" /><span>Invite Only</span></label>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Ticket Tiers</label>
                                {["General", "VIP"].map((tier, i) => (
                                    <div key={i} className="bg-stone-50 rounded-lg p-4 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" defaultValue={tier} placeholder="Tier Name" type="text" />
                                        <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Price (₹)" type="number" />
                                        <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Qty Available" type="number" />
                                    </div>
                                ))}
                                <Button className="text-[var(--secondary-color)] font-medium text-sm flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-sm">add</span> Add Ticket Tier</Button>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Max Attendees</label>
                                <FormInput placeholder="e.g., 200" type="number" />
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-stone-50 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block">check_circle</span>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">Event Ready to Publish!</h3>
                                <p className="text-[var(--text-secondary)] text-sm mb-4">Your event will be visible on KalaSetu and open for bookings once published.</p>
                                <div className="bg-white rounded-lg border p-4 text-left space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-stone-500">Title:</span><span className="font-medium">Evening of Ragas (Preview)</span></div>
                                    <div className="flex justify-between"><span className="text-stone-500">Category:</span><span className="font-medium">Performance</span></div>
                                    <div className="flex justify-between"><span className="text-stone-500">Date:</span><span className="font-medium">TBD</span></div>
                                    <div className="flex justify-between"><span className="text-stone-500">Venue:</span><span className="font-medium">TBD</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
                        <Button onClick={() => setStep(Math.max(1, step - 1))} className={`px-6 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-600 hover:bg-stone-50 ${step === 1 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={step === 1}>Back</Button>
                        {step < 3 ? (
                            <Button onClick={() => setStep(step + 1)} className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md">Next Step</Button>
                        ) : (
                            <Button onClick={async () => {
                                if (!title.trim()) { showToast('Please enter an event title.', 'warning'); return; }
                                if (!date) { showToast('Please enter a date.', 'warning'); return; }
                                if (!time) { showToast('Please enter a time.', 'warning'); return; }
                                setPublishing(true);
                                try {
                                    const startDate = new Date(`${date}T${time}:00`).toISOString();
                                    const payload = {
                                        title: title.trim(),
                                        category,
                                        artForm,
                                        description,
                                        startDate,
                                        time,
                                        venue,
                                    };
                                    console.log('Publishing event with payload:', payload);
                                    const response = await eventAPI.createEvent(payload);
                                    console.log('Event created response:', response);
                                    showToast('Event created successfully!', 'success');
                                    router.push('/opportunities?refresh=true');
                                } catch (err) {
                                    console.error('Event creation error:', err);
                                    showToast(err?.data?.message || err?.message || 'Failed to create event.', 'error');
                                } finally { setPublishing(false); }
                            }} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md flex items-center gap-2" disabled={publishing}>
                                <span className="material-symbols-outlined text-sm">publish</span>{publishing ? 'Publishing...' : 'Publish Event'}
                            </Button>
                        )}
                    </div>
                </SurfaceCard>
            </div>
        </AppShell>
    );
}
