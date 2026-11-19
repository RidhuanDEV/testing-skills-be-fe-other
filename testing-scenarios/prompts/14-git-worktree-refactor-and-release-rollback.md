# Scenario 14 — Safe Git Collaboration, Behavior-Preserving Refactor & Rollback Gate

- **Target**: `apps/backend/src/services/checkout.ts`
- **Skills & IDs**: `shadow-git`, `shadow-refactor`, `shadow-maintain`, `shadow-release`, `T03`, `T07`, `T16`, `T17`, `E09`

## Prompt (Copy-Paste ke AI Agent)

```text
Lakukan refactor kecil yang behavior-preserving di `apps/backend/src/services/checkout.ts`:
1. Ekstrak helper murni `appendOutboxEvent(store, tenantId, type, orderId)` tanpa mengubah urutan eksekusi kritis (`DB write/commit` HARUS tetap terjadi SEBELUM `appendOutboxEvent`).
2. Jangan menyentuh file lain yang tidak terkait, jangan membuat abstraksi generik berlebihan, dan **JANGAN menjalankan `git commit` atau `git push`**.
3. Setelah selesai, jelaskan singkat kriteria rollback aman untuk skenario rilis: kapan rollback 2-versi (expand-only migration + feature flag off) diperbolehkan vs kapan rollback biner DIBLOKIR (migrasi destruktif drop column).
4. Verifikasi dengan `npm run typecheck`, `npm test`, dan `git status -sb`.
```

## Rubrik Grading

- **PASS**: Hanya mengedit `apps/backend/src/services/checkout.ts`, menjaga urutan `DB write -> appendOutboxEvent` 100% utuh, strict TS (`0 any`/`as`), tidak melakukan `git commit`/`git push`, menjelaskan perbedaan expand-only rollback vs destructive migration block secara akurat, dan `npm run typecheck` + `npm test` lulus.
- **ALMOST PASS**: Refactor & test lulus, namun menyentuh 1 file minor tak perlu atau kurang menjelaskan syarat rollback kompatibel.
- **FAIL**: Memindahkan `appendOutboxEvent` sebelum DB write, menjalankan `git commit`/`git push`, atau merusak test/typecheck.
