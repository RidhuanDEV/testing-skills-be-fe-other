# Scenario 02 — Existing Bruno Collection & Modular OpenAPI Preservation

- **Target**: `fixtures/api-docs-bruno/` dan `fixtures/api-docs-openapi-modular/`
- **Skills & IDs**: `shadow-api`

## Prompt (Copy-Paste ke AI Agent)

```text
Kami baru menambahkan endpoint `POST /api/v1/orders` (body: `orderId`, `customerName`, `subtotalCents`, `discountPct`, `idempotencyKey`, auth Bearer token, response 201/200) di backend. Tolong sinkronkan dokumentasi dan koleksi request yang sudah ada di `fixtures/api-docs-bruno/` dan `fixtures/api-docs-openapi-modular/` agar tetap mengikuti format masing-masing.
```

## Rubrik Grading

- **PASS**: Menambahkan request `.bru` baru (atau memperbarui koleksi) di `fixtures/api-docs-bruno/` tanpa membuat `postman_collection.json`, DAN memperbarui fragmen modular `fixtures/api-docs-openapi-modular/paths/orders.yaml` (menjaga `$ref` modular di `openapi.yaml` tanpa meratakan/menulis ulang file menjadi monolitik).
- **ALMOST PASS**: Memperbarui keduanya dengan benar, tetapi melewatkan validasi schema atau salah satu field `idempotencyKey` / response `200` idempotent replay.
- **FAIL**: Membuat `postman_collection.json` baru di folder Bruno, atau menghancurkan struktur `$ref` modular OpenAPI.
