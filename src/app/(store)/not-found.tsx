import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-brush text-6xl text-crimson">Oops</p>
      <h1 className="mt-2 text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <Link href="/shop" className="btn btn-dark mt-6">Go to the shop</Link>
    </div>
  );
}
