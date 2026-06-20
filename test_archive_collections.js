const axios = require('axios');

async function testCollections() {
  const query = 'winzip';
  const collections = ['tucows', 'softwarelibrary', 'classicpcfiles', 'cdbbs'];
  
  for (const col of collections) {
    try {
      const url = `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(query)}) AND collection:(${col})&fl[]=identifier,title,downloads&rows=3&output=json`;
      const response = await axios.get(url, { timeout: 5000 });
      const docs = response.data.response.docs;
      console.log(`Collection [${col}] found ${response.data.response.numFound} items. Top docs:`);
      docs.forEach(doc => {
        console.log(`  - ${doc.title} (ID: ${doc.identifier}, Downloads: ${doc.downloads})`);
      });
    } catch (err) {
      console.error(`Collection [${col}] failed:`, err.message);
    }
  }
}

testCollections();
