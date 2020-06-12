import puppeteer from 'puppeteer';
import { Platforms, rememberLogin, getSearchLinks, login, runSearch } from './ms-rewards';

const isDev = process.env.NDOE_ENV !== 'production';

async function main() {
  const userAgent = (process.argv.slice(2)[0] === 'mobile') ? Platforms.MOBILE : Platforms.DESKTOP;

  // Set user agent, vulnerable to detection through navigator.platform 
  const browser = await puppeteer.launch({
    devtools: isDev,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--user-agent=' + userAgent
    ]
  });

  console.log(userAgent);

  const [_, searchLinks] = await Promise.all([
    // Set the cookies necessary from logging in
    login(browser),
    // Get list of text to search for
    getSearchLinks(browser)
  ]);

  // Create a list of searches to run, but don't run them yet
  const runnableSearches = searchLinks.map(textContent => () =>
    runSearch(browser, textContent)
  );

  await rememberLogin(browser, userAgent);

  // Open searches in browser serially
  for (const search of runnableSearches) {
    await search();
  }

  await browser.close();
}

main();
