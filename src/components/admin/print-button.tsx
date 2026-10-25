"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn bg-white py-2 text-sm text-navy">
      Print invoice
    </button>
  );
}
