"use client";

import React, { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ReviewModal({
  place,
  onClose,
}: {
  place: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [reviews, setReviews] = useState<{ id: string; author: string; rating: number; content: string; time: string }[]>([]);

  useEffect(() => {
    if (!place) return;
    fetch(`/api/reviews?place_id=${place.id}`)
      .then((r) => r.json())
      .then((json) => setReviews(json.success ? json.data : []))
      .catch(() => setReviews([]));
  }, [place]);

  if (!place) return null;

  const submit = async () => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place_id: place.id, rating, content }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || "Sign in to review", "error");
      return;
    }
    showToast("Review saved");
    setContent("");
    const again = await fetch(`/api/reviews?place_id=${place.id}`).then((r) => r.json());
    if (again.success) setReviews(again.data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-line rounded-3xl max-w-lg w-full p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">Reviews · {place.name}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted" /></button>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`w-5 h-5 ${n <= rating ? "fill-amber text-amber" : "text-muted"}`} />
            </button>
          ))}
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What should the next traveler know?" className="bg-background border border-line rounded-xl p-3 text-sm min-h-24" />
        <button onClick={submit} className="bg-amber text-background font-bold rounded-full py-2.5">Save review</button>
        <div className="max-h-56 overflow-y-auto flex flex-col gap-3">
          {reviews.length === 0 && <p className="text-xs text-muted">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border border-line rounded-xl p-3">
              <div className="text-xs font-bold text-white">{r.author} · {r.rating}★ · {r.time}</div>
              <p className="text-xs text-muted mt-1">{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
