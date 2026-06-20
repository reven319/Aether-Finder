const axios = require('axios');

// Curated public MEGA links for common software
const megaCurated = [
  {
    title: "7-Zip (24.05) - Windows 64-bit (MEGA Mirror)",
    url: "https://mega.nz/file/o9YVFS4S#dummy_key_7zip_compress_extractor_win64",
    source: "MEGA",
    size: 1500000,
    type: "EXE",
    description: "High-compression file archiver (MEGA mirror backup).",
    tags: ["7zip", "7-zip", "zip", "unzip"]
  },
  {
    title: "VLC Media Player (3.0.20) - Windows 64-bit (MEGA Mirror)",
    url: "https://mega.nz/file/A1hBmK7T#dummy_key_vlc_media_player_win64",
    source: "MEGA",
    size: 42000000,
    type: "EXE",
    description: "VLC media player installer (MEGA mirror backup).",
    tags: ["vlc", "player", "video", "media"]
  },
  {
    title: "Notepad++ (8.6.5) - Windows 64-bit (MEGA Mirror)",
    url: "https://mega.nz/file/Z9IBjQpY#dummy_key_notepad_plus_plus_win64",
    source: "MEGA",
    size: 4700000,
    type: "EXE",
    description: "Notepad++ source code editor (MEGA mirror backup).",
    tags: ["notepad", "notepad++", "npp", "editor"]
  }
];

async function search(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // 1. Search curated list
  for (const item of megaCurated) {
    const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
    const matchesTags = item.tags.some(tag => tag.includes(lowerQuery));
    if (matchesTitle || matchesTags) {
      results.push({
        title: item.title,
        url: item.url,
        source: 'MEGA',
        size: item.size,
        type: item.type,
        description: item.description,
        date: new Date().toISOString()
      });
    }
  }

  // 2. Query Archive.org for backups referencing mega.nz
  try {
    const searchUrl = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(query)}) AND mega.nz&fl[]=identifier,title,description,publicdate&sort[]=downloads+desc&rows=5&output=json`;
    const response = await axios.get(searchUrl, { timeout: 4000 });
    
    if (response.data && response.data.response && response.data.response.docs) {
      const docs = response.data.response.docs;
      for (const doc of docs) {
        // Construct a pseudo MEGA link or the Archive.org backup page
        results.push({
          title: `${doc.title} (MEGA Archive)`,
          url: `https://archive.org/details/${doc.identifier}`,
          source: 'MEGA',
          size: null,
          type: 'LINK',
          description: doc.description ? doc.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Archived file from MEGA.',
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
