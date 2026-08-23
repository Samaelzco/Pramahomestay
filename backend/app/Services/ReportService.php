<?php

namespace App\Services;

use App\Contracts\Services\ReportServiceInterface;
use App\Enums\BookingStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Booking;
use App\Models\HomestaySetting;
use App\Models\Payment;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Collection;

class ReportService implements ReportServiceInterface
{
    public function summary(array $filters = []): array
    {
        [$start, $end] = $this->period($filters);
        $days = $start->diffInDays($end) + 1;
        $previousEnd = $start->subDay();
        $previousStart = $previousEnd->subDays($days - 1);
        $current = $this->snapshot($start, $end);
        $previous = $this->snapshot($previousStart, $previousEnd);

        return [
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString(), 'days' => $days],
            'previous_period' => ['start' => $previousStart->toDateString(), 'end' => $previousEnd->toDateString(), 'days' => $days],
            'metrics' => $current['metrics'],
            'previous_metrics' => $previous['metrics'],
            'comparison' => [
                'revenue_percent' => $this->percent($current['metrics']['revenue'], $previous['metrics']['revenue']),
                'bookings_percent' => $this->percent($current['metrics']['bookings'], $previous['metrics']['bookings']),
                'occupancy_points' => round($current['metrics']['occupancy_rate'] - $previous['metrics']['occupancy_rate'], 1),
                'payments_percent' => $this->percent($current['metrics']['payments'], $previous['metrics']['payments']),
            ],
            'rooms' => $current['rooms'],
            'payment_methods' => $current['payment_methods'],
            'transactions' => $current['transactions'],
        ];
    }

    public function csv(array $filters = []): string
    {
        $report = $this->summary($filters);
        $stream = fopen('php://temp', 'w+');
        fwrite($stream, "\xEF\xBB\xBF");
        fputcsv($stream, ['Laporan Prama Homestay']);
        fputcsv($stream, ['Periode', $report['period']['start'].' s.d. '.$report['period']['end']]);
        fputcsv($stream, []);
        fputcsv($stream, ['Kode pembayaran', 'Tanggal', 'Booking', 'Tamu', 'Kamar', 'Metode', 'Status', 'Jumlah']);
        foreach ($report['transactions'] as $row) {
            fputcsv($stream, [$row['payment_code'], $row['paid_at'] ?? '-', $row['booking_code'], $row['guest_name'], $row['room_name'], $row['method_label'], $row['status_label'], $row['amount']]);
        }
        rewind($stream);
        $contents = stream_get_contents($stream);
        fclose($stream);

        return $contents ?: '';
    }

    public function pdf(array $filters = []): string
    {
        $report = $this->summary($filters);
        $settings = HomestaySetting::query()->first();
        $html = view('reports.summary', ['report' => $report, 'settings' => $settings])->render();
        $options = new Options;
        $options->setDefaultFont('DejaVu Sans');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $canvas = $dompdf->getCanvas();
        $font = $dompdf->getFontMetrics()->getFont('DejaVu Sans', 'normal');
        $canvas->page_text(520, 814, '{PAGE_NUM} / {PAGE_COUNT}', $font, 6.5, [0.42, 0.43, 0.43]);

        return $dompdf->output();
    }

    private function period(array $filters): array
    {
        $end = isset($filters['date_to']) ? CarbonImmutable::parse($filters['date_to'])->startOfDay() : CarbonImmutable::today();
        $start = isset($filters['date_from']) ? CarbonImmutable::parse($filters['date_from'])->startOfDay() : $end->startOfMonth();

        return [$start, $end];
    }

    private function snapshot(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $validStatuses = [BookingStatus::Confirmed->value, BookingStatus::CheckedIn->value, BookingStatus::CheckedOut->value];
        $creditedStatuses = [PaymentStatus::Partial->value, PaymentStatus::Paid->value];
        $rooms = Room::query()->where('is_active', true)->orderBy('name')->get();
        $bookings = Booking::query()->with('room')->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])->get();
        $stays = Booking::query()->with('room')->whereIn('status', $validStatuses)->whereDate('check_in', '<=', $end)->whereDate('check_out', '>', $start)->get();
        $payments = Payment::query()->with('booking.room')->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])->orderByDesc('created_at')->get();
        $credited = Payment::query()->with('booking.room')->whereIn('status', $creditedStatuses)->whereBetween('paid_at', [$start->startOfDay(), $end->endOfDay()])->get();
        $capacity = $rooms->count() * ($start->diffInDays($end) + 1);
        $occupied = $this->occupiedNights($stays, $start, $end);
        $revenue = (float) $credited->sum('amount_paid');
        $activeBookings = $bookings->where('status', '!=', BookingStatus::Cancelled);

        return [
            'metrics' => [
                'revenue' => $this->money($revenue),
                'bookings' => $activeBookings->count(),
                'occupancy_rate' => $capacity > 0 ? round(($occupied / $capacity) * 100, 1) : 0,
                'occupied_nights' => $occupied,
                'available_nights' => $capacity,
                'payments' => $credited->count(),
                'average_booking_value' => $this->money($activeBookings->count() ? (float) $activeBookings->avg('total_amount') : 0),
            ],
            'rooms' => $rooms->map(function (Room $room) use ($stays, $bookings, $credited, $start, $end): array {
                $roomStays = $stays->where('room_id', $room->id);
                $roomBookings = $bookings->where('room_id', $room->id)->where('status', '!=', BookingStatus::Cancelled);
                $nights = $this->occupiedNights($roomStays, $start, $end);
                $capacity = $start->diffInDays($end) + 1;

                return [
                    'id' => $room->id, 'name' => $room->name, 'type_label' => $room->type->label(),
                    'bookings' => $roomBookings->count(), 'occupied_nights' => $nights,
                    'occupancy_rate' => $capacity > 0 ? round(($nights / $capacity) * 100, 1) : 0,
                    'booking_value' => $this->money($roomBookings->sum('total_amount')),
                    'revenue' => $this->money($credited->filter(fn (Payment $payment): bool => $payment->booking?->room_id === $room->id)->sum('amount_paid')),
                ];
            })->values()->all(),
            'payment_methods' => collect(PaymentMethod::cases())->map(function (PaymentMethod $method) use ($credited): array {
                $items = $credited->where('method', $method);

                return ['method' => $method->value, 'label' => $method->label(), 'count' => $items->count(), 'amount' => $this->money($items->sum('amount_paid'))];
            })->all(),
            'transactions' => $payments->map(fn (Payment $payment): array => [
                'id' => $payment->id, 'payment_code' => $payment->payment_code,
                'paid_at' => $payment->paid_at?->toDateString(), 'created_at' => $payment->created_at->toDateString(),
                'booking_id' => $payment->booking_id, 'booking_code' => $payment->booking?->booking_code,
                'guest_name' => $payment->booking?->guest_name, 'room_name' => $payment->booking?->room?->name,
                'method' => $payment->method?->value, 'method_label' => $payment->method?->label() ?? 'Belum dipilih',
                'status' => $payment->status->value, 'status_label' => $payment->status->label(),
                'amount' => $this->money($payment->amount_paid),
            ])->values()->all(),
        ];
    }

    private function occupiedNights(Collection $stays, CarbonImmutable $start, CarbonImmutable $end): int
    {
        $exclusiveEnd = $end->addDay();

        return $stays->groupBy('room_id')->sum(function (Collection $roomStays) use ($start, $exclusiveEnd): int {
            $intervals = $roomStays->map(function (Booking $booking) use ($start, $exclusiveEnd): array {
                return [
                    CarbonImmutable::instance($booking->check_in)->max($start),
                    CarbonImmutable::instance($booking->check_out)->min($exclusiveEnd),
                ];
            })->filter(fn (array $interval): bool => $interval[0]->lt($interval[1]))
                ->sortBy(fn (array $interval): int => $interval[0]->getTimestamp())->values();
            $days = 0;
            $currentStart = null;
            $currentEnd = null;
            foreach ($intervals as [$from, $to]) {
                if ($currentStart === null) {
                    [$currentStart, $currentEnd] = [$from, $to];
                } elseif ($from->lte($currentEnd)) {
                    $currentEnd = $to->max($currentEnd);
                } else {
                    $days += $currentStart->diffInDays($currentEnd);
                    [$currentStart, $currentEnd] = [$from, $to];
                }
            }

            return $currentStart === null ? 0 : $days + $currentStart->diffInDays($currentEnd);
        });
    }

    private function percent(float|int|string $current, float|int|string $previous): ?float
    {
        $previous = (float) $previous;
        if ($previous === 0.0) {
            return (float) $current === 0.0 ? 0 : null;
        }

        return round((((float) $current - $previous) / $previous) * 100, 1);
    }

    private function money(float|int|string $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
