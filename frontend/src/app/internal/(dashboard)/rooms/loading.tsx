function Line({ className = "" }: { className?: string }) {
  return <span className={`block rounded-sm bg-surface-high ${className}`} />;
}

function SkeletonCell({ wide = false }: { wide?: boolean }) {
  return <div className="min-w-0"><Line className={`h-4 ${wide ? "w-32 max-w-full" : "w-24 max-w-full"}`} /><Line className="mt-2 h-3 w-20 max-w-[80%]" /></div>;
}

export default function RoomsLoading() {
  return (
    <main aria-busy="true" aria-label="Memuat daftar kamar" className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] animate-pulse px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><Line className="h-12 w-64" /><Line className="mt-4 h-5 w-[min(100%,480px)]" /></div><Line className="h-12 w-full sm:w-40" /></div>
      <div className="mt-8 grid gap-3 border-y py-5 sm:grid-cols-2 xl:grid-cols-[1fr_190px_190px_110px]"><Line className="h-12 w-full sm:col-span-2 xl:col-span-1" /><Line className="h-12 w-full" /><Line className="h-12 w-full" /><Line className="h-12 w-full sm:col-span-2 xl:col-span-1" /></div>
      <Line className="mt-8 h-4 w-32" />
      <div className="mt-5 overflow-hidden rounded-lg bg-surface shadow-[0_18px_42px_-28px_rgba(68,71,72,0.25)]">
        <div className="hidden grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] gap-5 border-b bg-surface-low px-6 py-4 lg:grid">{Array.from({ length: 6 }, (_, index) => <Line key={index} className="h-2.5 w-14" />)}</div>
        <div className="divide-y">
          {Array.from({ length: 3 }, (_, row) => (
            <div key={row} className="grid gap-5 px-5 py-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_0.9fr_auto] lg:items-center lg:px-6">
              <SkeletonCell wide /><SkeletonCell /><div><Line className="h-7 w-20" /><Line className="mt-2 h-3 w-32 max-w-full" /></div><SkeletonCell /><SkeletonCell /><Line className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
