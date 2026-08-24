"use client";

import { loginAction } from "@/app/internal/login/actions";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import { useActionState } from "react";

export function LoginForm() {
  const locale = useLocale();
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="mt-10 space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-muted uppercase">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue="admin@gmail.com" className="h-12 w-full rounded-sm border bg-surface px-4 text-base outline-none transition-colors focus:border-primary" />
        {state.errors?.email?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-muted uppercase">{localize(locale, "Kata sandi", "Password")}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required defaultValue="password" className="h-12 w-full rounded-sm border bg-surface px-4 text-base outline-none transition-colors focus:border-primary" />
      </div>
      {state.message && !state.errors?.email && <p role="alert" className="rounded-sm bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</p>}
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">
        {pending ? localize(locale, "Memeriksa akses…", "Checking access…") : localize(locale, "Masuk ke area internal", "Sign in to internal area")}
      </button>
    </form>
  );
}
