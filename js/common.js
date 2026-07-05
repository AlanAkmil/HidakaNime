// ============================================================
// COMMON HELPERS — dipakai di semua halaman
// Karena struktur JSON asli dari API belum 100% diketahui,
// semua fungsi di bawah ini "menebak" nama field yang paling umum.
// Kalau tampilan kosong/aneh, buka Debug JSON di tiap halaman
// buat liat struktur asli, lalu tambahin nama field ke array di bawah.
// ============================================================

// Beberapa endpoint (anime/detail, anime/episode) bungkus datanya 2 lapis: json.data.data
function unwrapData(json) {
  let d = json.data !== undefined ? json.data : json;
  if (d && d.data !== undefined && typeof d.data === 'object' && !Array.isArray(d.data)) {
    d = d.data;
  }
  return d;
}

function pick(obj, keys, fallback = '') {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

// Coba cari array item di dalam JSON, walau nested/beda-beda nama key-nya
function extractList(json) {
  if (!json) return [];
  let d = json.data !== undefined ? json.data : json;
  for (let i = 0; i < 5; i++) {
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object') {
      const candidates = ['data', 'results', 'list', 'items', 'animeList', 'donghuaList', 'anime', 'donghua'];
      let found = false;
      for (const key of candidates) {
        if (Array.isArray(d[key])) { d = d[key]; found = true; break; }
      }
      if (found) continue;
      const arrProp = Object.values(d).find(v => Array.isArray(v));
      if (arrProp) { d = arrProp; continue; }
    }
    break;
  }
  return Array.isArray(d) ? d : [];
}

function getTitle(item) {
  return pick(item, ['title', 'judul', 'name', 'anime_title'], 'Tanpa Judul');
}
function getImage(item) {
  return pick(item, ['poster', 'thumbnail', 'thumb', 'image', 'img', 'cover', 'gambar']);
}
function getEpisode(item) {
  return pick(item, ['episode', 'ep', 'current_episode', 'latestEpisode', 'episode_number']);
}
function getStatus(item) {
  return pick(item, ['status', 'type_status'], 'ONGOING');
}
function getCategory(item) {
  return pick(item, ['category', 'type', 'genre'], '');
}
function getSlug(item) {
  const raw = pick(item, ['slug', 'href', 'link', 'url', 'id']);
  if (!raw) return '';
  // ambil slug terakhir kalau berupa URL penuh
  const parts = raw.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function cardHTML(item, type) {
  const title = getTitle(item);
  const img = getImage(item);
  const ep = getEpisode(item);
  const status = getStatus(item);
  const cat = getCategory(item) || (type === 'anime' ? 'Anime' : 'Donghua');
  const slug = getSlug(item);
  return `
    <div class="card" onclick="location.href='detail.html?slug=${encodeURIComponent(slug)}&type=${type}'">
      <div class="card-thumb" style="background-image:url('${img}')">
        ${ep ? `<span class="badge badge-ep">EP ${ep}</span>` : ''}
        <span class="badge badge-status">${status}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-cat">${cat}</div>
      </div>
    </div>
  `;
}

async function apiGet(path) {
  const res = await fetch(path);
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Gagal fetch ${path}`);
  }
  return json;
}

function setupDebug(boxId, toggleId, data) {
  const box = document.getElementById(boxId);
  const toggle = document.getElementById(toggleId);
  if (!box || !toggle) return;
  box.textContent = JSON.stringify(data, null, 2);
  toggle.addEventListener('click', () => box.classList.toggle('active'));
}

function setupSearchToggle() {
  const btn = document.getElementById('searchToggle');
  const wrap = document.getElementById('searchWrap');
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  if (btn && wrap) {
    btn.addEventListener('click', () => wrap.classList.toggle('active'));
  }
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }
}
