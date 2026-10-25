import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · ausm admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-[#f3f4f8] print:bg-white lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-navy text-white print:hidden lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="rounded-lg bg-sky p-1"><Image src="/brand/logo-mark.png" alt="" width={26} height={26} /></div>
          <span className="text-lg font-semibold">ausm</span>
          <span className="rounded-full bg-crimson px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-white/10 px-5 py-3 text-sm lg:py-5">
          <p className="truncate text-white/60">{admin.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/" target="_blank" className="text-sky hover:underline">View store ↗</Link>
            <form action={signOut}><button className="text-white/70 hover:text-white">Sign out</button></form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {admin.demo && (
          <div className="bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-amber-950 print:hidden">
            Demo mode: viewing placeholder data. Connect Supabase to log in and save changes.
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
