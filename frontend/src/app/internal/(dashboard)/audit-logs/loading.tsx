import { serverLocale, serverLocalize } from "@/lib/locale-server";
export default async function AuditLogsLoading() {
  const locale = await serverLocale();
  return (
    <main
      aria-busy="true"
      aria-label={serverLocalize(locale, "Memuat Audit Log", "Loading Audit Log")}
      className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] animate-pulse px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16"
    >
      <div className="h-12 w-60 rounded-sm bg-surface-high" />
      <div className="mt-4 h-5 w-[min(560px,80vw)] rounded-sm bg-surface-high" />
      <div className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-12 rounded-sm bg-surface-high" />
        ))}
        <div className="h-16 rounded-sm bg-surface-high sm:col-span-2" />
      </div>
      <div className="mt-8 h-5 w-44 rounded-sm bg-surface-high" />
      <div className="mt-5 overflow-hidden rounded-lg bg-surface">
        <div className="h-12 bg-surface-low" />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border-t px-6 py-6 sm:grid-cols-2 lg:grid-cols-6"
          >
            {Array.from({ length: 6 }).map((__, cell) => (
              <div key={cell} className="h-5 rounded-sm bg-surface-high" />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
