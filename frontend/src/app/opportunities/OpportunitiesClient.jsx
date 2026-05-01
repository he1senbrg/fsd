'use client';
import { Button, EmptyState, Loader, PageHeader, PillTab } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { eventAPI, opportunityAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OpportunitiesClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [openCalls, setOpenCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // actions
  const [applyActive, setApplyActive] = useState(new Set());
  const [applyTexts, setApplyTexts] = useState({});
  const [applyLoading, setApplyLoading] = useState({});
  const [appliedOpps, setAppliedOpps] = useState(new Set());
  const [eventLoading, setEventLoading] = useState({});
  const [bookedEvents, setBookedEvents] = useState(new Set());
  const showToast = useToast();

  const toggleApplyForm = (id) => {
    setApplyActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitApplication = async (opp) => {
    const coverLetter = applyTexts[opp._id] || '';
    setApplyLoading((prev) => ({ ...prev, [opp._id]: true }));
    try {
      await opportunityAPI.apply(opp._id, coverLetter);
      setAppliedOpps((prev) => new Set([...prev, opp._id]));
      setApplyActive((prev) => {
        const next = new Set(prev);
        next.delete(opp._id);
        return next;
      });
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Failed to submit application.', 'error');
    }
    setApplyLoading((prev) => ({ ...prev, [opp._id]: false }));
  };

  const handleEventAction = async (event) => {
    if (!event._id) return;
    const isFree =
      event.price === 0 ||
      event.eventType === 'free' ||
      event.price === 'Free Entry' ||
      !event.price;
    if (!isFree) {
      // redirect to payment page if paid event
      router.push(
        `/payment?type=event&id=${event._id}&title=${encodeURIComponent(event.title || 'Event Ticket')}&amount=${event.price}`,
      );
      return;
    }
    setEventLoading((prev) => ({ ...prev, [event._id]: true }));
    try {
      await eventAPI.rsvpEvent(event._id);
      setBookedEvents((prev) => new Set([...prev, event._id]));
      showToast('RSVP confirmed!', 'success');
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Failed to process request.', 'error');
    }
    setEventLoading((prev) => ({ ...prev, [event._id]: false }));
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventAPI.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      showToast('Event deleted successfully', 'success');
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Failed to delete event', 'error');
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await opportunityAPI.deleteOpportunity(id);
      setOpenCalls((prev) => prev.filter((o) => o._id !== id));
      showToast('Opportunity deleted successfully', 'success');
    } catch (err) {
      if (err?.status !== 401) console.error(err);
      showToast('Failed to delete opportunity', 'error');
    }
  };

  const tabs = [
    'All',
    'Events',
    'My Bookings',
    'Opportunities',
    'Teaching',
    'Performances',
    'Exhibitions',
    'Festivals',
  ];
  const searchParams = useSearchParams();

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, oppsRes] = await Promise.allSettled([
          eventAPI.getEvents(),
          opportunityAPI.getOpportunities(),
        ]);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.events || []);
        if (oppsRes.status === 'fulfilled') setOpenCalls(oppsRes.value.data?.opportunities || []);
      } catch (e) {
        if (e?.status !== 401) console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [searchParams]);

  if (loading) return <Loader />;

  return (
    <div className="py-2">
      <PageHeader
        centered
        className="mb-12"
        subtitleClassName="text-lg max-w-2xl mx-auto mb-0"
        title="Opportunities & Events"
        titleClassName="text-4xl mb-3"
        subtitle="Find performances, workshops, exhibitions, open calls, and gigs — all in one place."
      />

      {/* search,filter */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--secondary-color)]"
            placeholder="Search events, gigs, or open calls..."
            type="text"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-stone-50 border-none rounded-lg px-4 py-3 text-sm"
        >
          <option value="All Categories">All Categories</option>
          <option value="workshop">Workshop</option>
          <option value="exhibition">Exhibition</option>
          <option value="festival">Festival</option>
          <option value="concert">Concert</option>
          <option value="performance">Performance</option>
        </select>
      </div>

      {/* tab */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <PillTab key={tab} onClick={() => setActiveTab(tab)} active={activeTab === tab}>
            {tab}
          </PillTab>
        ))}
      </div>

      {/* events */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-display flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--terracotta)]">event</span>Upcoming
        Events
      </h2>
      {events.length === 0 && (
        <EmptyState
          className="py-8 mb-8"
          icon="event_busy"
          iconClassName="text-4xl"
          description="No upcoming events."
        />
      )}
      <div className="grid gap-6 mb-16">
        {events
          .filter((event) => {
            const isBooked =
              bookedEvents.has(event._id) ||
              (user && event.attendees?.some((a) => (a._id || a) === user._id));
            if (activeTab === 'My Bookings' && !isBooked) return false;
            if (activeTab === 'My Bookings' && isBooked) return true;
            if (
              activeTab !== 'All' &&
              activeTab !== 'Events' &&
              activeTab !== 'Workshops' &&
              activeTab !== 'Exhibitions'
            )
              return false;
            if (activeTab === 'Workshops' && event.category !== 'workshop') return false;
            if (activeTab === 'Exhibitions' && event.category !== 'exhibition') return false;
            if (
              searchQuery &&
              !event.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !event.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
              return false;
            if (categoryFilter !== 'All Categories' && event.category !== categoryFilter)
              return false;
            return true;
          })
          .map((event, i) => {
            const d = event.date ? new Date(event.date) : null;
            const day = d ? d.getDate().toString().padStart(2, '0') : '';
            const month = d ? d.toLocaleString('en-IN', { month: 'short' }) : '';
            const isFree =
              event.price === 0 || event.type === 'free' || event.price === 'Free Entry';
            return (
              <div
                key={event._id || i}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-auto md:h-52 relative"
              >
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                  <Image
                    alt={event.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    src={event.img || event.image || event.coverImage || '/placeholder.png'}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[var(--terracotta)] text-xs font-bold uppercase tracking-wider mb-1 block">
                      {event.category}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-display group-hover:text-[var(--terracotta)] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-stone-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-stone-100 gap-3">
                    <div className="text-sm text-stone-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        <span className="material-symbols-outlined text-sm align-middle">
                          location_on
                        </span>{' '}
                        {event.location || event.venue}
                      </span>
                      <span
                        className={
                          isFree
                            ? 'text-green-600 font-bold'
                            : 'font-bold text-[var(--text-primary)]'
                        }
                      >
                        {isFree
                          ? 'Free Entry'
                          : typeof event.price === 'number'
                            ? `₹ ${event.price}`
                            : event.price}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {user && event.organizer?._id === user._id ? (
                        <Button
                          onClick={() => handleDeleteEvent(event)}
                          className="px-5 py-2 font-bold bg-white/80 hover:bg-red-50 text-red-500 rounded-lg shadow-sm transition-colors border border-red-100 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined">delete</span> Delete
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEventAction(event)}
                          disabled={eventLoading[event._id] || bookedEvents.has(event._id)}
                          className="bg-[var(--deep-teal)] text-white px-5 py-2 rounded-lg font-bold hover:bg-[var(--terracotta)] transition-colors shadow-md text-sm disabled:opacity-60"
                        >
                          {eventLoading[event._id]
                            ? 'Processing...'
                            : bookedEvents.has(event._id)
                              ? isFree
                                ? 'RSVP’d ✓'
                                : 'Booked ✓'
                              : isFree
                                ? 'RSVP'
                                : 'Book Ticket'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* open calls */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 font-display flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--terracotta)]">work</span>
        Opportunities
      </h2>
      {openCalls.length === 0 && (
        <EmptyState
          className="py-8 mb-8"
          icon="work_off"
          iconClassName="text-4xl"
          description="No open calls at this time."
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {openCalls
          .filter((call) => {
            if (activeTab !== 'All' && activeTab !== 'Open Calls' && activeTab !== 'Gigs')
              return false;
            if (activeTab === 'Gigs' && call.type !== 'performance') return false;
            if (
              searchQuery &&
              !call.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !call.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
              return false;
            if (
              categoryFilter !== 'All Categories' &&
              call.artForm !== categoryFilter &&
              call.type !== categoryFilter.toLowerCase()
            )
              return false;
            return true;
          })
          .map((call, i) => (
            <div
              key={call._id || i}
              className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:-translate-y-1 transition-transform group relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[var(--secondary-color)]">
                  <span className="material-symbols-outlined text-2xl">{call.icon || 'work'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--terracotta)] transition-colors text-sm">
                    {call.title}
                  </h3>
                  <p className="text-xs text-stone-500">{call.org || call.organization}</p>
                </div>
              </div>
              <div className="text-xs text-stone-500 space-y-1 mb-3">
                <p>
                  <span className="material-symbols-outlined text-sm align-middle">
                    location_on
                  </span>{' '}
                  {call.location}
                </p>
                <p>
                  <span className="material-symbols-outlined text-sm align-middle">schedule</span>{' '}
                  Deadline:{' '}
                  {call.deadline
                    ? new Date(call.deadline).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Open'}
                </p>
                <p className="font-bold text-[var(--text-primary)]">
                  <span className="material-symbols-outlined text-sm align-middle">payments</span>{' '}
                  {call.pay || call.compensation || 'Contact'}
                </p>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {(call.tags || call.categories || []).map((tag) => (
                  <span
                    key={tag}
                    className="bg-orange-50 text-[var(--primary-color)] text-[10px] px-2 py-0.5 rounded-full border border-orange-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {user && call.organizer?._id === user._id ? (
                  <Button
                    variant="unstyled"
                    onClick={() => handleDeleteOpportunity(call._id)}
                    disabled={appliedOpps.has(call._id)}
                    className="w-full text-sm p-1.5 bg-white/80 hover:bg-red-50 text-red-500 rounded-lg shadow-sm transition-colors border border-red-100 flex items-center justify-center "
                  >
                    <span className="material-symbols-outlined">delete</span> Delete
                  </Button>
                ) : (
                  <Button
                    variant={appliedOpps.has(call._id) ? 'success' : 'primary'}
                    onClick={() => toggleApplyForm(call._id)}
                    disabled={appliedOpps.has(call._id)}
                    className="w-full text-sm disabled:opacity-60"
                  >
                    {appliedOpps.has(call._id)
                      ? 'Applied ✓'
                      : applyActive.has(call._id)
                        ? 'Cancel'
                        : 'Apply Now'}
                  </Button>
                )}
                {applyActive.has(call._id) && (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs resize-none focus:ring-1 focus:ring-[var(--secondary-color)]"
                      rows={3}
                      placeholder="Write a brief cover letter (optional)..."
                      value={applyTexts[call._id] || ''}
                      onChange={(e) =>
                        setApplyTexts((prev) => ({ ...prev, [call._id]: e.target.value }))
                      }
                    />
                    <Button
                      variant="success"
                      onClick={() => submitApplication(call)}
                      disabled={applyLoading[call._id]}
                      className="w-full py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      {applyLoading[call._id] ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="text-center">
        {user?.role === 'artLover' ? (
          <Link
            href="/opportunities/create"
            className="inline-flex items-center gap-2 bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined">add_circle</span> Create an Opportunity
          </Link>
        ) : (
          <Link
            href="/events/create"
            className="inline-flex items-center gap-2 bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--secondary-color)] transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined">add_circle</span> Create an Event
          </Link>
        )}
      </div>
    </div>
  );
}
