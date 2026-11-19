# Scenario 07 — Search Tenant ACL Pre-Filter, UU PDP Erasure & Restore Rehydration

- **Target**: `apps/backend/src/db.ts` dan `apps/backend/src/server.test.ts`
- **Skills & IDs**: `shadow-search`, `shadow-privacy`, `shadow-resilience`, `T19`, `E08`

## Prompt (Copy-Paste ke AI Agent)

```text
Pada `apps/backend/src/db.ts`, tambahkan fungsi `replayErasureTombstonesAfterRestore(store)` untuk mensimulasikan skenario disaster recovery: sebuah snapshot DB sebelum erasure di-restore (sehingga dokumen yang sudah dihapus ikut hidup kembali), lalu log `erasure_tombstones` di-replay secara deterministik. Pastikan:
1. Dokumen biasa yang ada di tombstone kembali ditandai `erased = 1` dan TIDAK pernah muncul di `searchDocumentsForTenant`.
2. Dokumen dengan `legalHold = true` tetap terlindungi (tidak terhapus).
3. Pencarian tetap mempertahankan tenant ACL pre-filter di SQL (bukan post-filter setelah LIMIT).
Tambahkan test end-to-end di `apps/backend/src/server.test.ts` dan jalankan `npm run typecheck` serta `npm test`.
```

## Rubrik Grading

- **PASS**: Mengimplementasikan replay tombstone pasca-restore yang menjaga `legalHold`, membuktikan dokumen terhapus hilang dari hasil search dan dokumen tenant lain (`t-beta`) tetap 0 bocor ke `t-alpha`, strict TS (`0 any`/`as`), dan semua test lulus.
- **ALMOST PASS**: Logika replay benar dan lulus test, tetapi tidak menyertakan bukti simulasi "resurrection -> replay -> hilang dari search".
- **FAIL**: Menghapus dokumen `legalHold`, mengubah pre-filter SQL menjadi post-filter setelah `LIMIT`, atau tidak menjalankan test.
