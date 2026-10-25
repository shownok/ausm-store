import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { adminGetCategories } from "@/lib/admin";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await adminGetCategories();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-navy/60 hover:text-crimson">← Products</Link>
      <h1 className="mb-6 mt-1 text-2xl font-semibold">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
