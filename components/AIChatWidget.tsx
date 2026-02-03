"use client";

import { useState, useRef, useEffect } from "react";

const AI_PHONE_NUMBER = "(281) 555-0199";

const QUICK_REPLIES = [
  "What rental packages do you offer?",
  "Do you deliver to my area?",
  "What's your cancellation policy?",
  "I need help choosing items for my event.",
];

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Response {
  text: string;
  followUps: string[];
}

// Keyword-based matching: each entry has keywords to match and a response
const RESPONSES: { keywords: string[]; response: Response }[] = [
  // ── Packages ──
  {
    keywords: ["package", "packages", "bundle", "bundles", "deal"],
    response: {
      text: "We offer three curated packages:\n\n• **Essentials** — Tables, chairs, and basic linens starting at $500\n• **Elegance** — Full table settings with premium linens, centerpieces, and chair sashes starting at $1,200\n• **Grand Celebration** — Complete event styling including arches, uplighting, and tabletop decor starting at $2,500\n\nAll packages include delivery, setup, and pickup. Would you like details on any of these?",
      followUps: ["Tell me about the Essentials package", "What's included in Grand Celebration?", "Browse the collection", "How do I place an order?"],
    },
  },
  // ── Essentials package ──
  {
    keywords: ["essentials"],
    response: {
      text: "The **Essentials Package** starts at $500 and includes:\n\n• Round banquet tables (seats 8-10 each)\n• Folding or chiavari chairs\n• Basic white or ivory linens\n• Setup and breakdown\n• Delivery and pickup\n\nPerfect for simple, elegant gatherings. You can add items a la carte too!",
      followUps: ["What's included in Grand Celebration?", "Can I customize a package?", "Browse the collection"],
    },
  },
  // ── Elegance package ──
  {
    keywords: ["elegance"],
    response: {
      text: "The **Elegance Package** starts at $1,200 and includes:\n\n• Premium round or rectangular tables\n• Gold or silver chiavari chairs\n• Premium linens with napkins\n• Chair sashes in your color choice\n• Centerpiece bases\n• Full setup, styling, and breakdown\n\nA beautiful upgrade for weddings and formal events!",
      followUps: ["Tell me about the Essentials package", "What's included in Grand Celebration?", "Can I customize a package?"],
    },
  },
  // ── Grand Celebration ──
  {
    keywords: ["grand celebration", "grand"],
    response: {
      text: "The **Grand Celebration** starts at $2,500 and is our full-service package:\n\n• Premium tables and chairs\n• Luxury linens with napkins and runners\n• Centerpieces and tabletop decor\n• Ceremony arch or backdrop\n• LED uplighting (set of 10)\n• Full setup, styling, and breakdown\n\nIt's our most popular wedding package!",
      followUps: ["Can I customize a package?", "How far in advance should I book?", "Browse the collection"],
    },
  },
  // ── Customize ──
  {
    keywords: ["customize", "custom", "modify", "change package", "mix and match"],
    response: {
      text: "Absolutely! All our packages are fully customizable. You can:\n\n• **Add items** a la carte to any package\n• **Swap items** (e.g., upgrade chairs, change linen colors)\n• **Build your own** from scratch in our collection\n\nJust browse our collection and add what you need, or tell me about your event and I'll recommend the perfect setup!",
      followUps: ["Browse the collection", "I need help choosing items for my event.", "What rental packages do you offer?"],
    },
  },
  // ── Delivery ──
  {
    keywords: ["deliver", "delivery", "shipping", "drop off", "dropoff", "pickup", "pick up"],
    response: {
      text: "We deliver throughout the greater Houston metropolitan area within a 50-mile radius. Here's how it works:\n\n• **Delivery fee** starts at $75 (varies by distance)\n• We **deliver and set up** before your event\n• We **pick up and break down** after your event\n• Standard delivery window is 2-4 hours before your event start time\n\nJust share your event zip code and I can give you an exact quote!",
      followUps: ["What rental packages do you offer?", "How far in advance should I book?", "How do I place an order?"],
    },
  },
  // ── Cancellation ──
  {
    keywords: ["cancel", "cancellation", "refund", "reschedule"],
    response: {
      text: "We understand plans change! Here's our policy:\n\n• **30+ days before event** — Full refund\n• **15-29 days** — 50% refund\n• **Under 15 days** — No refund, but you can reschedule once\n\nTo cancel or reschedule, just log into your account or contact us.",
      followUps: ["How do I place an order?", "Where is my account?", "What rental packages do you offer?"],
    },
  },
  // ── Help choosing / event planning ──
  {
    keywords: ["help choosing", "help me choose", "recommend", "suggestion", "what should i", "which items", "what do i need"],
    response: {
      text: "I'd love to help! To give you the best recommendations, could you tell me:\n\n1. What type of event? (wedding, birthday, corporate, etc.)\n2. Approximate guest count?\n3. Indoor or outdoor?\n4. Do you have a color scheme or theme in mind?\n\nWith those details, I can suggest the perfect combination of rentals!",
      followUps: ["It's a wedding for 150 guests", "Outdoor birthday party for 50", "Corporate event for 100", "Browse the collection"],
    },
  },
  // ── Wedding ──
  {
    keywords: ["wedding"],
    response: {
      text: "Congratulations! For weddings, our most popular setup includes:\n\n• **Chiavari chairs** (gold or silver)\n• **Round tables** (60\" seats 8-10)\n• **Premium linens** in ivory or white\n• **Ceremony arch** or backdrop\n• **Centerpieces** and tabletop decor\n• **String lights** or LED uplighting\n\nOur **Grand Celebration** package covers all of this starting at $2,500. Or you can browse individual items in our collection!\n\n-> Browse our collection: /products",
      followUps: ["What's included in Grand Celebration?", "Browse the collection", "How far in advance should I book?", "Do you deliver to my area?"],
    },
  },
  // ── Birthday ──
  {
    keywords: ["birthday", "party"],
    response: {
      text: "Happy birthday planning! For birthday parties, we recommend:\n\n• **Tables and chairs** sized to your guest count\n• **Fun linens** in your party colors\n• **A tent or canopy** for outdoor parties\n• **String lights** for evening events\n• **PA system** if you need music/announcements\n\nOur **Essentials Package** at $500 is a great starting point! You can add items as needed.\n\n-> Browse our collection: /products",
      followUps: ["Tell me about the Essentials package", "Browse the collection", "Do you deliver to my area?"],
    },
  },
  // ── Corporate ──
  {
    keywords: ["corporate", "company", "business", "conference", "meeting"],
    response: {
      text: "Great choice! For corporate events, we recommend:\n\n• **Rectangular tables** for conference-style seating\n• **Padded folding chairs** for comfort\n• **Clean white or black linens**\n• **PA system** with wireless mic\n• **LED uplighting** in your brand colors\n\nOur **Elegance Package** at $1,200 works perfectly for professional settings.\n\n-> Browse our collection: /products",
      followUps: ["What rental packages do you offer?", "Browse the collection", "Do you deliver to my area?"],
    },
  },
  // ── Browse / collection ──
  {
    keywords: ["browse", "collection", "see items", "view items", "catalog", "inventory", "what do you have", "what do you rent"],
    response: {
      text: "You can browse our full collection online! We have:\n\n• **Chairs** — Chiavari, folding, cross-back\n• **Tables** — Round, rectangular, cocktail\n• **Linens** — Tablecloths, napkins, runners, sashes\n• **Arches** — Ceremony backdrops and arches\n• **Tabletop** — Centerpieces, candles, chargers, place settings\n\n-> Browse the collection: /products\n-> See chairs: /products?category=chairs\n-> See tables: /products?category=tables\n-> See linens: /products?category=linens\n-> See arches: /products?category=arches",
      followUps: ["What rental packages do you offer?", "I need help choosing items for my event.", "How do I place an order?"],
    },
  },
  // ── Order / booking ──
  {
    keywords: ["order", "book", "booking", "reserve", "how to order", "place an order"],
    response: {
      text: "Ordering is easy!\n\n1. **Browse** our collection at /products\n2. **Select** your rental dates and items\n3. **Add to cart** and choose delivery or pickup\n4. **Checkout** and pay securely with a credit card\n\nYou'll get an instant confirmation email. We handle delivery, setup, and pickup!\n\n-> Start browsing: /products",
      followUps: ["Browse the collection", "Do you deliver to my area?", "What rental packages do you offer?"],
    },
  },
  // ── Pricing / cost ──
  {
    keywords: ["price", "pricing", "cost", "how much", "rate", "rates", "expensive", "affordable", "cheap", "budget"],
    response: {
      text: "Our pricing is transparent and competitive:\n\n• **Chairs** — from $8/day\n• **Tables** — from $15/day\n• **Linens** — from $5/day\n• **Arches** — from $150 flat\n• **Lighting** — from $75 flat\n• **PA systems** — from $250/day\n\nPackages start at **$500** and save you 10-20% vs. a la carte. All prices are visible in our online collection!\n\n-> Browse with prices: /products",
      followUps: ["What rental packages do you offer?", "Browse the collection", "How do I place an order?"],
    },
  },
  // ── Chairs ──
  {
    keywords: ["chair", "chairs", "seating", "chiavari"],
    response: {
      text: "We have several beautiful chair options:\n\n• **Gold Chiavari** — Elegant and classic, $8/day\n• **Silver Chiavari** — Modern and sleek, $8/day\n• **Cross-back** — Rustic farmhouse style, $10/day\n• **White folding** — Clean and simple, $3/day\n\nAll chairs come with cushions. Minimum order of 20.\n\n-> See all chairs: /products?category=chairs",
      followUps: ["Browse the collection", "What rental packages do you offer?", "I need help choosing items for my event."],
    },
  },
  // ── Tables ──
  {
    keywords: ["table", "tables"],
    response: {
      text: "We offer a variety of table styles:\n\n• **60\" Round** — Seats 8-10 guests, $15/day\n• **72\" Round** — Seats 10-12 guests, $18/day\n• **6ft Rectangular** — Seats 6-8, $12/day\n• **8ft Rectangular** — Seats 8-10, $15/day\n• **Cocktail/Highboy** — Standing height, $20/day\n\n-> See all tables: /products?category=tables",
      followUps: ["Browse the collection", "What about chairs?", "What rental packages do you offer?"],
    },
  },
  // ── Linens ──
  {
    keywords: ["linen", "linens", "tablecloth", "napkin", "runner", "sash"],
    response: {
      text: "Our linen collection includes:\n\n• **Tablecloths** — Available in 20+ colors, from $5/day\n• **Napkins** — Matching or contrasting, from $1/each\n• **Table runners** — Elegant accent, from $8/day\n• **Chair sashes** — Organza, satin, or burlap, from $2/each\n\nWe can color-match to your event theme!\n\n-> See all linens: /products?category=linens",
      followUps: ["Browse the collection", "What about chairs?", "What rental packages do you offer?"],
    },
  },
  // ── Arches ──
  {
    keywords: ["arch", "arches", "backdrop", "ceremony"],
    response: {
      text: "Our arch and backdrop options include:\n\n• **Round arch** — Modern circle design, $200 flat\n• **Rectangular arch** — Classic frame, $175 flat\n• **Triangular arch** — Bohemian style, $150 flat\n• **Draping fabric** — Add-on, from $50\n\nAll arches can be decorated with your florals or our greenery add-ons.\n\n-> See all arches: /products?category=arches",
      followUps: ["Browse the collection", "What rental packages do you offer?", "I need help choosing items for my event."],
    },
  },
  // ── Lighting ──
  {
    keywords: ["light", "lights", "lighting", "uplighting", "string light"],
    response: {
      text: "We offer beautiful lighting options:\n\n• **String lights** (100ft) — Warm Edison-style, $75 flat\n• **LED uplighting** (set of 10) — 16 color options with remote, $150 flat\n• **Bistro lights** (50ft) — Classic cafe style, $50 flat\n\nLighting transforms any venue! Our Grand Celebration package includes uplighting.\n\n-> Browse the collection: /products",
      followUps: ["What's included in Grand Celebration?", "Browse the collection", "Do you deliver to my area?"],
    },
  },
  // ── Account / sign in ──
  {
    keywords: ["account", "sign in", "login", "log in", "my orders", "order status"],
    response: {
      text: "You can manage everything from your account:\n\n• **View order history** and status\n• **Track deliveries** in real-time\n• **Download invoices**\n• **Reschedule or cancel** bookings\n\n-> Sign in to your account: /login\n-> View your orders: /account\n\nDon't have an account? One is created automatically when you place your first order.",
      followUps: ["How do I place an order?", "What's your cancellation policy?", "Browse the collection"],
    },
  },
  // ── How far in advance ──
  {
    keywords: ["advance", "ahead of time", "when should i book", "how early", "last minute"],
    response: {
      text: "We recommend booking **at least 4-6 weeks** in advance for most events. For peak wedding season (April-October), we suggest **2-3 months** ahead to ensure availability.\n\nLast-minute bookings are sometimes possible - just reach out and we'll do our best!\n\n-> Start browsing: /products",
      followUps: ["How do I place an order?", "What rental packages do you offer?", "Browse the collection"],
    },
  },
  // ── Hours / contact ──
  {
    keywords: ["hours", "contact", "phone", "call", "email", "reach"],
    response: {
      text: "You can reach us anytime!\n\n• **AI Chat** — Available 24/7 right here\n• **AI Voice Line** — Call " + AI_PHONE_NUMBER + " anytime\n• **Online** — Browse and book 24/7 at our website\n\nFor complex event planning needs, our team is available Monday-Saturday, 9am-6pm.",
      followUps: ["How do I place an order?", "Browse the collection", "I need help choosing items for my event."],
    },
  },
  // ── Greetings ──
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy"],
    response: {
      text: "Hello! Welcome to Lolita Harris Event Rentals. I'm here to help you find everything you need for your event. What can I help you with?",
      followUps: ["What rental packages do you offer?", "Browse the collection", "I need help choosing items for my event.", "How do I place an order?"],
    },
  },
  // ── Thanks ──
  {
    keywords: ["thank", "thanks", "thank you", "appreciate"],
    response: {
      text: "You're welcome! Is there anything else I can help you with? Whether it's rental details, event planning tips, or placing an order - I'm here for you!",
      followUps: ["Browse the collection", "What rental packages do you offer?", "How do I place an order?"],
    },
  },
  // ── Appointment / meet ──
  {
    keywords: ["appointment", "appot", "meet", "visit", "showroom", "come in", "in person"],
    response: {
      text: "We'd love to meet with you! While most of our ordering is done conveniently online, we can arrange:\n\n• **Virtual consultations** for event planning\n• **Phone consultations** at " + AI_PHONE_NUMBER + "\n\nFor the fastest experience, you can browse our full collection online and place your order anytime.\n\n-> Browse the collection: /products\n-> Call us: " + AI_PHONE_NUMBER,
      followUps: ["Browse the collection", "I need help choosing items for my event.", "What rental packages do you offer?"],
    },
  },
  // ── Setup / breakdown ──
  {
    keywords: ["setup", "set up", "breakdown", "break down", "install", "assemble"],
    response: {
      text: "All rentals include **professional setup and breakdown**!\n\n• We arrive 2-4 hours before your event\n• Our team handles all setup and styling\n• After your event, we return for full breakdown and pickup\n• You don't need to lift a finger!\n\nThis is included in every package and rental order.",
      followUps: ["What rental packages do you offer?", "Do you deliver to my area?", "How do I place an order?"],
    },
  },
];

const DEFAULT_FOLLOW_UPS = [
  "What rental packages do you offer?",
  "Browse the collection",
  "I need help choosing items for my event.",
  "How do I place an order?",
];

function getResponse(input: string): Response {
  const lower = input.toLowerCase().trim();

  // Check each response entry for keyword matches
  for (const entry of RESPONSES) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.response;
      }
    }
  }

  return {
    text: "I'm not sure about that, but I'd love to help! Here are some things I can assist with:\n\n• Rental packages and pricing\n• Browsing our collection\n• Event planning recommendations\n• Delivery and setup info\n• Booking and orders\n\nOr you can call us at " + AI_PHONE_NUMBER + " to speak with our AI voice assistant!",
    followUps: DEFAULT_FOLLOW_UPS,
  };
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hi! I'm Lolita's AI assistant. I can help you find the perfect rentals for your event. You can also call us at **${AI_PHONE_NUMBER}** anytime.\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>(QUICK_REPLIES);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, followUps]);

  const handleLinkClick = (href: string) => {
    setOpen(false);
    window.location.href = href;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setFollowUps([]);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", text: response.text }]);
      setFollowUps(response.followUps);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  // Render message text with bold and clickable links
  const renderText = (text: string) => {
    return text.split("\n").map((line, j) => {
      // Check if line is a link line like "-> Browse: /products"
      const linkMatch = line.match(/^->\s*(.+?):\s*(\/\S+)/);
      if (linkMatch) {
        return (
          <p key={j} className={j > 0 ? "mt-1.5" : ""}>
            <button
              onClick={() => handleLinkClick(linkMatch[2])}
              className="inline-flex items-center gap-1 font-medium text-champagne-dark underline underline-offset-2 transition-colors hover:text-champagne"
            >
              {linkMatch[1]} &rarr;
            </button>
          </p>
        );
      }

      return (
        <p key={j} className={j > 0 ? "mt-1.5" : ""}>
          {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={k}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-champagne text-white shadow-lg transition-all hover:bg-champagne-dark hover:shadow-xl"
        aria-label="Open AI chat"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden border border-ivory-dark bg-white shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[500px] sm:w-[380px] sm:rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between bg-champagne px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 sm:hidden"
                aria-label="Close chat"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h3 className="font-heading text-base font-medium text-white">Lolita Harris</h3>
                <p className="font-body text-xs text-white/70">AI Event Concierge</p>
              </div>
            </div>
            <a
              href={`tel:${AI_PHONE_NUMBER.replace(/[^\d]/g, "")}`}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 font-body text-xs font-medium text-white transition-colors hover:bg-white/30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {AI_PHONE_NUMBER}
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 font-body text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-champagne text-white"
                      : "bg-ivory text-charcoal"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-ivory px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-gray [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-gray [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-warm-gray [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies / follow-up buttons */}
          {followUps.length > 0 && !typing && (
            <div className="flex flex-wrap gap-1.5 border-t border-ivory-dark px-4 py-3">
              {followUps.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-champagne/30 px-3 py-1.5 font-body text-xs text-champagne transition-colors hover:bg-champagne hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-ivory-dark px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rentals, pricing, availability..."
                className="flex-1 border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal placeholder:text-warm-gray-light focus:border-champagne focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center bg-champagne px-3 py-2.5 text-white transition-colors hover:bg-champagne-dark disabled:opacity-40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
