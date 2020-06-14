import puppeteer from 'puppeteer';
import { credentials } from './config';
import { randomInt } from './randomInt';

export const Platforms = {
  DESKTOP: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.74 Safari/537.36 Edg/79.0.309.43',
  MOBILE: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36'
}

export async function getSearchLinks(browser: puppeteer.Browser, platform: any) {
	/*
  const page = await browser.newPage();

  await page.goto('https://www.bing.com/');

  await page.waitFor('#crs_pane a');

  await page.click('#rightNavCaro');
  await page.click('#rightNavCaro');

  // To allow bar to load fully
  await page.waitFor(randomInt(1000, 1500));

  const links = page.evaluate(() =>
    Array.from(document.querySelectorAll('#crs_pane a')).map(
      (a: HTMLAnchorElement) => a.textContent
    )
  );

  await page.close();

  return links;
  */
  const fs = require("fs");
  const allWords: Array<string> = fs.readFileSync("words_mit.txt", 'utf-8').split('\n');

  const searchesRequired = (platform == Platforms.DESKTOP ? 30 : 20) + randomInt(2, 7);


  var words = new Array(0);
  for (var i = 0; i < searchesRequired; i++) {
    words.push(allWords[randomInt(0, allWords.length)]);
  }
  await console.log(words);
  console.log(words.length);

  return words;

}

export async function rememberLogin(browser: puppeteer.Browser, platform: any) {
  const page = await browser.newPage();
  await console.log(platform == Platforms.DESKTOP);
  await console.log(platform == Platforms.MOBILE);
  await page.goto('https://www.bing.com/');



  if (platform == Platforms.DESKTOP) {
    page.waitForSelector('#id_l');
    await page.evaluate(() => {
      const signInAnchor: HTMLAnchorElement = document.querySelector('#id_l');
      const loggedInUsername = signInAnchor.textContent;
      const signedOut = loggedInUsername.toLocaleLowerCase() === 'sign in';

      if (!signedOut) return signedOut;

      // Click sign in if necessary
      signInAnchor.click();

      // HACK: Wait arbitrary time for cookies to be loaded.
      return new Promise(resolve => setTimeout(resolve, 1000));
    });
  } else if (platform == Platforms.MOBILE) {
    await page.waitFor(5000);
    //page.waitForSelector('#mHamburger');
    await page.click('#mHamburger');

    // To allow sidebar to open
    await page.waitForSelector('#hb_s');


    await page.evaluate(() => {
      const signInAnchor: HTMLDivElement = document.querySelector('#hb_s');
      const loggedInUsername = signInAnchor.textContent;
      const signedOut = loggedInUsername.toLocaleLowerCase() === 'sign in';


      if (!signedOut) return signedOut;

      // Click sign in if necessary
      (<HTMLElement>document.querySelector('#HBSignIn').children.item(0)).click();
      // HACK: Wait arbitrary time for cookies to be loaded.
      return new Promise(resolve => setTimeout(resolve, 1000));
    });
  }

  await page.close();

  return;
}

export async function login(browser: puppeteer.Browser) {
  const page = await browser.newPage();

  // Navigate to the login page
  // Ensure username and password are given
  if (!credentials.username) {
    console.error('username is required but was not given');
    process.exit(1);
  } else if (!credentials.password) {
    console.error('password is required but was not given');
    process.exit(1);
  }

  await page.goto('https://login.live.com');

  // Login
  await page.type('[name="loginfmt"]', credentials.username, { delay: 32 });
  const formHandle = await page.$('form');
  await formHandle.press('Enter');
  await page.waitFor('.has-identity-banner');
  await page.type('[name="passwd"]', credentials.password, { delay: 32 });
  await formHandle.press('Enter');
  await page.waitForNavigation();

  page.close();

}

export async function runSearch(browser: puppeteer.Browser, queries: Array<string>) {
  const searchPage = await browser.newPage();

  for (const word of queries) {
    await searchPage.goto('https://bing.com/?q=' + word);
    await searchPage.waitForNavigation();
    await searchPage.waitFor(randomInt(2000, 5000));
  }
  await searchPage.close();

}
