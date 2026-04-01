"use client";

import { Search } from "lucide-react";

export function SearchFilter({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white/90 px-10 py-2.5 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-accent focus:bg-white"
      />
    </label>
  );
}
