import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Store settings</h1>
      <p className="mt-1 text-sm text-navy/60">Changes go live on the store immediately.</p>
      <SettingsForm settings={settings} />
    </div>
  );
}
