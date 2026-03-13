export default function LoadingSpinner({ text = "Loading..." }: Readonly<{ text?: string }>) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[color:var(--color-text-muted)]" role="status" aria-live="polite">
      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--color-border)] border-t-[color:var(--color-text)]" aria-hidden="true" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
