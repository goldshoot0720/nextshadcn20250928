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
  tracks?: Array<{
    kind: 'captions' | 'subtitles';
    label: string;
    srclang: string;
    src: string;
    default?: boolean;
  }>;
}

export function PlyrPlayer({ 
  type, 
  src, 
  poster, 
  loop = false,
  className = "",
  tracks = []
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
      ],
      ...(tracks.length > 0 ? { tracks } : {})
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
        'captions',
        'settings',
        'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed', 'loop'],
      captions: { active: true, update: true, language: 'auto' },
      loop: { active: loop },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true }
    }
  }), [type, src, poster, loop, tracks]);

  if (!isMounted) {
    return (
      <div className={className}>
        {type === 'video' ? (
          <video 
            controls 
            poster={poster}
            className="w-full rounded-lg"
          >
            <source src={src} />
          </video>
        ) : (
          <audio controls className="w-full">
            <source src={src} />
          </audio>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Plyr {...plyrProps} />
    </div>
  );
}
