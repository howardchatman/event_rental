"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import CartDrawer from "./CartDrawer";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.role === "admin");
          });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setIsAdmin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          scrolled
            ? "border-ivory-dark bg-ivory/95 backdrop-blur-md shadow-sm"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className={`font-heading text-xl tracking-wide transition-colors duration-300 ${
              scrolled ? "text-charcoal" : "text-white"
            }`}
          >
            Lolita Harris
            <span className="ml-1 hidden font-body text-xs font-light uppercase tracking-[0.15em] sm:inline">
              {" "}
              Event Rentals
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/products"
              className={`font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
                scrolled
                  ? "text-charcoal-light hover:text-champagne"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Collection
            </Link>

            <Link
              href="/demo"
              className={`font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
                scrolled
                  ? "text-champagne hover:text-champagne-dark"
                  : "text-champagne-light hover:text-white"
              }`}
            >
              Demo
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
                  scrolled
                    ? "text-charcoal-light hover:text-champagne"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}

            {user && (
              <Link
                href="/account"
                className={`font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
                  scrolled
                    ? "text-charcoal-light hover:text-champagne"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Account
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className={`relative transition-colors duration-300 ${
                scrolled
                  ? "text-charcoal-light hover:text-champagne"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className={`font-body text-sm font-medium transition-colors duration-300 ${
                  scrolled
                    ? "text-charcoal-light hover:text-champagne"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="border border-champagne bg-champagne/90 px-5 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-champagne"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
