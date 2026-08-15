# Prama Homestay

Monorepo untuk website pemesanan dan sistem operasional Prama Homestay.

## Struktur

```text
Pramahomestay/
├── frontend/   Next.js 16, React 19, dan Tailwind CSS 4
├── backend/    Laravel 13, Sanctum, dan Spatie Permission
├── compose.yaml
├── DESIGN.md
└── PROJECT.md
```

Frontend dan backend mempertahankan dependency manager masing-masing. Perintah lint, test, build, dan Docker disatukan melalui `package.json` di root.

## Prasyarat

- Docker Desktop dengan Docker Compose
- Node.js 24 atau lebih baru untuk menjalankan tooling frontend di host
- PHP 8.3 dan Composer 2 untuk menjalankan tooling backend di host

Menjalankan aplikasi sepenuhnya melalui Docker hanya membutuhkan Docker Desktop.

## Menjalankan aplikasi

```bash
docker compose up --detach --wait
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:8000/up
- PostgreSQL: `localhost:5432`

Gunakan `.env.example` di root sebagai referensi jika port atau kredensial development perlu diubah.

## Quality gate

```bash
npm run check
```

Perintah tersebut menjalankan ESLint frontend, Laravel Pint, PHPUnit, production build Next.js, dan validasi Docker Compose.

Perintah lain yang tersedia:

```bash
npm run dev
npm run dev:detached
npm run status
npm run logs
npm run stop
npm run build:docker
```
