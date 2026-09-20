const { reliableScrape } = require('./reliableScrape');
const { searchProducts } = require('./search');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    console.log('Usage:');
    console.log('  node cli.js scrape <productUrl> [--headed]');
    console.log('  node cli.js search <query>');
    process.exit(1);
  }

  if (command === 'search') {
    const query = args.slice(1).join(' ');
    if (!query) {
      console.log('Usage: node cli.js search <query>');
      process.exit(1);
    }

    console.log(`\nSearching for: "${query}"\n`);
    const results = await searchProducts(query);

    if (results.length === 0) {
      console.log('No results found.');
    } else {
      console.log(`Found ${results.length} result(s):\n`);
      results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}`);
        console.log(`   ID: ${r.storeProductId}`);
        console.log(`   Brand: ${r.brand}`);
        console.log(`   URL: ${r.url}`);
        console.log('');
      });
    }
  } else if (command === 'scrape') {
    const productUrl = args[1];
    const headed = args.includes('--headed');

    if (!productUrl) {
      console.log('Usage: node cli.js scrape <productUrl> [--headed]');
      process.exit(1);
    }

    console.log(`\nScraping: ${productUrl}`);
    console.log(`Mode: ${headed ? 'HEADED (visible browser)' : 'headless'}\n`);

    const result = await reliableScrape(
      { url: productUrl, name: productUrl },
      { maxRetries: 3, headless: !headed }
    );

    console.log('\n--- RESULT ---');
    console.log(`Success: ${result.success}`);

    if (result.finalResult) {
      console.log(`Price: $${result.finalResult.price}`);
      console.log(`In Stock: ${result.finalResult.inStock}`);
    } else {
      console.log('No price data obtained.');
    }

    console.log('\n--- ATTEMPTS ---');
    result.attempts.forEach((a) => {
      const statusIcon =
        a.status === 'success' ? '✓' : a.status === 'retried' ? '↻' : '✗';
      console.log(
        `  ${statusIcon} Attempt ${a.attemptNumber}: ${a.status} (${a.durationMs}ms)${a.errorMessage ? ` — ${a.errorMessage}` : ''}`
      );
    });
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Use "search" or "scrape"');
    process.exit(1);
  }
}

main().catch(console.error);
