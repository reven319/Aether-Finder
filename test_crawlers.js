const localIndex = require('./crawlers/local_index');
const githubCrawler = require('./crawlers/github');
const homebrewCrawler = require('./crawlers/homebrew');
const archiveCrawler = require('./crawlers/archiveorg');

async function testAll() {
  const query = '7zip';
  console.log(`=== RUNNING CRAWLER VERIFICATION TEST FOR "${query}" ===\n`);

  // 1. Test Local Index
  console.log('Testing Curated Local Index...');
  try {
    const results = await localIndex.search(query);
    console.log(`-> Local Index: Found ${results.length} results.`);
    if (results.length > 0) {
      console.log(`   Sample: "${results[0].title}" - ${results[0].url}`);
    }
  } catch (err) {
    console.error('-> Local Index: FAILED:', err.message);
  }
  console.log();

  // 2. Test GitHub Releases
  console.log('Testing GitHub Releases Crawler...');
  try {
    const results = await githubCrawler.search(query);
    console.log(`-> GitHub: Found ${results.length} results.`);
    if (results.length > 0) {
      console.log(`   Sample: "${results[0].title}" - ${results[0].url}`);
    }
  } catch (err) {
    console.error('-> GitHub: FAILED:', err.message);
  }
  console.log();

  // 3. Test Homebrew Casks
  console.log('Testing Homebrew Cask Crawler...');
  try {
    const results = await homebrewCrawler.search(query);
    console.log(`-> Homebrew: Found ${results.length} results.`);
    if (results.length > 0) {
      console.log(`   Sample: "${results[0].title}" - ${results[0].url}`);
    }
  } catch (err) {
    console.error('-> Homebrew: FAILED:', err.message);
  }
  console.log();

  // 4. Test Archive.org
  console.log('Testing Archive.org Crawler...');
  try {
    const results = await archiveCrawler.search(query);
    console.log(`-> Archive.org: Found ${results.length} results.`);
    if (results.length > 0) {
      console.log(`   Sample: "${results[0].title}" - ${results[0].url}`);
    }
  } catch (err) {
    console.error('-> Archive.org: FAILED:', err.message);
  }
  console.log();

  console.log('=== VERIFICATION COMPLETED ===');
}

testAll();
