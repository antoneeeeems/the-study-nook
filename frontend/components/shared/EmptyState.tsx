import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Readonly<EmptyStateProps>) {
  return (
    <div className="card p-12 text-center animate-fade-in-up">
      <div className="mb-4 flex justify-center text-[color:var(--color-text-muted)]">{icon}</div>
      <h3 className="mb-1 text-base font-semibold text-[color:var(--color-text)]">{title}</h3>
      <p className="mx-auto mb-4 max-w-sm text-sm text-[color:var(--color-text-muted)]">{description}</p>
      {action}
    </div>
  );
}
