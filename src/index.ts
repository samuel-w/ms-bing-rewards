import { Platforms, runBrowser } from './ms-rewards';

const isDev = process.env.NODE_ENV !== 'production';

async function main() {
  await runBrowser(Platforms.DESKTOP, isDev);
  await runBrowser(Platforms.MOBILE, isDev);
}

main();
