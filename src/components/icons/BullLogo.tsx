"use client";

import Image from "next/image";

interface BullLogoProps {
  className?: string;
  size?: number;
}

export function BullLogo({ className = "", size = 32 }: BullLogoProps) {
  return (
    <Image
      src="/logo-white.png"
      alt="AgriEID"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}
