@php
    $rupiah = fn ($value) => 'Rp '.number_format((float) $value, 0, ',', '.');
    $tanggal = fn ($value) => \Carbon\CarbonImmutable::parse($value)->format('d/m/Y');
    $perubahan = function ($value, $suffix = '%') {
        if ($value === null) return 'Baru pada periode ini';
        if ((float) $value === 0.0) return 'Sama dengan periode sebelumnya';
        return ((float) $value > 0 ? '+' : '').$value.$suffix.' dari periode sebelumnya';
    };
@endphp
<!doctype html>
<html lang="id">
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
    <footer class="document-footer"><span>{{ $settings?->name ?? 'Prama Homestay' }} · Laporan internal</span><span class="confidential">Dibuat {{ now()->timezone($settings?->timezone ?? 'Asia/Makassar')->format('d/m/Y H:i') }}</span></footer>
    <header class="document-header"><table><tr>
        <td><div class="brand">{{ $settings?->name ?? 'Prama Homestay' }}</div><h1>Laporan usaha</h1><p class="address muted">{{ $settings?->address }}</p></td>
        <td class="period"><div class="period-label muted">Periode laporan</div><strong>{{ $tanggal($report['period']['start']) }} - {{ $tanggal($report['period']['end']) }}</strong><span class="muted">{{ $report['period']['days'] }} hari</span></td>
    </tr></table></header>

    <section class="summary">
        <table class="summary-table">
            <tr><td><span class="metric-label">Pendapatan diterima</span><strong class="metric-value">{{ $rupiah($report['metrics']['revenue']) }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['revenue_percent']) }}</span></td><td><span class="metric-label">Booking masuk</span><strong class="metric-value">{{ $report['metrics']['bookings'] }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['bookings_percent']) }}</span></td></tr>
            <tr><td><span class="metric-label">Okupansi</span><strong class="metric-value">{{ $report['metrics']['occupancy_rate'] }}%</strong><span class="metric-note">{{ $perubahan($report['comparison']['occupancy_points'], ' poin') }}</span></td><td><span class="metric-label">Pembayaran valid</span><strong class="metric-value">{{ $report['metrics']['payments'] }}</strong><span class="metric-note">{{ $perubahan($report['comparison']['payments_percent']) }}</span></td></tr>
        </table>
        <table class="support-strip"><tr><td><span class="muted">Rata-rata booking</span><strong>{{ $rupiah($report['metrics']['average_booking_value']) }}</strong></td><td><span class="muted">Malam terisi</span><strong>{{ $report['metrics']['occupied_nights'] }} malam</strong></td><td><span class="muted">Kapasitas periode</span><strong>{{ $report['metrics']['available_nights'] }} malam kamar</strong></td></tr></table>
    </section>

    <section class="section">
        <div class="section-heading"><h2>Performa kamar</h2><p class="muted">Ringkasan booking, pemakaian malam, dan pendapatan per unit aktif.</p></div>
        <table class="data"><thead><tr><th style="width:25%">Kamar</th><th style="width:13%">Booking</th><th style="width:15%">Malam terisi</th><th style="width:15%">Okupansi</th><th class="right" style="width:32%">Pendapatan</th></tr></thead><tbody>@foreach($report['rooms'] as $room)<tr><td><div class="primary-line">{{ $room['name'] }}</div><div class="secondary-line">{{ $room['type_label'] }}</div></td><td>{{ $room['bookings'] }}</td><td>{{ $room['occupied_nights'] }}</td><td>{{ $room['occupancy_rate'] }}%</td><td class="right"><div class="primary-line">{{ $rupiah($room['revenue']) }}</div><div class="secondary-line">Nilai booking {{ $rupiah($room['booking_value']) }}</div></td></tr>@endforeach</tbody></table>
    </section>

    <section class="section" style="page-break-inside: avoid">
        <div class="section-heading"><h2>Rekap metode pembayaran</h2><p class="muted">Nilai pembayaran valid yang diterima pada periode terpilih.</p></div>
        <table class="method-grid">@foreach(collect($report['payment_methods'])->chunk(2) as $methods)<tr>@foreach($methods as $method)<td><span>{{ $method['label'] }}</span><span class="amount">{{ $rupiah($method['amount']) }}</span><div class="count">{{ $method['count'] }} transaksi</div></td>@endforeach @if($methods->count() === 1)<td></td>@endif</tr>@endforeach</table>
    </section>

    <section class="section">
        <div class="section-heading"><h2>Transaksi pembayaran</h2><p class="muted">{{ count($report['transactions']) }} catatan pembayaran dibuat pada periode laporan.</p></div>
        <table class="data"><thead><tr><th style="width:20%">Pembayaran</th><th style="width:27%">Booking / tamu</th><th style="width:14%">Kamar</th><th style="width:19%">Metode / status</th><th class="right" style="width:20%">Jumlah</th></tr></thead><tbody>@forelse($report['transactions'] as $row)<tr><td><div class="primary-line">{{ $row['payment_code'] }}</div><div class="secondary-line">{{ $tanggal($row['paid_at'] ?? $row['created_at']) }}</div></td><td><div class="primary-line">{{ $row['booking_code'] }}</div><div class="secondary-line">{{ $row['guest_name'] }}</div></td><td>{{ $row['room_name'] }}</td><td><div>{{ $row['method_label'] }}</div><div class="secondary-line">{{ $row['status_label'] }}</div></td><td class="right primary-line nowrap">{{ $rupiah($row['amount']) }}</td></tr>@empty<tr><td colspan="5" class="empty">Belum ada transaksi pada periode ini.</td></tr>@endforelse</tbody></table>
    </section>
</body>
</html>
