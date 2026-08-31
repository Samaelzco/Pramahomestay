# Internal Payments Surface

- Mode: Operate.
- Audience: admin dan staff yang merekonsiliasi tagihan reservasi.
- Job: menemukan transaksi, melihat sisa tagihan, mencatat pembayaran, menyimpan bukti, dan menangani transaksi gagal atau dikembalikan.
- Primary action: tambah pembayaran; aksi tiap baris membuka detail sebelum edit.
- Lifecycle: pembayaran sebagian atau lunas dapat ditandai dikembalikan dengan alasan wajib; nominal dan bukti tidak dihapus agar riwayat transaksi tetap utuh.
- Direction: established-world extension dari Urban Sanctuary dengan ringkasan tagihan sebagai umpan balik utama.
- Responsive moment: tabel menjadi susunan informasi berlabel; form, ringkasan nominal, dan bukti tersusun vertikal.
- Constraints: satu ringkasan pembayaran per booking, nominal tidak boleh melampaui tagihan, status normal dihitung server, dan gambar maksimum 5 MB.
