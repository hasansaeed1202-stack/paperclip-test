"use strict";
(() => {
  const c = window.CLINIC,
    q = (s) => document.querySelector(s),
    all = (s) => document.querySelectorAll(s);
  const price = () =>
    `${c.consultation.currency} ${c.consultation.fee.toLocaleString("en-PK")}`;
  const setText = (s, t) => all(s).forEach((el) => (el.textContent = t));
  setText("[data-price]", price());
  setText("[data-duration]", c.consultation.minutes);
  setText("[data-hours]", c.hours);
  setText("[data-address]", c.address);
  setText("[data-payments]", c.paymentMethods.join(", "));
  all("[data-phone]").forEach((el) => {
    const p = c.phones[Number(el.dataset.phone)];
    el.href = `tel:${p.international}`;
    if (el.closest(".contact-grid")) el.textContent = p.display;
  });
  all("[data-whatsapp]").forEach(
    (el) => (el.href = `https://wa.me/${c.whatsapp}`),
  );
  all("[data-map]").forEach((el) => (el.href = c.map));
  all("[data-email]").forEach((el) => {
    el.href = `mailto:${c.email}`;
    el.textContent = c.email;
  });
  q("#year").textContent = new Date().getFullYear();
  const toggle = q(".menu-toggle"),
    nav = q("#navigation");
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("header")) closeMenu();
  });
  matchMedia("(min-width:901px)").addEventListener("change", closeMenu);
  const dialog = q("#lightbox");
  let galleryTrigger;
  all("[data-image]").forEach((button) =>
    button.addEventListener("click", () => {
      galleryTrigger = button;
      q("#lightbox-image").src = button.dataset.image;
      q("#lightbox-image").alt = button.dataset.caption;
      q("#lightbox-caption").textContent = button.dataset.caption;
      dialog.showModal();
    }),
  );
  q("#close-lightbox").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => galleryTrigger?.focus());
  const form = q("#appointment-form"),
    result = q("#request-result"),
    error = q("#form-error");
  form.querySelector("button[type=submit]").disabled = false;
  const fields = form.elements,
    mins = (t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
  const formatTime = (n) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const lastTime = formatTime(
    mins(c.consultation.closes) - c.consultation.minutes,
  );
  fields.time.min = c.consultation.opens;
  fields.time.max = lastTime;
  q("#time-help").textContent =
    `${c.consultation.opens}–${lastTime} (24-hour time) for a ${c.consultation.minutes}-minute call.`;
  const today = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: c.consultation.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  fields.date.min = today();
  let message = "";
  const invalidate = () => {
    result.hidden = true;
    q("#send-request").removeAttribute("href");
    q("#request-status").textContent = "";
    q("#copy-status").textContent = "";
    message = "";
  };
  form.addEventListener("input", (e) => {
    e.target.setCustomValidity?.("");
    error.textContent = "";
    invalidate();
  });
  const fail = (name, text) => {
    error.textContent = text;
    fields[name].setCustomValidity(text);
    fields[name].reportValidity();
    fields[name].focus();
  };
  // Transport boundary: a backend adapter must return verified server state, never an optimistic confirmation.
  const prepareRequest = (data) => {
    const labels = {
      fullName: "Full name",
      age: "Age",
      country: "Country",
      contact: "Contact / WhatsApp",
      date: "Preferred date",
      time: "Preferred time (Pakistan UTC+5)",
      method: "Consultation method",
      reason: "Reason for consultation",
    };
    return [
      `ONLINE CONSULTATION REQUEST`,
      c.name,
      "Doctor Ihsan Ullah",
      `Fee: ${price()} / ${c.consultation.minutes} minutes`,
      "",
      ...Object.entries(labels).map(([key, label]) => `${label}: ${data[key]}`),
      "",
      "Appointment requested — awaiting clinic confirmation.",
      "Please confirm availability or suggest an alternative time.",
      "Please share payment instructions around confirmation.",
    ].join("\n");
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.textContent = "";
    invalidate();
    fields.date.min = today();
    const data = Object.fromEntries(new FormData(form));
    for (const key of Object.keys(data)) {
      data[key] = data[key].trim().replace(/[\r\n\t]+/g, " ");
      if (!data[key]) return fail(key, "Please complete this field.");
    }
    if (
      !/^\+?[\d\s().-]+$/.test(data.contact) ||
      data.contact.replace(/\D/g, "").length < 8 ||
      data.contact.replace(/\D/g, "").length > 15
    )
      return fail(
        "contact",
        "Enter a valid phone number including your country code (8–15 digits).",
      );
    const date = new Date(
      `${data.date}T${data.time}:00${c.consultation.utcOffset}`,
    );
    if (!Number.isFinite(date.getTime()) || date <= new Date())
      return fail("date", "Choose a future date and time in Pakistan time.");
    const day = new Date(`${data.date}T12:00:00Z`).getUTCDay();
    if (!c.consultation.days.includes(day))
      return fail("date", "Choose a date from Monday to Saturday.");
    if (data.time < c.consultation.opens || data.time > lastTime)
      return fail(
        "time",
        `Choose a time between ${c.consultation.opens} and ${lastTime} Pakistan time.`,
      );
    message = prepareRequest(data);
    q("#request-preview").textContent = message;
    q("#send-request").href =
      `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(message)}`;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({
      block: "nearest",
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "auto"
        : "smooth",
    });
  });
  q("#send-request").addEventListener("click", () => {
    q("#request-status").textContent =
      "Appointment requested — awaiting clinic confirmation. Complete sending in WhatsApp; this page cannot verify delivery.";
  });
  q("#copy-request").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message);
      q("#copy-status").textContent =
        "Copied. Paste into your clinic WhatsApp conversation and send.";
    } catch {
      q("#copy-status").textContent =
        "Copy unavailable. Select the request text above and copy it manually.";
      const range = document.createRange();
      range.selectNodeContents(q("#request-preview"));
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: c.name,
    foundingDate: "2014",
    telephone: c.phones.map((p) => p.international),
    email: c.email,
    hasMap: c.map,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Peoples Colony, Quaid-e-Azam Chowk, Main Market",
      addressLocality: "Attock City",
      addressCountry: "PK",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: c.consultation.opens,
      closes: c.consultation.closes,
    },
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.append(script);
  if (c.siteUrl) {
    const url = new URL(c.siteUrl);
    if (url.protocol === "https:") {
      const canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = url.href;
      document.head.append(canonical);
      for (const [property, content] of Object.entries({
        "og:url": url.href,
        "og:image": new URL("assets/doctor.webp", url).href,
        "og:image:alt": "Doctor Ihsan Ullah at German Homeopathic Clinic",
      })) {
        const meta = document.createElement("meta");
        meta.setAttribute("property", property);
        meta.content = content;
        document.head.append(meta);
      }
    }
  }
})();
