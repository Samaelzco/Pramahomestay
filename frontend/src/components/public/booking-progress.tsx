import { CheckIcon } from "@/components/ui/icons";
import { serverLocalize, type ServerLocale } from "@/lib/locale-server";

type Step = 1 | 2 | 3 | 4;

export function BookingProgress({ current, locale }: { current: Step; locale: ServerLocale }) {
  const steps = [serverLocalize(locale, "Tanggal", "Dates"), serverLocalize(locale, "Kamar", "Room"), serverLocalize(locale, "Data tamu", "Guest details"), serverLocalize(locale, "Pembayaran", "Payment")];

  return <ol className="relative grid w-full max-w-2xl grid-cols-4" aria-label={serverLocalize(locale, "Tahapan booking", "Booking progress")}>
    <span aria-hidden="true" className="absolute top-5 right-[12.5%] left-[12.5%] h-px bg-outline" />
    {steps.map((label, index) => {
      const step = (index + 1) as Step;
      const complete = step < current;
      const active = step === current;
      return <li key={label} aria-current={active ? "step" : undefined} className="relative flex flex-col items-center text-center">
        <span className={`relative z-10 grid size-10 place-items-center rounded-full text-xs font-bold transition-colors ${complete ? "bg-secondary text-white" : active ? "bg-foreground text-background ring-4 ring-secondary-soft" : "border bg-surface text-muted"}`}>{complete ? <CheckIcon className="size-4" /> : `0${step}`}</span>
        <span className={`mt-3 text-[0.7rem] font-semibold sm:text-xs ${active ? "text-foreground" : "text-muted"}`}>{label}</span>
      </li>;
    })}
  </ol>;
}
