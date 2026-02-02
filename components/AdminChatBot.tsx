"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  message: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Check availability", message: "What's available for this Saturday?" },
  { label: "New appointment", message: "I need to schedule a site visit for a client" },
  { label: "Follow up leads", message: "Which leads need follow-up today?" },
  { label: "Today's orders", message: "Show me today's orders" },
  { label: "Revenue report", message: "What's our revenue this month?" },
  { label: "Suggest upsell", message: "What should I upsell for a wedding with 150 guests?" },
];

// Simple bot logic — in production this would call an AI API
function generateBotResponse(userMsg: string, conversationHistory: Message[]): { text: string; delay: number } {
  const msg = userMsg.toLowerCase();

  // Availability questions
  if (msg.includes("available") || msg.includes("availability") || msg.includes("saturday") || msg.includes("stock")) {
    return {
      text: `Here's what's available for this weekend:\n\n` +
        `✅ **20x40 White Tent** — 6 of 8 available\n` +
        `✅ **Round Tables (60")** — 42 of 50 available\n` +
        `✅ **Chiavari Chairs (Gold)** — 136 of 200 available\n` +
        `✅ **String Lights (100ft)** — 18 of 20 available\n` +
        `⚠️ **PA System** — 1 of 5 available\n` +
        `❌ **LED Uplighting** — 0 of 10 available (fully booked)\n\n` +
        `Would you like me to create a reservation hold for any items?`,
      delay: 800,
    };
  }

  // Schedule appointment
  if (msg.includes("schedule") || msg.includes("appointment") || msg.includes("site visit") || msg.includes("consultation")) {
    return {
      text: `I can help schedule that! Here are the next available slots:\n\n` +
        `📅 **Tomorrow** — 10:00 AM, 2:00 PM\n` +
        `📅 **Wednesday** — 9:00 AM, 11:00 AM, 3:00 PM\n` +
        `📅 **Thursday** — 10:00 AM, 1:00 PM\n\n` +
        `What's the client's name and preferred time? I'll book it and send them a confirmation email.`,
      delay: 600,
    };
  }

  // Client info / booking for appointment
  if ((msg.includes("book") || msg.includes("name") || msg.includes("client")) && conversationHistory.some(m => m.text.includes("schedule"))) {
    return {
      text: `Got it! I've created the appointment:\n\n` +
        `📋 **Site Visit Booked**\n` +
        `• Client: *Details from your message*\n` +
        `• Date: Tomorrow at 10:00 AM\n` +
        `• Type: Site consultation\n` +
        `• Status: Confirmed\n\n` +
        `I've sent a confirmation email to the client and added it to the calendar. Want me to also prep a quote for their event?`,
      delay: 700,
    };
  }

  // Leads follow-up
  if (msg.includes("lead") || msg.includes("follow-up") || msg.includes("follow up") || msg.includes("prospect")) {
    return {
      text: `You have **3 leads** needing follow-up today:\n\n` +
        `🔴 **Sarah Mitchell** — Wedding (150 guests, Jun 15)\n` +
        `   Last contact: 3 days ago. Quote sent: $4,850. *Hot lead — needs follow-up!*\n\n` +
        `🟡 **Marcus Rivera** — Corporate Event (Jul 20)\n` +
        `   Last contact: 5 days ago. Initial inquiry. *Needs quote.*\n\n` +
        `🟢 **Emily Chen** — Birthday Party (Mar 28)\n` +
        `   Last contact: 1 day ago. Quote accepted. *Ready to close!*\n\n` +
        `Want me to draft a follow-up email for Sarah, or create a quote for Marcus?`,
      delay: 900,
    };
  }

  // Draft email
  if (msg.includes("draft") || msg.includes("email") || msg.includes("follow-up email")) {
    return {
      text: `Here's a draft follow-up for Sarah Mitchell:\n\n` +
        `---\n` +
        `**Subject:** Your wedding rental quote — a few additions to consider\n\n` +
        `Hi Sarah,\n\n` +
        `I wanted to follow up on the quote I sent for your June 15th wedding. With 150 guests, I'd also recommend:\n\n` +
        `• **String lighting** (3 sets) — creates a beautiful ambiance for evening receptions\n` +
        `• **LED uplighting** (2 sets) — accent lighting in your wedding colors\n\n` +
        `This would add ~$600 to the total. Shall I update the quote?\n\n` +
        `Best regards,\n[Your name]\n` +
        `---\n\n` +
        `Want me to send this, edit it, or save it as a draft?`,
      delay: 1000,
    };
  }

  // Today's orders
  if (msg.includes("today") && (msg.includes("order") || msg.includes("delivery"))) {
    return {
      text: `Here's today's order activity:\n\n` +
        `📦 **2 deliveries scheduled:**\n` +
        `• Order #a1b2c3 → 123 Oak St — Delivery at 9 AM (tent + tables)\n` +
        `• Order #d4e5f6 → 456 Pine Ave — Delivery at 2 PM (chairs + lighting)\n\n` +
        `💰 **1 new order paid:**\n` +
        `• Order #g7h8i9 — $2,350 (wedding package, event Mar 22)\n\n` +
        `⏳ **1 pending payment:**\n` +
        `• Order #j0k1l2 — $890 (expires in 8 minutes)\n\n` +
        `Need me to update any order statuses or send delivery confirmations?`,
      delay: 700,
    };
  }

  // Revenue
  if (msg.includes("revenue") || msg.includes("sales") || msg.includes("earnings") || msg.includes("money")) {
    return {
      text: `📊 **Revenue Report — February 2026:**\n\n` +
        `• Total Revenue: **$18,450**\n` +
        `• Orders: **12**\n` +
        `• Average Order: **$1,537**\n` +
        `• Top Product: 20x40 White Tent ($9,000)\n\n` +
        `📈 **vs. January:** +22% revenue, +15% orders\n\n` +
        `**Pipeline (upcoming confirmed):**\n` +
        `• March: $24,200 (8 orders)\n` +
        `• April: $8,900 (3 orders)\n\n` +
        `Want a detailed breakdown by category or product?`,
      delay: 800,
    };
  }

  // Upsell / suggestions
  if (msg.includes("upsell") || msg.includes("suggest") || msg.includes("recommend") || msg.includes("wedding") || msg.includes("guest")) {
    return {
      text: `Great question! For a **wedding with 150 guests**, here's my recommended package:\n\n` +
        `**Essentials:**\n` +
        `• 2× 20x40 White Tent — $900/day\n` +
        `• 19× Round Tables (60") — $285/day\n` +
        `• 150× Chiavari Chairs — $1,200/day\n\n` +
        `**High-Margin Upsells** 💰:\n` +
        `• 3× String Light Sets — $225 flat (+68% margin)\n` +
        `• 2× LED Uplighting — $300 flat (+72% margin)\n` +
        `• 1× PA System — $250/day (+55% margin)\n\n` +
        `**Package total: ~$3,160/day**\n` +
        `If you bundle the lighting, you could offer a 10% discount and still make 60%+ margin.\n\n` +
        `Want me to generate this as a formal quote?`,
      delay: 1000,
    };
  }

  // Quote
  if (msg.includes("quote") || msg.includes("proposal") || msg.includes("estimate")) {
    return {
      text: `I'll generate a quote! Here's what I need:\n\n` +
        `1. **Client name & email**\n` +
        `2. **Event date(s)**\n` +
        `3. **Guest count**\n` +
        `4. **Items needed** (or say "wedding package" / "corporate package")\n` +
        `5. **Delivery needed?** (adds $75)\n\n` +
        `Or I can pull from an existing lead — just tell me the client name.`,
      delay: 600,
    };
  }

  // Greeting
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg === "help") {
    return {
      text: `Hey Lolita! I'm here to make running your rental business easier. Here's what I can do:\n\n` +
        `• 📦 **Inventory** — Check availability, stock levels\n` +
        `• 📅 **Appointments** — Schedule site visits, consultations\n` +
        `• 💼 **Leads** — Track prospects, draft follow-ups\n` +
        `• 💰 **Sales** — Create quotes, suggest upsells\n` +
        `• 📊 **Reports** — Revenue, order summaries\n\n` +
        `Try the quick actions below, or just ask me anything!`,
      delay: 500,
    };
  }

  // Catch-all
  return {
    text: `I can help with that! Here are some things I'm great at:\n\n` +
      `• "What's available this Saturday?"\n` +
      `• "Schedule a site visit for a client"\n` +
      `• "Which leads need follow-up?"\n` +
      `• "What should I upsell for a 200-guest wedding?"\n` +
      `• "Draft a follow-up email for Sarah"\n` +
      `• "Show me this month's revenue"\n\n` +
      `What would you like to do?`,
    delay: 500,
  };
}

export default function AdminChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hey Lolita! I'm your EventRental assistant. I help you run your rental business smoothly — checking inventory, scheduling site visits, following up on leads, and helping close sales. What can I help with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const response = generateBotResponse(text, messages);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: response.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, response.delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Notification badge (unread count)
  const unreadCount = isOpen ? 0 : 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
          isOpen ? "bg-gray-700 rotate-0" : "bg-indigo-600 animate-bounce-slow"
        }`}
        style={{ animationDuration: isOpen ? "0s" : "2s" }}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[420px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-indigo-600 px-5 py-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 4.235a1.5 1.5 0 01-1.279.765H8.749a1.5 1.5 0 01-1.28-.765L5 14.5m14 0H5" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">EventRental Assistant</h3>
              <p className="text-xs text-indigo-200">Inventory · Appointments · Leads · Sales</p>
            </div>
            <div className="ml-auto flex h-2.5 w-2.5 items-center">
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-indigo-600 text-white"
                      : "rounded-bl-md bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => {
                    // Simple markdown-ish rendering
                    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    const italicLine = boldLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    return (
                      <span key={i}>
                        {line === "---" ? (
                          <hr className="my-2 border-gray-300" />
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: italicLine }} />
                        )}
                        {i < msg.text.split("\n").length - 1 && <br />}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mb-3 flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5 overflow-x-auto border-t bg-gray-50 px-4 py-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.message)}
                className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t px-4 py-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory, leads, appointments..."
              className="flex-1 rounded-full border px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
