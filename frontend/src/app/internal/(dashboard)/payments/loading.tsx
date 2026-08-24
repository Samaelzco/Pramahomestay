import { serverLocale, serverLocalize } from "@/lib/locale-server";
function Line({ className = "" }: { className?: string }) {
  return <span className={`block rounded-sm bg-surface-high ${className}`} />;
}

function Cell({
  wide = false,
  badge = false,
}: {
  wide?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Line className={`h-4 ${wide ? "w-32 max-w-full" : "w-24 max-w-full"}`} />
      <Line className={`mt-2 ${badge ? "h-7 w-16" : "h-3 w-20 max-w-[80%]"}`} />
    </div>
  );
}

export default async function PaymentLoading() {
  const locale = await serverLocale();
  return (
    <main
      aria-busy="true"
      aria-label={serverLocalize(locale, "Memuat daftar pembayaran", "Loading payments")}
      className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] animate-pulse px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Line className="h-12 w-80 max-w-full" />
          <Line className="mt-4 h-5 w-[min(100%,560px)]" />
        </div>
        <Line className="h-12 w-full sm:w-52" />
      </div>
      <div className="mt-8 grid items-end gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_160px_170px_150px_150px_110px]">
        <Line className="h-12 w-full sm:col-span-2 xl:col-span-1" />
        {Array.from({ length: 4 }, (_, index) => (
          <Line key={index} className="h-12 w-full" />
        ))}
        <Line className="h-12 w-full sm:col-span-2 xl:col-span-1" />
      </div>
      <Line className="mt-8 h-4 w-44" />
      <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
        <div className="hidden grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] gap-5 border-b bg-surface-low px-6 py-4 lg:grid">
          {Array.from({ length: 6 }, (_, index) => (
            <Line key={index} className="h-2.5 w-14" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: 4 }, (_, row) => (
            <div
              key={row}
              className="grid gap-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr_0.9fr_0.8fr_auto] lg:items-center lg:px-6"
            >
              <Cell badge />
              <Cell wide />
              <Cell />
              <Cell />
              <Cell />
              <Line className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
