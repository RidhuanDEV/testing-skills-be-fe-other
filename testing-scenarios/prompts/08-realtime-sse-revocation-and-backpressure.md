# Scenario 08 — Realtime SSE Resumption, Mid-Session Revocation & Backpressure

- **Target**: `apps/backend/src/server.ts` (`/api/v1/events/stream`)
- **Skills & IDs**: `shadow-realtime`, `T15`

## Prompt (Copy-Paste ke AI Agent)

```text
Audit dan tingkatkan endpoint SSE `GET /api/v1/events/stream` di `apps/backend/src/server.ts`:
1. Jika `Last-Event-ID` lebih tua dari batas retensi buffer yang tersedia (simulasikan dengan batas `MAX_REPLAY_GAP = 50` atau jika cursor melebihi urutan terakhir), kirim event eksplisit `snapshot_required` agar client melakukan resync state daripada diam-diam kehilangan event.
2. Jelaskan singkat arsitektur produksi untuk multi-node pub/sub fan-out (Redis Pub/Sub atau NATS) dan batas antrean slow-consumer backpressure.
3. Pertahankan isolasi tenant dan terminasi akses saat sesi SSO dicabut (`revokeSsoSession`), tambahkan test di `apps/backend/src/server.test.ts`, lalu jalankan `npm run typecheck` dan `npm test`.
```

## Rubrik Grading

- **PASS**: Menambahkan event `snapshot_required` pada kondisi stale/out-of-window cursor, mempertahankan isolasi tenant & penolakan sesi SSO yang dicabut (`401`), menjelaskan multi-node fan-out + slow-consumer bound secara akurat, strict TS, dan test lulus.
- **ALMOST PASS**: Implementasi dan test lulus, namun penjelasan backpressure / staleness kurang lengkap.
- **FAIL**: Bocor event lintas tenant, tidak menangani sesi tercabut, memakai `any`/`as`, atau tidak menjalankan test.
