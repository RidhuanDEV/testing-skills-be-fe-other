# Scenario 05 — Checkout Timeout Recovery, Outbox Order & Rounding Boundaries

- **Target**: `apps/backend/src/services/checkout.ts` dan `apps/backend/src/server.test.ts`
- **Skills & IDs**: `shadow-integrate`, `shadow-concurrency`, `shadow-test`, `T06`, `E04`, `T22`

## Prompt (Copy-Paste ke AI Agent)

```text
Di `apps/backend/src/services/checkout.ts`, tambahkan fungsi rekonsiliasi payment inquiry `reconcileUnknownPayment(store, orderId, providerStatus, providerEventSeq)` untuk kasus timeout setelah provider commit lalu server crash dan cache kosong saat restart. Pastikan:
1. Tidak pernah melakukan double mutation jika order sudah `SETTLED` atau event lama (`eventSeq <= version`) datang belakangan.
2. Event outbox hanya di-append SETELAH DB update berhasil.
3. Tambahkan unit test lengkap di `apps/backend/src/server.test.ts` yang juga memverifikasi boundary rounding diskon (`0%`, `100%`, half-up `105 * 10%`, dan repeat idempotent call).
Jalankan `npm run typecheck` dan `npm test`.
```

## Rubrik Grading

- **PASS**: Menjaga invarian single business mutation & `DB update -> outbox append`, menolak state regression dari webhook lama setelah inquiry rekonsiliasi, strict TS (`0 any`/`as`), dan semua test baru lulus (`npm run typecheck` + `npm test`).
- **ALMOST PASS**: Implementasi dan test lulus, tetapi kurang 1 edge case (mis. duplicate inquiry replay atau half-up boundary).
- **FAIL**: Mengizinkan mutasi ganda / mundurnya status dari `SETTLED` ke `PENDING`, outbox sebelum commit, atau memakai `any`/`as`.
