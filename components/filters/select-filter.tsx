"use client";

export function SelectFilter({
  value,
  onChange,
  options,
  allLabel = "全部"
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="filter-shell">
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
