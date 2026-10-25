import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  return (
    <div className="grid min-h-dvh place-items-center bg-sky px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-navy/10">
        <div className="flex items-center gap-2">
          <Image src="/brand/logo-mark.png" alt="" width={36} height={36} />
          <Image src="/brand/logo-word.png" alt="ausm" width={80} height={20} className="h-5 w-auto" />
          <span className="ml-1 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Sign in</h1>
        {sp.error === "not_admin" && (
          <p className="mt-3 rounded-xl bg-crimson/10 p-3 text-sm text-crimson">
            This account isn&apos;t an admin. Ask the store owner to add you.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
