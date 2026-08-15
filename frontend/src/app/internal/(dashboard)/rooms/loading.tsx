export default function RoomsLoading() {
  return <main className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 xl:px-16"><div className="h-12 w-64 animate-pulse rounded-sm bg-surface-high" /><div className="mt-5 h-5 w-96 max-w-full animate-pulse rounded-sm bg-surface-high" /><div className="mt-12 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[460px] animate-pulse rounded-lg bg-surface-high" />)}</div></main>;
}
