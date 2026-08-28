"use client";

import { submitPublicPaymentProofAction } from "@/app/booking/payment/[token]/actions";
import { ImageIcon, ShieldIcon } from "@/components/ui/icons";
import type { ActionState } from "@/lib/api/types";
import { localize, localizeApiMessage, type Locale } from "@/lib/locale";
import { useActionState, useRef, useState } from "react";

export function PublicPaymentProofForm({ token, locale }: { token: string; locale: Locale }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitPublicPaymentProofAction.bind(null, token), {});
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 flex min-h-28 w-full items-center gap-4 border border-dashed bg-surface-low px-5 text-left transition-colors hover:bg-surface-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary">
          <span className="grid size-11 shrink-0 place-items-center bg-background text-secondary"><ImageIcon className="size-5" /></span>
          <span><span className="block text-sm font-semibold">{fileName || localize(locale, "Pilih foto bukti transfer", "Choose a transfer receipt")}</span><span className="mt-1 block text-xs leading-5 text-muted">JPG, PNG, WEBP · max. 5 MB</span></span>
        </button>
        <input ref={inputRef} name="proof" required type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
        {state.errors?.proof?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
      </div>
    </div>
    <button disabled={pending} className="mt-6 min-h-13 w-full bg-primary px-6 text-sm font-bold text-background transition-colors hover:bg-foreground/85 disabled:cursor-wait disabled:opacity-60">{pending ? localize(locale, "Mengunggah…", "Uploading…") : localize(locale, "Kirim untuk diverifikasi", "Submit for verification")}</button>
    <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldIcon className="mt-0.5 size-4 shrink-0" />{localize(locale, "Bukti hanya digunakan untuk memverifikasi pembayaran reservasi ini.", "Your receipt is used only to verify this reservation payment.")}</p>
  </form>;
}
