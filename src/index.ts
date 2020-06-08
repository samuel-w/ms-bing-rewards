import puppeteer from 'puppeteer';
import { getSearchLinks, login, runSearch } from './ms-rewards';

const isDev = process.env.NDOE_ENV !== 'production';

const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43';
const mobileUserAgent = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36';
async function main() {
  // Set user agent, vulnerable to detection through navigator.platform
  const platform = process.argv.slice(2)[0];
  const userAgent = (platform === 'mobile') ? mobileUserAgent : desktopUserAgent;
  
  const browser = await puppeteer.launch({
    devtools: isDev,
                    args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--user-agent='+userAgent
                ]
  });
  
  console.log(userAgent);

  const [_, searchLinks] = await Promise.all([
    // Set the cookies necessary from logging in
    await login(browser),
    // Get list of text to search for
    getSearchLinks(browser)
  ]);

  // Create a list of searches to run, but don't run them yet
  const runnableSearches = searchLinks.map(textContent => () =>
    runSearch(browser, textContent)
  );

  // Open searches in browser serially
  for (const search of runnableSearches) {
    await search();
  }
  
  await browser.close();
}

main();
