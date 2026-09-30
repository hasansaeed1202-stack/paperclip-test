"use strict";
(() => {
  const card = document.querySelector("#radio-show");
  if (!card) return;
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi", hour: "2-digit", hourCycle: "h23",
  });
  const status = card.querySelector("[data-radio-status]");
  const next = card.querySelector("[data-radio-next]");
  const link = card.querySelector("[data-radio-link]");
  function update() {
    const hour = Number(clock.format(new Date()));
    const live = hour === 18;
    card.classList.toggle("is-live", live);
    status.textContent = live ? "LIVE NOW" : "Radio Show";
    next.textContent = live
      ? "On air until 7:00 PM PKT · Listen on Dabang FM’s website."
      : `Next show: ${hour < 18 ? "today" : "tomorrow"} at 6:00 PM PKT`;
    link.textContent = live ? "Listen Live ↗" : "Visit Dabang FM ↗";
  }
  update();
  setInterval(update, 1000);
  document.addEventListener("visibilitychange", update);
  window.addEventListener("pageshow", update);
})();
