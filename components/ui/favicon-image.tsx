"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getFaviconUrl, getGoogleFaviconUrl } from "@/lib/faviconUtils";

interface FaviconImageProps {
  siteUrl: string;
  siteName: string;
  size?: number;
  className?: string;
}

export function FaviconImage({ siteUrl, siteName, size = 20, className = "" }: FaviconImageProps) {
  const [faviconUrl, setFaviconUrl] = useState<string>("");
  const [fallbackUrl, setFallbackUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!siteUrl) {
      setIsLoading(false);
      return;
    }

    // Primary: DuckDuckGo, Fallback: Google
    const primary = getFaviconUrl(siteUrl);
    const fallback = getGoogleFaviconUrl(siteUrl);
    setFaviconUrl(primary);
    setFallbackUrl(fallback);
    setIsLoading(false);
    setHasError(false);
    setUseFallback(false);
  }, [siteUrl]);

  const handleError = () => {
    if (!useFallback && fallbackUrl) {
      // Try fallback URL (Google)
      setUseFallback(true);
    } else {
      // Both failed, show default icon
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  const currentUrl = useFallback ? fallbackUrl : faviconUrl;

  if (isLoading || !currentUrl || hasError) {
    // 顯示預設圖示
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">🌐</span>
      </div>
    );
  }

  return (
    <Image
      src={currentUrl}
      alt={`${siteName} favicon`}
      width={size}
      height={size}
      className={`rounded-sm ${className}`}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized // 因為是外部圖片，使用 unoptimized
    />
  );
}