import puppeteer from 'puppeteer';
import { Platforms, getSearchLinks, login, runSearch } from './ms-rewards';
import { platform } from 'os';

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

  const [page, searchLinks] = await Promise.all([
    // Set the cookies necessary from logging in
    login(browser),
    // Get list of text to search for
    getSearchLinks(browser, userAgent)
  ]);


  // Open searches in browser
  await runSearch(page, searchLinks);

  await browser.close();
}

main();
