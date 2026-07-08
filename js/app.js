let donghuaPage = 1;
let animePage = 1;
let lastDebug = {};

async function loadDonghua() {
  const grid = document.getElementById('donghuaGrid');
  const btn = document.getElementById('donghuaMore');
  btn.textContent = 'MEMUAT...';
  try {
    const json = await apiGet(`/api/ongoing?page=${donghuaPage}`);
    lastDebug.donghua = json;
    const items = extractList(json);
    if (items.length === 0 && donghuaPage === 1) {
      grid.innerHTML = '<div class="state-msg">Belum ada data donghua.</div>';
      btn.style.display = 'none';
      return;
    }
    items.forEach(item => grid.insertAdjacentHTML('beforeend', cardHTML(item, 'donghua')));
    donghuaPage++;
    btn.textContent = 'MUAT LEBIH BANYAK';
  } catch (err) {
    grid.insertAdjacentHTML('beforeend', `<div class="state-msg">Gagal memuat: ${err.message}</div>`);
    btn.style.display = 'none';
  }
}

async function loadAnime() {
  const grid = document.getElementById('animeGrid');
  const btn = document.getElementById('animeMore');
  btn.textContent = 'MEMUAT...';
  try {
    const json = await apiGet(`/api/anime-ongoing`);
    lastDebug.anime = json;
    const items = extractList(json);
    if (items.length === 0) {
      grid.innerHTML = '<div class="state-msg">Belum ada data anime.</div>';
    } else {
      items.forEach(item => grid.insertAdjacentHTML('beforeend', animeCardHTML(item)));
    }
    btn.style.display = 'none'; // kusonime cuma nampilin listing terbaru, gak ada halaman berikutnya
  } catch (err) {
    grid.insertAdjacentHTML('beforeend', `<div class="state-msg">Gagal memuat: ${err.message}</div>`);
    btn.style.display = 'none';
  }
}

document.getElementById('donghuaMore').addEventListener('click', loadDonghua);
document.getElementById('animeMore').addEventListener('click', loadAnime);

setupSearchToggle();
loadDonghua();
loadAnime();

setTimeout(() => setupDebug('debugBox', 'debugToggle', lastDebug), 1500);
