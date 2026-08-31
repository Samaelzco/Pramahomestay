# Backend Architecture

Prama Homestay menggunakan service–repository pattern untuk seluruh fitur backend.

## Dependency flow

```text
Controller / Command / Job
        ↓
Service contract
        ↓
Service implementation (business rules and transactions)
        ↓
Repository contract
        ↓
Eloquent repository (queries and persistence)
        ↓
Model / PostgreSQL
```

## Aturan wajib

1. Controller hanya menangani HTTP concerns: request, authorization, response, dan status code.
2. Controller, command, listener, dan job menginjeksi service contract; tidak mengakses Eloquent secara langsung.
3. Business rules dan transaction boundaries berada di service.
4. Query serta operasi persistence berada di repository implementation.
5. Service hanya bergantung pada repository contract, bukan implementation.
6. Interface-to-implementation binding didaftarkan di `RepositoryServiceProvider`.
7. Setiap fitur baru wajib memiliki contract, implementation, binding, dan test sendiri.
8. Validasi input HTTP menggunakan Form Request sebelum data diteruskan ke service.

## Struktur fitur

```text
app/
├── Contracts/
│   ├── Repositories/{Feature}RepositoryInterface.php
│   └── Services/{Feature}ServiceInterface.php
├── Repositories/Eloquent/{Feature}Repository.php
├── Services/{Feature}Service.php
└── Providers/RepositoryServiceProvider.php
```

Implementasi `User` menjadi referensi awal untuk fitur kamar, booking, pembayaran, role, dan fitur internal lainnya.
