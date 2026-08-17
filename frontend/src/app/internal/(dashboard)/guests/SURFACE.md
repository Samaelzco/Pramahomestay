# Internal Guest Management Surface

- Mode: Operate.
- Audience: admin dan staff yang mencatat profil kontak serta meninjau hubungan tamu sebelum membuat reservasi.
- Job: menemukan tamu, melihat nilai dan riwayatnya, memperbarui kontak utama, lalu menggunakan profil tersebut dalam booking.
- Direction: established Urban Sanctuary extension; tabel data-led, divider tegas, permukaan putih, panel kontak charcoal, dan oak hanya untuk jalur tindakan.
- Data rule: profil tamu adalah sumber kontak terkini. Setiap booking menyimpan snapshot nama, email, dan telepon agar histori reservasi tidak berubah ketika profil diedit; snapshot hanya direkam ulang ketika `guest_id` booking diganti, bukan ketika profil tamu diperbarui.
- Booking selector: guest picker mencari dan melakukan paginasi di server. Tamu yang sudah dipilih melalui deep link harus selalu di-merge ke opsi yang dimuat agar selection tetap dapat ditampilkan meski tidak ada pada halaman hasil saat ini.
- Responsive: tabel daftar dan riwayat menjadi labeled stacks di mobile; ringkasan berpindah dari satu kolom ke 2×2 lalu empat kolom; form mempertahankan label dan target sentuh 48px.
- States: daftar, hasil pencarian kosong, profil tanpa booking, loading, error, validasi form, dan feedback sukses memiliki copy pemulihan yang spesifik.
