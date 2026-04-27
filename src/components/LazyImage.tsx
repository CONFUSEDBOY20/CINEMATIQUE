import React, { useRef, useState, useEffect, memo } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g. 'aspect-[2/3]'
}

export const LazyImage = memo(({ src, alt, className = '' }: LazyImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' } // start loading 200px before visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={inView ? (error ? '/placeholder-poster.svg' : src) : undefined}
      alt={alt}
      className={`${className} transition-all duration-700 ease-out ${loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`}
      onLoad={() => setLoaded(true)}
      onError={() => { setError(true); setLoaded(true); }}
      decoding="async"
      loading="lazy"
    />
  );
});
