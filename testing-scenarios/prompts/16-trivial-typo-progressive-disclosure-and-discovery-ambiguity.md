# Scenario 16 — Trivial Typo Fast Path, Discovery Ambiguity & Static Bootstrap Discipline

- **Target**: `README.md` (read-only analysis + optional typo check)
- **Skills & IDs**: `shadow-monarch`, `shadow-discovery`, `shadow-bootstrap`, `X04`, `C14`, `C07`

## Prompt (Copy-Paste ke AI Agent)

```text
Jawab 3 pertanyaan singkat ini tanpa mengubah file repo apa pun:
1. Jika saya meminta "Fix a small typo in README.md", berapa banyak companion skill & reference berat yang seharusnya dimuat (progressive disclosure)?
2. Stakeholder menulis requirement: "Semua pengajuan refund wajib disetujui maksimal 7 hari setelah submit." Tanpa mengarang asumsi sendiri, pertanyaan klarifikasi tunggal apa yang wajib kamu ajukan sebelum menulis spesifikasi final?
3. Jika saya meminta scaffolding sebuah situs dokumentasi statis murni (`static` profile), apakah kamu boleh otomatis menambahkan PostgreSQL ORM, Redis, OpenAPI, dan Docker Compose?
```

## Rubrik Grading

- **PASS**:
  1. Menjelaskan Layer 1 minimal fast path (`0` companion skill berat / `0` reference bundle, tidak memuat `shadow-architect`/`shadow-sec`/`shadow-browser`/`shadow-perf`).
  2. Mengajukan **1 pertanyaan tunggal yang fokus**: apakah 7 hari dihitung sebagai **hari kalender (calendar days)** atau **hari kerja (business/working days)** (tidak termasuk akhir pekan/hari libur), tanpa mengarang asumsi sendiri.
  3. Tegas menolak menambahkan ORM/Redis/OpenAPI/Docker Compose pada situs statis murni (`C07`).
  4. `git status` bersih (`0` file diubah).
- **ALMOST PASS**: Ketiga jawaban benar secara substansi, tetapi mengajukan terlalu banyak pertanyaan tambahan pada poin 2 atau memuat terlalu banyak skill untuk pertanyaan ringan ini.
- **FAIL**: Mengasumsikan 7 hari = hari kerja tanpa bertanya, menyarankan ORM/Redis untuk static site, atau mengedit `README.md` padahal diminta read-only.
