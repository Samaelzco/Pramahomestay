# User & Hak Akses

- Mode: Operate.
- Admin mengelola user internal melalui daftar, filter, halaman tambah, dan halaman edit terpisah.
- Administrator dapat menambah dan mengedit role operasional beserta nama, deskripsi, dan permission per modul.
- Administrator merupakan role sistem dengan akses penuh yang dilindungi. Slug role custom tetap stabil setelah dibuat.
- Role hanya dapat dihapus jika belum digunakan user; tombol Hapus tetap terlihat dalam keadaan disabled ketika terikat.
- Akun sendiri tidak dapat dinonaktifkan, dihapus, atau diubah rolenya. Admin aktif terakhir tidak dapat dinonaktifkan atau dihapus.
- User hanya dapat dihapus jika belum memiliki riwayat operasional; kondisi lain tetap menampilkan tombol Hapus dalam keadaan disabled.
- Menonaktifkan user mencabut token login tetapi mempertahankan seluruh riwayat.
- Daftar menjadi tabel pada layar lebar dan data berlabel dua kolom pada tablet/mobile tanpa horizontal scroll.
