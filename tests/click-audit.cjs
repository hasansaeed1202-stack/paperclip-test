const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  const results = [];
  try {
    for (const width of [1440, 768, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(pathToFileURL(path.resolve("index.html")).href);
      // Capture external handoffs before default navigation; no test data is sent.
      await page.evaluate(() => {
        window.handoffs = [];
        document.addEventListener(
          "click",
          (e) => {
            const a = e.target.closest("a");
            if (a && /^(https:|tel:|mailto:)/.test(a.href)) {
              e.preventDefault();
              window.handoffs.push(a.href);
            }
          },
          true,
        );
      });
      const summaries = page.locator("summary");
      for (let i = 0; i < (await summaries.count()); i++) {
        const s = summaries.nth(i);
        await s.click();
        assert.equal(await s.evaluate((e) => e.parentElement.open), true);
        assert.ok(
          (await s.evaluate((e) => e.parentElement.innerText)).length > 50,
        );
        await s.focus();
        await page.keyboard.press("Enter");
        assert.equal(await s.evaluate((e) => e.parentElement.open), false);
        await page.keyboard.press("Space");
        assert.equal(await s.evaluate((e) => e.parentElement.open), true);
        results.push(
          `${width}: expanded + keyboard toggled: ${await s.innerText()}`,
        );
      }
      const links = page.locator("a[href]");
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const a = links.nth(i);
        if (
          (await a.evaluate((e) => !!e.closest("#navigation"))) &&
          width <= 900
        )
          await page.locator(".menu-toggle").click();
        if (!(await a.isVisible())) continue;
        const href = await a.getAttribute("href");
        assert.notEqual(href, "#");
        const label = (await a.innerText()).replace(/\s+/g, " ").trim();
        if (href.startsWith("https://wa.me/")) {
          const u = new URL(href);
          assert.equal(u.pathname, "/923178191818");
          // The quick-action bar intentionally opens a plain clinic conversation.
          if (!(await a.evaluate((e) => !!e.closest(".mobile-actions"))))
            assert.ok(u.searchParams.get("text"));
        }
        if (href.startsWith("tel:"))
          assert.ok(["tel:+923178191818", "tel:+923009171002"].includes(href));
        if (href.startsWith("mailto:"))
          assert.equal(href, "mailto:dr.ehsanpk@gmail.com");
        if (href.includes("maps.app"))
          assert.equal(href, "https://maps.app.goo.gl/FdYHM3yxc6KPLa2T7");
        if (await a.evaluate((e) => e.classList.contains("skip")))
          await a.focus();
        await a.click();
        if (href.startsWith("#")) {
          assert.equal(await page.evaluate(() => location.hash), href);
          assert.ok(await page.locator(href).count());
        } else
          assert.equal(
            (await page.evaluate(() => window.handoffs)).at(-1),
            href,
          );
        results.push(`${width}: clicked ${label} -> ${href}`);
      }
      for (let i = 0; i < 3; i++) {
        const method = page.locator("[data-method]").nth(i);
        await method.click();
        assert.equal(
          await page.locator("[name=method]").inputValue(),
          await method.getAttribute("data-method"),
        );
      }
      for (let i = 0; i < (await page.locator("[data-image]").count()); i++) {
        const trigger = page.locator("[data-image]").nth(i);
        await trigger.click();
        assert.equal(
          await page.locator("dialog").evaluate((e) => e.open),
          true,
        );
        await page.locator("#close-lightbox").click();
        assert.equal(
          await trigger.evaluate((e) => e === document.activeElement),
          true,
        );
        await trigger.focus();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Escape");
        assert.equal(
          await page.locator("dialog").evaluate((e) => e.open),
          false,
        );
      }
      if (width <= 900) {
        await page.locator(".menu-toggle").click();
        await page.keyboard.press("Escape");
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
      }
      assert.deepEqual(errors, []);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.close();
    }
    fs.writeFileSync(
      path.join(
        process.env.PAPERCLIP_RUN_SCRATCH_DIR || ".",
        "click-audit.txt",
      ),
      results.join("\n"),
    );
    console.log(
      `PASS: ${results.length} individual link/accordion checks across desktop, tablet and mobile; all method shortcuts; both gallery controls; native keyboard states; no JS errors.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
