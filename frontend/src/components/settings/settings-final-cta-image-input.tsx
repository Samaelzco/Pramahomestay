"use client";

import { ImageIcon, TrashIcon } from "@/components/ui/icons";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function SettingsFinalCtaImageInput({ currentImageUrl, errors }: { currentImageUrl?: string | null; errors?: string[] }) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const previewUrl = selectedUrl ?? (removeCurrent ? null : currentImageUrl);

  useEffect(() => () => { if (selectedUrl) URL.revokeObjectURL(selectedUrl); }, [selectedUrl]);

  function selectImage(file?: File) {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (!file) { setSelectedUrl(null); setFileName(null); return; }
    setSelectedUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setRemoveCurrent(false);
  }

  function clearImage() {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedUrl(null);
    setFileName(null);
    setRemoveCurrent(Boolean(currentImageUrl));
  }

  return <div>
    <input name="remove_final_cta_image" type="hidden" value={removeCurrent ? "1" : "0"} />
    <div className="overflow-hidden rounded-lg bg-surface-low">
      <div className="relative aspect-[16/7] min-h-56 bg-surface-high">
        {previewUrl ? <Image src={previewUrl} alt={localize(locale, "Preview gambar CTA penutup", "Final CTA image preview")} fill sizes="(min-width: 768px) 740px, 100vw" unoptimized={previewUrl.startsWith("blob:")} className="object-cover" /> : <div className="absolute inset-0 grid place-items-center px-6 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-sm bg-surface text-secondary"><ImageIcon className="size-5" /></span><p className="mt-4 text-sm font-semibold">{localize(locale, "Menggunakan gambar hero sebagai fallback", "Using the hero image as fallback")}</p></div></div>}
        {previewUrl && <button type="button" onClick={clearImage} className="absolute top-4 right-4 inline-flex min-h-10 items-center gap-2 rounded-sm bg-black/75 px-3 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black"><TrashIcon className="size-4" />{localize(locale, "Hapus", "Remove")}</button>}
      </div>
      <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div><p className="text-base font-semibold">{localize(locale, "Latar CTA penutup", "Final CTA background")}</p><p className="mt-1 max-w-xl text-sm leading-6 text-muted">{localize(locale, "Gunakan JPG, PNG, atau WebP hingga 8 MB. Rasio lebar 16:9 disarankan agar pemotongan tetap rapi.", "Use a JPG, PNG, or WebP up to 8 MB. A wide 16:9 ratio is recommended for clean cropping.")}</p><p className="mt-2 text-xs text-muted">{fileName ?? (previewUrl ? localize(locale, "Gambar yang tersimpan saat ini", "Currently saved image") : localize(locale, "Belum ada gambar khusus", "No custom image yet"))}</p></div>
        <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-high focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"><span>{previewUrl ? localize(locale, "Ganti gambar", "Replace image") : localize(locale, "Pilih gambar", "Choose image")}</span><input ref={inputRef} name="final_cta_image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} /></label>
      </div>
    </div>
    {errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
  </div>;
}
