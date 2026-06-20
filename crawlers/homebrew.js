const axios = require('axios');

let caskCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchCasks() {
  const now = Date.now();
  if (caskCache && (now - lastFetchTime < CACHE_DURATION)) {
    return caskCache;
  }

  try {
    const url = 'https://formulae.brew.sh/api/cask.json';
    const response = await axios.get(url, { timeout: 10000 });
    caskCache = response.data;
    lastFetchTime = now;
    return caskCache;
  } catch (err) {
    console.error('Homebrew crawler error fetching casks:', err.message);
    return caskCache || []; // Fallback to cache if available
  }
}

async function search(query) {
  const results = [];
  try {
    const casks = await fetchCasks();
    if (!casks || casks.length === 0) return results;

    const lowerQuery = query.toLowerCase();
    
    // Filter casks matching query
    const matches = casks.filter(cask => {
      const matchToken = cask.token && cask.token.toLowerCase().includes(lowerQuery);
      const matchName = cask.name && cask.name.some(n => n.toLowerCase().includes(lowerQuery));
      const matchDesc = cask.desc && cask.desc.toLowerCase().includes(lowerQuery);
      return matchToken || matchName || matchDesc;
    });

    // Take the top 10 matches
    const topMatches = matches.slice(0, 10);

    for (const cask of topMatches) {
      const title = cask.name && cask.name[0] ? `${cask.name[0]} (${cask.version})` : `${cask.token} (${cask.version})`;
      results.push({
        title: title,
        url: cask.url,
        source: 'Homebrew Cask',
        size: null, // Size will be resolved on verification
        type: cask.url.split('.').pop().toUpperCase(),
        description: cask.desc || `macOS package for ${cask.token}.`,
        date: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Homebrew search error:', error.message);
  }
  return results;
}

module.exports = { search };
