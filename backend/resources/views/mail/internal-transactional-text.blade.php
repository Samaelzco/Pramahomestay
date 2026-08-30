{{ $notification->subject }}

{{ $notification->payload['message'] }}
Kode booking: {{ $notification->payload['booking_code'] }}
Kamar: {{ $notification->payload['room_name'] ?? '-' }}
Menginap: {{ $notification->payload['check_in'] }} - {{ $notification->payload['check_out'] }}

@if($notification->action_url)
Buka di panel internal: {{ $notification->action_url }}
@endif

Email ini dikirim sesuai preferensi notifikasi akun internalmu.
