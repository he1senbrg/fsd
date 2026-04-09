"use client";
import AppShell from "@/components/AppShell";
import { Button, FormInput, FormSelect, FormStepper, FormTextarea, SurfaceCard } from "@/components/ui";
import { useState } from "react";

export default function CreateCampaignPage() {
    const [step, setStep] = useState(1);

    return (
        <AppShell>
            <div className="py-2">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">Create a Campaign</h1>
                <p className="text-[var(--text-secondary)] mb-8">Launch your crowdfunding campaign and let the community support your art.</p>

                <FormStepper
                    currentStep={step}
                    steps={["Project Info", "Story & Media", "Rewards & Goal"]}
                />

                <SurfaceCard className="p-4 sm:p-6 md:p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Campaign Title *</label>
                                <FormInput className="focus:border-transparent" placeholder="Give your project a catchy title" type="text" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Category *</label>
                                <FormSelect>
                                    <option>Visual Arts</option>
                                    <option>Performing Arts</option>
                                    <option>Textiles & Weaving</option>
                                    <option>Heritage & Restoration</option>
                                    <option>Music</option>
                                    <option>Education & Workshop</option>
                                </FormSelect>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Short Description *</label>
                                <FormTextarea placeholder="Describe your campaign in 1-2 sentences..." rows={3} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Location</label>
                                <FormInput placeholder="City, State, India" type="text" />
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Full Story *</label>
                                <FormTextarea placeholder="Tell backers why this project matters..." rows={8} />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">Cover Image *</label>
                                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-4xl text-stone-400 mb-2 block">cloud_upload</span>
                                    <p className="text-sm text-stone-500">Drag & drop or click to upload</p>
                                    <p className="text-xs text-stone-400 mt-1">JPEG, PNG up to 5MB</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-[var(--text-primary)] mb-2 block">Video (Optional)</label>
                                <FormInput placeholder="YouTube or Vimeo URL" type="url" />
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Funding Goal (₹) *</label>
                                    <FormInput placeholder="100000" type="number" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1 block">Campaign Duration *</label>
                                    <FormSelect>
                                        <option>15 days</option>
                                        <option>30 days</option>
                                        <option>45 days</option>
                                        <option>60 days</option>
                                    </FormSelect>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Reward Tiers</h3>
                                {[1, 2].map(j => (
                                    <div key={j} className="bg-stone-50 rounded-lg p-4 mb-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Tier Name" type="text" />
                                            <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Amount (₹)" type="number" />
                                            <input className="border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Perks" type="text" />
                                        </div>
                                    </div>
                                ))}
                                <Button className="text-[var(--secondary-color)] font-medium text-sm flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-sm">add</span> Add Tier</Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
                        <Button onClick={() => setStep(Math.max(1, step - 1))} className={`px-6 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors ${step === 1 ? "opacity-50 cursor-not-allowed" : ""}`} disabled={step === 1}>
                            Back
                        </Button>
                        <div className="flex gap-3">
                            <Button className="px-6 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-700 transition-colors">Save Draft</Button>
                            {step < 3 ? (
                                <Button onClick={() => setStep(step + 1)} className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-md">
                                    Next Step
                                </Button>
                            ) : (
                                <Button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md">
                                    Publish Campaign
                                </Button>
                            )}
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </AppShell>
    );
}
