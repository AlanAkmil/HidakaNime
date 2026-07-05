const params = new URLSearchParams(location.search);
const slug = params.get('slug') || '';
let debugData = {};

function extractDownloads(d) {
  const candidates = ['download', 'downloads', 'download_url', 'downloadLinks', 'mirror', 'mirrors'];
  for (const key of candidates) {
    if (Array.isArray(d[key])) return d[key];
    if (d[key] && typeof d[key] === 'object') {
      // e.g. { "360p": [...], "480p": [...] } or { "360p": "url" }
      const out = [];
      for (const [quality, val] of Object.entries(d[key])) {
        if (Array.isArray(val)) {
          val.forEach(v => out.push({ quality, ...(typeof v === 'object' ? v : { url: v }) }));
        } else if (typeof val === 'string') {
          out.push({ quality, url: val });
        }
      }
      if (out.length) return out;
    }
  }
  return [];
}

async function load() {
  const playerArea = document.getElementById('playerArea');
  const downloadList = document.getElementById('downloadList');
  const epInfo = document.getElementById('epInfo');

  if (!slug) {
    playerArea.innerHTML = '<div class="state-msg">Slug episode tidak ditemukan.</div>';
    return;
  }

  try {
    const json = await apiGet(`/api/episode?slug=${encodeURIComponent(slug)}`);
    debugData = json;
    const d = json.data !== undefined ? json.data : json;

    const title = getTitle(d);
    const streamUrl = pick(d, ['stream_url', 'streamUrl', 'embed', 'embed_url', 'player', 'video_url', 'videoUrl']);

    epInfo.innerHTML = `<div class="page-title" style="font-size:16px; padding-top:10px;">${title || 'Episode'}</div>`;

    if (streamUrl) {
      if (streamUrl.match(/\.(mp4|m3u8)(\?|$)/i)) {
        playerArea.innerHTML = `<div class="player-wrap"><video src="${streamUrl}" controls autoplay playsinline></video></div>`;
      } else {
        playerArea.innerHTML = `<div class="player-wrap"><iframe src="${streamUrl}" allowfullscreen allow="autoplay; encrypted-media"></iframe></div>`;
      }
    } else {
      playerArea.innerHTML = '<div class="state-msg">Link streaming tidak ditemukan di response API. Cek Debug JSON di bawah untuk lihat field yang tersedia, lalu tambahin nama field-nya di js/watch.js.</div>';
    }

    const downloads = extractDownloads(d);
    if (downloads.length === 0) {
      downloadList.innerHTML = '<div class="state-msg">Tidak ada link download.</div>';
    } else {
      downloadList.innerHTML = downloads.map(dl => {
        const label = pick(dl, ['quality', 'resolution', 'label'], 'Download');
        const url = pick(dl, ['url', 'link', 'href']);
        return `<a class="download-item" href="${url}" target="_blank" rel="noopener">${label}</a>`;
      }).join('');
    }
  } catch (err) {
    playerArea.innerHTML = `<div class="state-msg">Gagal memuat: ${err.message}</div>`;
  }
}

load();
setTimeout(() => setupDebug('debugBox', 'debugToggle', debugData), 1200);
