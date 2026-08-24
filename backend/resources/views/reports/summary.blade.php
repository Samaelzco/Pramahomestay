@php
    $en = ($locale ?? 'id') === 'en';
    $t = fn ($id, $english) => $en ? $english : $id;
    $rupiah = fn ($value) => 'Rp '.number_format((float) $value, 0, ',', '.');
    $tanggal = fn ($value) => \Carbon\CarbonImmutable::parse($value)->format('d/m/Y');
    $perubahan = function ($value, $suffix = '%') use ($t) {
        if ($value === null) return $t('Baru pada periode ini', 'New in this period');
        if ((float) $value === 0.0) return $t('Sama dengan periode sebelumnya', 'Same as the previous period');
        return ((float) $value > 0 ? '+' : '').$value.$suffix.' '.$t('dari periode sebelumnya', 'from the previous period');
    };
    $methodLabels = ['cash' => 'Cash', 'bank_transfer' => 'Bank transfer', 'qris' => 'QRIS', 'card' => 'Card'];
    $statusLabels = ['unpaid' => 'Unpaid', 'partial' => 'Partially paid', 'paid' => 'Paid', 'failed' => 'Failed', 'refunded' => 'Refunded'];
@endphp
<!doctype html>
<html lang="{{ $en ? 'en' : 'id' }}">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 34px 34px 44px; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: "DejaVu Sans", sans-serif; color: #1a1c1c; font-size: 8.5px; line-height: 1.45; }
        h1, h2, p { margin: 0; }
        h1 { font-size: 23px; line-height: 1.15; letter-spacing: -0.4px; }
        h2 { margin-bottom: 8px; font-size: 12px; line-height: 1.25; }
        .muted { color: #5f6263; }
        .right { text-align: right; }
        .nowrap { white-space: nowrap; }
        .document-header { padding-bottom: 16px; border-bottom: 1px solid #aeb1b1; }
        .document-header table { width: 100%; border-collapse: collapse; }
        .document-header td { padding: 0; vertical-align: top; }
        .brand { margin-bottom: 4px; font-size: 8px; font-weight: 700; letter-spacing: 0.9px; text-transform: uppercase; }
        .address { max-width: 360px; margin-top: 7px; line-height: 1.5; }
        .period { width: 185px; text-align: right; }
        .period-label { margin-bottom: 4px; font-size: 7px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
        .period strong { display: block; font-size: 10px; }
        .summary { margin-top: 16px; page-break-inside: avoid; }
        .summary-table { width: 100%; border-collapse: separate; border-spacing: 6px; margin: -6px; }
        .summary-table td { width: 50%; padding: 11px 12px; vertical-align: top; background: #f2f1ee; }
        .metric-label { color: #525556; font-size: 8px; }
        .metric-value { display: block; margin-top: 3px; font-size: 16px; line-height: 1.25; }
        .metric-note { display: block; margin-top: 3px; color: #666968; font-size: 7px; }
        .support-strip { width: 100%; margin-top: 8px; border-collapse: collapse; border-top: 1px solid #d6d7d5; border-bottom: 1px solid #d6d7d5; }
        .support-strip td { width: 33.33%; padding: 8px 10px; border-left: 1px solid #d6d7d5; }
        .support-strip td:first-child { padding-left: 0; border-left: 0; }
        .support-strip td:last-child { padding-right: 0; }
        .support-strip strong { display: block; margin-top: 2px; font-size: 9px; }
        .section { margin-top: 20px; }
        .section-heading { padding-bottom: 7px; border-bottom: 1px solid #aeb1b1; }
        .section-heading p { margin-top: 2px; font-size: 7.5px; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data thead { display: table-header-group; }
        table.data tr { page-break-inside: avoid; }
        table.data th { padding: 7px 6px; background: #f2f1ee; color: #414445; font-size: 6.5px; font-weight: 700; letter-spacing: 0.55px; text-align: left; text-transform: uppercase; }
        table.data td { padding: 8px 6px; border-bottom: 1px solid #dedfdd; vertical-align: top; }
        table.data th:first-child, table.data td:first-child { padding-left: 8px; }
        table.data th:last-child, table.data td:last-child { padding-right: 8px; }
        table.data .right { text-align: right; }
        .primary-line { font-weight: 700; }
        .secondary-line { margin-top: 2px; color: #666968; font-size: 7px; }
        .method-grid { width: 100%; border-collapse: separate; border-spacing: 6px; margin: 2px -6px -6px; }
        .method-grid td { width: 50%; padding: 9px 10px; vertical-align: top; background: #f7f6f4; }
        .method-grid .amount { float: right; font-weight: 700; }
        .method-grid .count { margin-top: 3px; color: #666968; font-size: 7px; }
        .empty { padding: 18px !important; color: #666968; text-align: center; }
        .document-footer { position: fixed; right: 0; bottom: -28px; left: 0; padding-top: 7px; border-top: 1px solid #d6d7d5; color: #6b6e6e; font-size: 6.5px; }
        .document-footer .confidential { float: right; }
    </style>
</head>
<body>
    <footer class="document-footer"><span>{{ $settings?->name ?? 'Prama Homestay' }} · {{ $t('Laporan internal', 'Internal report') }}</span><span class="confidential">{{ $t('Dibuat', 'Generated') }} {{ now()->timezone($settings?->timezone ?? 'Asia/Makassar')->format('d/m/Y H:i') }}</span></footer>
    <header class="document-header"><table><tr>
        <td><div class="brand">{{ $settings?->name ?? 'Prama Homestay' }}</div><h1>{{ $t('Laporan usaha', 'Business report') }}</h1><p class="address muted">{{ $settings?->address }}</p></td>
        <td class="period"><div class="period-label muted">{{ $t('Periode laporan', 'Report period') }}</div><strong>{{ $tanggal($report['period']['start']) }} - {{ $tanggal($report['period']['end']) }}</strong><span class="muted">{{ $report['period']['days'] }} {{ $t('hari', 'days') }}</span></td>
    </tr></table></header>

    <section class="summary">
        <table class="summary-table">
            <tr><td><span class="metric-label">{{ $t('Pendapatan diterima', 'Revenue received') }}</span><strong class="metric-value">{{ $rupiah($report['metrics']['revenue']) }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['revenue_percent']) }}</span></td><td><span class="metric-label">{{ $t('Booking masuk', 'New bookings') }}</span><strong class="metric-value">{{ $report['metrics']['bookings'] }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['bookings_percent']) }}</span></td></tr>
            <tr><td><span class="metric-label">{{ $t('Okupansi', 'Occupancy') }}</span><strong class="metric-value">{{ $report['metrics']['occupancy_rate'] }}%</strong><span class="metric-note">{{ $perubahan($report['comparison']['occupancy_points'], $t(' poin', ' points')) }}</span></td><td><span class="metric-label">{{ $t('Pembayaran valid', 'Valid payments') }}</span><strong class="metric-value">{{ $report['metrics']['payments'] }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['payments_percent']) }}</span></td></tr>
        </table>
        <table class="support-strip"><tr><td><span class="muted">{{ $t('Rata-rata booking', 'Average booking') }}</span><strong>{{ $rupiah($report['metrics']['average_booking_value']) }}</strong></td><td><span class="muted">{{ $t('Malam terisi', 'Occupied nights') }}</span><strong>{{ $report['metrics']['occupied_nights'] }} {{ $t('malam', 'nights') }}</strong></td><td><span class="muted">{{ $t('Kapasitas periode', 'Period capacity') }}</span><strong>{{ $report['metrics']['available_nights'] }} {{ $t('malam kamar', 'room nights') }}</strong></td></tr></table>
    </section>

    <section class="section">
        <div class="section-heading"><h2>{{ $t('Performa kamar', 'Room performance') }}</h2><p class="muted">{{ $t('Ringkasan booking, pemakaian malam, dan pendapatan per unit aktif.', 'Summary of bookings, occupied nights, and revenue for each active unit.') }}</p></div>
        <table class="data"><thead><tr><th style="width:25%">{{ $t('Kamar', 'Room') }}</th><th style="width:13%">Booking</th><th style="width:15%">{{ $t('Malam terisi', 'Occupied nights') }}</th><th style="width:15%">{{ $t('Okupansi', 'Occupancy') }}</th><th class="right" style="width:32%">{{ $t('Pendapatan', 'Revenue') }}</th></tr></thead><tbody>@foreach($report['rooms'] as $room)<tr><td><div class="primary-line">{{ $room['name'] }}</div></td><td>{{ $room['bookings'] }}</td><td>{{ $room['occupied_nights'] }}</td><td>{{ $room['occupancy_rate'] }}%</td><td class="right"><div class="primary-line">{{ $rupiah($room['revenue']) }}</div><div class="secondary-line">{{ $t('Nilai booking', 'Booking value') }} {{ $rupiah($room['booking_value']) }}</div></td></tr>@endforeach</tbody></table>
    </section>

    <section class="section" style="page-break-inside: avoid">
        <div class="section-heading"><h2>{{ $t('Rekap metode pembayaran', 'Payment method summary') }}</h2><p class="muted">{{ $t('Nilai pembayaran valid yang diterima pada periode terpilih.', 'Value of valid payments received in the selected period.') }}</p></div>
        <table class="method-grid">@foreach(collect($report['payment_methods'])->chunk(2) as $methods)<tr>@foreach($methods as $method)<td><span>{{ $en ? ($methodLabels[$method['method']] ?? $method['label']) : $method['label'] }}</span><span class="amount">{{ $rupiah($method['amount']) }}</span><div class="count">{{ $method['count'] }} {{ $t('transaksi', 'transactions') }}</div></td>@endforeach @if($methods->count() === 1)<td></td>@endif</tr>@endforeach</table>
    </section>

    <section class="section">
        <div class="section-heading"><h2>{{ $t('Transaksi pembayaran', 'Payment transactions') }}</h2><p class="muted">{{ count($report['transactions']) }} {{ $t('catatan pembayaran dibuat pada periode laporan.', 'payment records were created in the report period.') }}</p></div>
        <table class="data"><thead><tr><th style="width:20%">{{ $t('Pembayaran', 'Payment') }}</th><th style="width:27%">Booking / {{ $t('tamu', 'guest') }}</th><th style="width:14%">{{ $t('Kamar', 'Room') }}</th><th style="width:19%">{{ $t('Metode', 'Method') }} / status</th><th class="right" style="width:20%">{{ $t('Jumlah', 'Amount') }}</th></tr></thead><tbody>@forelse($report['transactions'] as $row)<tr><td><div class="primary-line">{{ $row['payment_code'] }}</div><div class="secondary-line">{{ $tanggal($row['paid_at'] ?? $row['created_at']) }}</div></td><td><div class="primary-line">{{ $row['booking_code'] }}</div><div class="secondary-line">{{ $row['guest_name'] }}</div></td><td>{{ $row['room_name'] }}</td><td><div>{{ $en ? ($methodLabels[$row['method']] ?? $row['method_label']) : $row['method_label'] }}</div><div class="secondary-line">{{ $en ? ($statusLabels[$row['status']] ?? $row['status_label']) : $row['status_label'] }}</div></td><td class="right primary-line nowrap">{{ $rupiah($row['amount']) }}</td></tr>@empty<tr><td colspan="5" class="empty">{{ $t('Belum ada transaksi pada periode ini.', 'There are no transactions in this period.') }}</td></tr>@endforelse</tbody></table>
    </section>
</body>
</html>
