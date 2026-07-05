let currentMode = 'donghua';
let currentDay = 'senin';
const cache = {};
let debugData = {};

const dayAliases = {
  senin: ['senin', 'monday', 'mon'],
  selasa: ['selasa', 'tuesday', 'tue'],
  rabu: ['rabu', 'wednesday', 'wed'],
  kamis: ['kamis', 'thursday', 'thu'],
  jumat: ['jumat', 'friday', 'fri'],
  sabtu: ['sabtu', 'saturday', 'sat'],
  minggu: ['minggu', 'sunday', 'sun']
};

// Buang tanda kutip/apostrof macam-macam (' ' ` `) biar "jum'at" == "jumat"
function normalizeDay(str) {
  return (str || '').toString().toLowerCase().replace(/['\u2019\u2018`]/g, '');
}

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
  }

  // Case 2: real API shape -> { schedule: [ {day, donghua_list} ] } ATAU { data: [ {day, items} ] }
  const scheduleArr = Array.isArray(d && d.schedule) ? d.schedule
    : Array.isArray(d && d.data) ? d.data
    : (Array.isArray(d) ? d : null);
  if (scheduleArr) {
    const match = scheduleArr.find(entry => {
      const dayVal = normalizeDay(pick(entry, ['day', 'hari', 'release_day', 'releaseDay'], ''));
      return aliases.some(a => dayVal === a || dayVal.includes(a));
    });
    if (match) {
      const nestedKey = ['donghua_list', 'anime_list', 'list', 'items', 'anime', 'donghua']
        .find(k => Array.isArray(match[k]));
      if (nestedKey) return match[nestedKey];
      // if the matched entry itself has no obvious nested array, fall back to any array inside it
      const anyArr = Object.values(match).find(v => Array.isArray(v));
      if (anyArr) return anyArr;
    }
  }

  // Case 3: flat array with a day/hari field directly on each item
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
    const thumb = img
      ? `<img src="${img}" alt="">`
      : `<div class="list-row-placeholder">▶</div>`;
    return `
      <div class="list-row" onclick="location.href='detail.html?slug=${encodeURIComponent(slug)}&type=${type}'">
        ${thumb}
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
