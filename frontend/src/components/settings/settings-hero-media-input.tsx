"use client";

import { ImageIcon, TrashIcon, VideoIcon, XIcon } from "@/components/ui/icons";
import type { HomestaySettings } from "@/lib/api/types";
import { shouldBypassImageOptimization } from "@/lib/image";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroMediaErrors = Record<string, string[]> | undefined;

function ErrorList({ errors }: { errors?: string[] }) {
  const locale = useLocale();
  return errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>);
}

export function SettingsHeroMediaInput({ settings, errors }: { settings: HomestaySettings; errors: HeroMediaErrors }) {
  const locale = useLocale();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"image" | "video">(settings.hero_media_type);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Array<{ name: string; url: string }>>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ name: string; url: string } | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const retainedImages = settings.hero_images.filter((image) => !removedImageIds.has(image.id));
  const availableSlots = Math.max(0, 5 - retainedImages.length);

  useEffect(() => () => {
    selectedImages.forEach((image) => URL.revokeObjectURL(image.url));
    if (selectedVideo) URL.revokeObjectURL(selectedVideo.url);
  }, [selectedImages, selectedVideo]);

  const allImageErrors = useMemo(() => Object.entries(errors ?? {}).filter(([key]) => key === "hero_images" || key.startsWith("hero_images.")).flatMap(([, messages]) => messages), [errors]);

  function selectImages(files: FileList | null) {
    selectedImages.forEach((image) => URL.revokeObjectURL(image.url));
    setClientError(null);
    if (!files?.length) { setSelectedImages([]); return; }
    if (files.length > availableSlots) {
      if (imageInputRef.current) imageInputRef.current.value = "";
      setSelectedImages([]);
      setClientError(localize(locale, `Hanya tersedia ${availableSlots} slot gambar.`, `Only ${availableSlots} image slots remain.`));
      return;
    }
    setSelectedImages(Array.from(files).map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
  }

  function clearSelectedImages() {
    selectedImages.forEach((image) => URL.revokeObjectURL(image.url));
    if (imageInputRef.current) imageInputRef.current.value = "";
    setSelectedImages([]);
    setClientError(null);
  }

  function selectVideo(file?: File) {
    if (selectedVideo) URL.revokeObjectURL(selectedVideo.url);
    setClientError(null);
    if (!file) { setSelectedVideo(null); return; }
    if (file.size > 50 * 1024 * 1024) {
      if (videoInputRef.current) videoInputRef.current.value = "";
      setSelectedVideo(null);
      setClientError(localize(locale, "Ukuran video maksimal 50 MB.", "The video may not exceed 50 MB."));
      return;
    }
    setSelectedVideo({ name: file.name, url: URL.createObjectURL(file) });
    setRemoveVideo(false);
  }

  function clearVideo() {
    if (selectedVideo) URL.revokeObjectURL(selectedVideo.url);
    if (videoInputRef.current) videoInputRef.current.value = "";
    setSelectedVideo(null);
    setRemoveVideo(Boolean(settings.hero_video_url));
  }

  const videoPreview = selectedVideo?.url ?? (removeVideo ? null : settings.hero_video_url);

  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={`cursor-pointer border p-5 transition-colors ${mode === "image" ? "border-secondary bg-secondary-soft" : "bg-surface hover:bg-surface-low"}`}>
        <input type="radio" name="hero_media_type" value="image" checked={mode === "image"} onChange={() => setMode("image")} className="sr-only" />
        <span className="flex items-center gap-3 text-base font-semibold"><ImageIcon className="size-5 text-secondary" />{localize(locale, "Carousel gambar", "Image carousel")}</span>
        <span className="mt-2 block text-sm leading-6 text-muted">{localize(locale, "Gunakan hingga lima gambar yang berganti otomatis.", "Use up to five images that rotate automatically.")}</span>
      </label>
      <label className={`cursor-pointer border p-5 transition-colors ${mode === "video" ? "border-secondary bg-secondary-soft" : "bg-surface hover:bg-surface-low"}`}>
        <input type="radio" name="hero_media_type" value="video" checked={mode === "video"} onChange={() => setMode("video")} className="sr-only" />
        <span className="flex items-center gap-3 text-base font-semibold"><VideoIcon className="size-5 text-secondary" />{localize(locale, "Video tunggal", "Single video")}</span>
        <span className="mt-2 block text-sm leading-6 text-muted">{localize(locale, "Putar satu video pendek secara otomatis tanpa suara.", "Autoplay one short video without sound.")}</span>
      </label>
    </div>
    <ErrorList errors={errors?.hero_media_type} />

    {mode === "image" ? <div className="border-t pt-6">
      {Array.from(removedImageIds).map((id) => <input key={id} type="hidden" name="remove_hero_image_ids[]" value={id} />)}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="font-semibold">{localize(locale, "Gambar hero", "Hero images")}</h3><p className="mt-1 text-sm leading-6 text-muted">{localize(locale, "JPG, PNG, atau WebP hingga 8 MB per gambar. Urutan gambar tersimpan digunakan sebagai urutan carousel.", "JPG, PNG, or WebP up to 8 MB each. Saved order becomes the carousel order.")}</p></div><p className="shrink-0 text-sm font-semibold text-secondary">{retainedImages.length + selectedImages.length}/5</p></div>
      {(retainedImages.length > 0 || selectedImages.length > 0) && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {retainedImages.map((image, index) => <div key={image.id} className="group relative aspect-[4/3] overflow-hidden bg-surface-high"><Image src={image.url} alt={`${localize(locale, "Gambar hero", "Hero image")} ${index + 1}`} fill sizes="180px" unoptimized={shouldBypassImageOptimization(image.url)} className="object-cover" /><button type="button" onClick={() => setRemovedImageIds((current) => new Set(current).add(image.id))} aria-label={localize(locale, "Hapus gambar", "Remove image")} className="absolute top-2 right-2 grid size-9 place-items-center bg-primary text-white shadow-sm"><TrashIcon className="size-4" /></button><span className="absolute bottom-2 left-2 bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">{index + 1}</span></div>)}
        {selectedImages.map((image, index) => <div key={image.url} className="relative aspect-[4/3] overflow-hidden bg-surface-high"><Image src={image.url} alt={image.name} fill sizes="180px" unoptimized className="object-cover" /><span className="absolute bottom-2 left-2 bg-secondary px-2 py-1 text-[11px] font-semibold text-white">{localize(locale, "Baru", "New")} {index + 1}</span></div>)}
      </div>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className={`inline-flex min-h-11 items-center border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-high ${availableSlots === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}><span>{localize(locale, "Pilih gambar", "Choose images")}</span><input ref={imageInputRef} name="hero_images[]" type="file" multiple disabled={availableSlots === 0} accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectImages(event.target.files)} /></label>
        {selectedImages.length > 0 && <button type="button" onClick={clearSelectedImages} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-muted hover:text-foreground"><XIcon className="size-4" />{localize(locale, "Batalkan pilihan", "Clear selection")}</button>}
      </div>
      <label className="mt-6 block max-w-xs text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Interval pergantian", "Rotation interval")}<select name="hero_cycle_seconds" defaultValue={settings.hero_cycle_seconds} className="mt-2 h-12 w-full border bg-surface px-4 text-sm font-normal tracking-normal text-foreground normal-case">{[4, 6, 8, 10].map((seconds) => <option key={seconds} value={seconds}>{seconds} {localize(locale, "detik", "seconds")}</option>)}</select></label>
      {clientError && <p className="mt-3 text-sm text-danger">{clientError}</p>}<ErrorList errors={allImageErrors} />
    </div> : <div className="border-t pt-6">
      <input type="hidden" name="remove_hero_video" value={removeVideo ? "1" : "0"} />
      <h3 className="font-semibold">{localize(locale, "Video hero", "Hero video")}</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{localize(locale, "Gunakan MP4 atau WebM hingga 50 MB. Video akan diputar otomatis tanpa suara, berulang, dan memenuhi area hero.", "Use an MP4 or WebM up to 50 MB. It will autoplay muted, loop, and fill the hero area.")}</p>
      {videoPreview && <div className="relative mt-5 aspect-video max-w-2xl overflow-hidden bg-black"><video src={videoPreview} controls muted playsInline className="size-full object-cover" /><button type="button" onClick={clearVideo} className="absolute top-3 right-3 inline-flex min-h-10 items-center gap-2 bg-primary px-3 text-xs font-semibold text-white"><TrashIcon className="size-4" />{localize(locale, "Hapus", "Remove")}</button></div>}
      <div className="mt-5 flex items-center gap-3"><label className="inline-flex min-h-11 cursor-pointer items-center border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-high"><span>{videoPreview ? localize(locale, "Ganti video", "Replace video") : localize(locale, "Pilih video", "Choose video")}</span><input ref={videoInputRef} name="hero_video" type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(event) => selectVideo(event.target.files?.[0])} /></label>{selectedVideo && <span className="max-w-sm truncate text-sm text-muted">{selectedVideo.name}</span>}</div>
      {clientError && <p className="mt-3 text-sm text-danger">{clientError}</p>}<ErrorList errors={errors?.hero_video} />
    </div>}
  </div>;
}
