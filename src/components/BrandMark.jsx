export default function BrandMark({ size = 24, title = 'Math Motion' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
    >
      <path d="M2.5 20.5 V4.5 L12 9.5 L21.5 4.5 V20.5" strokeWidth="2.6" />
      <path d="M7.5 19 V12.5 L12 15.5 L16.5 12.5 V19" strokeWidth="1.9" opacity="0.72" />
    </svg>
  );
}
