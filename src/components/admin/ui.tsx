"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";

export function SubmitButton({ children, className = "btn btn-dark", pendingText = "Saving…" }: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-xl bg-crimson/10 px-3 py-2 text-sm font-medium text-crimson" role="alert">{state.error}</p>;
  if (state.message) return <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800" role="status">{state.message}</p>;
  return null;
}
