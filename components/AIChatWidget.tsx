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

const MOCK_RESPONSES: Record<string, string> = {
  "what rental packages do you offer?":
    "We offer three curated packages:\n\n• **Essentials** — Tables, chairs, and basic linens starting at $500\n• **Elegance** — Full table settings with premium linens, centerpieces, and chair sashes starting at $1,200\n• **Grand Celebration** — Complete event styling including arches, uplighting, and tabletop decor starting at $2,500\n\nAll packages include delivery, setup, and pickup. Would you like details on any of these?",
  "do you deliver to my area?":
    "We deliver throughout the greater metropolitan area within a 50-mile radius. Delivery fees start at $75 and vary by distance. Just share your event zip code and I can give you an exact quote!",
  "what's your cancellation policy?":
    "We understand plans change! Here's our policy:\n\n• **30+ days before event** — Full refund\n• **15–29 days** — 50% refund\n• **Under 15 days** — No refund, but you can reschedule once\n\nWould you like to proceed with a booking?",
  "i need help choosing items for my event.":
    "I'd love to help! To give you the best recommendations, could you tell me:\n\n1. What type of event? (wedding, birthday, corporate, etc.)\n2. Approximate guest count?\n3. Indoor or outdoor?\n4. Do you have a color scheme or theme in mind?\n\nWith those details, I can suggest the perfect combination of rentals!",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  return "Thanks for your message! I can help with rental availability, pricing, packages, delivery info, and event planning. Feel free to ask, or call our AI assistant at " + AI_PHONE_NUMBER + " for instant help!";
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hi! I'm Lolita's AI assistant. I can help you find the perfect rentals for your event. You can also call our AI voice line at **${AI_PHONE_NUMBER}** anytime.\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
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
                <h3 className="font-heading text-base font-medium text-white">AI Assistant</h3>
                <p className="font-body text-xs text-white/70">Powered by Retell AI</p>
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
                  {msg.text.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                      {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={k}>{part.slice(2, -2)}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
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

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-ivory-dark px-4 py-3">
              {QUICK_REPLIES.map((q) => (
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
