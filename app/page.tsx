'use client';

import Image from 'next/image';
import React from 'react';
import { Calendar, DollarSign, MapPin, Menu, Paperclip, X } from 'lucide-react';
import ChatInput from '@/components/ChatInput';
import SupplierCard from '@/components/SupplierCard';
import TypingIndicator from '@/components/TypingIndicator';

type SupplierMatch = {
  company_name: string;
  hq_location: string;
  matchScore: number;
  matchTemp?: 'hot' | 'warm' | 'cold';
  lead_time_days?: number;
  certifications?: string[];
  recycled_content_percent?: number;
  website?: string | null;
  reasons?: string[];
};

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  suppliers?: SupplierMatch[];
  variant?: 'info' | 'error';
  needsClarification?: boolean;
  isTyping?: boolean;
}

type FilterKey = 'location' | 'time' | 'budget' | null;

type ConversationContext = {
  location?: string;
  deliveryDays?: number;
  budgetUSD?: { min?: number; max?: number };
};

const stats = [
  { value: '2.1K+', label: 'Verified shops', description: 'CNC and fabrication partners confirmed for ISO or AS9100.' },
  { value: '146M+', label: 'Companies tracked', description: 'Signals across U.S. manufacturers refreshed each week.' },
  { value: '<5 sec', label: 'Average response', description: 'Fast matching powered by live firmographic data.' },
];

const features = [
  {
    title: 'Certified suppliers only',
    body: 'We surface domestic partners that pass ISO 9001, AS9100, or NADCAP checks before every introduction.',
  },
  {
    title: 'Logistics aware scoring',
    body: 'Lead time, capacity signals, and proximity weighting ensures your shortlist can actually deliver.',
  },
  {
    title: 'Sustainability signals',
    body: 'Highlight recycled content and ESG metrics so procurement teams can meet program targets.',
  },
];

const timelineSteps = [
  {
    title: 'Share your RFQ',
    body: 'Describe material, tolerances, quantity, delivery window, and any compliance needs.',
  },
  {
    title: 'Machine parsing',
    body: 'SteelMatch extracts specs, auto-fills missing context, and queries live supplier data.',
  },
  {
    title: 'Ranked shortlist',
    body: 'Receive up to five U.S. manufacturers with match scores, certifications, and lead times.',
  },
  {
    title: 'Warm intro',
    body: 'We schedule intro calls or route RFQs directly so your team can close faster.',
  },
];

const pricingTiers = [
  {
    name: 'Pilot',
    price: '$0',
    description: 'Ideal for sourcing leads or validating a new material program.',
    bullets: ['5 AI matches per month', 'Email follow up from our team', 'Live supplier enrichment'],
  },
  {
    name: 'Growth',
    price: '$199',
    description: 'For procurement teams running multiple RFQs each month.',
    bullets: ['Unlimited searches', 'Priority intros within 24 hours', 'Exportable supplier dossiers'],
  },
];

const navItems = [
  { label: 'Capabilities', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

function formatTimeFrame(days?: number) {
  if (!days) return 'Time Frame';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 60) return `${Math.round(days / 7)} week${days / 7 === 1 ? '' : 's'}`;
  return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? '' : 's'}`;
}

function formatBudget(budget?: { min?: number; max?: number }) {
  if (!budget) return 'Amount';
  const formatter = (value?: number) => (typeof value === 'number' ? `$${value.toLocaleString()}` : undefined);
  const min = formatter(budget.min);
  const max = formatter(budget.max);
  if (min && max) return `${min} - ${max}`;
  if (min) return `>= ${min}`;
  if (max) return `<= ${max}`;
  return 'Amount';
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    text: 'Hey there, describe your metal requirement and I will surface U.S. manufacturers that fit the spec.',
    variant: 'info',
  },
];

export default function Page() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [conversationContext, setConversationContext] = React.useState<ConversationContext>({});
  const [pendingField, setPendingField] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [openFilter, setOpenFilter] = React.useState<FilterKey>(null);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const [locationDraft, setLocationDraft] = React.useState('');
  const [timeFrameDraft, setTimeFrameDraft] = React.useState(14);
  const [budgetDraft, setBudgetDraft] = React.useState<{ min?: string; max?: string }>({});

  const nextId = React.useRef(initialMessages.length + 1);
  const locationPopoverRef = React.useRef<HTMLDivElement | null>(null);
  const timePopoverRef = React.useRef<HTMLDivElement | null>(null);
  const budgetPopoverRef = React.useRef<HTMLDivElement | null>(null);

  const showCTA = React.useMemo(
    () => messages.some((m) => m.sender === 'ai' && m.suppliers && m.suppliers.length > 0),
    [messages],
  );

  const clarificationHint =
    pendingField === 'location' ? 'Add your state or ZIP so we can shortlist nearby suppliers...' : null;

  React.useEffect(() => {
    if (openFilter === 'location') {
      setLocationDraft(conversationContext.location ?? '');
    } else if (openFilter === 'time') {
      setTimeFrameDraft(conversationContext.deliveryDays ?? 14);
    } else if (openFilter === 'budget') {
      setBudgetDraft({
        min: conversationContext.budgetUSD?.min ? String(conversationContext.budgetUSD.min) : '',
        max: conversationContext.budgetUSD?.max ? String(conversationContext.budgetUSD.max) : '',
      });
    }
  }, [openFilter, conversationContext]);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!openFilter) return;
      const ref =
        openFilter === 'location'
          ? locationPopoverRef.current
          : openFilter === 'time'
            ? timePopoverRef.current
            : budgetPopoverRef.current;
      if (ref && !ref.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenFilter(null);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openFilter]);

  function appendContext(partial: Partial<ConversationContext>, closePendingField = false) {
    setConversationContext((prev) => {
      const next = { ...prev, ...partial };
      Object.keys(next).forEach((key) => {
        const k = key as keyof ConversationContext;
        if (next[k] === undefined || next[k] === null) {
          delete next[k];
        }
      });
      return next;
    });
    if (closePendingField) setPendingField(null);
  }

  function clearContext(keys: Array<keyof ConversationContext>) {
    setConversationContext((prev) => {
      const next = { ...prev } as ConversationContext;
      for (const k of keys) delete (next as any)[k];
      return next;
    });
  }

  async function handleSend(rawText: string) {
    const text = rawText.trim();
    if (!text) return;

    const userId = nextId.current++;
    const placeholderId = nextId.current++;

    const userMessage: Message = { id: userId, sender: 'user', text };
    const placeholder: Message = { id: placeholderId, sender: 'ai', text: '', variant: 'info', isTyping: true };
    setMessages((prev) => [...prev, userMessage, placeholder]);
    setIsLoading(true);

    try {
      const requestBody = { query: text, context: conversationContext };
      try {
        console.log('[frontend] request payload', requestBody);
      } catch {}
      const response = await fetch('/api/match-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => ({}));
      try {
        console.log('[frontend] full response', { status: response.status, ok: response.ok, data });
      } catch {}

      if (response.status === 422 && data?.needsClarification) {
        const needsLocation = Array.isArray(data.fields) && data.fields.includes('location');
        setPendingField((data.fields && data.fields[0]) || null);
        if (needsLocation) {
          setOpenFilter('location');
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? {
                  id: placeholderId,
                  sender: 'ai',
                  text: data.message || 'Could you share your location so we can localize the search?',
                  variant: 'info',
                  needsClarification: true,
                  isTyping: false,
                }
              : msg,
          ),
        );
        return;
      }

      if (!response.ok) {
        const message =
          typeof data?.message === 'string'
            ? data.message
            : 'We ran into an issue reaching the supplier data source. Try again in a moment.';

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === placeholderId
              ? { id: placeholderId, sender: 'ai', text: message, variant: 'error', isTyping: false }
              : msg,
          ),
        );
        return;
      }

      if (data?.context) {
        appendContext(
          {
            location: data.context.location ?? conversationContext.location,
            deliveryDays: data.context.deliveryDays ?? conversationContext.deliveryDays,
            budgetUSD: data.context.budgetUSD ?? conversationContext.budgetUSD,
          },
          Boolean(data?.context?.location),
        );
      }

      const suppliers: SupplierMatch[] = Array.isArray(data?.suppliers) ? data.suppliers : [];
      const aiMessage: Message = {
        id: placeholderId,
        sender: 'ai',
        text: data?.message || (suppliers.length ? 'Here are the best matches we found.' : 'No results returned.'),
        suppliers,
        variant: suppliers.length ? 'info' : 'error',
        isTyping: false,
      };

      setMessages((prev) => prev.map((msg) => (msg.id === placeholderId ? aiMessage : msg)));
    } catch (error) {
      console.error('[frontend] match-suppliers error', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId
            ? {
                id: placeholderId,
                sender: 'ai',
                text: 'Network error connecting to the supplier data source. Please retry shortly.',
                variant: 'error',
                isTyping: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <Header mobileOpen={mobileNavOpen} onToggleMobile={() => setMobileNavOpen((prev) => !prev)} />
      {mobileNavOpen ? <MobileNav items={navItems} onNavigate={() => setMobileNavOpen(false)} /> : null}

      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative container mx-auto flex flex-col items-center gap-12 px-4 text-center">
          <div className="flex max-w-4xl flex-col items-center gap-6">
            <h1 className="font-bebas text-5xl leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Real-time sourcing intelligence for metals teams
            </h1>
            <p className="max-w-2xl text-lg text-white/70 sm:text-xl">
              AI-matched U.S. steel partners - certified, fast, sustainable. Describe your RFQ and we deliver a vetted shortlist in seconds.
            </p>
          </div>

          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#141416] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-6 py-5 text-md text-white/80">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Steel Match AI
            </div>

            <div className="space-y-4 px-6 py-6">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xl rounded-3xl px-4 py-3 text-left text-md leading-relaxed ${
                        isUser ? 'bg-primary text-white rounded-br-xl' : 'bg-white/5 text-white/90 rounded-bl-xl'
                      }`}
                    >
                      {msg.isTyping ? <TypingIndicator /> : msg.text}
                      {msg.suppliers?.length ? (
                        <div className="mt-4 space-y-3">
                          {msg.suppliers.map((supplier, index) => (
                            <SupplierCard key={`${supplier.company_name}-${index}`} {...supplier} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 px-6 py-4">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                clarificationHint={clarificationHint}
                variant="dark"
                leftAccessory={<Paperclip size={16} />}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/5 px-6 py-4">
              <FilterButton
                icon={MapPin}
                label="Location"
                {...(conversationContext.location ? { value: conversationContext.location } : {})}
                onClick={() => setOpenFilter(openFilter === 'location' ? null : 'location')}
              />
              <FilterButton
                icon={Calendar}
                label="Time Frame"
                {...(conversationContext.deliveryDays
                  ? { value: formatTimeFrame(conversationContext.deliveryDays) }
                  : {})}
                onClick={() => setOpenFilter(openFilter === 'time' ? null : 'time')}
              />
              <FilterButton
                icon={DollarSign}
                label="Amount"
                {...(conversationContext.budgetUSD
                  ? { value: formatBudget(conversationContext.budgetUSD) }
                  : {})}
                onClick={() => setOpenFilter(openFilter === 'budget' ? null : 'budget')}
              />
            </div>
          </div>
        </div>

        {openFilter === 'location' ? (
          <PopoverCard ref={locationPopoverRef}>
            <h3 className="text-md font-semibold text-white">Select location</h3>
            <p className="text-xs text-white/60">We prioritize matches near your project or warehouse.</p>
            <input
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="State, metro area, or ZIP"
              className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-md text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-4 flex justify-between gap-2 text-md">
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:text-white"
                onClick={() => {
                  clearContext(['location']);
                  setPendingField(null);
                  setOpenFilter(null);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
                onClick={() => {
                  const trimmed = locationDraft.trim();
                  if (trimmed) {
                    appendContext({ location: trimmed }, true);
                  } else {
                    clearContext(['location']);
                    setPendingField(null);
                  }
                  setOpenFilter(null);
                }}
              >
                Save
              </button>
            </div>
          </PopoverCard>
        ) : null}

        {openFilter === 'time' ? (
          <PopoverCard ref={timePopoverRef}>
            <h3 className="text-md font-semibold text-white">Delivery time frame</h3>
            <p className="text-xs text-white/60">Set the maximum number of days until you need material in hand.</p>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wider text-white/50">
              <span>1 day</span>
              <span>12 weeks</span>
            </div>
            <input
              type="range"
              min={1}
              max={84}
              value={timeFrameDraft}
              onChange={(e) => setTimeFrameDraft(Number(e.target.value))}
              className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-primary"
            />
            <div className="mt-3 text-right text-md text-white">{formatTimeFrame(timeFrameDraft)}</div>
            <div className="mt-4 flex justify-between gap-2 text-md">
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:text-white"
                onClick={() => {
                  clearContext(['deliveryDays']);
                  setOpenFilter(null);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
                onClick={() => {
                  appendContext({ deliveryDays: timeFrameDraft });
                  setOpenFilter(null);
                }}
              >
                Save
              </button>
            </div>
          </PopoverCard>
        ) : null}

        {openFilter === 'budget' ? (
          <PopoverCard ref={budgetPopoverRef}>
            <h3 className="text-md font-semibold text-white">Budget range</h3>
            <p className="text-xs text-white/60">Optional: helps prioritize suppliers that match your target spend.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60">Min</label>
                <input
                  value={budgetDraft.min ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setBudgetDraft((prev) => ({ ...prev, min: val }));
                  }}
                  placeholder="e.g. 10000"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-md text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Max</label>
                <input
                  value={budgetDraft.max ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setBudgetDraft((prev) => ({ ...prev, max: val }));
                  }}
                  placeholder="e.g. 75000"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-md text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between gap-2 text-md">
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-white/70 hover:text-white"
                onClick={() => {
                  clearContext(['budgetUSD']);
                  setOpenFilter(null);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
                onClick={() => {
                  const minVal = budgetDraft.min ? Number(budgetDraft.min) : undefined;
                  const maxVal = budgetDraft.max ? Number(budgetDraft.max) : undefined;
                  if (typeof minVal === 'number' || typeof maxVal === 'number') {
                    const payload: { min?: number; max?: number } = {};
                    if (typeof minVal === 'number') payload.min = minVal;
                    if (typeof maxVal === 'number') payload.max = maxVal;
                    appendContext({ budgetUSD: payload });
                  } else {
                    clearContext(['budgetUSD']);
                  }
                  setOpenFilter(null);
                }}
              >
                Save
              </button>
            </div>
          </PopoverCard>
        ) : null}
      </section>

      <section className="relative z-10 border-t border-white/10 bg-[#0d0d0f] py-20" id="stats">
        <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-md font-semibold uppercase tracking-wide text-white/60">{stat.label}</p>
              <p className="mt-3 text-md text-white/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101013] py-24" id="features">
        <div className="container mx-auto flex flex-col gap-12 px-4 text-center">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Capabilities</span>
            <h2 className="font-bebas text-4xl text-white">A shortlist you can send to procurement</h2>
            <p className="text-base text-white/70">
              Every recommendation is backed by certifications, operations signals, and sustainability data so stakeholders can move quickly.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-md leading-relaxed text-white/70">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d0d0f] py-24" id="how-it-works">
        <div className="container mx-auto flex flex-col gap-10 px-4">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Workflow</span>
            <h2 className="mt-3 font-bebas text-4xl text-white">How teams match with suppliers</h2>
            <p className="mt-2 text-base text-white/70">
              From intake to introductions, SteelMatch keeps sourcing momentum high and feedback loops fast.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {timelineSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-md leading-relaxed text-white/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101013] py-24" id="pricing">
        <div className="container mx-auto flex flex-col gap-12 px-4">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Pricing</span>
            <h2 className="mt-3 font-bebas text-4xl text-white">Start with a pilot, scale as you grow</h2>
            <p className="mt-2 text-base text-white/70">
              Deploy SteelMatch internally or invite your suppliers. Upgrade whenever you need unlimited matches.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
                <div>
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <p className="mt-1 text-3xl font-semibold text-primary">{tier.price}</p>
                  <p className="mt-3 text-md text-white/70">{tier.description}</p>
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-2 text-md text-white/70">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-md font-semibold text-white hover:bg-primary/90"
                >
                  Talk with us
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (matches reference layout while preserving copy) */}
      <section className="border-t border-white/10 bg-[#0d0d0f] py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-10 text-center">
            <h3 className="text-3xl font-semibold text-white">Ready to source smarter?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-md text-white/70">
              Describe your RFQ and get a vetted shortlist in seconds. Connect with certified, fast, and sustainable U.S. partners.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="mailto:hello@steelmatch.ai"
                className="rounded-lg border border-white/20 px-5 py-3 text-md text-white/80 hover:text-white"
              >
                Contact
              </a>
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#'}
                className="rounded-lg bg-primary px-5 py-3 text-md font-semibold text-white hover:bg-primary/90"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {showCTA ? (
        <section className="border-t border-white/10 bg-[#0d0d0f] py-24">
          <div className="mx-auto max-w-3xl rounded-3xl border border-primary/30 bg-primary/10 px-6 py-12 text-center text-white">
            <h3 className="text-2xl font-semibold">Found the right supplier match?</h3>
            <p className="mt-3 text-base text-white/80">
              Get intro calls and quotes - free for your first RFQ. Our sourcing team closes the loop within one business day.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-md text-white placeholder:text-white/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#'}
                className="rounded-lg bg-primary px-5 py-3 text-md font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0d0d0f]"
              >
                Schedule Intro Call
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-white/10 bg-[#080809] py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="SteelMatch Pro" width={36} height={36} className="rounded-lg" />
            <div>
              <p className="text-md font-semibold text-white">SteelMatch Pro</p>
              <p className="text-xs text-white/60">Steel Match 2025 - real-time B2B data on 146M+ companies</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-md text-white/50">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </a>
            ))}
            <a href="mailto:hello@steelmatch.ai" className="hover:text-white">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function Header({ mobileOpen, onToggleMobile }: { mobileOpen: boolean; onToggleMobile: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#080809]/70 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="SteelMatch Pro" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold text-white">SteelMatch Pro</span>
        </div>
        <nav className="hidden items-center gap-8 text-md text-white/60 md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="mailto:hello@steelmatch.ai"
            className="rounded-lg border border-white/20 px-4 py-2 text-md text-white/70 hover:text-white"
          >
            Contact
          </a>
          <a
            href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#'}
            className="rounded-lg bg-primary px-4 py-2 text-md font-semibold text-white hover:bg-primary/90"
          >
            Get Started
          </a>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          className="rounded-lg border border-white/20 p-2 text-white md:hidden"
          onClick={onToggleMobile}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </header>
  );
}

function MobileNav({ items, onNavigate }: { items: typeof navItems; onNavigate: () => void }) {
  return (
    <nav className="fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-[#080809] px-4 py-4 md:hidden">
      <ul className="flex flex-col gap-4 text-md text-white/80">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} onClick={onNavigate} className="block">
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <a href="mailto:hello@steelmatch.ai" onClick={onNavigate}>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}

function FilterButton({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof MapPin;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-md text-white hover:bg-white/10"
    >
      <Icon size={16} className="text-white/70" />
      <span>{value ? `${label}: ${value}` : label}</span>
    </button>
  );
}

const PopoverCard = React.forwardRef<HTMLDivElement, React.PropsWithChildren>(
  function PopoverCard({ children }, ref) {
    return (
      <div
        ref={ref}
        className="fixed left-1/2 top-[calc(100vh/2)] z-40 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl"
      >
        {children}
      </div>
    );
  },
);
