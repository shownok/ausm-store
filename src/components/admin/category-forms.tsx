"use client";

import { useActionState, useEffect, useRef } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { CATEGORY_GROUPS } from "@/lib/types";
import { FormMessage, SubmitButton } from "./ui";

function Fields({ c }: { c?: Category }) {
  return (
    <>
      <input name="name" defaultValue={c?.name} placeholder="Name" required className="field" aria-label="Name" />
      <input name="slug" defaultValue={c?.slug} placeholder="slug (auto)" className="field" aria-label="Slug" />
      <select name="group_name" defaultValue={c?.group_name ?? "Fashion"} className="field" aria-label="Group">
        {CATEGORY_GROUPS.map((g) => <option key={g}>{g}</option>)}
      </select>
      <input name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} className="field" aria-label="Sort order" />
      <label className="flex items-center gap-2 whitespace-nowrap text-sm">
        <input type="checkbox" name="active" defaultChecked={c?.active ?? true} className="h-4 w-4 accent-[#25274d]" /> Visible
      </label>
    </>
  );
}

export function NewCategoryForm() {
  const [state, action] = useActionState(saveCategory, null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid items-center gap-2 sm:grid-cols-[2fr_1.5fr_1.5fr_80px_auto]">
        <Fields />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-primary py-2 text-sm">Add category</SubmitButton>
    </form>
  );
}

export function CategoryRow({ category }: { category: Category }) {
  const [state, action] = useActionState(saveCategory, null);
  const [delState, delAction] = useActionState(deleteCategory, null);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <form action={action} className="grid items-center gap-2 sm:grid-cols-[2fr_1.5fr_1.5fr_80px_auto_auto]">
        <input type="hidden" name="id" value={category.id} />
        <Fields c={category} />
        <SubmitButton className="btn btn-dark py-2 text-sm">Save</SubmitButton>
      </form>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex-1"><FormMessage state={state ?? delState} /></div>
        <form action={delAction}>
          <input type="hidden" name="id" value={category.id} />
          <button className="text-xs text-navy/45 hover:text-crimson">Delete</button>
        </form>
      </div>
    </div>
  );
}
