const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  try {
    for (const reducedMotion of ["no-preference", "reduce"])
      for (const width of [320, 375, 390, 430]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          hasTouch: true,
          isMobile: true,
          reducedMotion,
        });
        const page = await context.newPage();
        await page.goto(pathToFileURL(path.resolve("index.html")).href);
        await page.waitForTimeout(1000);
        const links = page.locator(".mobile-actions a");
        assert.equal(await links.count(), 4);
        assert.deepEqual(
          await links
            .locator("span")
            .evaluateAll((es) => es.map((e) => e.firstChild.textContent)),
          ["Call", "WhatsApp", "Book online", "Directions"],
        );
        await page.evaluate(() => {
          window.handoffs = [];
          document.addEventListener("click", (e) => {
            const a = e.target.closest(".mobile-actions a");
            if (a && a.getAttribute("href") !== "#booking") {
              window.handoffs.push({
                href: a.href,
                prevented: e.defaultPrevented,
              });
              e.preventDefault();
            }
          });
        });
        const cdp = await context.newCDPSession(page);
        for (let i = 0; i < 4; i++) {
          const a = links.nth(i),
            box = await a.boundingBox();
          assert.ok(box.width >= 44 && box.height >= 44);
          assert.ok(
            await a.evaluate((e) => e.scrollWidth <= e.clientWidth),
            "label fits",
          );
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [
              { x: box.x + box.width / 2, y: box.y + box.height / 2 },
            ],
          });
          await page.waitForTimeout(110);
          const scale = await a.evaluate((e) => getComputedStyle(e).scale);
          assert.ok(
            reducedMotion === "reduce"
              ? ["1", "none"].includes(scale)
              : Number(scale) < 1,
          );
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
          await page.waitForTimeout(450);
          if (i === 2) {
            assert.equal(new URL(page.url()).hash, "#booking");
            await page.waitForTimeout(800);
            const top = await page
              .locator("#booking")
              .evaluate((e) => e.getBoundingClientRect().top);
            assert.ok(top >= 0 && top < 200, "booking destination");
          }
        }
        assert.deepEqual(await page.evaluate(() => window.handoffs), [
          { href: "tel:+923178191818", prevented: false },
          { href: "https://wa.me/923178191818", prevented: false },
          {
            href: "https://maps.app.goo.gl/FdYHM3yxc6KPLa2T7",
            prevented: false,
          },
        ]);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.evaluate(() =>
          scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
        );
        assert.ok(
          await page.evaluate(
            () =>
              document.querySelector("footer").getBoundingClientRect().bottom <=
              document.querySelector(".mobile-actions").getBoundingClientRect()
                .top,
          ),
          "footer clearance",
        );
        await links.nth(1).focus();
        await page.keyboard.press("Tab");
        assert.notEqual(
          await links.nth(2).evaluate((e) => getComputedStyle(e).outlineStyle),
          "none",
        );
        console.log(
          `PASS four actions, touch, destination, overflow, footer, focus: ${width} ${reducedMotion}`,
        );
        await context.close();
      }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
