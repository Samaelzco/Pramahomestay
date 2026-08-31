import { LanguageToggle } from "@/components/internal/language-toggle";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { BrandMark } from "@/components/ui/brand-mark";
import { serverLocalize, type ServerLocale } from "@/lib/locale-server";
import Link from "next/link";

export function BookingFlowHeader({ propertyName, logoUrl, locale }: { propertyName: string; logoUrl?: string | null; locale: ServerLocale }) {
  return <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex min-w-0 items-center gap-3"><BrandMark logoUrl={logoUrl} propertyName={propertyName} /><span className="truncate font-bold max-[359px]:hidden">{propertyName}</span></Link>
      <div className="flex items-center gap-2"><Link href="/booking/status" className="hidden min-h-11 items-center px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:inline-flex">{serverLocalize(locale, "Cek pesanan", "Find booking")}</Link><LanguageToggle /><ThemeToggle /></div>
    </div>
  </header>;
}
