# Internal Bookings Surface

- Mode: Operate.
- Audience: admin dan staff yang mencatat reservasi serta menjalankan aktivitas kedatangan dan keberangkatan tamu.
- Job: menemukan booking, memeriksa jadwal, mencegah bentrok kamar, membuat reservasi, membaca detail, dan memperbarui status.
- Primary action: tambah booking; aksi tiap baris membuka detail sebelum edit.
- Lifecycle: booking menunggu atau dikonfirmasi dapat dibatalkan dengan alasan opsional. Check-in/selesai tidak dapat dibatalkan; pembayaran yang sudah dikreditkan harus dikembalikan lebih dahulu.
- Delete rule: soft delete hanya untuk booking menunggu atau dibatalkan yang belum memiliki data pembayaran. Status aktif dan relasi pembayaran mengunci aksi hapus dengan alasan yang terlihat.
- Content: data Booking dan relasi Room. Pembayaran belum ditampilkan sampai fitur Pembayaran dibangun.
- Direction: established-world extension dari Urban Sanctuary—daftar operasional padat, detail menginap berhierarki jelas, dan estimasi biaya menjadi umpan balik utama pada form.
- Responsive moment: tabel berubah menjadi susunan informasi berlabel pada mobile; form dan ringkasan biaya tersusun vertikal.
- Constraints: total dihitung server dari snapshot harga kamar, booking non-cancelled tidak boleh tumpang tindih, dan kapasitas tamu mengikuti kamar.
