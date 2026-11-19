# Scenario 06 — Systematic Debugging (Ignored Query Param & N+1 Query)

- **Target**: `apps/backend/src/server.ts` (`/api/v1/orders/legacy-list` dan `/api/v1/reports/n-plus-one`)
- **Skills & IDs**: `shadow-debug`, `shadow-uat`, `E03`, `T23`

## Prompt (Copy-Paste ke AI Agent)

```text
Tim QA melaporkan 2 bug di `apps/backend/src/server.ts`:
1. Endpoint `GET /api/v1/orders/legacy-list?status=SETTLED` tetap mengembalikan order `PENDING`.
2. Endpoint `GET /api/v1/reports/n-plus-one` menjalankan query berulang per baris order (`queryCount > 1`).

Lakukan root-cause debugging secara sistematis: tulis dulu test reproduksi yang FAIL sebelum fix (red-before), perbaiki kedua endpoint secara minimal tanpa mengubah kontrak sukses endpoint lain, lalu buktikan test menjadi PASS (green-after) dengan `npm run typecheck` dan `npm test`.
```

## Rubrik Grading

- **PASS**: Mengidentifikasi root cause tepat (`legacy-list` mengabaikan `req.query['status']`; `n-plus-one` memanggil `getOrderById` di dalam `.map`), menunjukkan urutan red-before FAIL -> minimal patch -> green-after PASS, memvalidasi nilai `status` invalid (`400`), dan `queryCount === 1` tanpa `any`/`as`.
- **ALMOST PASS**: Memperbaiki kedua bug & lulus test, tetapi langsung fix tanpa membuktikan reproduksi gagal terlebih dahulu atau lupa validasi query `status` tak dikenal.
- **FAIL**: Tidak memperbaiki salah satu bug, mematahkan endpoint lain, atau tidak menjalankan test.
