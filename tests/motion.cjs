const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const url = pathToFileURL(path.join(root, "index.html")).href;
(async () => {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
  });
  try {
    for (const width of [320, 375, 390, 430, 768, 1440, 1920]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: width < 1000,
        isMobile: width < 1000,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url);
      assert.ok(
        await page.evaluate(() => document.getAnimations().length > 0),
        "hero entrance",
      );
      await page.waitForTimeout(1100);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow ${width}`,
      );
      if (width < 641) {
        const action = page.locator(".mobile-actions a").first();
        await action.scrollIntoViewIfNeeded();
        const box = await action.boundingBox();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            { x: box.x + box.width / 2, y: box.y + box.height / 2 },
          ],
        });
        await page.waitForTimeout(100);
        assert.ok(
          await action.evaluate((e) => Number(getComputedStyle(e).scale) < 1),
          "real touch compression",
        );
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchCancel",
          touchPoints: [],
        });
        await page.waitForTimeout(450);
        assert.equal(
          await action.evaluate((e) => e.classList.contains("motion-pressed")),
          false,
        );
        assert.ok(
          ["none", "1"].includes(
            await action.evaluate((e) => getComputedStyle(e).scale),
          ),
        );
        assert.ok(
          await page.evaluate(
            () =>
              parseFloat(getComputedStyle(document.body).paddingBottom) >=
              document.querySelector(".mobile-actions").getBoundingClientRect()
                .height,
          ),
          "bar clearance",
        );
        assert.equal(
          await page.evaluate(() => matchMedia("(pointer: fine)").matches),
          false,
        );
      } else if (width >= 1000) {
        await page.locator(".hero-photo").hover({ position: { x: 30, y: 30 } });
        await page.waitForTimeout(100);
        assert.notEqual(
          await page
            .locator(".hero-photo")
            .evaluate((e) => e.style.getPropertyValue("--depth-x")),
          "",
        );
        await page.locator(".hero .button").first().hover();
        await page.waitForTimeout(450);
        assert.equal(
          await page
            .locator(".hero .button")
            .first()
            .evaluate((e) => getComputedStyle(e).translate),
          "0px -2px",
        );
      }
      await page.locator(".hero .button").first().click();
      await page.waitForTimeout(1100);
      assert.equal(new URL(page.url()).hash, "#booking");
      assert.ok(
        await page
          .locator("#booking")
          .evaluate(
            (e) =>
              Math.abs(
                e.getBoundingClientRect().top -
                  parseFloat(
                    getComputedStyle(document.documentElement).scrollPaddingTop,
                  ),
              ) < 3,
          ),
        "anchor landing",
      );
      await page.locator(".concern").first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      assert.equal(
        await page
          .locator(".concern")
          .first()
          .evaluate((e) => getComputedStyle(e).opacity),
        "1",
      );
      await page.keyboard.press("Tab");
      await page.locator("summary").first().focus();
      assert.notEqual(
        await page
          .locator("summary")
          .first()
          .evaluate((e) => getComputedStyle(e).outlineStyle),
        "none",
      );
      await page.keyboard.press("Enter");
      assert.ok(
        await page
          .locator("details")
          .first()
          .evaluate((e) => e.open),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await page.evaluate(() => document.getAnimations().length),
        0,
      );
      assert.equal(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).scrollBehavior,
        ),
        "auto",
      );
      assert.deepEqual(errors, []);
      await context.close();
    }
    for (const mode of ["no-js", "no-motion", "no-observer", "reduced"]) {
      const context = await browser.newContext({
        javaScriptEnabled: mode !== "no-js",
        reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
      });
      if (mode === "no-motion")
        await context.route("**/motion.js", (route) => route.abort());
      if (mode === "no-observer")
        await context.addInitScript(() => {
          delete window.IntersectionObserver;
        });
      const page = await context.newPage();
      await page.goto(url);
      await page.waitForTimeout(1000);
      for (const selector of [
        "h1",
        ".hero .button",
        ".section-heading",
        ".concern",
        ".gallery-item",
      ]) {
        assert.equal(
          await page
            .locator(selector)
            .first()
            .evaluate((e) => getComputedStyle(e).opacity),
          "1",
          `${mode} visible ${selector}`,
        );
      }
      assert.ok(await page.locator('a[href^="tel:"]').count());
      assert.ok(await page.locator('a[href^="https://wa.me/"]').count());
      await context.close();
    }
    // All static content, links, SEO and domain files must survive byte-for-byte.
    const base = execFileSync("git", ["show", "7217baa:index.html"], {
      cwd: root,
      encoding: "utf8",
    });
    const current = fs
      .readFileSync(path.join(root, "index.html"), "utf8")
      .replace(/^    <link rel="stylesheet" href="motion.css" \/>\r?\n/m, "")
      .replace(/^    <script src="motion.js" defer><\/script>\r?\n/m, "");
    assert.equal(
      current
        .replace(/\r/g, "")
        .replace(/      <a class="mobile-booking"[\s\S]*?<\/a\n      >\n/, ""),
      base.replace(/\r/g, ""),
    );
    for (const file of [
      "radio.js",
      "clinic-config.js",
      "CNAME",
      "robots.txt",
      "sitemap.xml",
    ]) {
      assert.deepEqual(
        fs.readFileSync(path.join(root, file)),
        execFileSync("git", ["show", `7217baa:${file}`], { cwd: root }),
      );
    }
    console.log(
      "PASS: 7 widths, hero, native anchor landing, real touch press/cancel/release, pointer depth, hover, keyboard, focus, reduced-motion change, JS/observer failure, static content/SEO/radio/domain preservation.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
