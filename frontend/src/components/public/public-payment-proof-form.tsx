"use client";

import { submitPublicPaymentProofAction } from "@/app/booking/payment/[token]/actions";
import { PaymentProofViewer } from "@/components/payments/payment-proof-viewer";
import { ImageIcon, ShieldIcon, TrashIcon } from "@/components/ui/icons";
import type { ActionState } from "@/lib/api/types";
import { localize, localizeApiMessage, type Locale } from "@/lib/locale";
import { useActionState, useEffect, useRef, useState } from "react";

export function PublicPaymentProofForm({ token, locale }: { token: string; locale: Locale }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitPublicPaymentProofAction.bind(null, token), {});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  function select(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  const fileSize = selectedFile
    ? `${new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { maximumFractionDigits: 1 }).format(selectedFile.size / 1024 / 1024)} MB`
    : null;

  return <form action={action}>
    <h2 className="text-xl font-semibold tracking-[-0.02em]">{localize(locale, "Kirim bukti transfer", "Submit transfer proof")}</h2>
    <p className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Pastikan nominal dan rekening tujuan sudah benar sebelum mengunggah bukti.", "Confirm the amount and destination account before uploading your receipt.")}</p>
    {state.message && <div role="alert" className="mt-5 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</div>}
    <div className="mt-6 grid gap-5">
      <label className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
        {localize(locale, "Nomor referensi", "Reference number")} <span className="font-normal tracking-normal normal-case">({localize(locale, "opsional", "optional")})</span>
        <input name="reference_number" maxLength={120} className="mt-2 h-12 w-full border bg-surface px-4 text-sm font-normal tracking-normal normal-case outline-none transition-colors focus:border-primary" />
      </label>
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Bukti pembayaran", "Payment proof")}</p>
        {previewUrl && selectedFile ? (
          <div className="mt-2 overflow-hidden rounded-lg bg-surface-low">
            <PaymentProofViewer
              src={previewUrl}
              alt={localize(locale, "Preview bukti pembayaran yang dipilih", "Preview of the selected payment receipt")}
              className="aspect-[4/3] w-full rounded-none"
              sizes="(max-width: 1024px) 100vw, 440px"
            />
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-muted" aria-live="polite">{fileSize} · {localize(locale, "Siap diunggah", "Ready to upload")}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className="min-h-10 border bg-surface px-4 text-xs font-semibold transition-colors hover:bg-surface-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {localize(locale, "Ganti", "Replace")}
                </button>
                <button type="button" onClick={clear} className="inline-flex min-h-10 items-center gap-2 border bg-surface px-4 text-xs font-semibold text-danger transition-colors hover:bg-[#ffdad6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger">
                  <TrashIcon className="size-4" />
                  {localize(locale, "Hapus", "Remove")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 flex min-h-28 w-full items-center gap-4 border border-dashed bg-surface-low px-5 text-left transition-colors hover:bg-surface-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
            <span className="grid size-11 shrink-0 place-items-center bg-background text-secondary"><ImageIcon className="size-5" /></span>
            <span><span className="block text-sm font-semibold">{localize(locale, "Pilih foto bukti transfer", "Choose a transfer receipt")}</span><span className="mt-1 block text-xs leading-5 text-muted">JPG, PNG, WEBP · max. 5 MB</span></span>
          </button>
        )}
        <input ref={inputRef} name="proof" required type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onClick={(event) => { event.currentTarget.value = ""; }} onChange={(event) => select(event.target.files?.[0])} />
        {state.errors?.proof?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
      </div>
    </div>
    <button disabled={pending || !selectedFile} className="mt-6 min-h-13 w-full bg-primary px-6 text-sm font-bold text-background transition-colors hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-60">{pending ? localize(locale, "Mengunggah…", "Uploading…") : localize(locale, "Kirim untuk diverifikasi", "Submit for verification")}</button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{localize(locale, "Bukti hanya digunakan untuk memverifikasi pembayaran reservasi ini.", "Your receipt is used only to verify this reservation payment.")}</p>
  </form>;
}
