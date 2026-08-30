<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ $notification->subject }}</title></head>
<body style="margin:0;background:#f3f3f3;color:#1a1c1c;font-family:Arial,sans-serif">
@php $p = $notification->payload ?? []; @endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3f3"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff">
<tr><td style="padding:28px 32px;border-bottom:1px solid #e2e2e2;font-weight:700">{{ $p['property_name'] ?? 'Prama Homestay' }} · Internal</td></tr>
<tr><td style="padding:40px 32px 20px"><div style="font-size:12px;color:#795830;font-weight:700;letter-spacing:.08em">TINDAKAN DIPERLUKAN</div><h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;letter-spacing:-.03em">{{ $notification->subject }}</h1><p style="margin:18px 0 0;color:#575b5c;font-size:16px;line-height:1.7">{{ $p['message'] }}</p></td></tr>
<tr><td style="padding:12px 32px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1e7da"><tr><td style="padding:22px"><div style="font-size:12px;color:#795830;font-weight:700">KODE BOOKING</div><div style="margin-top:8px;font-size:24px;font-weight:700">{{ $p['booking_code'] }}</div><div style="margin-top:8px;color:#575b5c">{{ $p['room_name'] ?? '—' }} · {{ $p['check_in'] }} — {{ $p['check_out'] }}</div></td></tr></table></td></tr>
@if($notification->action_url)<tr><td style="padding:0 32px 36px"><a href="{{ $notification->action_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:16px 22px;font-weight:700">Buka di panel internal</a></td></tr>@endif
<tr><td style="padding:24px 32px;background:#111;color:#c4c7c7;font-size:12px;line-height:1.6">Email ini dikirim karena akunmu mengaktifkan notifikasi email dan memiliki hak akses yang sesuai. Preferensi dapat diubah pada data user.</td></tr>
</table></td></tr></table></body></html>
