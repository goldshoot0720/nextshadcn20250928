"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";

// Dynamically import Plyr to avoid SSR issues
const Plyr = dynamic(
  () => import("plyr-react").then((mod) => mod.Plyr),
  { ssr: false }
);

// 全域單一播放管理：當一個媒體開始播放時，暂停所有其他媒體
const setupSinglePlayback = () => {
  if (typeof window === 'undefined') return;
  
  // 避免重複設置
  if ((window as any).__singlePlaybackSetup) return;
  (window as any).__singlePlaybackSetup = true;
  
  document.addEventListener('play', (e) => {
    const target = e.target as HTMLMediaElement;
    if (target.tagName === 'AUDIO' || target.tagName === 'VIDEO') {
      // 暂停所有其他的 audio 和 video 元素
      const allMedia = document.querySelectorAll('audio, video');
      allMedia.forEach((media) => {
        if (media !== target && !(media as HTMLMediaElement).paused) {
          (media as HTMLMediaElement).pause();
        }
      });
    }
  }, true);
};

interface PlyrPlayerProps {
  type: "video" | "audio";
  src: string;
  poster?: string;
  loop?: boolean;
  autoplay?: boolean;
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
  autoplay = false,
  className = "",
  tracks = []
}: PlyrPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // 設置全域單一播放
    setupSinglePlayback();
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
      autoplay: autoplay,
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true }
    }
  }), [type, src, poster, loop, autoplay, tracks]);

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

  return (
    <div className={className}>
      <Plyr {...plyrProps} />
    </div>
  );
}
