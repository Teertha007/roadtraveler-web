"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Upload, Check, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ClaimListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingName?: string;
}

export default function ClaimListingModal({ isOpen, onClose, listingName = "Zion River Resort RV Park" }: ClaimListingModalProps) {
  const { showToast } = useToast();
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Owner / General Manager");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessEmail.trim()) {
      showToast("Please provide your business email", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Claim submitted! Our admin team reviews within 24-48 hours.");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-line rounded-3xl max-w-lg w-full shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-base text-white">Claim Business Listing</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <div className="p-3 bg-background border border-line rounded-xl mb-4">
            <span className="text-[10px] text-amber font-bold uppercase tracking-wider block">Target Listing</span>
            <h4 className="text-sm font-bold text-white">{listingName}</h4>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Verify ownership to manage amenities, update opening dates, respond to reviews, and unlock the <strong>Verified Owner</strong> badge.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-white block mb-1">Business Email Address</label>
            <input 
              type="email"
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="e.g. info@zionriverresort.com"
              className="w-full bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">Direct Phone Number</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(435) 555-0192"
              className="w-full bg-background border border-line rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">Proof of Ownership (Utility Bill, Business License, or Domain Email)</label>
            <div 
              onClick={() => {
                setProofUploaded(true);
                showToast("Proof document attached: business_license.pdf");
              }}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                proofUploaded 
                  ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]" 
                  : "border-line bg-background/50 hover:border-amber text-muted hover:text-white"
              }`}
            >
              {proofUploaded ? (
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Check className="w-4 h-4" /> Proof Document Attached
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-amber" />
                  <span className="text-xs font-medium">Click to upload PDF or image proof</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber text-background rounded-xl text-xs font-bold hover:bg-amber/90 transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? "Submitting..." : "Submit Claim Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
