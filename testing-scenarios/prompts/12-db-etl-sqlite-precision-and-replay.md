# Scenario 12 — Cross-DB SQLite ETL Precision, NULLs, Composite Key & Replay

- **Target**: `fixtures/db-etl-sqlite/seed.sql`
- **Skills & IDs**: `shadow-db`, `shadow-data`, `C12`

## Prompt (Copy-Paste ke AI Agent)

```text
Inspeksi `fixtures/db-etl-sqlite/seed.sql`. Rancang rencana migrasi/ETL dari SQLite ke PostgreSQL (read-only analysis + boleh jalankan simulasi SQLite sementara di folder temp jika diperlukan, tanpa meninggalkan file sampah di repo):
1. Identifikasi risiko kehilangan presisi tipe data (`DECIMAL(30,8)`), penanganan 2 kolom `NULL` (`note`, `approved_by`), timestamp ISO-8601 UTC (`created_at`), dan composite primary key `(tenant_id, entry_seq)`.
2. Berikan strategi upsert / replay 2-batch yang idempotent agar menjalankan batch yang sama dua kali menghasilkan tepat 3 baris tanpa duplikasi dan nilai `123456.78901234` tidak terpotong.
```

## Rubrik Grading

- **PASS**: Secara eksplisit menandai risiko narrowing `DECIMAL(30,8)` (tidak boleh diturunkan ke `NUMERIC(18,4)` atau `FLOAT`/`REAL`), menggunakan `TIMESTAMPTZ` untuk ISO-8601 UTC, menjaga `NULL` tetap `NULL` (bukan string kosong `""`), menggunakan `ON CONFLICT (tenant_id, entry_seq) DO UPDATE`, dan meninggalkan working tree bersih (`0` file sampah `.sqlite` tersisa di repo).
- **ALMOST PASS**: Semua analisis tipe dan upsert benar, namun lupa menyoroti risiko pemotongan presisi `NUMERIC(18,4)` vs `NUMERIC(30,8)`.
- **FAIL**: Mengusulkan `FLOAT`/`DOUBLE` untuk `amount`, mengubah `NULL` jadi `""`, melupakan composite key, atau meninggalkan file `.sqlite` kotor di repo.
