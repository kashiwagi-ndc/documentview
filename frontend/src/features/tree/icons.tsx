export function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#e2554f" />
      <path d="M15 2v5h5" fill="#c23e39" />
      <text x="5" y="18" fontSize="8" fill="#fff" fontFamily="sans-serif" fontWeight="bold">
        PDF
      </text>
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="1.5" fill="#3a8ac2" />
      <circle cx="8" cy="10" r="2" fill="#ffffff" />
      <path d="m4 18 5-6 4 4 3-3 5 5" stroke="#ffffff" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function OtherFileIcon({ ext }: { ext: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#6b7280" />
      <path d="M15 2v5h5" fill="#4b5563" />
      <text x="3.5" y="18" fontSize="6.5" fill="#fff" fontFamily="sans-serif" fontWeight="bold">
        {ext.slice(0, 4)}
      </text>
    </svg>
  );
}

export function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.12s ease" }}
    >
      <path d="M9 6l6 6-6 6" stroke="#666" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
