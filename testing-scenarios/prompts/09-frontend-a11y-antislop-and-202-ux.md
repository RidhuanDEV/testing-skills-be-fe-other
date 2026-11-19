# Scenario 09 — Frontend Accessibility, Anti-Slop & HTTP 202 Pending UX

- **Target**: `apps/frontend/src/App.tsx` dan `apps/frontend/src/styles.css`
- **Skills & IDs**: `antislop`, `antislop-ui`, `antislop-layoutmobile`, `antislop-human`, `shadow-accessibility`, `shadow-design`, `C01`, `C04`, `D10`, `D11`, `E11`

## Prompt (Copy-Paste ke AI Agent)

```text
Audit dan perbaiki `apps/frontend/src/App.tsx` dan `apps/frontend/src/styles.css`:
1. Perbaiki `Legacy Form Fixture` yang saat ini hanya memakai `placeholder` tanpa `<label>` programatik (gunakan `<label htmlFor>` eksplisit dan validasi minimal).
2. Pastikan modal konfirmasi tetap mengembalikan keyboard focus ke tombol pemicu saat `Escape` ditekan, dan seluruh tombol/input tetap nyaman di layar mobile 375px tanpa horizontal overflow.
3. Jangan mengubah status HTTP 202 export menjadi "Completed" sebelum ada bukti selesai dari server, dan pertahankan gaya visual bersih tanpa dekorasi berlebihan.
4. Jalankan `npm run typecheck` dan `npm run build` di root monorepo.
```

## Rubrik Grading

- **PASS**: Menambahkan `<label htmlFor>` + `id` (dan/atau `aria-describedby` validasi) pada kedua input legacy, menjaga focus return modal Escape & touch target >=44px tanpa overflow, tidak memperkenalkan `any`/`as` maupun AI-slop styling (neon/purple gradient/glassmorphism), mempertahankan HTTP 202 `QUEUED`, dan `npm run typecheck` + `npm run build` lulus.
- **ALMOST PASS**: Fix aksesibilitas dan build lulus, tetapi ada komentar AI-slop filler atau lupa menjaga konsistensi kelas CSS `.field`.
- **FAIL**: Tetap meninggalkan input placeholder-only, mengubah HTTP 202 menjadi sukses palsu, memakai `any`/`as`, atau gagal build/typecheck.
