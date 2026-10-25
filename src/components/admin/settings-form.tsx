"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/types";
import { FormMessage, SubmitButton } from "./ui";

export function SettingsForm({ settings: s }: { settings: StoreSettings }) {
  const [state, action] = useActionState(saveSettings, null);
  return (
    <form action={action} className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Contact &amp; payments</h2>
        <div>
          <label className="label" htmlFor="store_name">Store name</label>
          <input id="store_name" name="store_name" defaultValue={s.store_name} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">WhatsApp number</label>
          <input id="whatsapp" name="whatsapp" defaultValue={s.whatsapp} className="field" placeholder="8801XXXXXXXXX" />
          <p className="mt-1 text-xs text-navy/50">With country code, no + or spaces. Used for every WhatsApp button.</p>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={s.email} className="field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="bkash_number">bKash number</label>
            <input id="bkash_number" name="bkash_number" defaultValue={s.bkash_number} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="nagad_number">Nagad number</label>
            <input id="nagad_number" name="nagad_number" defaultValue={s.nagad_number} className="field" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Delivery</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="delivery_inside_dhaka">Inside Dhaka ৳</label>
            <input id="delivery_inside_dhaka" name="delivery_inside_dhaka" type="number" min={0} defaultValue={s.delivery_inside_dhaka} className="field" />
          </div>
          <div>
            <label className="label" htmlFor="delivery_outside_dhaka">Outside Dhaka ৳</label>
            <input id="delivery_outside_dhaka" name="delivery_outside_dhaka" type="number" min={0} defaultValue={s.delivery_outside_dhaka} className="field" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="free_delivery_over">Free delivery over ৳</label>
          <input id="free_delivery_over" name="free_delivery_over" type="number" min={0} defaultValue={s.free_delivery_over ?? ""} className="field" placeholder="Leave empty to turn off" />
        </div>
        <div>
          <label className="label" htmlFor="announcement">Announcement bar</label>
          <input id="announcement" name="announcement" defaultValue={s.announcement} className="field" placeholder="Leave empty to hide" />
        </div>
      </section>

      <div className="flex items-center gap-4 lg:col-span-2">
        <SubmitButton className="btn btn-primary">Save settings</SubmitButton>
        <div className="flex-1"><FormMessage state={state} /></div>
      </div>
    </form>
  );
}
