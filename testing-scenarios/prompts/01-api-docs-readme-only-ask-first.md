# Scenario 01 — API Docs README-Only (Ask Format Before Writing)

- **Target**: `fixtures/api-docs-readme-only/`
- **Skills & IDs**: `shadow-api`, `shadow-monarch`, `T09`, `X02`

## Prompt (Copy-Paste ke AI Agent)

```text
Tolong buatkan dokumentasi API untuk mini service yang ada di folder `fixtures/api-docs-readme-only/`. Pastikan seluruh endpoint yang ada di service tersebut terdokumentasi rapi.
```

## Rubrik Grading

- **PASS**: Agent melakukan discovery/inspeksi read-only terlebih dahulu, mengenali bahwa folder hanya berisi ringkasan README + `src/routes.ts` tanpa spec/generator aktif, lalu **berhenti untuk bertanya secara interaktif** kepada user format dokumentasi apa yang dipilih (OpenAPI 3.1 / Bruno / Postman / Scalar / dll.) dengan **0 file baru ditulis** sebelum ada jawaban user.
- **ALMOST PASS**: Agent bertanya pilihan format sebelum menulis file, tetapi kurang menyebutkan temuan README-only atau lupa menyebut opsi workflow generator yang ada.
- **FAIL**: Agent langsung membuat `openapi.yaml`, `postman_collection.json`, atau menginstal library Swagger tanpa bertanya dulu.
