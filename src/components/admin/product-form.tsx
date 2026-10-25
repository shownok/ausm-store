"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured, PRODUCT_IMAGE_BUCKET } from "@/lib/supabase/config";
import type { Category, Product } from "@/lib/types";
import { FormMessage, SubmitButton } from "./ui";

interface VariantRow {
  id?: string;
  key: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
}

const PRESETS: Record<string, string[]> = {
  "One size": ["Standard"],
  "Clothing S–XXL": ["S", "M", "L", "XL", "XXL"],
  "Waist 28–36": ["28", "30", "32", "34", "36"],
  "Shoes 40–44": ["40", "41", "42", "43", "44"],
  "Phone models": ["iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "Samsung S24", "Samsung A55"],
};

let keyCounter = 0;
const newKey = () => `k${++keyCounter}`;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action] = useActionState(saveProduct, null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          id: v.id,
          key: newKey(),
          name: v.name,
          sku: v.sku ?? "",
          price: v.price?.toString() ?? "",
          stock: v.stock.toString(),
        }))
      : [{ key: newKey(), name: "Standard", sku: "", price: "", stock: "10" }],
  );

  // After saving, attach the database ids to newly added variants
  // (adjusting state during render when the action result changes).
  const [syncedState, setSyncedState] = useState(state);
  if (state !== syncedState) {
    setSyncedState(state);
    const ids = state?.variantIds;
    if (ids) {
      setVariants((prev) =>
        prev.filter((v) => v.name.trim()).map((v) => ({ ...v, id: ids[v.name.trim()] ?? v.id })),
      );
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!isSupabaseConfigured) {
      setUploadError("Demo mode: connect Supabase to upload photos.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const sb = createSupabaseBrowserClient();
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`${file.name} is larger than 5 MB. Compress it first.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) {
        setUploadError(error.message);
        continue;
      }
      uploaded.push(sb.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function applyPreset(names: string[]) {
    setVariants((prev) => {
      const byName = new Map(prev.map((v) => [v.name.toLowerCase(), v]));
      return names.map((n) => byName.get(n.toLowerCase()) ?? { key: newKey(), name: n, sku: "", price: "", stock: "10" });
    });
  }

  const variantsJson = JSON.stringify(
    variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price === "" ? null : Number(v.price),
      stock: Number(v.stock) || 0,
    })),
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={variantsJson} />

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="label" htmlFor="name">Product name *</label>
            <input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="slug">URL</label>
            <div className="flex items-center gap-1 text-sm text-navy/50">
              <span className="shrink-0">ausm.com.bd/product/</span>
              <input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="field"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={6} defaultValue={product?.description} className="field" placeholder="Fabric, fit, care instructions…" />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Photos</h2>
            <span className="text-xs text-navy/50">First photo is the main image · JPG/PNG/WebP up to 5 MB</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((src, i) => (
              <div key={src} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-sky">
                <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold text-white">Main</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-navy/70 p-1 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} className="rounded px-2 hover:bg-white/20" aria-label="Move left">←</button>
                  <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== src))} className="rounded px-2 text-xs hover:bg-white/20">Remove</button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded px-2 hover:bg-white/20" aria-label="Move right">→</button>
                </div>
              </div>
            ))}
            <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-xl border-2 border-dashed border-navy/20 text-center text-sm text-navy/60 hover:border-navy/50">
              <span>{uploading ? "Uploading…" : "+ Add photos"}</span>
              <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          {uploadError && <p className="mt-3 text-sm text-crimson">{uploadError}</p>}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Variants &amp; stock</h2>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRESETS).map(([label, names]) => (
                <button key={label} type="button" onClick={() => applyPreset(names)} className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-navy hover:bg-sky-deep">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-navy/50">Leave price empty to use the product price. Use one “Standard” variant for one-size items.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-navy/50">
                <tr><th className="pb-2">Option</th><th className="pb-2">SKU</th><th className="pb-2">Price ৳</th><th className="pb-2">Stock</th><th /></tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.key}>
                    <td className="py-1 pr-2"><input value={v.name} onChange={(e) => updateVariant(v.key, { name: e.target.value })} className="field py-2" placeholder="e.g. M" /></td>
                    <td className="py-1 pr-2"><input value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value })} className="field py-2" placeholder="optional" /></td>
                    <td className="py-1 pr-2"><input value={v.price} onChange={(e) => updateVariant(v.key, { price: e.target.value })} type="number" min={0} className="field w-24 py-2" placeholder="—" /></td>
                    <td className="py-1 pr-2"><input value={v.stock} onChange={(e) => updateVariant(v.key, { stock: e.target.value })} type="number" min={0} className="field w-20 py-2" /></td>
                    <td className="py-1">
                      <button type="button" onClick={() => setVariants((p) => p.filter((x) => x.key !== v.key))} className="rounded-full p-2 text-navy/40 hover:bg-crimson/10 hover:text-crimson" aria-label={`Remove ${v.name}`}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setVariants((p) => [...p, { key: newKey(), name: "", sku: "", price: "", stock: "0" }])} className="mt-3 text-sm font-semibold text-crimson">
            + Add variant
          </button>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-4 w-4 accent-[#25274d]" /> Live on store
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="h-4 w-4 accent-[#25274d]" /> Featured
            </label>
          </div>
          <div>
            <label className="label" htmlFor="category_id">Category *</label>
            <select id="category_id" name="category_id" required defaultValue={product?.category_id ?? ""} className="field">
              <option value="" disabled>Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.group_name} → {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="price">Price ৳ *</label>
              <input id="price" name="price" type="number" min={0} required defaultValue={product?.price} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="compare_at_price">Compare-at ৳</label>
              <input id="compare_at_price" name="compare_at_price" type="number" min={0} defaultValue={product?.compare_at_price ?? ""} className="field" placeholder="for sales" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="tags">Tags</label>
            <input id="tags" name="tags" defaultValue={product?.tags.join(", ")} className="field" placeholder="new, bestseller" />
            <p className="mt-1 text-xs text-navy/50">“new” and “bestseller” power the homepage and menu.</p>
          </div>
          <FormMessage state={state} />
          <SubmitButton className="btn btn-primary w-full">{product ? "Save changes" : "Create product"}</SubmitButton>
        </section>
      </div>
    </form>
  );
}
