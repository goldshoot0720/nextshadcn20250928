"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";

// Dynamically import Plyr to avoid SSR issues
const Plyr = dynamic(
  () => import("plyr-react").then((mod) => mod.Plyr),
  { ssr: false }
);

interface PlyrPlayerProps {
  type: "video" | "audio";
  src: string;
  poster?: string;
  loop?: boolean;
  className?: string;
}

export function PlyrPlayer({ 
  type, 
  src, 
  poster, 
  loop = false,
  className = ""
}: PlyrPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const plyrProps = useMemo(() => ({
    source: {
      type: type,
      sources: [
        {
          src: src,
          ...(type === 'video' && poster ? { poster } : {})
        }
      ]
    },
    options: {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'fullscreen'
      ],
      settings: ['quality', 'speed', 'loop'],
      loop: { active: loop },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true }
    }
  }), [type, src, poster, loop]);

  if (!isMounted) {
    return (
      <div className={className}>
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Plyr {...plyrProps} />
    </div>
  );
}
