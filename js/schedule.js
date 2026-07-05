let currentMode = 'donghua';
let currentDay = 'senin';
const cache = {};
let debugData = {};

const dayAliases = {
  senin: ['senin', 'monday', 'mon'],
  selasa: ['selasa', 'tuesday', 'tue'],
  rabu: ['rabu', 'wednesday', 'wed'],
  kamis: ['kamis', 'thursday', 'thu'],
  jumat: ['jumat', "jum'at", 'friday', 'fri'],
  sabtu: ['sabtu', 'saturday', 'sat'],
  minggu: ['minggu', 'sunday', 'sun']
};

async function getScheduleData(mode) {
  if (cache[mode]) return cache[mode];
  const json = await apiGet(mode === 'donghua' ? '/api/schedule' : '/api/anime-schedule');
  cache[mode] = json;
  debugData[mode] = json;
  return json;
}

function findDayItems(json, day) {
  const aliases = dayAliases[day] || [day];
  let d = json.data !== undefined ? json.data : json;

  // Case 1: object keyed by day name -> { Senin: [...], Selasa: [...] }
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const keys = Object.keys(d);
    for (const k of keys) {
      if (aliases.includes(k.toLowerCase())) {
        if (Array.isArray(d[k])) return d[k];
      }
    }
    // maybe nested one level deeper (e.g. d.schedule.Senin)
    for (const k of keys) {
      if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) {
        const innerKeys = Object.keys(d[k]);
        for (const ik of innerKeys) {
          if (aliases.includes(ik.toLowerCase()) && Array.isArray(d[k][ik])) {
            return d[k][ik];
          }
        }
      }
    }
  }

  // Case 2: flat array with a day/hari field on each item
  const list = extractList(json);
  const filtered = list.filter(item => {
    const dayVal = pick(item, ['day', 'hari', 'release_day', 'releaseDay'], '').toString().toLowerCase();
    return aliases.some(a => dayVal.includes(a));
  });
  if (filtered.length > 0) return filtered;

  // Fallback: no grouping detected, just show everything so it's not empty
  return list;
}

function renderList(items) {
  const container = document.getElementById('scheduleList');
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="state-msg">Tidak ada jadwal untuk hari ini.</div>';
    return;
  }
  container.innerHTML = items.map(item => {
    const title = getTitle(item);
    const img = getImage(item);
    const slug = getSlug(item);
    const type = currentMode;
    return `
      <div class="list-row" onclick="location.href='detail.html?slug=${encodeURIComponent(slug)}&type=${type}'">
        <img src="${img}" alt="">
        <div class="list-title">${title}</div>
        <div class="chevron">›</div>
      </div>
    `;
  }).join('');
}

async function render() {
  const container = document.getElementById('scheduleList');
  container.innerHTML = '<div class="state-msg">Memuat jadwal...</div>';
  try {
    const json = await getScheduleData(currentMode);
    const items = findDayItems(json, currentDay);
    renderList(items);
  } catch (err) {
    container.innerHTML = `<div class="state-msg">Gagal memuat: ${err.message}</div>`;
  }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    render();
  });
});

document.querySelectorAll('.day-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDay = btn.dataset.day;
    render();
  });
});

setupSearchToggle();
render();
setTimeout(() => setupDebug('debugBox', 'debugToggle', debugData), 1500);
