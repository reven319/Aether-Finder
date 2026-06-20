const axios = require('axios');
const cheerio = require('cheerio');

async function search(query) {
  const results = [];
  try {
    const searchUrl = `https://sourceforge.net/directory/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    const projects = new Set();

    // Find links that look like project URLs
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        // Match /projects/name/ or https://sourceforge.net/projects/name/
        const match = href.match(/(?:\/projects\/|sourceforge\.net\/projects\/)([a-zA-Z0-9\-_]+)/);
        if (match) {
          const projectName = match[1].toLowerCase();
          // Filter out generic paths
          const ignored = ['about', 'search', 'add_project', 'support', 'compare', 'explore', 'software', 'enterprise', 'resources', 'blog', 'jobs'];
          if (!ignored.includes(projectName)) {
            projects.add(match[1]); // Keep original casing
          }
        }
      }
    });

    // For the top 5 projects found, generate the details
    const projectList = Array.from(projects).slice(0, 5);

    for (const proj of projectList) {
      try {
        // Query details of this project to get a nicer description
        const projectPageUrl = `https://sourceforge.net/projects/${proj}/`;
        const projResponse = await axios.get(projectPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 4000
        });

        const proj$ = cheerio.load(projResponse.data);
        const title = proj$('h1').text().trim() || proj;
        const description = proj$('#description').text().trim() || proj$('p.description').text().trim() || `SourceForge project ${proj}`;
        const downloadUrl = `https://sourceforge.net/projects/${proj}/files/latest/download`;

        results.push({
          title: `${title} (SourceForge)`,
          url: downloadUrl,
          source: 'SourceForge',
          size: null, // Size will be resolved on verification
          type: 'EXE/ZIP',
          description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
          date: new Date().toISOString() // No direct date easily accessible on main page
        });
      } catch (err) {
        // If getting details fails, push basic placeholder
        results.push({
          title: `${proj} (SourceForge)`,
          url: `https://sourceforge.net/projects/${proj}/files/latest/download`,
          source: 'SourceForge',
          size: null,
          type: 'EXE/ZIP',
          description: `Download the latest version of ${proj} from SourceForge.`,
          date: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('SourceForge crawler error:', error.message);
  }
  return results;
}

module.exports = { search };
