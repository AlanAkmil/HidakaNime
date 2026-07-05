const params = new URLSearchParams(location.search);
const slug = params.get('slug') || '';
const type = params.get('type') || 'donghua';
let debugData = {};
let servers = [];

function getStreamServers(d) {
  if (d.streaming && Array.isArray(d.streaming.servers)) {
    return d.streaming.servers.map(s => ({ name: pick(s, ['name'], 'Server'), url: pick(s, ['url']) }));
  }
  const candidates = ['servers', 'server_list', 'streaming_servers'];
  for (const key of candidates) {
    if (Array.isArray(d[key])) {
      return d[key].map(s => ({ name: pick(s, ['name', 'label'], 'Server'), url: pick(s, ['url', 'link']) }));
    }
  }
  return [];
}

function getMainStreamUrl(d) {
  if (d.streaming && d.streaming.main_url && d.streaming.main_url.url) return d.streaming.main_url.url;
  if (servers.length) return servers[0].url;
  return pick(d, ['stream_url', 'streamUrl', 'embed', 'embed_url', 'player', 'video_url', 'videoUrl']);
}

function getDownloadGroups(d) {
  const dl = d.download_url || d.download || d.downloads;
  const groups = [];
  if (dl && typeof dl === 'object' && !Array.isArray(dl)) {
    for (const [quality, providers] of Object.entries(dl)) {
      if (providers && typeof providers === 'object' && !Array.isArray(providers)) {
        const links = Object.entries(providers).map(([provider, url]) => ({ provider, url }));
        groups.push({ quality: quality.replace(/^mp4_/i, '').toUpperCase(), links });
      } else if (typeof providers === 'string') {
        groups.push({ quality: quality.replace(/^mp4_/i, '').toUpperCase(), links: [{ provider: 'Download', url: providers }] });
      }
    }
  }
  return groups;
}

function renderPlayer(url) {
  const playerArea = document.getElementById('playerArea');
  if (!url) {
    playerArea.innerHTML = '<div class="state-msg">Link streaming tidak ditemukan.</div>';
    return;
  }
  if (url.match(/\.(mp4|m3u8)(\?|$)/i)) {
    playerArea.innerHTML = `<div class="player-wrap"><video src="${url}" controls autoplay playsinline></video></div>`;
  } else {
    playerArea.innerHTML = `<div class="player-wrap"><iframe src="${url}" allowfullscreen allow="autoplay; encrypted-media"></iframe></div>`;
  }
}

function renderServerList() {
  const wrap = document.getElementById('serverList');
  if (!wrap) return;
  if (!servers.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = servers.map((s, i) => `
    <button class="server-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${s.name}</button>
  `).join('');
  wrap.querySelectorAll('.server-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPlayer(servers[parseInt(btn.dataset.index)].url);
    });
  });
}

async function load() {
  const downloadList = document.getElementById('downloadList');
  const epInfo = document.getElementById('epInfo');

  if (!slug) {
    document.getElementById('playerArea').innerHTML = '<div class="state-msg">Slug episode tidak ditemukan.</div>';
    return;
  }

  try {
    const json = await apiGet(`/api/episode?slug=${encodeURIComponent(slug)}&type=${encodeURIComponent(type)}`);
    debugData = json;
    const d = unwrapData(json);

    const title = pick(d, ['title', 'episode'], 'Episode');
    epInfo.innerHTML = `<div class="page-title" style="font-size:16px; padding-top:10px;">${title}</div>`;

    servers = getStreamServers(d);
    renderServerList();
    renderPlayer(getMainStreamUrl(d));

    const groups = getDownloadGroups(d);
    if (groups.length === 0) {
      downloadList.innerHTML = '<div class="state-msg">Tidak ada link download.</div>';
    } else {
      downloadList.innerHTML = groups.map(g => `
        <div class="dl-quality-label">${g.quality}</div>
        <div class="dl-provider-row">
          ${g.links.map(l => `<a class="download-item" href="${l.url}" target="_blank" rel="noopener">${l.provider}</a>`).join('')}
        </div>
      `).join('');
    }

    if (d.donghua_details) {
      const parentTitle = pick(d.donghua_details, ['title'], '');
      const parentSlug = pick(d.donghua_details, ['slug'], '');
      if (parentTitle && parentSlug) {
        epInfo.insertAdjacentHTML('beforeend', `
          <div style="padding:0 16px 10px;">
            <a class="back-btn" style="margin:0;" href="detail.html?slug=${encodeURIComponent(parentSlug)}&type=${encodeURIComponent(type)}">Lihat semua episode ${parentTitle}</a>
          </div>
        `);
      }
    }
  } catch (err) {
    document.getElementById('playerArea').innerHTML = `<div class="state-msg">Gagal memuat: ${err.message}</div>`;
  }
}

load();
setTimeout(() => setupDebug('debugBox', 'debugToggle', debugData), 1200);
