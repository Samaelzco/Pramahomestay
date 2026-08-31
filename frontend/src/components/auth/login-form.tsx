"use client";

import { loginAction } from "@/app/internal/login/actions";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import { useActionState, useState } from "react";

export function LoginForm() {
  const locale = useLocale();
  const [state, action, pending] = useActionState(loginAction, {});
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form action={action} autoComplete="off" className="mt-10 space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-muted uppercase">Email</label>
        <input id="email" name="email" type="email" autoComplete="off" autoCapitalize="none" spellCheck={false} required className="h-12 w-full rounded-sm border bg-surface px-4 text-base outline-none transition-colors focus:border-primary" />
        {state.errors?.email?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-muted uppercase">{localize(locale, "Kata sandi", "Password")}</label>
        <div className="relative">
          <input id="password" name="password" type={passwordVisible ? "text" : "password"} autoComplete="new-password" required className="h-12 w-full rounded-sm border bg-surface pr-14 pl-4 text-base outline-none transition-colors focus:border-primary" />
          <button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? localize(locale, "Sembunyikan kata sandi", "Hide password") : localize(locale, "Lihat kata sandi", "Show password")} aria-pressed={passwordVisible} className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-sm text-muted transition-colors hover:bg-surface-low hover:text-foreground">
            {passwordVisible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
      </div>
      {state.message && !state.errors?.email && <p role="alert" className="rounded-sm bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{localizeApiMessage(locale, state.message)}</p>}
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center rounded-sm bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f3131] disabled:opacity-60">
        {pending ? localize(locale, "Memeriksa akses…", "Checking access…") : localize(locale, "Masuk ke area internal", "Sign in to internal area")}
      </button>
    </form>
  );
}
