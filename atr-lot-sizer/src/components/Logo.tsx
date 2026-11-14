export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className}>
      <rect width="512" height="512" rx="112" fill="#0a0f16" />
      <circle cx="256" cy="256" r="130" fill="none" stroke="#3dd6c6" strokeWidth="30" />
      <circle cx="256" cy="256" r="46" fill="#3dd6c6" />
      <path d="M256 70v60M256 382v60M70 256h60M382 256h60" stroke="#3dd6c6" strokeWidth="30" strokeLinecap="round" />
    </svg>
  );
}
