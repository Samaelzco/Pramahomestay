membuat web dan manajemen pemesanan kamar pada Prama Homestay.
tech stack: next js, laravel, postgre, docker
user : pelanggan, admin, staff
role permission based access
fitur: pelanggan melihat landing page, melihat kamar, melihat detail kamar, melakukan pemesanan, melakukan pembayaran, melihat status pesanan tanpa login. staff manage fitur operasional seperti kamar, booking, dan pembayaran. admin manage semua fitur internal termasuk melihat dashboard, kamar, pembayaran, booking, user, role dan permission, log aktivitas.
setiap step harus merancu pada product md ini, setiap melakukan perubahan atau melaksanakan step wajib melakukan testing kalau sudah bebas tanpa error baru boleh selesai dan lanjut ke step berikutnya. 

step by step
1. buat folder frontend lalu install next js terbaru
2. buat folder backend lalu install laravel terbaru, set database menggunakan postgre, laravel sancthum, laravel spatie
3. setup docker untuk project ini
4. setup mono repo untuk project ini
5. setup arsitektur laravel untuk menggunakan service-repository pattern dan wajib
6. buat seeder untuk admin dengan email: admin@gmail.com, password: password
7. buat database dan juga model untuk project sesuai fitur yang sudah ditentukan. pastikan masing masing itu ada index, create, dan edit pada internal jangan semua dijadikan 1 file. lalu langsung buat tampilan UI nya di frontend dan sambungkan apinya agar BE dan FE terkoneksi. buat per masing masing fitur internal dulu jangan langsung semuanya. konfirmasi dulu ke aku fitur apa yang akan kamu kerjakan. pada next js juga harus di pisah per fitur jangan dijadikan semua dalam 1 file tsx
8. cek validasi agar lebih aman
9. buat page untuk pelanggan sesuai dengan referensi dan pastikan mobile first.