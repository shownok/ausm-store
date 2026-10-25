import type { Metadata } from "next";
import { CategoryRow, NewCategoryForm } from "@/components/admin/category-forms";
import { adminGetCategories } from "@/lib/admin";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await adminGetCategories();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Categories</h1>
      <p className="mt-1 text-sm text-navy/60">Groups control the Shop menu. Lower sort numbers appear first.</p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Add a category</h2>
        <NewCategoryForm />
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
