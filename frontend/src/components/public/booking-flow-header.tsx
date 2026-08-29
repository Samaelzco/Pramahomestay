import { LanguageToggle } from "@/components/internal/language-toggle";
import { ThemeToggle } from "@/components/internal/theme-toggle";
import { HomeIcon } from "@/components/ui/icons";
import { serverLocalize, type ServerLocale } from "@/lib/locale-server";
import Link from "next/link";

export function BookingFlowHeader({ propertyName, locale }: { propertyName: string; locale: ServerLocale }) {
  return <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary text-background"><HomeIcon className="size-5" /></span><span className="truncate font-bold max-[359px]:hidden">{propertyName}</span></Link>
      <div className="flex items-center gap-2"><Link href="/booking/status" className="hidden min-h-11 items-center px-3 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:inline-flex">{serverLocalize(locale, "Cek pesanan", "Find booking")}</Link><LanguageToggle /><ThemeToggle /></div>
    </div>
  </header>;
}
