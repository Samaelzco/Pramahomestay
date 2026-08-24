"use client";

import { ImageIcon, TrashIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { localize, useLocale } from "@/lib/locale";

export function PaymentProofInput({ currentProofUrl, errors }: { currentProofUrl?: string | null; errors?: string[] }) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const previewUrl = selectedUrl ?? (removeCurrent ? null : currentProofUrl);

  useEffect(() => () => { if (selectedUrl) URL.revokeObjectURL(selectedUrl); }, [selectedUrl]);

  function select(file?: File) {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (!file) { setSelectedUrl(null); setFileName(null); return; }
    setSelectedUrl(URL.createObjectURL(file)); setFileName(file.name); setRemoveCurrent(false);
  }
  function clear() {
    if (selectedUrl) URL.revokeObjectURL(selectedUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedUrl(null); setFileName(null); setRemoveCurrent(Boolean(currentProofUrl));
  }

  return <div className="sm:col-span-2">
    <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Bukti pembayaran", "Payment receipt")}</span>
    <input name="remove_proof" type="hidden" value={removeCurrent ? "1" : "0"} />
    <div className="mt-2 grid overflow-hidden rounded-lg bg-surface-low md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex min-h-52 flex-col items-start justify-center p-6 md:min-h-64 md:p-8"><span className="grid size-10 place-items-center rounded-sm bg-surface text-secondary"><ImageIcon className="size-5" /></span><p className="mt-5 text-base font-semibold">{localize(locale, "Unggah bukti pembayaran", "Upload payment receipt")}</p><p className="mt-2 max-w-md text-sm leading-6 text-muted">{localize(locale, "Gunakan JPG, PNG, atau WebP hingga 5 MB. Pastikan nominal dan referensi dapat terbaca.", "Use a JPG, PNG, or WebP up to 5 MB. Make sure the amount and reference are legible.")}</p><label className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-sm border bg-surface px-5 text-sm font-semibold hover:bg-surface-high focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"><span>{previewUrl ? localize(locale, "Ganti gambar", "Replace image") : localize(locale, "Pilih gambar", "Choose image")}</span><input ref={inputRef} name="proof" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => select(event.target.files?.[0])} /></label><p className="mt-3 text-xs text-muted">{fileName ?? (currentProofUrl && !removeCurrent ? localize(locale, "Bukti yang tersimpan saat ini", "Currently saved receipt") : localize(locale, "Opsional · belum ada gambar", "Optional · no image yet"))}</p>{errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{error}</p>)}</div>
      <div className="relative min-h-52 bg-surface-high md:min-h-64">{previewUrl ? <><Image src={previewUrl} alt={localize(locale, "Preview bukti pembayaran", "Payment receipt preview")} fill sizes="260px" unoptimized={previewUrl.startsWith("blob:")} className="object-cover" /><button type="button" onClick={clear} className="absolute top-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary/90 px-3 text-xs font-semibold text-white hover:bg-primary"><TrashIcon className="size-4" />{localize(locale, "Hapus", "Remove")}</button></> : <div className="grid h-full min-h-52 place-items-center px-6 text-center text-sm leading-6 text-muted md:min-h-64">{localize(locale, "Preview bukti akan muncul di sini.", "The receipt preview will appear here.")}</div>}</div>
    </div>
  </div>;
}
