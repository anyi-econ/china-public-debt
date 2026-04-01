"use client";

import { Search } from "lucide-react";

export function SearchFilter({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="filter-shell relative block rounded-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-transparent px-11 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]/75"
      />
    </label>
  );
}
