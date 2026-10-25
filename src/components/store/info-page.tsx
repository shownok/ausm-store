export function InfoPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {eyebrow && <p className="font-brush text-3xl text-crimson">{eyebrow}</p>}
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-navy/80 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_a]:text-crimson [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
