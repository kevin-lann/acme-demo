"use client";

import { useState } from "react";

type Image = { src: string; alt: string };

export function Gallery({ images }: { images: Image[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="space-y-3" data-testid="gallery">
      <div className="card relative overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: generated SVG */}
        <img src={current.src} alt={current.alt} className="aspect-square w-full object-cover" data-testid="gallery-main" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="btn-secondary absolute top-1/2 left-3 -translate-y-1/2 rounded-full px-3"
              data-testid="gallery-prev"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="btn-secondary absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-3"
              data-testid="gallery-next"
            >
              ›
            </button>
          </>
        )}
        <span
          className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
          data-testid="gallery-position"
        >
          {index + 1} / {images.length}
        </span>
      </div>
      <div className="flex gap-2" role="tablist" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`overflow-hidden rounded-lg border-2 ${i === index ? "border-brand-600" : "border-transparent"}`}
            data-testid={`gallery-thumb-${i}`}
          >
            {/* biome-ignore lint/performance/noImgElement: generated SVG */}
            <img src={img.src} alt="" className="h-16 w-16 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
