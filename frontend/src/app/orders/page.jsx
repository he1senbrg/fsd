'use client';
import AppShell from '@/components/AppShell';
import { Button, EmptyState, Loader, PageHeader, PillTab } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { conversationAPI, orderAPI } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const router = useRouter();
  const showToast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [trackingData, setTrackingData] = useState({});
  const [trackingLoading, setTrackingLoading] = useState({});
  const [successBanner, setSuccessBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('success') === 'true';
  });
  const [ticketData, setTicketData] = useState({});
  const [ticketLoading, setTicketLoading] = useState({});
  const [contactLoading, setContactLoading] = useState({});

  const tabLabels = ['All', 'Purchases', 'Bookings', 'Crowdfunding'];

  const loadTracking = async (orderId) => {
    if (trackingData[orderId]) return;
    setTrackingLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await orderAPI.getTracking(orderId);
      setTrackingData((prev) => ({ ...prev, [orderId]: res.data || res }));
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Tracking info not available.', 'error');
    }
    setTrackingLoading((prev) => ({ ...prev, [orderId]: false }));
  };

  const loadTicket = async (orderId) => {
    if (ticketData[orderId]) return;
    setTicketLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await orderAPI.getTicket(orderId);
      setTicketData((prev) => ({ ...prev, [orderId]: res.data || res }));
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Ticket info not available.', 'error');
    }
    setTicketLoading((prev) => ({ ...prev, [orderId]: false }));
  };

  const contactSeller = async (order) => {
    const sellerId = order.seller?._id;
    if (!sellerId) {
      showToast('Seller contact not available.', 'warning');
      return;
    }
    setContactLoading((prev) => ({ ...prev, [order._id]: true }));
    try {
      const res = await conversationAPI.startConversation(sellerId);
      const convId = res.data?.conversation?._id;
      router.push(convId ? `/messages?conv=${convId}` : '/messages');
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      router.push('/messages');
    }
    setContactLoading((prev) => ({ ...prev, [order._id]: false }));
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data?.orders || []);
      } catch (e) {
        if (e?.status !== 401) console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  // auto dismiss banner
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      window.history.replaceState({}, '', '/orders');
      const t = setTimeout(() => setSuccessBanner(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  const statusColorMap = {
    shipped: 'text-blue-600 bg-blue-50',
    confirmed: 'text-green-600 bg-green-50',
    delivered: 'text-green-700 bg-green-100',
    processing: 'text-orange-600 bg-orange-50',
    cancelled: 'text-red-600 bg-red-50',
  };

  const filtered =
    activeTab === 0
      ? orders
      : orders.filter((o) => {
          const type = (o.orderType || '').toLowerCase();
          if (activeTab === 1) return type === 'purchase';
          if (activeTab === 2) return type === 'booking';
          if (activeTab === 3) return type === 'crowdfunding';
          return true;
        });

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
        {/* pay success banner */}
        {successBanner && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl text-green-500">
                check_circle
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-base mb-0.5">Payment Successful!</h3>
              <p className="text-sm text-green-700">
                Your order/booking has been confirmed. You can track it below.
              </p>
            </div>
            <Button
              onClick={() => setSuccessBanner(false)}
              className="text-green-400 hover:text-green-600 transition-colors mt-0.5"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </Button>
          </div>
        )}

        <PageHeader
          title="My Orders & Bookings"
          subtitle="Track your purchases, event bookings, and campaign contributions."
        />

        {/* tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide">
          {tabLabels.map((tab, i) => (
            <PillTab
              key={tab}
              active={i === activeTab}
              onClick={() => setActiveTab(i)}
              inactiveClassName="bg-white border-stone-200 text-stone-600 hover:border-[var(--primary-color)]"
            >
              {tab}
            </PillTab>
          ))}
        </div>

        {/* orders */}
        {filtered.length === 0 && <EmptyState description="No orders found." icon="receipt_long" />}
        <div className="space-y-4">
          {filtered.map((order) => {
            const statusColor =
              statusColorMap[order.status?.toLowerCase()] || 'text-stone-600 bg-stone-50';
            const isPurchase = order.orderType === 'purchase';
            const isBooking = order.orderType === 'booking';
            const isCrowdfunding = order.orderType === 'crowdfunding';

            const firstItem = order.items?.[0];
            const productId = firstItem?.product?._id;
            const extraItems = (order.items?.length || 0) - 1;

            const displayTitle = isPurchase
              ? firstItem?.product?.name || 'Product Order'
              : isBooking
                ? order.event?.title || 'Event Booking'
                : order.campaign?.title || 'Campaign Contribution';

            const displayImage = isPurchase
              ? firstItem?.product?.images?.[0] || null
              : isBooking
                ? order.event?.coverImage || order.event?.image || null
                : order.campaign?.coverImage || order.campaign?.image || null;

            const sellerName = order.seller?.fullName || '';
            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—';

            const canTrack = order.status === 'shipped' && isPurchase;
            const canViewTicket =
              isBooking && (order.status === 'confirmed' || order.status === 'processing');
            const canReview =
              (order.status === 'delivered' || order.status === 'confirmed') &&
              isPurchase &&
              Boolean(productId);

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
              >
                {/* thumbnail */}
                <div className="relative w-full sm:w-24 h-40 sm:h-24 flex-shrink-0">
                  {displayImage ? (
                    <Image
                      alt={displayTitle}
                      className="rounded-lg object-cover"
                      src={displayImage}
                      fill
                      sizes="(max-width: 640px) 100vw, 96px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-stone-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-stone-300">
                        {isBooking ? 'event' : isCrowdfunding ? 'savings' : 'storefront'}
                      </span>
                    </div>
                  )}
                  {extraItems > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold rounded-md px-1.5 py-0.5">
                      +{extraItems} more
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1.5 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[var(--text-primary)] text-base leading-snug truncate">
                        {displayTitle}
                      </h3>
                      {sellerName && (
                        <p className="text-xs text-stone-500 mt-0.5">by {sellerName}</p>
                      )}
                      {/* sub items for many pdt order */}
                      {isPurchase && order.items?.length > 1 && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          +{' '}
                          {order.items
                            .slice(1)
                            .map((i) => i.product?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      {/* campaign badge */}
                      {isCrowdfunding && (
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          Crowdfunding
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${statusColor}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-stone-400">tag</span>
                      <span className="font-mono text-xs text-stone-600">
                        {order.orderId || order._id}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-stone-400">
                        calendar_today
                      </span>
                      {orderDate}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] text-base">
                      ₹ {(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                    {order.platformCommission > 0 && (
                      <span className="text-xs text-stone-400">
                        (incl. ₹{order.platformCommission} fee)
                      </span>
                    )}
                  </div>

                  {/* event info abt booking */}
                  {isBooking && order.event?.startDate && (
                    <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-stone-400">
                        schedule
                      </span>
                      {new Date(order.event.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {order.event?.venue && ` · ${order.event.venue}`}
                    </p>
                  )}

                  {/* actions */}
                  <div className="flex flex-col gap-3 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {canTrack && (
                        <Button
                          variant="primary"
                          onClick={() => loadTracking(order._id)}
                          disabled={trackingLoading[order._id]}
                          className="text-xs disabled:opacity-60"
                        >
                          {trackingLoading[order._id] ? 'Loading…' : 'Track Shipment'}
                        </Button>
                      )}
                      {canViewTicket && (
                        <Button
                          variant="primary"
                          onClick={() => loadTicket(order._id)}
                          disabled={ticketLoading[order._id]}
                          className="text-xs disabled:opacity-60"
                        >
                          {ticketLoading[order._id] ? 'Loading…' : 'View Ticket'}
                        </Button>
                      )}
                      {canReview && (
                        <Button
                          variant="primary"
                          onClick={() =>
                            router.push(`/marketplace/product?id=${encodeURIComponent(productId)}`)
                          }
                          className="text-xs"
                        >
                          Leave Review
                        </Button>
                      )}
                      {isCrowdfunding && (
                        <Button
                          variant="primary"
                          onClick={() => router.push('/crowdfunding')}
                          className="text-xs"
                        >
                          View Campaign
                        </Button>
                      )}
                      {order.seller && (
                        <Button
                          variant="outline"
                          onClick={() => contactSeller(order)}
                          disabled={contactLoading[order._id]}
                          className="text-xs disabled:opacity-60"
                        >
                          {contactLoading[order._id] ? '…' : 'Contact Seller'}
                        </Button>
                      )}
                    </div>

                    {/* tracking info */}
                    {trackingData[order._id] && (
                      <div className="bg-stone-50 rounded-lg p-3 text-xs border border-stone-200 space-y-1">
                        <p className="font-bold text-stone-700 flex items-center gap-1 mb-1.5">
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          Tracking Details
                        </p>
                        <p>
                          Carrier: <strong>{trackingData[order._id]?.carrier || 'N/A'}</strong>
                        </p>
                        <p>
                          Tracking #:{' '}
                          <strong className="font-mono">
                            {trackingData[order._id]?.trackingNumber || 'N/A'}
                          </strong>
                        </p>
                        <p>
                          Status: <strong>{trackingData[order._id]?.status || 'In Transit'}</strong>
                        </p>
                        {trackingData[order._id]?.estimatedDelivery && (
                          <p>
                            Est. Delivery:{' '}
                            <strong>
                              {new Date(
                                trackingData[order._id].estimatedDelivery,
                              ).toLocaleDateString('en-IN')}
                            </strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* ticket info */}
                    {ticketData[order._id] && (
                      <div className="bg-orange-50 rounded-lg p-3 text-xs border border-orange-200 space-y-1">
                        <p className="font-bold text-stone-700 flex items-center gap-1 mb-1.5">
                          <span className="material-symbols-outlined text-sm">
                            confirmation_number
                          </span>
                          Ticket Details
                        </p>
                        <p>
                          Event:{' '}
                          <strong>
                            {ticketData[order._id]?.ticket?.event?.title || displayTitle}
                          </strong>
                        </p>
                        <p>
                          Attendee:{' '}
                          <strong>
                            {ticketData[order._id]?.ticket?.attendee?.fullName || '—'}
                          </strong>
                        </p>
                        <p>
                          Booking ID:{' '}
                          <strong className="font-mono">
                            {ticketData[order._id]?.ticket?.orderId || order.orderId}
                          </strong>
                        </p>
                        {ticketData[order._id]?.ticket?.event?.startDate && (
                          <p>
                            Date:{' '}
                            <strong>
                              {new Date(
                                ticketData[order._id].ticket.event.startDate,
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </strong>
                          </p>
                        )}
                        {ticketData[order._id]?.ticket?.event?.venue && (
                          <p>
                            Venue: <strong>{ticketData[order._id].ticket.event.venue}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
