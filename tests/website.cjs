/* Run with NODE_PATH pointing to a directory containing playwright and @axe-core/playwright. */
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
(async () => {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  const root = path.resolve(__dirname, ".."),
    out = process.env.PAPERCLIP_RUN_SCRATCH_DIR || root;
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(pathToFileURL(path.join(root, "index.html")).href);
      await page.locator("#gallery").scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("img[src]")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow ${width}`,
      );
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="#"]')]
          .filter((a) => !document.querySelector(a.getAttribute("href")))
          .map((a) => a.hash),
      );
      assert.deepEqual(broken, []);
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
        `accessibility ${width}`,
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: path.join(out, `clinic-${width}.png`),
        fullPage: true,
      });
      if (width <= 900) {
        await page.locator(".menu-toggle").click();
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "true",
        );
        await page.keyboard.press("Escape");
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
        await page.locator(".menu-toggle").click();
        await page.locator('nav a[href="#doctor"]').click();
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const expected = [
      "tel:+923178191818",
      "tel:+923009171002",
      "mailto:dr.ehsanpk@gmail.com",
      "https://wa.me/923178191818",
      "https://maps.app.goo.gl/FdYHM3yxc6KPLa2T7",
    ];
    for (const href of expected)
      assert.ok(await page.locator(`a[href^="${href}"]`).count(), href);
    const content = await page.locator("body").innerText();
    for (const text of [
      "Doctor Ihsan Ullah",
      "D.H.M.S.",
      "R.H.M.P.",
      "164552",
      "R-96305",
      "Muhammad Hassan",
      "PKR 1,000",
      "Medicines are charged separately.",
      "20",
    ])
      assert.ok(content.includes(text), text);
    await page.locator('#appointment-form button[type="submit"]').click();
    assert.equal(await page.locator("#request-result").isVisible(), false);
    assert.equal(
      await page
        .locator('[name="fullName"]')
        .evaluate((e) => e.validity.valueMissing),
      true,
    );
    const fill = async (name, value) =>
      page.locator(`[name="${name}"]`).fill(value);
    for (const [k, v] of Object.entries({
      fullName: "Test Patient",
      age: "35",
      country: "Pakistan",
      contact: "+92 300 1234567",
      reason: "Brief consultation enquiry",
      date: "2099-01-05",
      time: "10:00",
    }))
      await fill(k, v);
    await page.locator('[name="method"]').selectOption("WhatsApp voice call");
    await fill("contact", "abc");
    await page.locator('button[type="submit"]').click();
    assert.match(await page.locator("#form-error").innerText(), /valid phone/);
    await fill("contact", "+92 300 1234567");
    await fill("date", "2099-01-04");
    await page.locator('button[type="submit"]').click();
    assert.match(
      await page.locator("#form-error").innerText(),
      /Monday to Saturday/,
    );
    await fill("date", "2000-01-01");
    await page.locator('button[type="submit"]').click();
    assert.equal(
      await page
        .locator('[name="date"]')
        .evaluate((e) => e.validity.rangeUnderflow),
      true,
    );
    await fill("date", "2099-01-05");
    await fill("time", "18:00");
    await page.locator('button[type="submit"]').click();
    assert.equal(
      await page
        .locator('[name="time"]')
        .evaluate((e) => e.validity.rangeOverflow),
      true,
    );
    await fill("time", "10:00");
    for (const method of [
      "WhatsApp voice call",
      "WhatsApp video call",
      "Normal phone call",
    ]) {
      await page.locator('[name="method"]').selectOption(method);
      await page.locator('button[type="submit"]').click();
      assert.ok(await page.locator("#request-result").isVisible());
      const href = await page.locator("#send-request").getAttribute("href"),
        u = new URL(href);
      assert.equal(u.hostname, "wa.me");
      assert.equal(u.pathname, "/923178191818");
      const message = u.searchParams.get("text");
      for (const text of [
        "Test Patient",
        "35",
        "Pakistan",
        "+92 300 1234567",
        "2099-01-05",
        "10:00",
        method,
        "Brief consultation enquiry",
        "PKR 1,000 / 20 minutes",
        "awaiting clinic confirmation",
      ])
        assert.ok(message.includes(text), text);
    }
    await fill("reason", "<img src=x onerror=alert(1)>");
    assert.equal(await page.locator("#request-result").isVisible(), false);
    await page.locator('button[type="submit"]').click();
    assert.equal(await page.locator("#request-preview img").count(), 0);
    // Test handoff UI without contacting the clinic or transmitting test information.
    await page
      .locator("#send-request")
      .evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
    await page.locator("#send-request").click();
    assert.match(
      await page.locator("#request-status").innerText(),
      /Appointment requested — awaiting clinic confirmation/,
    );
    await page.locator("#copy-request").click();
    await page.waitForFunction(
      () => document.querySelector("#copy-status").textContent.length > 0,
    );
    assert.match(
      await page.locator("#copy-status").innerText(),
      /Copied|Copy unavailable/,
    );
    for (const name of [
      "fullName",
      "age",
      "country",
      "contact",
      "date",
      "time",
      "method",
      "reason",
    ]) {
      assert.equal(
        await page.locator('[name="' + name + '"]').getAttribute("required"),
        "",
      );
    }
    await page.locator(".gallery-item").first().click();
    assert.equal(await page.locator("dialog").evaluate((d) => d.open), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").evaluate((d) => d.open), false);
    assert.equal(
      await page
        .locator(".gallery-item")
        .first()
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.locator("summary").first().focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .locator("details")
        .first()
        .evaluate((e) => e.open),
      true,
    );
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
      "auto",
    );
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    for (const f of [
      "index.html",
      "styles.css",
      "clinic-config.js",
      "script.js",
    ])
      assert.ok(fs.statSync(path.join(root, f)).size > 0);
    const schema = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    assert.equal(JSON.parse(schema).name, "German Homeopathic Clinic");
    console.log(
      "PASS: 5 responsive widths, axe WCAG A/AA, navigation, assets, contact links, all 3 booking methods, required/date/time/phone validation, structured message, safe text, status, lightbox, FAQ, reduced motion, no storage or JS errors.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
