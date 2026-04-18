const axios = require('axios');
const fs = require('fs');

async function testScrape() {
    const url = 'https://www.amazon.in/Yamaha-F280-Acoustic-Guitar-Natural/dp/B08317Y4VP/?th=1';
    console.log(`Diagnostic Scrape for: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache'
            },
            timeout: 20000
        });

        fs.writeFileSync('amazon_debug.html', response.data);
        console.log(`Successfully saved HTML. Length: ${response.data.length}`);
        console.log(`First 300 chars: ${response.data.substring(0, 300)}`);
    } catch (error) {
        console.error(`Diagnostic Failed: ${error.message}`);
    }
}

testScrape();
