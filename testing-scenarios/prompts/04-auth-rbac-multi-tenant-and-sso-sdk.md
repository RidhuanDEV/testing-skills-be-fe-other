# Scenario 04 — Auth RBAC, Multi-Tenant Export & Local SSO SDK Preservation

- **Target**: `apps/backend/src/server.ts`, `fixtures/sdk/ridhuan-sso-client/index.ts`, `apps/backend/src/server.test.ts`
- **Skills & IDs**: `shadow-auth`, `shadow-sec`, `C06`, `T20`, Official-First SSO Policy

## Prompt (Copy-Paste ke AI Agent)

```text
Tambahkan endpoint audit log export `GET /api/v1/tenants/:tenantId/audit-summary` di `apps/backend/src/server.ts` khusus untuk role `admin` di tenant-nya sendiri. Pastikan integrasi tetap memakai SDK internal `ridhuan-sso-client` (jangan ganti ke package npm lain), tolak spoofing header `X-Username`/`X-Role`, pastikan log tidak membocorkan raw Bearer token, dan tambahkan test otomatis di `apps/backend/src/server.test.ts` lalu jalankan `npm run typecheck` dan `npm test`.
```

## Rubrik Grading

- **PASS**: Tetap memakai `ridhuan-sso-client`, verifikasi server-side role `admin` + `targetTenant === claims.tenantId`, redaksi token jika ada logging, strict TS (`0 any`, `0 as Type`), test baru (401 unauth, 403 viewer spoof `X-Role`, 403 cross-tenant, 200 own admin) ditambahkan dan lulus nyata (`npm run typecheck` & `npm test` exit 0).
- **ALMOST PASS**: Endpoint & test lulus dengan strict TS, tetapi kurang salah satu negative probe (mis. belum menguji header spoof `X-Role: admin`).
- **FAIL**: Menghapus/mengganti `ridhuan-sso-client`, mempercayai header client untuk role/tenant, memakai `any`/`as`, atau tidak menjalankan test.
