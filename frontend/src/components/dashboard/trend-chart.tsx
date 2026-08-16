import { useId } from "react";

type Point = { date: string; value: number };

const dateLabel = (value: string, long = false) => new Intl.DateTimeFormat("id-ID", long
  ? { day: "numeric", month: "short", year: "numeric" }
  : { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));

export function TrendChart({ points, formatValue, formatAxis, maxValue, title, description }: {
  points: Point[];
  formatValue: (value: number) => string;
  formatAxis: (value: number) => string;
  maxValue?: number;
  title: string;
  description: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const gradientId = `${id}-area`;
  const width = 320;
  const height = 210;
  const pad = { top: 16, right: 6, bottom: 32, left: 58 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const dataMax = Math.max(...points.map((point) => point.value), 0);
  const scaleMax = Math.max(maxValue ?? dataMax, 1);
  const latest = points.at(-1)?.value ?? 0;
  const coordinates = points.map((point, index) => ({
    ...point,
    x: pad.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth),
    y: pad.top + innerHeight - (point.value / scaleMax) * innerHeight,
  }));
  const line = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = coordinates.length ? `${line} L${coordinates.at(-1)?.x},${pad.top + innerHeight} L${coordinates[0].x},${pad.top + innerHeight} Z` : "";
  const xLabels = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])).filter((index) => index >= 0);
  const markerStep = Math.max(1, Math.ceil(points.length / 10));
  const markers = coordinates.filter((_, index) => index % markerStep === 0 || index === coordinates.length - 1);
  const yTicks = [scaleMax, scaleMax / 2, 0];

  return <figure>
    <figcaption className="flex items-start justify-between gap-5"><div><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{description}</p></div><div className="shrink-0 text-right"><p className="text-xs text-muted">Terakhir</p><p className="mt-1 text-sm font-semibold tabular-nums">{formatValue(latest)}</p></div></figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${titleId} ${descriptionId}`} className="mt-5 h-auto w-full overflow-visible">
      <title id={titleId}>{title}</title><desc id={descriptionId}>{`${description}. Nilai terakhir ${formatValue(latest)} dan nilai tertinggi ${formatValue(dataMax)}.`}</desc>
      {yTicks.map((tick, index) => { const y = pad.top + innerHeight * (index / 2); return <g key={index}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="currentColor" className="text-outline/55" strokeWidth="1" /><text x={pad.left - 7} y={y + 4} textAnchor="end" fill="#575b5c" fontSize="11">{formatAxis(tick)}</text></g>; })}
      <path d={area} fill={`url(#${gradientId})`} />
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#795830" stopOpacity=".2" /><stop offset="1" stopColor="#795830" stopOpacity=".015" /></linearGradient></defs>
      <path d={line} fill="none" stroke="#795830" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {markers.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#795830" strokeWidth="2"><title>{`${dateLabel(point.date, true)}: ${formatValue(point.value)}`}</title></circle>)}
      {xLabels.map((index) => <text key={index} x={coordinates[index]?.x} y={height - 6} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} fill="#575b5c" fontSize="11">{coordinates[index] ? dateLabel(coordinates[index].date) : ""}</text>)}
    </svg>
  </figure>;
}
