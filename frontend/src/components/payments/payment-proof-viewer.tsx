"use client";

import { ExpandIcon, XIcon } from "@/components/ui/icons";
import { localize, useLocale } from "@/lib/locale";
import Image from "next/image";
import { useRef } from "react";

export function PaymentProofViewer({
  src,
  alt,
  className = "mt-5 aspect-[16/9] w-full max-w-2xl",
  sizes = "(max-width: 768px) 100vw, 672px",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={`group relative block min-w-0 max-w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-high text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized
          className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
        />
        <span className="absolute right-3 bottom-3 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary/90 px-3.5 text-xs font-semibold text-white shadow-[0_12px_32px_-18px_rgba(0,0,0,.8)] backdrop-blur-sm transition-colors group-hover:bg-primary">
          <ExpandIcon className="size-4" />
          {localize(locale, "Lihat layar penuh", "View fullscreen")}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={localize(locale, "Pratinjau bukti pembayaran", "Payment receipt preview")}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-[#0b0d0d] p-0 text-white backdrop:bg-black/90"
      >
        <div className="flex h-full min-h-0 flex-col px-4 py-3 sm:px-6 sm:py-5">
          <div className="flex shrink-0 items-center justify-between gap-4 pb-3 sm:pb-4">
            <p className="min-w-0 truncate text-sm font-semibold text-white/80">{alt}</p>
            <button
              type="button"
              onClick={close}
              aria-label={localize(locale, "Tutup pratinjau", "Close preview")}
              className="grid size-11 shrink-0 place-items-center rounded-sm border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <XIcon className="size-5" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              unoptimized
              className="object-contain"
            />
          </div>
          <p className="shrink-0 pt-3 text-center text-xs text-white/60 sm:pt-4">
            {localize(locale, "Tekan Esc untuk menutup", "Press Esc to close")}
          </p>
        </div>
      </dialog>
    </>
  );
}
