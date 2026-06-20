const axios = require('axios');

async function search(query) {
  const results = [];
  try {
    // Search repositories matching the query
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Software-Search-Engine-Crawler/1.0'
      },
      timeout: 5000
    });

    if (!searchResponse.data || !searchResponse.data.items) {
      return results;
    }

    const repos = searchResponse.data.items;

    for (const repo of repos) {
      try {
        // Fetch releases for this repo
        const releasesUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases/latest`;
        const releasesResponse = await axios.get(releasesUrl, {
          headers: {
            'User-Agent': 'Software-Search-Engine-Crawler/1.0'
          },
          timeout: 4000
        });

        const release = releasesResponse.data;
        if (release && release.assets && release.assets.length > 0) {
          for (const asset of release.assets) {
            // Check if the asset is an installer or executable or zip archive
            const lowerName = asset.name.toLowerCase();
            const extensions = ['.exe', '.msi', '.dmg', '.pkg', '.zip', '.tar.gz', '.appimage', '.deb', '.rpm'];
            const matchesExt = extensions.some(ext => lowerName.endsWith(ext));

            if (matchesExt) {
              results.push({
                title: `${repo.name} (${release.tag_name}) - ${asset.name}`,
                url: asset.browser_download_url,
                source: 'GitHub',
                size: asset.size,
                type: asset.name.split('.').pop().toUpperCase(),
                description: release.body ? release.body.substring(0, 150) + '...' : repo.description || 'GitHub release asset.',
                date: asset.updated_at || release.published_at
              });
            }
          }
        }
      } catch (err) {
        // Log individual repo errors but don't fail the entire GitHub crawl
        // console.error(`Error fetching releases for ${repo.full_name}:`, err.message);
      }
    }
  } catch (error) {
    console.error('GitHub crawler error:', error.message);
  }
  return results;
}

module.exports = { search };
