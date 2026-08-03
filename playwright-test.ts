import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const results: any = {};

  for (const locale of ['en-US', 'es-CO', 'fr-FR']) {
    const url = `https://speek-dzx.pages.dev/${locale}/`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const htmlBase = await page.locator('html').getAttribute('q:base');
    const htmlLocale = await page.locator('html').getAttribute('lang');
    const checkboxLabel = await page.locator('label:has(input[type="checkbox"])').first().textContent();
    const before = { htmlBase, htmlLocale, checkboxLabel: checkboxLabel?.trim() };

    // Click first checkbox
    await page.locator('input[type="checkbox"]').first().click();
    await page.waitForTimeout(500);

    const afterBase = await page.locator('html').getAttribute('q:base');
    const afterLocale = await page.locator('html').getAttribute('lang');
    const afterLabel = await page.locator('label:has(input[type="checkbox"])').first().textContent();

    results[locale] = {
      before,
      after: { htmlBase: afterBase, htmlLocale: afterLocale, checkboxLabel: afterLabel?.trim() }
    };
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
