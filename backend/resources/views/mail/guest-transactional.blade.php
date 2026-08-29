<!doctype html>
<html lang="{{ $notification->locale }}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ $notification->subject }}</title></head>
<body style="margin:0;background:#f3f3f3;color:#1a1c1c;font-family:Arial,sans-serif">
@php
    $p = $notification->payload ?? [];
    $en = $notification->locale === 'en';
    $headings = [
        'booking_created' => $en ? 'Your stay is being held.' : 'Kamar sedang kami tahan untukmu.',
        'payment_proof_submitted' => $en ? 'Your receipt is in review.' : 'Bukti pembayaran sedang diperiksa.',
        'payment_verified' => $en ? 'Your reservation is confirmed.' : 'Reservasimu sudah dikonfirmasi.',
        'payment_rejected' => $en ? 'Please check your payment receipt.' : 'Periksa kembali bukti pembayaranmu.',
        'booking_cancelled' => $en ? 'This booking has been cancelled.' : 'Booking ini telah dibatalkan.',
        'payment_expired' => $en ? 'The payment window has closed.' : 'Waktu pembayaran telah berakhir.',
    ];
    $messages = [
        'booking_created' => $en ? 'Keep your booking code and complete payment before the deadline.' : 'Simpan kode booking dan selesaikan pembayaran sebelum batas waktunya.',
        'payment_proof_submitted' => $en ? 'No need to upload it again. We will update you after verification.' : 'Tidak perlu mengunggah ulang. Kami akan mengabari setelah verifikasi.',
        'payment_verified' => $en ? 'Your payment is recorded. We look forward to welcoming you.' : 'Pembayaran sudah tercatat. Kami menantikan kedatanganmu.',
        'payment_rejected' => $en ? 'The receipt could not be verified. Please submit a clearer or corrected receipt.' : 'Bukti belum dapat diverifikasi. Silakan kirim bukti yang lebih jelas atau sudah diperbaiki.',
        'booking_cancelled' => $en ? 'The room has been released from your reservation.' : 'Kamar telah dilepas dari reservasi ini.',
        'payment_expired' => $en ? 'Contact the property if you still want to continue this reservation.' : 'Hubungi homestay jika kamu masih ingin melanjutkan reservasi.',
    ];
    $money = 'Rp '.number_format((float) ($p['total_amount'] ?? 0), 0, ',', '.');
@endphp
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3f3"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff">
<tr><td style="padding:28px 32px;border-bottom:1px solid #e2e2e2;font-weight:700">{{ $p['property_name'] ?? 'Prama Homestay' }}</td></tr>
<tr><td style="padding:40px 32px 20px"><h1 style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-.03em">{{ $headings[$notification->type->value] }}</h1><p style="margin:18px 0 0;color:#575b5c;font-size:16px;line-height:1.7">{{ $messages[$notification->type->value] }}</p></td></tr>
<tr><td style="padding:12px 32px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1e7da"><tr><td style="padding:22px"><div style="font-size:12px;color:#795830;font-weight:700">{{ $en ? 'BOOKING CODE' : 'KODE BOOKING' }}</div><div style="margin-top:8px;font-size:25px;font-weight:700;letter-spacing:-.02em">{{ $p['booking_code'] }}</div></td></tr></table></td></tr>
<tr><td style="padding:0 32px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:10px 0;color:#575b5c">{{ $en ? 'Room' : 'Kamar' }}</td><td align="right" style="padding:10px 0;font-weight:700">{{ $p['room_name'] ?? '—' }}</td></tr>
<tr><td style="padding:10px 0;color:#575b5c">{{ $en ? 'Stay' : 'Menginap' }}</td><td align="right" style="padding:10px 0;font-weight:700">{{ $p['check_in'] }} — {{ $p['check_out'] }}</td></tr>
<tr><td style="padding:10px 0;color:#575b5c">{{ $en ? 'Total' : 'Total' }}</td><td align="right" style="padding:10px 0;font-weight:700">{{ $money }}</td></tr>
</table></td></tr>
@if(!empty($p['reason']))<tr><td style="padding:0 32px 28px"><div style="background:#fff0ee;padding:18px"><strong>{{ $en ? 'Note' : 'Catatan' }}</strong><p style="margin:8px 0 0;line-height:1.6">{{ $p['reason'] }}</p></div></td></tr>@endif
@if($notification->action_url)<tr><td style="padding:0 32px 36px"><a href="{{ $notification->action_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:16px 22px;font-weight:700">{{ $en ? 'Continue to payment' : 'Lanjutkan pembayaran' }}</a></td></tr>@endif
<tr><td style="padding:24px 32px;background:#111;color:#c4c7c7;font-size:12px;line-height:1.6">{{ $en ? 'This is an automated transactional email. Keep your booking code private.' : 'Ini adalah email transaksi otomatis. Jaga kerahasiaan kode bookingmu.' }}</td></tr>
</table></td></tr></table></body></html>
