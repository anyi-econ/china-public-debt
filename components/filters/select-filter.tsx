"use client";

export function SelectFilter({ value, onChange, options, allLabel = "全部" }: { value: string; onChange: (value: string) => void; options: string[]; allLabel?: string }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-line bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-white"
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}
