import { LoginForm } from "@/components/auth/login-form";
import { LanguageToggle } from "@/components/internal/language-toggle";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { BrandMark } from "@/components/ui/brand-mark";
import { LocalizedText } from "@/components/ui/localized-text";
import { apiFetch } from "@/lib/api/client";
import type { ApiItem, PublicBrandingData } from "@/lib/api/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const { data: branding } = await apiFetch<ApiItem<PublicBrandingData>>("/public/branding", {}, false).catch(() => ({
    data: { name: "Prama Homestay", logo_url: null },
  }));

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(120deg, rgba(0,0,0,.25), rgba(0,0,0,.72)), url('https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1600&q=90')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative flex items-center gap-3">
          <BrandMark logoUrl={branding.logo_url} propertyName={branding.name} className="size-12" fallbackClassName="bg-background text-primary" iconClassName="size-6" />
          <div className="min-w-0"><p className="truncate text-lg font-semibold">{branding.name}</p><p className="text-xs tracking-[0.12em] text-white/70 uppercase">Internal operations</p></div>
        </div>
        <div className="relative max-w-xl pb-8">
          <p className="text-4xl leading-[1.12] font-semibold tracking-[-0.03em]"><LocalizedText id="Ruang kerja yang setenang pengalaman tamu." en="A workspace as calm as the guest experience." /></p>
          <p className="mt-5 max-w-md text-base leading-7 text-white/72"><LocalizedText id="Kelola ketersediaan, kondisi, dan detail kamar dalam satu alur operasional." en="Manage room availability, condition, and details in one operational flow." /></p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="absolute top-5 right-6 flex items-center gap-2 sm:right-8"><LanguageToggle /><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <BrandMark logoUrl={branding.logo_url} propertyName={branding.name} className="size-11" fallbackClassName="bg-primary text-white" />
            <div className="min-w-0"><p className="truncate font-semibold">{branding.name}</p><p className="text-xs tracking-[0.1em] text-muted uppercase">Internal</p></div>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-primary"><LocalizedText id="Selamat datang kembali" en="Welcome back" /></h1>
          <p className="mt-3 max-w-sm leading-7 text-muted"><LocalizedText id="Masuk menggunakan akun admin atau staff untuk melanjutkan operasional." en="Sign in with an admin or staff account to continue operations." /></p>
          <LoginForm />
          <p className="mt-8 text-sm leading-6 text-muted"><LocalizedText id="Akses dilindungi dan setiap perubahan terkait dengan akun internal Anda." en="Access is protected and every change is linked to your internal account." /></p>
        </div>
      </section>
    </main>
  );
}
