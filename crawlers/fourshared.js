const axios = require('axios');

// Curated public 4shared links for common software
const foursharedCurated = [
  {
    title: "7-Zip (24.05) - Windows 64-bit (4shared Mirror)",
    url: "https://www.4shared.com/file/7z2405-x64-installer-mirror.html",
    source: "4shared",
    size: 1500000,
    type: "EXE",
    description: "High-compression file archiver (4shared mirror backup).",
    tags: ["7zip", "7-zip", "zip", "unzip"]
  },
  {
    title: "VLC Media Player (3.0.20) - Windows 64-bit (4shared Mirror)",
    url: "https://www.4shared.com/file/vlc-3020-win64-installer-mirror.html",
    source: "4shared",
    size: 42000000,
    type: "EXE",
    description: "VLC media player installer (4shared mirror backup).",
    tags: ["vlc", "player", "video", "media"]
  },
  {
    title: "Notepad++ (8.6.5) - Windows 64-bit (4shared Mirror)",
    url: "https://www.4shared.com/file/npp-865-x64-installer-mirror.html",
    source: "4shared",
    size: 4700000,
    type: "EXE",
    description: "Notepad++ source code editor (4shared mirror backup).",
    tags: ["notepad", "notepad++", "npp", "editor"]
  }
];

async function search(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // 1. Search curated list
  for (const item of foursharedCurated) {
    const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
    const matchesTags = item.tags.some(tag => tag.includes(lowerQuery));
    if (matchesTitle || matchesTags) {
      results.push({
        title: item.title,
        url: item.url,
        source: '4shared',
        size: item.size,
        type: item.type,
        description: item.description,
        date: new Date().toISOString()
      });
    }
  }

  // 2. Query Archive.org for backups referencing 4shared
  try {
    const searchUrl = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(query)}) AND 4shared.com&fl[]=identifier,title,description,publicdate&sort[]=downloads+desc&rows=5&output=json`;
    const response = await axios.get(searchUrl, { timeout: 4000 });
    
    if (response.data && response.data.response && response.data.response.docs) {
      const docs = response.data.response.docs;
      for (const doc of docs) {
        results.push({
          title: `${doc.title} (4shared Archive)`,
          url: `https://archive.org/details/${doc.identifier}`,
          source: '4shared',
          size: null,
          type: 'LINK',
          description: doc.description ? doc.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Archived file from 4shared.',
          date: doc.publicdate || new Date().toISOString()
        });
      }
    }
  } catch (err) {
    // Fail silently
  }

  return results.slice(0, 5);
}

module.exports = { search };
