export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/45 px-6 py-14 text-center text-sm leading-7 text-[var(--ink-soft)]">
      {message}
    </div>
  );
}
