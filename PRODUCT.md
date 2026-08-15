# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Pelanggan melihat kamar, membuat pemesanan dan pembayaran, serta memeriksa status pesanan tanpa login.
- Staff menjalankan operasional kamar, booking, dan pembayaran.
- Admin mengelola seluruh fitur internal, termasuk dashboard, kamar, booking, pembayaran, user, role, permission, dan log aktivitas.

## Product Purpose

Prama Homestay menyatukan pengalaman pemesanan pelanggan dan pekerjaan operasional homestay. Keberhasilan berarti pelanggan dapat menyelesaikan alur pemesanan dengan jelas, sementara tim internal dapat menjaga data kamar, booking, dan pembayaran tetap akurat.

## Operating Context

Fitur internal dibangun satu per satu dan memerlukan konfirmasi sebelum implementasi. Fitur Kamar adalah vertical slice pertama; data Booking dan Pembayaran belum boleh diasumsikan tersedia di permukaan Kamar.

## Capabilities and Constraints

- Stack yang dikonfirmasi: Next.js, Laravel, PostgreSQL, dan Docker dalam monorepo.
- Backend wajib memakai service–repository pattern.
- Autentikasi API memakai Laravel Sanctum; akses internal memakai role dan permission Spatie.
- Setiap fitur internal memiliki halaman index, create, dan edit yang terpisah.
- Frontend dipisah per route, komponen, dan fitur; satu halaman besar tidak boleh memuat seluruh implementasi.
- Setiap perubahan harus melalui testing sebelum fitur berikutnya dimulai.
- Fitur pelanggan dikerjakan setelah validasi keamanan dan harus mobile-first.

## Brand Commitments

Nama produk adalah Prama Homestay. Sistem visual “Urban Sanctuary” pada `DESIGN.md` dan referensi Stitch merupakan acuan yang mengikat.

## Evidence on Hand

- Brief produk: `PROJECT.md`.
- Sistem desain: `DESIGN.md`.
- Referensi halaman dan source visual: `stitch_urban_prama_homestay_booking/`.
- Belum ada data booking, checkout tamu, pembayaran, atau progress housekeeping yang boleh ditampilkan sebagai fakta pada fitur Kamar.

## Product Principles

- Jaga data operasional sebagai sumber kebenaran, bukan dekorasi UI.
- Pisahkan fitur agar perubahan dapat diuji dan dikembangkan tanpa saling mengikat.
- Jangan mengarang data lintas fitur yang belum dibangun.
- Berikan akses sesuai tugas admin dan staff melalui permission eksplisit.
