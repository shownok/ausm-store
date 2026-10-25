import Image from "next/image";

const PALETTES = [
  { bg: "#ddf1fc", shape: "#25274d", text: "#da004f" },
  { bg: "#25274d", shape: "#da004f", text: "#ddf1fc" },
  { bg: "#f6e6ec", shape: "#da004f", text: "#25274d" },
  { bg: "#e9eaf3", shape: "#3a3d6b", text: "#da004f" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Shows the first product photo, or a branded placeholder tile when the
 * product has no photos yet (all demo products).
 */
export function ProductVisual({
  name,
  image,
  label,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  className = "",
}: {
  name: string;
  image?: string | null;
  label?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-sky ${className}`}>
        <Image src={image} alt={name} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const h = hash(name);
  const p = PALETTES[h % PALETTES.length];
  const initials = name
    .split(/\s+/)
    .filter((w) => /[a-z]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: p.bg }}
      role="img"
      aria-label={`${name} (placeholder image)`}
    >
      <div
        className="absolute inset-y-0 right-0 w-[46%]"
        style={{ background: p.shape, clipPath: "polygon(38% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.92 }}
      />
      <div className="absolute inset-0 grain opacity-60" />
      <span
        className="absolute left-[10%] top-1/2 -translate-y-1/2 font-brush leading-none"
        style={{ color: p.text, fontSize: "clamp(3rem, 9vw, 6.5rem)" }}
      >
        {initials}
      </span>
      {label && (
        <span
          className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy"
        >
          {label}
        </span>
      )}
      <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white">
        Photo soon
      </span>
    </div>
  );
}
