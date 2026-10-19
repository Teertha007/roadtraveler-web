"use client";

import React, { useEffect, useState } from "react";
import { X, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle?: string;
  postAuthor?: string;
  postId?: string | number;
}

export default function CommentsModal({ isOpen, onClose, postTitle, postAuthor, postId }: CommentsModalProps) {
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; author: string; initial: string; color: string; text: string; time: string }[]>([]);

  useEffect(() => {
    if (!isOpen || !postId) return;
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setComments(json.data); })
      .catch(() => setComments([]));
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleAddComment = async () => {
    if (!commentText.trim() || !postId) return;
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    const json = await res.json();
    if (!json.success) {
      showToast(json.error || "Sign in to comment", "error");
      return;
    }
    setComments([...comments, json.data]);
    setCommentText("");
    showToast("Comment posted");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber" />
              <h3 className="font-bold text-base text-white">Post Discussion</h3>
            </div>
            {postTitle && (
              <p className="text-xs text-muted truncate max-w-sm mt-0.5">
                {postTitle} · by {postAuthor}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-2xl bg-background/50 border border-line/50">
              <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                {c.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{c.author}</span>
                  <span className="text-[10px] text-muted">{c.time}</span>
                </div>
                <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Input */}
        <div className="p-4 border-t border-line bg-background/50 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Write a helpful reply..."
            className="flex-1 bg-card border border-line rounded-full px-4 py-2.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-amber"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className="p-2.5 bg-amber text-background rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
