"use client";
import AppShell from "@/components/AppShell";
import { Button, Loader } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { campaignAPI, cartAPI, eventAPI } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// payment form inner component
function PaymentForm() {
    const router = useRouter();
    const showToast = useToast();
    const searchParams = useSearchParams();

    const type = searchParams.get("type") || "cart";
    const itemId = searchParams.get("id") || "";
    const paramAmount = parseFloat(searchParams.get("amount") || "0");
    const paramTitle = searchParams.get("title") || "";
    const tierName = searchParams.get("tier") || "";
    const campaignAmount = parseFloat(searchParams.get("campaignAmount") || "0");

    // cart state (type=cart)
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(type === "cart");

    // payment form state
    const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
    const [cardName, setCardName] = useState("");
    const [expiry, setExpiry] = useState("12/28");
    const [cvv, setCvv] = useState("123");
    const [upiId, setUpiId] = useState("");
    // card | upi | netbanking
    const [paymentMethod, setPaymentMethod] = useState("card");

    // processing state
    const [paying, setPaying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");

    // load cart for checkout
    useEffect(() => {
        if (type !== "cart") return;
        cartAPI.getCart()
            .then(res => setCartItems(res.data?.cart?.items || []))
            .catch(() => { })
            .finally(() => setCartLoading(false));
    }, [type]);

    // totals
    const cartSubtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0
    );
    const cartFee = Math.round(cartSubtotal * 0.05);
    const cartTotal = cartSubtotal + cartFee;

    const displayAmount = type === "cart" ? cartTotal : paramAmount;
    const displayTitle = type === "cart" ? "Cart Checkout" : paramTitle;

    // pay handler
    const handlePay = async () => {
        if (paymentMethod === "card") {
            const cleaned = cardNumber.replace(/\s/g, "");
            if (cleaned.length < 12) { showToast("Please enter a valid card number.", "warning"); return; }
            if (!cardName.trim()) { showToast("Please enter the cardholder name.", "warning"); return; }
            if (!expiry.trim()) { showToast("Please enter the expiry date.", "warning"); return; }
            if (cvv.length < 3) { showToast("Please enter a valid CVV.", "warning"); return; }
        } else if (paymentMethod === "upi") {
            if (!upiId.includes("@")) { showToast("Please enter a valid UPI ID.", "warning"); return; }
        }

        setPaying(true);
        try {
            let result;
            if (type === "cart") {
                result = await cartAPI.checkout();
                setOrderId(result.data?.order?.orderId || result.data?.order?._id || "ORD-STUB");
            } else if (type === "event") {
                result = await eventAPI.bookTicket(itemId, tierName);
                setOrderId(result.data?.order?.orderId || result.data?.order?._id || "TKT-STUB");
            } else if (type === "campaign") {
                result = await campaignAPI.back(itemId, campaignAmount || displayAmount);
                setOrderId(result.data?.contribution?._id || result.data?.order?.orderId || "CONT-STUB");
            }
            setSuccess(true);
            setTimeout(() => router.push("/orders?success=true"), 3500);
        } catch (err) {
            if (err?.status !== 401) console.error(err);
            const msg = err?.data?.message || err?.message || "Payment failed. Please try again.";
            showToast(msg, "error");
        } finally {
            setPaying(false);
        }
    };

    const formatCard = (val) => {
        const digits = val.replace(/\D/g, "").slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    };

    // success screen
    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                    <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] font-display mb-2">Payment Successful!</h2>
                    <p className="text-stone-500 mb-1">
                        {type === "cart" && "Your order has been placed successfully."}
                        {type === "event" && "Your ticket has been booked successfully."}
                        {type === "campaign" && "Thank you for supporting this campaign!"}
                    </p>
                    {orderId && (
                        <p className="text-sm text-stone-400">
                            Reference ID: <span className="font-mono font-bold text-[var(--text-primary)]">{orderId}</span>
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/orders" className="btn-primary px-8 py-3 shadow-md flex items-center gap-2">
                        <span className="material-symbols-outlined">confirmation_number</span>
                        View My Orders
                    </Link>
                    <Link href={type === "event" ? "/opportunities" : type === "campaign" ? "/crowdfunding" : "/marketplace"} className="btn-outline px-6 py-3">
                        Continue Browsing
                    </Link>
                </div>
                <p className="text-xs text-stone-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Redirecting to orders page…
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-2">
            {/* breadcrumb nav */}
            <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1">
                <Link href={type === "event" ? "/opportunities" : type === "campaign" ? "/crowdfunding" : "/cart"} className="hover:text-[var(--primary-color)] transition-colors">
                    {type === "event" ? "Opportunities" : type === "campaign" ? "Crowdfunding" : "Cart"}
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-medium text-[var(--text-secondary)]">Payment</span>
            </nav>

            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 font-display flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--primary-color)]">lock</span>
                Secure Checkout
            </h1>

            {/* secure badges */}
            <div className="flex flex-wrap gap-4 mb-8">
                {[
                    { icon: "verified_user", color: "text-green-500", label: "SSL Secured" },
                    { icon: "payments", color: "text-blue-500", label: "Encrypted Payment" },
                    { icon: "privacy_tip", color: "text-purple-500", label: "Data Protected" },
                ].map(b => (
                    <div key={b.label} className="flex items-center gap-2 bg-white border border-stone-100 rounded-full px-4 py-1.5 text-xs text-stone-500 shadow-sm">
                        <span className={`material-symbols-outlined text-base ${b.color}`}>{b.icon}</span>
                        {b.label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* pay form */}
                <div className="lg:col-span-3 space-y-6">
                    {/* method tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                        <h2 className="font-bold text-[var(--text-primary)] font-display mb-4">Payment Method</h2>
                        <div className="flex gap-3 mb-6">
                            {[
                                { id: "card", icon: "credit_card", label: "Card" },
                                { id: "upi", icon: "account_balance_wallet", label: "UPI" },
                                { id: "netbanking", icon: "account_balance", label: "Net Banking" },
                            ].map(m => (
                                <Button
                                    key={m.id}
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${paymentMethod === m.id ? "border-[var(--primary-color)] bg-orange-50 text-[var(--primary-color)]" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}
                                >
                                    <span className="material-symbols-outlined text-xl">{m.icon}</span>
                                    {m.label}
                                </Button>
                            ))}
                        </div>

                        {/* card fields */}
                        {paymentMethod === "card" && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Test mode — use card <span className="font-mono font-bold">4242 4242 4242 4242</span>, any future expiry, any 3-digit CVV.
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">Card Number *</label>
                                    <div className="relative">
                                        <input
                                            value={cardNumber}
                                            onChange={e => setCardNumber(formatCard(e.target.value))}
                                            maxLength={19}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent font-mono tracking-widest"
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-stone-300">credit_card</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">Cardholder Name *</label>
                                    <input
                                        value={cardName}
                                        onChange={e => setCardName(e.target.value)}
                                        placeholder="Name as on card"
                                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">Expiry Date *</label>
                                        <input
                                            value={expiry}
                                            onChange={e => setExpiry(e.target.value)}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">CVV *</label>
                                        <input
                                            value={cvv}
                                            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            placeholder="123"
                                            type="password"
                                            maxLength={4}
                                            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent font-mono"
                                        />
                                    </div>
                                </div>
                                {/* card visual */}
                                <div className="bg-gradient-to-br from-[var(--deep-teal)] to-[var(--primary-color)] rounded-2xl p-5 text-white relative overflow-hidden mt-2">
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-4"></div>
                                    <p className="text-xs opacity-70 mb-4 font-medium tracking-widest uppercase">Debit / Credit Card</p>
                                    <p className="font-mono text-lg tracking-widest mb-4">{cardNumber || "•••• •••• •••• ••••"}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] opacity-60 uppercase mb-0.5">Cardholder</p>
                                            <p className="font-bold text-sm tracking-wide">{cardName || "YOUR NAME"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] opacity-60 uppercase mb-0.5">Expires</p>
                                            <p className="font-bold text-sm">{expiry || "MM/YY"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* UPI fields */}
                        {paymentMethod === "upi" && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Test mode — enter any valid UPI ID format like <span className="font-mono font-bold">test@upi</span>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">UPI ID *</label>
                                    <input
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-3 pt-2">
                                    {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                                        <Button key={app} onClick={() => setUpiId(`test@${app.toLowerCase()}`)} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-stone-200 hover:border-[var(--primary-color)] hover:bg-orange-50 transition-colors text-xs font-medium text-stone-600">
                                            <span className="material-symbols-outlined text-[var(--primary-color)]">account_balance_wallet</span>
                                            {app}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* netbanking fields */}
                        {paymentMethod === "netbanking" && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Test mode — select any bank and proceed.
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-[var(--text-primary)] mb-1.5 block">Select Bank *</label>
                                    <select className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent">
                                        <option>State Bank of India</option>
                                        <option>HDFC Bank</option>
                                        <option>ICICI Bank</option>
                                        <option>Axis Bank</option>
                                        <option>Kotak Mahindra Bank</option>
                                        <option>Punjab National Bank</option>
                                        <option>Bank of Baroda</option>
                                        <option>Canara Bank</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-600 space-y-1">
                                    <p>You will be securely redirected to your bank&apos;s payment portal.</p>
                                    <p className="text-xs text-stone-400">In test mode this step is simulated.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* address (not actually used rn) */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                        <h2 className="font-bold text-[var(--text-primary)] font-display mb-4">Billing Address</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="First Name" className="border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent" />
                                <input placeholder="Last Name" className="border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent" />
                            </div>
                            <input placeholder="Street Address" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent" />
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="City" className="border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent" />
                                <input placeholder="PIN Code" className="border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent" />
                            </div>
                            <select className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--secondary-color)] focus:border-transparent">
                                <option>Select State</option>
                                {["Rajasthan", "Maharashtra", "Delhi", "Karnataka", "Gujarat", "West Bengal", "Kerala", "Tamil Nadu"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* summary */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 sticky top-20">
                        <h2 className="font-bold text-[var(--text-primary)] font-display mb-4">
                            {type === "cart" ? "Cart Summary" : type === "event" ? "Booking Summary" : "Contribution Summary"}
                        </h2>

                        {/* cart items */}
                        {type === "cart" && (
                            <div className="space-y-3 mb-4">
                                {cartLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <span className="material-symbols-outlined animate-spin text-[var(--secondary-color)]">progress_activity</span>
                                    </div>
                                ) : cartItems.length === 0 ? (
                                    <p className="text-sm text-stone-400 text-center py-2">Cart is empty</p>
                                ) : (
                                    cartItems.map(item => (
                                        <div key={item._id} className="flex gap-3 items-center">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                                <Image src={item.product?.images?.[0] || "/placeholder.png"} alt={item.product?.name} className="w-full h-full object-cover" width={48} height={48} unoptimized />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.product?.name}</p>
                                                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-bold text-[var(--text-primary)] flex-shrink-0">
                                                ₹ {((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* event,campaign summary */}
                        {type !== "cart" && (
                            <div className="bg-orange-50 rounded-xl p-4 mb-4">
                                <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{displayTitle}</p>
                                {tierName && (
                                    <p className="text-xs text-stone-500 mb-1">Ticket Tier: <span className="font-semibold">{tierName}</span></p>
                                )}
                                <p className="text-xs text-stone-500">
                                    {type === "event" ? "Event Ticket" : "Campaign Contribution"}
                                </p>
                            </div>
                        )}

                        {/* amounts */}
                        <div className="space-y-2.5 text-sm border-t border-stone-100 pt-4">
                            {type === "cart" ? (
                                <>
                                    <div className="flex justify-between text-stone-600">
                                        <span>Subtotal</span>
                                        <span>₹ {cartSubtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span>Platform Fee (5%)</span>
                                        <span>₹ {cartFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-stone-400">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-semibold">FREE</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between text-stone-600">
                                    <span>Amount</span>
                                    <span>₹ {displayAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-stone-200 pt-2.5 flex justify-between font-bold text-base text-[var(--text-primary)]">
                                <span>Total Payable</span>
                                <span className="text-[var(--primary-color)]">₹ {displayAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* pay btn */}
                        <Button
                            onClick={handlePay}
                            disabled={paying || (type === "cart" && cartLoading)}
                            className="w-full mt-6 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white py-4 rounded-xl font-bold text-base transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {paying ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Processing…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">lock</span>
                                    Pay ₹ {displayAmount.toLocaleString()}
                                </>
                            )}
                        </Button>

                        <p className="text-center text-xs text-stone-400 mt-3 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                            Your payment is 100% secure & encrypted
                        </p>

                        {/* accepted payment icons */}
                        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                            {["Visa", "Mastercard", "RuPay", "UPI", "BHIM"].map(brand => (
                                <span key={brand} className="text-[10px] font-bold text-stone-400 border border-stone-200 px-2 py-1 rounded">{brand}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <AppShell>
            <Suspense fallback={<Loader />}>
                <PaymentForm />
            </Suspense>
        </AppShell>
    );
}
