"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Account created! Check your email to confirm.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="mb-8 text-center">
        <p className="mb-2 font-body text-sm uppercase tracking-[0.2em] text-champagne">
          Lolita Harris Event Rentals
        </p>
        <h1 className="text-3xl font-light text-charcoal">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border border-ivory-dark bg-white p-6">
        {isSignUp && (
          <div>
            <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
              required
            />
          </div>
        )}
        <div>
          <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-champagne py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark disabled:opacity-40"
        >
          {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-sm text-warm-gray">
        {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-medium text-champagne hover:text-champagne-dark"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
