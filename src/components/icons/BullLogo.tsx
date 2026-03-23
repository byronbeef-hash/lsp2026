"use client";

interface BullLogoProps {
  className?: string;
  size?: number;
}

export function BullLogo({ className = "", size = 32 }: BullLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left horn */}
      <path
        d="M48 28C44 20 36 10 20 4C18 3 16 4 17 6C22 16 30 24 40 30"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right horn */}
      <path
        d="M52 28C56 20 64 10 80 4C82 3 84 4 83 6C78 16 70 24 60 30"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bull head/nose */}
      <path
        d="M38 35C34 40 32 48 34 56C36 64 42 70 50 72C58 70 64 64 66 56C68 48 66 40 62 35C58 30 52 28 50 28C48 28 42 30 38 35Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Nose ring / nostrils */}
      <path
        d="M42 58C42 54 46 50 50 50C54 50 58 54 58 58C58 62 54 65 50 65C46 65 42 62 42 58Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left signal wave 1 */}
      <path
        d="M26 38C22 44 22 54 26 62"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Left signal wave 2 */}
      <path
        d="M18 34C12 44 12 58 18 68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Right signal wave 1 */}
      <path
        d="M74 38C78 44 78 54 74 62"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Right signal wave 2 */}
      <path
        d="M82 34C88 44 88 58 82 68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
