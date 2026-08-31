import { ArrowLeftIcon } from "@/components/ui/icons";
import { serverLocale, serverLocalize } from "@/lib/locale-server";
import Link from "next/link";

export default async function RoomNotFound() {
  const locale = await serverLocale();
  return <main className="grid min-h-screen place-items-center bg-background px-5 text-center text-foreground"><div className="max-w-lg"><p className="text-sm font-semibold text-secondary">404</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{serverLocalize(locale, "Kamar tidak tersedia", "Room unavailable")}</h1><p className="mt-4 leading-7 text-muted">{serverLocalize(locale, "Kamar mungkin sedang dinonaktifkan atau tidak lagi menerima reservasi.", "This room may be inactive or no longer accepting reservations.")}</p><Link href="/booking" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-primary px-6 text-sm font-bold text-background"><ArrowLeftIcon className="size-4" />{serverLocalize(locale, "Lihat kamar lain", "View other rooms")}</Link></div></main>;
}
