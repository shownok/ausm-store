"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductVisual } from "./product-visual";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <ProductVisual name={name} priority sizes="(min-width:1024px) 55vw, 100vw" className="aspect-[4/5] w-full rounded-3xl" />;
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`relative h-20 w-16 overflow-hidden rounded-xl border-2 ${i === active ? "border-crimson" : "border-transparent"}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <ProductVisual
        name={name}
        image={images[active]}
        priority
        sizes="(min-width:1024px) 55vw, 100vw"
        className="aspect-[4/5] flex-1 rounded-3xl"
      />
    </div>
  );
}
