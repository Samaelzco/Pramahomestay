"use client";

import { ArrowLeftIcon, ArrowRightIcon, ExpandIcon, ImageIcon, XIcon } from "@/components/ui/icons";
import { localize, type Locale } from "@/lib/locale";
import { shouldBypassImageOptimization } from "@/lib/image";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GalleryImage = { id: number; url: string };

export function RoomDetailGallery({ images, roomName, locale }: { images: GalleryImage[]; roomName: string; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const visibleImages = images.slice(0, 3);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? null : (current + 1) % images.length);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return <div className="grid min-h-[24rem] place-items-center bg-surface-low text-center sm:min-h-[32rem]">
      <div><ImageIcon className="mx-auto size-10 text-secondary" /><p className="mt-4 font-semibold">{localize(locale, "Foto kamar belum tersedia", "Room photos are not available yet")}</p></div>
    </div>;
  }

  return <>
    <section aria-label={localize(locale, `Galeri ${roomName}`, `${roomName} gallery`)} className={`relative grid gap-2 overflow-hidden rounded-lg bg-surface-high sm:grid-cols-2 sm:gap-3 lg:h-[34rem] lg:grid-cols-12 lg:grid-rows-2 ${visibleImages.length === 1 ? "lg:block" : ""}`}>
      {visibleImages.map((image, index) => {
        const remaining = images.length - visibleImages.length;
        return <button key={image.id} type="button" onClick={() => setActiveIndex(index)} className={`group relative aspect-[4/3] overflow-hidden bg-surface-high text-left sm:aspect-[4/3] ${index === 0 ? "sm:col-span-2 sm:aspect-[16/9] lg:col-span-8 lg:row-span-2 lg:aspect-auto" : `hidden sm:block lg:col-span-4 lg:aspect-auto ${visibleImages.length === 2 ? "sm:col-span-2 lg:col-span-4 lg:row-span-2" : ""}`} ${visibleImages.length === 1 ? "h-full w-full" : ""}`} aria-label={localize(locale, `Buka foto ${index + 1}`, `Open photo ${index + 1}`)}>
          <Image src={image.url} alt={`${roomName} · ${index + 1}`} fill priority={index === 0} sizes={index === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 34vw, 50vw"} unoptimized={shouldBypassImageOptimization(image.url)} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          {index === visibleImages.length - 1 && remaining > 0 && <span className="absolute right-4 bottom-4 bg-black/70 px-4 py-2 text-sm font-bold text-white">+{remaining} {localize(locale, "foto", "photos")}</span>}
        </button>;
      })}
      <button type="button" onClick={() => setActiveIndex(0)} className="absolute right-4 bottom-4 flex min-h-11 items-center gap-2 rounded-sm bg-background/95 px-4 text-sm font-bold text-foreground shadow-[0_18px_44px_-24px_rgba(0,0,0,0.65)] transition-transform hover:-translate-y-0.5 sm:right-5 sm:bottom-5"><ExpandIcon className="size-4" />{localize(locale, `Lihat ${images.length} foto`, `View ${images.length} photos`)}</button>
    </section>

    {activeIndex !== null && <div role="dialog" aria-modal="true" aria-label={localize(locale, `Foto ${roomName}`, `${roomName} photos`)} className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4 text-white sm:p-8">
      <button ref={closeButtonRef} type="button" onClick={() => setActiveIndex(null)} className="absolute top-4 right-4 z-10 grid size-12 place-items-center border border-white/25 bg-black/40 sm:top-6 sm:right-6" aria-label={localize(locale, "Tutup galeri", "Close gallery")}><XIcon className="size-5" /></button>
      <div className="relative h-[min(78vh,60rem)] w-full max-w-[92rem]"><Image src={images[activeIndex].url} alt={`${roomName} · ${activeIndex + 1}`} fill sizes="100vw" unoptimized={shouldBypassImageOptimization(images[activeIndex].url)} className="object-contain" priority /></div>
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tabular-nums text-white/70">{activeIndex + 1} / {images.length}</p>
      {images.length > 1 && <>
        <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} className="absolute bottom-4 left-4 grid size-12 place-items-center border border-white/25 bg-black/40 sm:top-1/2 sm:bottom-auto sm:left-6 sm:-translate-y-1/2" aria-label={localize(locale, "Foto sebelumnya", "Previous photo")}><ArrowLeftIcon className="size-5" /></button>
        <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} className="absolute right-4 bottom-4 grid size-12 place-items-center border border-white/25 bg-black/40 sm:top-1/2 sm:right-6 sm:bottom-auto sm:-translate-y-1/2" aria-label={localize(locale, "Foto berikutnya", "Next photo")}><ArrowRightIcon className="size-5" /></button>
      </>}
    </div>}
  </>;
}
