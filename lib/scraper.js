/**
 * PROJECT     : IFILM
 * ORIGINAL AUTHOR : BINTANG
 * ADAPTED FOR : Vercel Serverless API (iFilm Lengkap web clone)
 * DESCRIPTION : Scrape Donghua & anime from IFILM
 */

const https = require('https');

const API_BASE = 'vps-donghuawatch.vercel.app';

class IFILMScraper {
    constructor() {
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*'
        };
    }

    async getAnimeSchedule() {
        const data = await this._fetch(API_BASE, '/api/anime/schedule');
        return { success: true, data };
    }

    async getDonghuaSchedule() {
        const data = await this._fetch(API_BASE, '/api/schedule');
        return { success: true, data };
    }

    async search(query, page = 1) {
        const data = await this._fetch(API_BASE, `/api/search/${encodeURIComponent(query)}/${page}`);
        return { success: true, data };
    }

    async getDetail(slug) {
        const data = await this._fetch(API_BASE, `/api/detail/${slug}`);
        return { success: true, data };
    }

    async getEpisode(slug) {
        const data = await this._fetch(API_BASE, `/api/episode/${slug}`);
        return { success: true, data };
    }

    async getDonghuaCompleted(page = 1) {
        const data = await this._fetch(API_BASE, `/api/completed/${page}`);
        return { success: true, data };
    }

    async getDonghuaOngoing(page = 1) {
        const data = await this._fetch(API_BASE, `/api/ongoing/${page}`);
        return { success: true, data };
    }

    async getAnimeCompleted(page = 1) {
        const data = await this._fetch(API_BASE, `/api/anime/completed/${page}`);
        return { success: true, data };
    }

    async getAnimeOngoing(page = 1) {
        const data = await this._fetch(API_BASE, `/api/anime/ongoing/${page}`);
        return { success: true, data };
    }

    _fetch(hostname, path, redirectCount = 0) {
        return new Promise((resolve, reject) => {
            if (redirectCount > 5) {
                reject(new Error('Terlalu banyak redirect'));
                return;
            }

            const options = {
                hostname,
                port: 443,
                path,
                method: 'GET',
                headers: this.headers
            };

            const req = https.request(options, (res) => {
                // Ikuti redirect (301/302/303/307/308)
                if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                    res.resume(); // buang body, lanjut ke lokasi baru
                    let loc = res.headers.location;
                    let newHostname = hostname;
                    let newPath = loc;
                    if (loc.startsWith('http://') || loc.startsWith('https://')) {
                        const u = new URL(loc);
                        newHostname = u.hostname;
                        newPath = u.pathname + u.search;
                    }
                    this._fetch(newHostname, newPath, redirectCount + 1)
                        .then(resolve)
                        .catch(reject);
                    return;
                }

                let data = '';
                res.on('data', (chunk) => { data += chunk.toString(); });
                res.on('end', () => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`HTTP ${res.statusCode}`));
                        return;
                    }
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${e.message}`));
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(15000, () => {
                req.destroy(new Error('Request timeout'));
            });
            req.end();
        });
    }
}

module.exports = IFILMScraper;
