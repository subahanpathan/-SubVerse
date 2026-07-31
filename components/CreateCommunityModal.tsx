"use client";

import { Flame, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
}: CreateCommunityModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create Subverse");
      }

      onClose();
      setName("");
      setDescription("");
      router.push(`/r/${data.name}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1A1A1B] border border-[#343536] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-[#272729]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand/10 p-2.5 rounded-full">
            <Flame className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create a Subverse</h2>
            <p className="text-xs text-zinc-400">
              Build a space for your community and topics.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Subverse Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                r/
              </span>
              <input
                type="text"
                required
                maxLength={21}
                placeholder="technology"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, "_"))}
                className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 pl-8 pr-3 py-2.5 rounded-xl border border-[#343536] focus:border-brand focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Max 21 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="What is this subverse about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#272729] text-sm text-white placeholder-zinc-500 p-3 rounded-xl border border-[#343536] focus:border-brand focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-4 py-2.5 rounded-full hover:bg-[#272729]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Subverse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
