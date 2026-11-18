// One stroke icon set, drawn for this demo (DESIGN.md: one consistent stroke and weight).
type P = { className?: string };

export function CheckIcon({ className = "ic" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function DiamondIcon({ className = "ic f" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l9 9-9 9-9-9z" />
    </svg>
  );
}

export function CloseIcon({ className = "ic" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function DownloadIcon({ className = "ic" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11m-5-5l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function PlusIcon({ className = "ic" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PlayIcon({ className = "ic f" }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" style={{ width: 13, height: 13 }}>
      <path d="M7 4l13 8-13 8z" />
    </svg>
  );
}

export function BackIcon({ className = "back" }: P) {
  return (
    <svg className={className} width="11" height="18" viewBox="0 0 11 18" aria-hidden="true">
      <path d="M9 1L2 9l7 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo B · Tally: four ink strokes, one plum slash. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M9 8v16M13.5 8v16M18 8v16M22.5 8v16" stroke="var(--ink)" strokeWidth="2.4" fill="none" />
      <path d="M6 21 26 11" stroke="var(--accent)" strokeWidth="2.8" fill="none" />
    </svg>
  );
}
