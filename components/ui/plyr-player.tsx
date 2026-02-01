"use client";

import { useMemo, useEffect, useState, useRef } from "react";
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
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect video aspect ratio
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const ratio = width / height;
        
        if (ratio > 1.2) {
          setAspectRatio('landscape'); // Wide video
        } else if (ratio < 0.8) {
          setAspectRatio('portrait'); // Vertical video
        } else {
          setAspectRatio('square');
        }
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [type, src]);

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
            ref={videoRef}
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

  // Apply styling based on aspect ratio
  const containerClass = type === 'video' 
    ? aspectRatio === 'portrait' 
      ? 'max-w-md mx-auto' // Vertical video: narrower container, centered
      : aspectRatio === 'square'
      ? 'max-w-2xl mx-auto' // Square video: medium container, centered
      : 'w-full' // Landscape video: full width
    : '';

  return (
    <div className={`${className} ${containerClass}`}>
      <Plyr {...plyrProps} />
    </div>
  );
}
