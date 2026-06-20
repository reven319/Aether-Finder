const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Import crawlers
const localIndex = require('./crawlers/local_index');
const githubCrawler = require('./crawlers/github');
const homebrewCrawler = require('./crawlers/homebrew');
const archiveCrawler = require('./crawlers/archiveorg');
const megaCrawler = require('./crawlers/mega');
const foursharedCrawler = require('./crawlers/fourshared');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Search endpoint
app.use('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  console.log(`[Search] Query: "${query}"`);

  // Execute all crawlers in parallel
  const crawlerPromises = [
    localIndex.search(query).catch(err => { console.error('Local Index error:', err.message); return []; }),
    githubCrawler.search(query).catch(err => { console.error('GitHub error:', err.message); return []; }),
    homebrewCrawler.search(query).catch(err => { console.error('Homebrew error:', err.message); return []; }),
    archiveCrawler.search(query).catch(err => { console.error('Archive.org error:', err.message); return []; }),
    megaCrawler.search(query).catch(err => { console.error('MEGA error:', err.message); return []; }),
    foursharedCrawler.search(query).catch(err => { console.error('4shared error:', err.message); return []; })
  ];

  const results = await Promise.allSettled(crawlerPromises);

  // Flatten results
  let mergedResults = [];
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      mergedResults = mergedResults.concat(result.value);
    }
  });

  // Deduplicate results by URL
  const seenUrls = new Set();
  const uniqueResults = [];

  for (const item of mergedResults) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueResults.push(item);
    }
  }

  // Optional: Rank/sort results (Local Index first, then GitHub, then Homebrew, then Archive.org, then cloud hosts)
  const sourceOrder = { 'Official Site': 1, 'GitHub': 2, 'Homebrew Cask': 3, 'Internet Archive': 4, 'MEGA': 5, '4shared': 6 };
  uniqueResults.sort((a, b) => {
    const orderA = sourceOrder[a.source] || 5;
    const orderB = sourceOrder[b.source] || 5;
    return orderA - orderB;
  });

  res.json({
    query: query,
    total: uniqueResults.length,
    results: uniqueResults
  });
});

// Link verification endpoint
app.get('/api/verify', async (req, res) => {
  const downloadUrl = req.query.url;
  if (!downloadUrl) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    let size = null;
    let contentType = null;
    let status = 'active';

    // 1. Try HEAD request first (fastest)
    try {
      const headResponse = await axios.head(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 4000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });

      size = headResponse.headers['content-length'];
      contentType = headResponse.headers['content-type'];
    } catch (headErr) {
      // 2. If HEAD fails (e.g. 405 Method Not Allowed), fall back to GET requesting only the first byte
      const getResponse = await axios.get(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Range': 'bytes=0-0'
        },
        timeout: 4000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });

      // Extract content size from Content-Range or Content-Length
      const contentRange = getResponse.headers['content-range'];
      if (contentRange) {
        // Content-Range format: bytes 0-0/123456
        const match = contentRange.match(/\/(\d+)$/);
        if (match) {
          size = match[1];
        }
      }
      if (!size) {
        size = getResponse.headers['content-length'];
      }
      contentType = getResponse.headers['content-type'];
    }

    res.json({
      status: 'active',
      size: size ? parseInt(size, 10) : null,
      contentType: contentType || 'application/octet-stream'
    });

  } catch (error) {
    console.error(`[Verify] Link check failed for: ${downloadUrl} - ${error.message}`);
    res.json({
      status: 'unknown',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
