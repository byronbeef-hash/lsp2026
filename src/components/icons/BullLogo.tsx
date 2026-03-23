"use client";

interface BullLogoProps {
  className?: string;
  size?: number;
}

export function BullLogo({ className = "", size = 32 }: BullLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-white.png"
      alt="AgriEID"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
