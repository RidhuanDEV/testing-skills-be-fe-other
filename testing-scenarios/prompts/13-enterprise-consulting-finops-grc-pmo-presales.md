# Scenario 13 — Enterprise Consulting Suite (FinOps, GRC, PMO & Presales)

- **Target**: `fixtures/consulting-data/` (semua 4 file)
- **Skills & IDs**: `shadow-finops`, `shadow-grc`, `shadow-pmo`, `shadow-presales`, `T02`, `T04`, `E07`

## Prompt (Copy-Paste ke AI Agent)

```text
Baca seluruh 4 file di `fixtures/consulting-data/` (read-only, jangan ubah file apa pun), lalu berikan analisis ringkas & tajam untuk masing-masing:
1. **FinOps (`finops-invoice-2026-q4.json`)**: Hitung alokasi biaya per tim (`team-checkout` dan `team-search`) termasuk proporsi shared gateway + biaya unallocated sehingga total tepat sama dengan `invoice_total` (`1000.00`), serta jelaskan mengapa tarif Q3 (`15.00`) tidak boleh ditimpa saat mengaudit ulang Q3.
2. **GRC (`grc-control-register.json`)**: Nilai efektivitas kontrol `A.8.24` (pisahkan Design vs Operating karena baru ada 2 dari 4 sampel kuartalan!) dan `A.5.15`, dengan tetap memisahkan COBIT Capability vs Maturity serta mencatat snapshot regulasi POJK 11/2022 + PADK OJK 1/2026.
3. **PMO (`pmo-cr-request.md`)**: Tentukan apakah permintaan Excel macro pivot adalah `Defect` atau kandidat `Paid CR` (berdasar hierarki kontrak > Addendum #1 > KAK > FSD), rute persetujuan CCB, hitung PERT expected duration (Task A + Task B) dan EVM (`CPI` & `SPI`).
4. **Presales (`presales-kak-summary.md`)**: Pisahkan dengan tegas antara **Provider RAB** vs **PPK HPS** di bawah Perpres 46/2025, sebut ketentuan TKDN/UMKK >= 40%, dan berikan kerangka 3 skenario sizing (`Conservative / Expected / Stress`).
```

## Rubrik Grading

- **PASS**:
  1. FinOps: `team-checkout = 466.67`, `team-search = 483.33`, `unallocated = 50.00`, sum exact `1000.00` + dated tariff reproducibility.
  2. GRC: `A.8.24` Design = Effective, Operating = Pending/Incomplete (TIDAK mengklaim compliant/effective penuh); `A.5.15` Effective; menyebut POJK 11/2022 + PADK OJK 1/2026 & COBIT Capability != Maturity.
  3. PMO: Mengklasifikasi sebagai **Paid CR candidate** (Addendum #1 mengunci CSV & PDF saja, mengalahkan catatan FSD), perlu persetujuan CCB, PERT Task A `(4+24+12)/6 = 6.67d`, Task B `(2+12+6)/6 = 3.33d` -> total `10.00d`, `CPI = 600/680 = 0.88`, `SPI = 600/650 = 0.92`.
  4. Presales: Tegas membedakan Provider RAB vs PPK HPS (Perpres 46/2025), TKDN/UMKK >= 40%, dan 3 skenario sizing.
- **ALMOST PASS**: Semua prinsip tata kelola benar, tetapi ada selisih pembulatan kecil atau 1 angka EVM/PERT terlewat.
- **FAIL**: Menyatakan `A.8.24` Operating Effective meski sampel kurang, menyebut FSD mengalahkan Addendum, menyamakan Provider RAB dengan PPK HPS, atau mengedit file.
