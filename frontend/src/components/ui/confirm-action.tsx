"use client";

import type { ActionState } from "@/lib/api/types";
import { useActionState, useEffect, useRef } from "react";

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ConfirmAction({ action, trigger, title, description, confirmLabel, tone = "danger", reason }: {
  action: ServerAction;
  trigger: string;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  reason?: { label: string; required?: boolean; placeholder?: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  useEffect(() => {
    if (state.success) dialogRef.current?.close();
  }, [state.message, state.success]);

  function close() {
    if (pending) return;
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  return <>
    <button ref={triggerRef} type="button" onClick={() => dialogRef.current?.showModal()} className={`inline-flex min-h-10 items-center text-sm font-semibold underline decoration-transparent underline-offset-4 hover:decoration-current ${tone === "danger" ? "text-danger" : "text-secondary"}`}>{trigger}</button>
    <dialog ref={dialogRef} onCancel={(event) => { if (pending) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-lg border-0 bg-surface p-0 text-primary shadow-[0_24px_70px_-24px_rgba(17,17,17,.55)] backdrop:bg-primary/55">
      <form action={formAction} className="p-6 sm:p-7">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        {reason && <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">{reason.label}
          <textarea name="reason" required={reason.required} maxLength={500} rows={3} placeholder={reason.placeholder} className="mt-2 w-full resize-y rounded-sm border bg-surface px-4 py-3 text-base font-normal leading-6 normal-case tracking-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </label>}
        {state.message && !state.success && <p role="alert" className="mt-5 rounded-sm bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]">{state.message}</p>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={pending} onClick={close} className="min-h-11 rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-low disabled:opacity-60">Kembali</button>
          <button type="submit" disabled={pending} className={`min-h-11 rounded-sm px-5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${tone === "danger" ? "bg-[#93000a] hover:bg-[#720008]" : "bg-primary hover:bg-[#2f3131]"}`}>{pending ? "Memproses…" : confirmLabel}</button>
        </div>
      </form>
    </dialog>
  </>;
}
