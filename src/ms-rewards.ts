import puppeteer from 'puppeteer';
import { randomInt } from './randomInt';

export const Platforms = {
  DESKTOP: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 Edg/83.0.478.45',
  MOBILE: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36'
}

export async function getSearchLinks(platform: any) {
  const fs = require("fs");
  const allWords: Array<string> = fs.readFileSync("words_mit.txt", 'utf-8').split('\n');

  // Go up to requirement, plus random padding
  const searchesRequired = (platform == Platforms.DESKTOP ? 30 : 20) + randomInt(2, 7);


  var words = new Array(0);
  for (var i = 0; i < searchesRequired; i++) {
    words.push(allWords[randomInt(0, allWords.length)]);
  }

  return words;

}

export async function login(browser: puppeteer.Browser): Promise<puppeteer.Page> {
  const page = await browser.newPage();

  const username = process.env.LIVE_USERNAME;
  const password = process.env.LIVE_PASSWORD;

  // Navigate to the login page
  // Ensure username and password are given
  if (username === 'USERNAME_HERE') {
    console.error('username is required but was not given');
    process.exit(1);
  } else if (process.env.password === 'PASSWORD_HERE') {
    console.error('password is required but was not given');
    process.exit(1);
  }

  await page.goto('https://login.live.com');

  // Login
  await page.type('[name="loginfmt"]', username, { delay: 32 });
  const formHandle = await page.$('form');
  await formHandle.press('Enter');
  await page.waitFor('.has-identity-banner');
  await page.type('[name="passwd"]', password, { delay: 32 });
  await formHandle.press('Enter');
  await page.waitForNavigation();

  return page;

}

export async function runSearch(searchPage: puppeteer.Page, queries: Array<string>) {
  for (const word of queries) {
    await searchPage.goto('https://bing.com/?q=' + word, { waitUntil: 'domcontentloaded' });
    await searchPage.waitFor(randomInt(3000, 8000));
  }
  await searchPage.close();

}

export async function runBrowser(userAgent: string, isDev: boolean) {
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
    getSearchLinks(userAgent)
  ]);


  // Open searches in browser
  await runSearch(page, searchLinks);

  await browser.close();
}
