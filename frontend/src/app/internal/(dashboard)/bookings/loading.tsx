export default function BookingLoading() {
  return <main className="mx-auto max-w-[1440px] animate-pulse px-6 py-10 md:px-10 md:py-12 xl:px-16"><div className="h-12 w-72 rounded-sm bg-surface-high" /><div className="mt-4 h-6 w-[min(100%,560px)] rounded-sm bg-surface-high" /><div className="mt-10 h-24 rounded-lg bg-surface-high" /><div className="mt-8 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 rounded-lg bg-surface-high" />)}</div></main>;
}
