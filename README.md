# iFilm Lengkap (Web Clone)

Web nonton Donghua & Anime subtitle Indonesia, UI neo-brutalism mirip ifilm.web.id.
Backend pakai scraper `ifilm.js` (credit: Bintang) yang dibungkus jadi API routes Vercel.

## Struktur
- `lib/scraper.js` — class scraper asli (adaptasi dari ifilm.js)
- `api/*.js` — serverless functions (search, schedule, detail, episode, dll)
- `index.html`, `schedule.html`, `search.html`, `detail.html`, `watch.html` — halaman
- `css/style.css` — style neo-brutalism (hitam + kuning)
- `js/*.js` — logic tiap halaman

## Cara Deploy (dari HP, GitHub + Vercel)
1. Extract zip ini, upload semua isinya ke repo GitHub baru (via GitHub app / web upload).
2. Buka vercel.com -> New Project -> Import repo tadi.
3. Framework preset: pilih **Other** (bukan Next.js). Build command & output directory dikosongin aja (default).
4. Deploy. Selesai — nanti dapet URL `xxx.vercel.app`.

## PENTING — soal struktur data API
Gua belum bisa tes langsung ke `vps-donghuawatch.vercel.app` (sandbox gua gak ada akses internet),
jadi semua kode render di frontend (`js/common.js`, `js/detail.js`, `js/watch.js`) dibikin **defensif**:
dia nyoba nebak nama field yang paling umum (title/judul, poster/thumbnail/image, slug/link/url, dst).

Kalau pas dibuka ada bagian yang kosong atau salah (misal poster gak muncul, atau video gak keputer):
1. Buka halaman itu, scroll ke bawah, klik tombol **"Debug JSON"** — bakal muncul struktur asli JSON dari API.
2. Liat nama field yang bener di situ (misal ternyata field-nya `img_url` bukan `poster`).
3. Edit array di `js/common.js` (fungsi `getImage`, `getTitle`, dll) atau di `js/detail.js` / `js/watch.js`,
   tambahin nama field yang bener ke dalam array-nya.

Kirim aja screenshot Debug JSON-nya ke gua kalau mau dibenerin, gua tinggal sesuaiin nama field-nya.

## Endpoint API yang tersedia
- `GET /api/search?q=king&page=1`
- `GET /api/schedule` (jadwal donghua)
- `GET /api/anime-schedule`
- `GET /api/detail?slug=...`
- `GET /api/episode?slug=...`
- `GET /api/completed?page=1`
- `GET /api/ongoing?page=1`
- `GET /api/anime-completed?page=1`
- `GET /api/anime-ongoing?page=1`
