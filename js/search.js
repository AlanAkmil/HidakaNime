const params = new URLSearchParams(location.search);
const q = params.get('q') || '';
let page = 1;
let debugData = {};

document.getElementById('searchInput').value = q;
document.getElementById('resultTitle').textContent = q ? `Hasil untuk "${q}"` : 'Cari sesuatu di atas';

async function loadResults() {
  if (!q) return;
  const grid = document.getElementById('resultGrid');
  const btn = document.getElementById('moreBtn');
  btn.style.display = 'block';
  btn.textContent = 'MEMUAT...';
  try {
    const json = await apiGet(`/api/search?q=${encodeURIComponent(q)}&page=${page}`);
    debugData = json;
    const items = extractList(json);
    if (items.length === 0 && page === 1) {
      grid.innerHTML = '<div class="state-msg">Tidak ada hasil ditemukan.</div>';
      btn.style.display = 'none';
      return;
    }
    if (items.length === 0) {
      btn.style.display = 'none';
      return;
    }
    items.forEach(item => grid.insertAdjacentHTML('beforeend', cardHTML(item, 'donghua')));
    page++;
    btn.textContent = 'MUAT LEBIH BANYAK';
  } catch (err) {
    grid.insertAdjacentHTML('beforeend', `<div class="state-msg">Gagal memuat: ${err.message}</div>`);
    btn.style.display = 'none';
  }
}

document.getElementById('moreBtn').addEventListener('click', loadResults);
setupSearchToggle();
loadResults();
setTimeout(() => setupDebug('debugBox', 'debugToggle', debugData), 1200);
