function Line({ className = "" }: { className?: string }) {
  return <span className={`block rounded-sm bg-surface-high ${className}`} />;
}

export default function InternalNotificationsLoading() {
  return (
    <main aria-busy="true" className="mx-auto min-h-[calc(100vh-64px)] max-w-[1440px] animate-pulse px-6 py-10 sm:px-8 md:px-10 md:py-12 xl:px-16">
      <Line className="h-12 w-96 max-w-full" />
      <Line className="mt-4 h-5 w-[min(100%,680px)]" />
      <div className="mt-10 grid gap-3 border-y py-6 sm:grid-cols-[240px_280px_120px]">
        <Line className="h-12" />
        <Line className="h-12" />
        <Line className="h-12" />
      </div>
      <Line className="mt-8 h-4 w-44" />
      <div className="mt-5 divide-y bg-surface">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid gap-4 px-5 py-5 sm:grid-cols-[48px_1fr] lg:grid-cols-[56px_180px_1fr_180px] lg:items-center">
            <Line className="size-11" />
            <Line className="h-4 w-28" />
            <div>
              <Line className="h-4 w-52 max-w-full" />
              <Line className="mt-2 h-3 w-80 max-w-full" />
            </div>
            <Line className="h-4 w-32" />
          </div>
        ))}
      </div>
    </main>
  );
}
