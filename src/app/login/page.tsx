"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setShowDemo(Boolean(j.demoLogin)))
      .catch(() => setShowDemo(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, display_name: displayName || username }),
    });
    const json = await res.json();
    setBusy(false);
    if (!json.success) {
      setError(json.error || "Could not sign in");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-background px-4 py-8" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
      <form onSubmit={submit} className="w-full max-w-md bg-card border border-line rounded-3xl p-6 md:p-8 flex flex-col gap-4">
        <Link href="/" className="text-amber text-sm font-bold">← RoadTraveler</Link>
        <h1 className="text-2xl font-bold text-white">{mode === "login" ? "Sign in" : "Create account"}</h1>
        {showDemo ? (
          <p className="text-sm text-muted">
            Local demo: <span className="text-white">teertha</span> / <span className="text-white">roadtraveler</span>
          </p>
        ) : (
          <p className="text-sm text-muted">Create an account or sign in with your username.</p>
        )}
        {mode === "signup" && (
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="bg-background border border-line rounded-xl px-4 py-3 text-sm" />
        )}
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="bg-background border border-line rounded-xl px-4 py-3 text-sm" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="bg-background border border-line rounded-xl px-4 py-3 text-sm" required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="bg-amber text-background font-bold rounded-full py-3 disabled:opacity-60">
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sm text-muted hover:text-white">
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
