# German Homeopathic Clinic, Attock

Premium redesign of the existing static website in `hasansaeed1202-stack/paperclip-test`. The site presents Doctor Ihsan Ullah, clinic credentials, physical visits, online consultation requests, Friday checkups, patient information and genuine clinic photography. No runtime framework, database, analytics or external font service is used.

## Preview

Open `index.html` in a current browser. No installation or compilation is required. For HTTP preview, run `npx serve .` from this directory and open the printed local URL. Clipboard access works best on HTTPS or localhost; a manual-copy fallback is provided.

## Files

- `index.html`: semantic, crawlable clinic content and no-JavaScript contact fallbacks.
- `styles.css`: green/red clinic identity, responsive layouts, focus states and reduced motion.
- `clinic-config.js`: contact settings, consultation pricing/duration/hours, payment methods and deployment URL.
- `script.js`: configuration binding, navigation, validation, WhatsApp request adapter, lightbox and structured data.
- `assets/`: optimized, metadata-stripped public photographs and clinic symbol only.
- `tests/website.cjs`: browser and accessibility regression checks.
- `QA.md`: verification results and practical limits.

## Update clinic information

Edit `clinic-config.js`. The runtime applies phone numbers, WhatsApp, email, map link, address, price, duration and payment names throughout the page. Phone international values begin `+92`; the WhatsApp value is digits only (`923178191818`). Do not use the domestic leading zero after country code 92.

Keep the corresponding static HTML fallbacks, title/description, physical hours and credential text in `index.html` in sync for search engines and visitors without JavaScript. Registration information must come from the clinic's documents; do not publish certificate scans, identity numbers, home addresses or unnecessary identifiers.

### Consultation price, duration and schedule

Change `consultation.fee`, `currency` and `minutes` in `clinic-config.js`. One shared price applies to WhatsApp voice, WhatsApp video and normal phone calls. Request output, visible price labels and latest starting time use that configuration. Also update the HTML fallback text and meta description. The current confirmed offering is **PKR 1,000 / 20 minutes**.

Times are explicitly Pakistan time (Asia/Karachi, UTC+5). The form rejects past date/times, Sundays and starts outside opening hours or too close to closing for a full consultation. These checks are request guardrails, not an availability calendar. If the clinic authorizes other appointment hours, update `consultation.opens`, `closes`, `days`, displayed hours and helper text together.

### Payments

Edit `paymentMethods` to change method names. Current methods are Easypaisa, Allied Bank and UBL. No account number, payment gateway, account validation or automated payment verification is implemented. Actual payment instructions should be shared privately by the clinic around confirmation, or later supplied by an authenticated backend. Never put secrets or private account data in this public configuration.

## How booking works

1. The patient provides only name, age, country, contact number, brief reason, date, time and preferred call method.
2. Browser and application validation prepare a structured message. The patient reviews it locally.
3. **Open WhatsApp & send request** opens `wa.me/923178191818` with the encoded message. The patient must press **Send in WhatsApp**. Copying the message is an alternative.
4. The page says **Appointment requested — awaiting clinic confirmation**, with an explicit reminder that sending in WhatsApp is required and the page cannot verify delivery. The preview itself is marked ready to send, not confirmed.
5. The clinic checks availability, confirms or proposes an alternative, and arranges payment. The call occurs after appointment and payment confirmation.

No details are submitted to this site's server, stored in local/session storage, or sent to analytics. Editing any field invalidates the old preview/link. WhatsApp receives the message in its URL only when the patient follows the handoff link; its own privacy and retention practices apply. Keep reasons brief. A blocked clipboard or unavailable WhatsApp never implies successful delivery; use the displayed text or call the clinic.

Without JavaScript the request button is disabled, preventing a fallback GET form submission from putting patient details in the site's URL. Direct phone, email, directions and WhatsApp links remain available. No real patient messages are sent by automated tests.

## Persistent appointment management later

`prepareRequest` and the `booking` configuration define the current transport boundary. `booking.endpoint` is intentionally null and is not a working API. A future implementation needs:

- HTTPS API with server-side validation, consent handling, rate limits and abuse protection.
- Database with explicit requested, proposed-alternative, confirmed, cancelled and completed states; idempotency and timezone-aware dates.
- Authenticated staff dashboard and availability/conflict checks before confirmation.
- Role-based access, encryption, controlled retention/deletion, audit logs and backups for personal data.
- A notification service or WhatsApp Business integration with delivery receipts and consent, plus authenticated payment integration or staff verification.
- Server acknowledgements and recoverable failure states. Never display confirmed based solely on a client submit or opened messaging app.

The current static host cannot securely provide these features. It also does not take payments, send automatic reminders, reserve slots or verify doctor availability.

## Genuine photos and logo

The current main photographs come from the MRN-6 attachments:

- `doctor-portrait.jpg`: the newly supplied portrait, cropped only to remove the background certificate. The face is unaltered; no AI reconstruction.
- `clinic-interior.jpg`: the newly supplied empty-chair interior, re-encoded as JPEG for performance with no composition changes.

Existing clinic-authorized assets are retained:

- `doctor.webp`: IMG_3106.HEIC, converted and cropped around the doctor.
- `doctor-at-clinic.webp`: IMG_3105.HEIC, converted and cropped for the gallery.
- `consultation-room.webp`: IMG_3113.JPG.jpeg, orientation corrected and optimized.
- `clinic-logo.png`: the supplied standalone green/red symbol (`file_0000000024a082089cef86edfd2e8a86.png`), tightly cropped to the symbol and resized. No attachment named IMG_3100 was present; the separately supplied symbol was used, not an invented logo or photographed poster.

The portrait crops remove background certificates. The certificate and patient-rights originals stay outside the repository. The patient information section is a concise English summary of the supplied Urdu notice. Only requested public credential information is reproduced. Photos are not stretched; EXIF/GPS metadata is stripped. The two new images total approximately 266 KiB.

To replace photos, use clinic-authorized images, remove private background information and metadata, export WebP at a sensible size, and replace the files in `assets/`. Update dimensions, descriptive alt text and gallery captions in HTML. Do not commit originals containing private documents. Do not add stock patients, fabricated testimonials, ratings, awards or cure claims.

## Deployment

Upload only `index.html`, `styles.css`, `script.js`, `clinic-config.js` and `assets/` to an HTTPS static host. No build step is needed. GitHub Pages can publish this repository from the intended branch/root, or another static host can serve the same files. Keep development dependencies, tests and private source attachments out of deployment packages. No live domain or hosting change is assumed by this repository upgrade.

Once the public URL is known, set `siteUrl` to the full HTTPS base URL including a trailing slash. The script then adds canonical, Open Graph URL/image and image-alt tags. For social crawlers that do not execute JavaScript, also copy these final absolute URLs into static `<link rel="canonical">` and `<meta property="og:url">` / `<meta property="og:image">` tags in the HTML head. Do not guess a domain. Basic title, description, Open Graph title/description and semantic headings are already static; factual MedicalClinic JSON-LD is generated from configuration.

## Tests

Run `npm ci`, then `npm test` and `node tests/click-audit.cjs`. Tests use installed Microsoft Edge by default. To use installed Chrome set `BROWSER_CHANNEL=chrome`. Development dependencies are not needed by the deployed site. The tests exercise responsive widths, axe WCAG A/AA checks, internal anchors, asset loading, contact URLs, booking validation and all call methods, message encoding, safe rendering, menu, FAQ and gallery keyboard interaction, and reduced motion. They suppress the WhatsApp handoff navigation so no test data reaches the clinic.

See `QA.md` for the verified scope and external-service limitations.

## MRN-6 design and interactions

Original green, cream and muted-red composition with a large portrait hero, floating translucent caption, rounded sticky navigation, large clinic interior, editorial credentials, rounded appointment form and responsive mobile action bar. Six native details/summary concern cards open with mouse, touch, Enter or Space; each links to booking. Call-method shortcuts preselect the matching method. General WhatsApp links include a useful message. No decorative payment or medicine brand buttons are used. The Dribbble reference informed spacing, typography and rounded presentation only; no text, branding, images or exact layout was copied.
