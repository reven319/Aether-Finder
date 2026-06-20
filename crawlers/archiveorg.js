const axios = require('axios');

async function search(query) {
  const results = [];
  try {
    const searchUrl = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(query)}) AND mediatype:(software)&fl[]=identifier,title,description,publicdate,downloads&sort[]=downloads+desc&rows=8&output=json`;
    const searchResponse = await axios.get(searchUrl, { timeout: 5000 });

    if (!searchResponse.data || !searchResponse.data.response || !searchResponse.data.response.docs) {
      return results;
    }

    const docs = searchResponse.data.response.docs;

    for (const doc of docs) {
      try {
        const metadataUrl = `https://archive.org/metadata/${doc.identifier}`;
        const metadataResponse = await axios.get(metadataUrl, { timeout: 4000 });

        if (metadataResponse.data && metadataResponse.data.files) {
          const files = metadataResponse.data.files;
          
          // Look for direct software installers/binaries first, then zip files
          const binaryExtensions = ['.exe', '.msi', '.dmg', '.pkg', '.iso', '.zip', '.tar.gz', '.rar'];
          
          // Find the best download candidate
          let bestFile = null;
          let highestPriority = -1;

          for (const file of files) {
            const lowerName = file.name.toLowerCase();
            
            // Skip system or small files
            if (lowerName.startsWith('__ia_thumb') || lowerName.endsWith('.xml') || lowerName.endsWith('.sqlite') || lowerName.endsWith('.torrent') || lowerName.endsWith('.png') || lowerName.endsWith('.jpg')) {
              continue;
            }

            const extIndex = binaryExtensions.findIndex(ext => lowerName.endsWith(ext));
            if (extIndex !== -1) {
              // Priority: 0: exe, 1: msi, 2: dmg, 3: pkg, 4: iso, etc.
              // We want higher priority (lower index is higher priority, or just map it)
              const priority = binaryExtensions.length - extIndex;
              if (priority > highestPriority) {
                highestPriority = priority;
                bestFile = file;
              }
            }
          }

          if (bestFile) {
            const downloadUrl = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(bestFile.name)}`;
            const fileSize = bestFile.size ? parseInt(bestFile.size, 10) : null;
            
            results.push({
              title: `${doc.title} - ${bestFile.name}`,
              url: downloadUrl,
              source: 'Internet Archive',
              size: fileSize,
              type: bestFile.name.split('.').pop().toUpperCase(),
              description: doc.description ? doc.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'Archived software download.',
              date: doc.publicdate || new Date().toISOString()
            });
          }
        }
      } catch (err) {
        // Fail silently for individual items
      }
    }
  } catch (error) {
    console.error('Archive.org crawler error:', error.message);
  }
  return results;
}

module.exports = { search };
