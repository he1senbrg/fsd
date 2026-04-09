"use client";
import AppShell from "@/components/AppShell";
import { useState } from "react";
import { Button } from "@/components/ui";

const faqs = [
    { q: "How do I create a seller profile?", a: "Navigate to Settings > Profile and toggle 'Enable Seller Mode'. You can then add products through your Shop tab." },
    { q: "How does crowdfunding work?", a: "Artists can create campaigns with funding goals. Backers contribute any amount. If the goal is met within the deadline, funds are released. Otherwise, backers are refunded." },
    { q: "How do I book an artist for my event?", a: "Browse the Discover page, find an artist, and click 'Book Now'. You can also message them directly to discuss details." },
    { q: "What payment methods are supported?", a: "We support UPI, net banking, credit/debit cards, and international payments via Stripe." },
    { q: "How do I get verified?", a: "Complete your profile with portfolio, get at least 5 reviews, and apply through Settings > Verification. Our team reviews within 48 hours." },
    { q: "What are the marketplace fees?", a: "KalaSetu charges a 5% commission on marketplace sales to cover payment processing and platform maintenance." },
];

const categories = [
    { icon: "person", label: "Profile & Account", desc: "Settings, verification, billing" },
    { icon: "storefront", label: "Marketplace", desc: "Selling, shipping, orders" },
    { icon: "event", label: "Events & Bookings", desc: "Creating, managing events" },
    { icon: "savings", label: "Crowdfunding", desc: "Campaigns, payouts, tiers" },
    { icon: "shield", label: "Safety & Privacy", desc: "Reporting, data, privacy" },
    { icon: "devices", label: "Technical Issues", desc: "Bugs, app, browser support" },
];

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState(0);

    return (
        <AppShell>
            <div className="py-2">
                {/* header */}
                <div className="text-center mb-12">
                    <span className="material-symbols-outlined text-5xl text-[var(--secondary-color)] mb-3 block">help</span>
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] font-display mb-3">Help Center & Support</h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">Find answers, get help, and reach our support team.</p>
                </div>

                {/* search */}
                <div className="relative max-w-2xl mx-auto mb-12">
                    <span className="material-symbols-outlined absolute left-4 top-4 text-stone-400">search</span>
                    <input className="w-full bg-white border border-orange-200 rounded-xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-[var(--secondary-color)] shadow-sm" placeholder="Search for help..." type="text" />
                </div>

                {/* help */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                    {categories.map((cat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-orange-100 p-5 cursor-pointer hover:shadow-md hover:border-[var(--primary-color)] transition-all hover:-translate-y-1 text-center">
                            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3 text-[var(--secondary-color)]">
                                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">{cat.label}</h3>
                            <p className="text-xs text-stone-500">{cat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-display text-center">Frequently Asked Questions</h2>
                    <div className="space-y-3 max-w-3xl mx-auto">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white border border-orange-100 rounded-xl overflow-hidden">
                                <Button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                                    <span className="font-semibold text-[var(--text-primary)]">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-stone-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>expand_more</span>
                                </Button>
                                {openFaq === i && (
                                    <div className="px-6 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-stone-50 pt-3 animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* contact */}
                <section className="bg-gradient-to-r from-[var(--deep-teal)] to-[var(--primary-color)] rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute -top-8 -left-8 w-28 h-28 bg-white/10 rounded-full"></div>
                    <h2 className="text-2xl font-bold mb-3 font-display relative z-10">Still need help?</h2>
                    <p className="text-white/80 mb-6 relative z-10">Our support team is available 24/7 to assist you.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-4 relative z-10">
                        <Button className="bg-white text-[var(--deep-teal)] px-6 py-3 rounded-lg font-bold hover:bg-[var(--cream)] transition-colors flex items-center justify-center gap-2 shadow-lg">
                            <span className="material-symbols-outlined">chat</span>Start Live Chat
                        </Button>
                        <Button className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/30">
                            <span className="material-symbols-outlined">mail</span>Email Support
                        </Button>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
