const params = new URLSearchParams(location.search);
const slug = params.get('slug') || '';
const type = params.get('type') || 'donghua';
let debugData = {};

function extractEpisodeList(json) {
  const d = json.data !== undefined ? json.data : json;
  const candidates = ['episode_list', 'episodeList', 'episodes', 'list_episode', 'listEpisode', 'daftar_episode'];
  for (const key of candidates) {
    if (d && Array.isArray(d[key])) return d[key];
  }
  // fallback: any array property whose items look like episodes (has 'episode' or 'title')
  if (d && typeof d === 'object') {
    for (const val of Object.values(d)) {
      if (Array.isArray(val) && val.length && typeof val[0] === 'object') {
        return val;
      }
    }
  }
  return [];
}

async function load() {
  const content = document.getElementById('detailContent');
  const epList = document.getElementById('episodeList');
  if (!slug) {
    content.innerHTML = '<div class="state-msg">Slug tidak ditemukan.</div>';
    return;
  }
  try {
    const json = await apiGet(`/api/detail?slug=${encodeURIComponent(slug)}`);
    debugData = json;
    const d = json.data !== undefined ? json.data : json;

    const title = getTitle(d);
    const poster = getImage(d);
    const synopsis = pick(d, ['synopsis', 'sinopsis', 'description', 'desc'], 'Sinopsis tidak tersedia.');
    const status = getStatus(d);
    const genre = pick(d, ['genre', 'genres', 'category'], '');

    content.innerHTML = `
      <div class="detail-hero">
        <img class="detail-poster" src="${poster}" alt="">
        <div class="detail-info">
          <h1>${title}</h1>
          <div class="meta">Status: ${status}</div>
          ${genre ? `<div class="meta">Genre: ${Array.isArray(genre) ? genre.join(', ') : genre}</div>` : ''}
        </div>
      </div>
      <div class="detail-synopsis">${synopsis}</div>
    `;

    const episodes = extractEpisodeList(json);
    if (episodes.length === 0) {
      epList.innerHTML = '<div class="state-msg">Belum ada episode terdaftar.</div>';
      return;
    }
    epList.innerHTML = episodes.map(ep => {
      const epTitle = pick(ep, ['title', 'episode', 'name'], 'Episode');
      const epSlug = getSlug(ep) || pick(ep, ['slug', 'href', 'link', 'url']);
      return `
        <div class="ep-item" onclick="location.href='watch.html?slug=${encodeURIComponent(epSlug)}'">
          <span>${epTitle}</span>
          <span>▶</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    content.innerHTML = `<div class="state-msg">Gagal memuat: ${err.message}</div>`;
  }
}

load();
setTimeout(() => setupDebug('debugBox', 'debugToggle', debugData), 1200);
