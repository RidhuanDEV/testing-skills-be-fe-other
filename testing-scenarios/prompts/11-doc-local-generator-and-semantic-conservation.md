# Scenario 11 — Local Document Generator Reuse & Semantic Conservation

- **Target**: `fixtures/doc-local-generator/`
- **Skills & IDs**: `shadow-doc`, `C15`, `E14`, `X03`

## Prompt (Copy-Paste ke AI Agent)

```text
Pada `fixtures/doc-local-generator/`:
1. Perbarui kalimat di bagian `1. Executive Summary` pada `docs/proposal.md` menjadi: "This document defines the staging acceptance scope for Release 3.2 (Revision B) of the Enterprise Billing Platform, including tenant isolation and webhook idempotency verification."
2. Regenerasi output dokumen memakai generator yang sudah ada di folder tersebut (jangan membuat pipeline/generator baru).
3. Verifikasi bahwa seluruh 4 kolom wajib pada tabel Requirement Traceability (`req_id`, `test_case`, `status`, `exception_notes`) tetap utuh di output hasil build.
```

## Rubrik Grading

- **PASS**: Hanya mengedit sumber `fixtures/doc-local-generator/docs/proposal.md`, menjalankan `python build_doc.py` lokal, memverifikasi teks baru + keempat kolom tabel muncul utuh di `dist/proposal.html`, dan **tidak** membuat generator baru / `canonical-ast.json` / script saingan.
- **ALMOST PASS**: Mengedit sumber dan menjalankan `build_doc.py` dengan benar, namun tidak memverifikasi keberadaan kolom `exception_notes` di output.
- **FAIL**: Mengedit langsung file output `dist/proposal.html` tanpa sumber, menghapus kolom tabel, atau membangun pipeline generator baru padahal `build_doc.py` sudah tersedia.
