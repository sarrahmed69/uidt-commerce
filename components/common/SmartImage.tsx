"use client";
import Image from "next/image";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function SmartImage({
  src, alt, className = "", priority = false, fill = false, width = 400, height = 400
}: SmartImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-300 ${className}`} style={fill ? {} : { width, height }}>
        <span className="text-2xl font-bold">{alt?.[0]?.toUpperCase() ?? "?"}</span>
      </div>
    );
  }

  // Supabase storage + autres URLs externes
  const isExternal = src.startsWith("http");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        priority={priority}
        unoptimized={isExternal}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={isExternal}
      onError={() => setError(true)}
    />
  );
}