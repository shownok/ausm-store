"use client";

import { useActionState } from "react";
import { updateOrder } from "@/app/admin/actions";
import type { Order } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";
import { FormMessage, SubmitButton } from "./ui";

const HELP: Record<string, string> = {
  pending: "New order, not yet confirmed with the customer.",
  confirmed: "Customer confirmed by phone/WhatsApp. Ready to pack.",
  shipped: "Handed to the courier.",
  delivered: "Customer received it (COD collected).",
  cancelled: "Cancelled. Items go back into stock automatically.",
  returned: "Returned by the customer. Items go back into stock automatically.",
};

export function OrderForm({ order }: { order: Order }) {
  const [state, action] = useActionState(updateOrder, null);
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <input type="hidden" name="id" value={order.id} />
      <h2 className="font-semibold">Update order</h2>
      <fieldset className="space-y-2">
        <legend className="label">Status</legend>
        {ORDER_STATUSES.map((s) => (
          <label key={s} className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 p-3 has-[:checked]:border-navy has-[:checked]:bg-sky/60">
            <input type="radio" name="status" value={s} defaultChecked={order.status === s} className="mt-1 accent-[#25274d]" />
            <span>
              <span className="block text-sm font-semibold capitalize">{s}</span>
              <span className="text-xs text-navy/55">{HELP[s]}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div>
        <label className="label" htmlFor="admin_note">Internal note</label>
        <textarea id="admin_note" name="admin_note" rows={3} defaultValue={order.admin_note ?? ""} className="field" placeholder="Courier tracking number, call notes…" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-dark w-full">Save</SubmitButton>
    </form>
  );
}
