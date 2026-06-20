const axios = require('axios');
const cheerio = require('cheerio');

async function testOv() {
  try {
    const url = 'https://www.oldversion.com/search?q=7-zip'; // Let's try 7-zip search
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    
    console.log('Main Content Text Preview:');
    console.log($('#main-content-body').text().trim().substring(0, 500));
    
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      links.push({ text, href });
    });
    console.log(`Found ${links.length} total links:`);
    console.log(links.slice(30));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testOv();
