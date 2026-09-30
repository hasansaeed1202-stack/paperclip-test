const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge'});
  try {
    for (const timezoneId of ['Asia/Karachi', 'America/Los_Angeles', 'Asia/Tokyo']) {
      const context = await browser.newContext({timezoneId});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.clock.install({time: new Date('2026-09-30T12:59:59Z')});
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      const status = page.locator('[data-radio-status]');
      assert.equal(await status.textContent(), 'Radio Show');
      assert.match(await page.locator('[data-radio-next]').textContent(), /today/);
      await page.clock.runFor(1000);
      assert.equal(await status.textContent(), 'LIVE NOW');
      assert.equal(await page.locator('[data-radio-link]').textContent(), 'Listen Live ↗');
      assert.equal(await page.locator('[data-radio-link]').getAttribute('href'), 'https://www.dabangfm.com/');
      await page.clock.fastForward(30 * 60 * 1000);
      assert.equal(await status.textContent(), 'LIVE NOW');
      await page.clock.fastForward(30 * 60 * 1000);
      assert.equal(await status.textContent(), 'Radio Show');
      assert.match(await page.locator('[data-radio-next]').textContent(), /tomorrow/);
      await page.clock.fastForward(1000);
      assert.equal(await status.textContent(), 'Radio Show');
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({width, height: 1000});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('#radio-show').scrollIntoViewIfNeeded();
        if (timezoneId === 'Asia/Karachi' && process.env.PAPERCLIP_RUN_SCRATCH_DIR) {
          await page.locator('#radio-show').screenshot({path: path.join(process.env.PAPERCLIP_RUN_SCRATCH_DIR, `radio-${width}.png`)});
        }
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('Radio boundaries, automatic transitions, 3 device timezones, responsive widths and JS errors: PASS');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
