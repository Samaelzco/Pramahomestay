"use client";

import { ImageIcon, TrashIcon } from "@/components/ui/icons";
import { shouldBypassImageOptimization } from "@/lib/image";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";

export function SettingsLogoInput({ currentLogoUrl, errors }: { currentLogoUrl?: string | null; errors?: string[] }) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const previewUrl = selectedUrl ?? (removeCurrent ? null : currentLogoUrl);

  useEffect(() => () => { if (selectedUrl) URL.revokeObjectURL(selectedUrl); }, [selectedUrl]);

  function selectLogo(file?: File) {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (!file) { setSelectedUrl(null); setFileName(null); return; }
    setSelectedUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setRemoveCurrent(false);
  }

  function clearLogo() {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedUrl(null);
    setFileName(null);
    setRemoveCurrent(Boolean(currentLogoUrl));
  }

  return <div className="sm:col-span-2">
    <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Logo</span>
    <input name="remove_logo" type="hidden" value={removeCurrent ? "1" : "0"} />
    <div className="mt-2 grid overflow-hidden rounded-lg bg-surface-low sm:grid-cols-[1fr_180px]">
      <div className="flex min-h-48 flex-col items-start justify-center p-6">
        <span className="grid size-10 place-items-center rounded-sm bg-surface text-secondary"><ImageIcon className="size-5" /></span>
        <p className="mt-4 text-base font-semibold">{localize(locale, "Logo properti", "Property logo")}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">{localize(locale, "Gunakan JPG, PNG, atau WebP hingga 3 MB. Gambar persegi dengan latar transparan akan tampil paling baik.", "Use a JPG, PNG, or WebP up to 3 MB. A square image with a transparent background works best.")}</p>
        <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-high focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"><span>{previewUrl ? localize(locale, "Ganti logo", "Replace logo") : localize(locale, "Pilih logo", "Choose logo")}</span><input ref={inputRef} name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectLogo(event.target.files?.[0])} /></label>
        <p className="mt-3 text-xs text-muted">{fileName ?? (previewUrl ? localize(locale, "Logo yang tersimpan saat ini", "Currently saved logo") : localize(locale, "Belum ada logo", "No logo yet"))}</p>
        {errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
      </div>
      <div className="relative grid min-h-48 place-items-center bg-surface-high p-6">
        {previewUrl ? <><div className="relative size-28 overflow-hidden rounded-lg bg-surface"><Image src={previewUrl} alt={localize(locale, "Preview logo Prama Homestay", "Prama Homestay logo preview")} fill sizes="112px" unoptimized={shouldBypassImageOptimization(previewUrl)} className="object-contain p-2" /></div><button type="button" onClick={clearLogo} className="absolute top-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary px-3 text-xs font-semibold text-white"><TrashIcon className="size-4" />{localize(locale, "Hapus", "Remove")}</button></> : <p className="text-center text-sm leading-6 text-muted">{localize(locale, "Preview logo", "Logo preview")}</p>}
      </div>
    </div>
  </div>;
}
