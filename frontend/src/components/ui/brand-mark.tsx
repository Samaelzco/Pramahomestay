"use client";

import { HomeIcon } from "@/components/ui/icons";
import { shouldBypassImageOptimization } from "@/lib/image";
import Image from "next/image";
import { useState } from "react";

type BrandMarkProps = {
  logoUrl?: string | null;
  propertyName: string;
  className?: string;
  fallbackClassName?: string;
  iconClassName?: string;
};

export function BrandMark({
  logoUrl,
  propertyName,
  className = "size-10",
  fallbackClassName = "bg-primary text-background",
  iconClassName = "size-5",
}: BrandMarkProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showLogo = Boolean(logoUrl) && failedUrl !== logoUrl;

  return (
    <span data-has-logo={showLogo || undefined} className={`relative grid shrink-0 place-items-center ${className}`}>
      {showLogo ? (
        <Image
          src={logoUrl!}
          alt={`${propertyName} logo`}
          fill
          sizes="48px"
          unoptimized={shouldBypassImageOptimization(logoUrl!)}
          className="object-contain"
          onError={() => setFailedUrl(logoUrl!)}
        />
      ) : (
        <span className={`absolute inset-0 grid place-items-center rounded-sm ${fallbackClassName}`}><HomeIcon aria-hidden="true" className={iconClassName} /></span>
      )}
    </span>
  );
}
