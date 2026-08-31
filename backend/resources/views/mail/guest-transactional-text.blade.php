{{ $notification->subject }}

{{ $notification->locale === 'en' ? 'Booking code' : 'Kode booking' }}: {{ $notification->payload['booking_code'] }}
{{ $notification->locale === 'en' ? 'Room' : 'Kamar' }}: {{ $notification->payload['room_name'] ?? '-' }}
{{ $notification->locale === 'en' ? 'Stay' : 'Menginap' }}: {{ $notification->payload['check_in'] }} - {{ $notification->payload['check_out'] }}
@if(!empty($notification->payload['reason']))
{{ $notification->locale === 'en' ? 'Note' : 'Catatan' }}: {{ $notification->payload['reason'] }}
@endif
@if($notification->action_url)
{{ $notification->locale === 'en' ? 'Continue payment' : 'Lanjutkan pembayaran' }}: {{ $notification->action_url }}
@endif
