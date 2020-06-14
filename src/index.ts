import puppeteer from 'puppeteer';
import { Platforms, getSearchLinks, login, runSearch } from './ms-rewards';

const isDev = process.env.NODE_ENV !== 'production';

async function main() {
  const userAgent = (process.argv.slice(2)[0] === 'mobile') ? Platforms.MOBILE : Platforms.DESKTOP;

  // Set user agent, vulnerable to detection through navigator.platform 
  const browser = await puppeteer.launch({
    headless: false,
    devtools: isDev,
    args: [
      '--user-agent=' + userAgent
    ]
  });

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
