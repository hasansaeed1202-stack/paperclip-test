# MRN-5 verification record

Verified on 29 September 2026 against the upgraded existing repository.

- Headless Microsoft Edge: 1440, 1024, 768, 390 and 320px widths; no horizontal overflow.
- Visually reviewed desktop, tablet and mobile screenshots, including genuine portraits and gallery.
- axe WCAG 2 A/AA and 2.1 AA automated checks: zero violations at all five widths. This is not a claim of formal accessibility certification.
- Main and mobile navigation, internal anchors, menu expanded state, Escape dismissal and menu link closure passed.
- Both Pakistan-format telephone links, WhatsApp number, email and supplied Google Maps target checked.
- Eight required form fields, missing-field validation, phone format, past date, Sunday and out-of-hours rejection passed.
- WhatsApp voice, WhatsApp video and normal phone methods all generated correct messages with name, age, country, contact, reason, preferred date/time, PKR 1,000 and 20-minute duration.
- Request preview and handoff distinguish request from confirmation. Editing data invalidates an old request. Test navigation was suppressed; no real message was sent.
- HTML-like patient text remains plain text; no HTML injection. No local storage writes or JavaScript errors.
- Gallery modal opens/closes, Escape works, focus returns to the trigger. FAQ keyboard activation and reduced motion passed.
- All published image paths load; responsive dimensions, lazy loading and privacy-conscious crops checked.
- Doctor name, qualifications, NCH 164552 and renewal dates, clinic-supplied PHC R-96305, dispenser, address, contact details, clinic hours and Friday medicines-separate wording reviewed against supplied task/documents.
- No certificate scans, private addresses, personal identity numbers, fabricated testimonials, ratings, patient counts or outcome guarantees published.
- README covers configuration, images, pricing, payments, preview, deployment and future persistent backend.

## Limits

No live booking database, slot reservation, availability lookup, payment processing or notification service exists. The patient sends the request via WhatsApp and the clinic confirms manually. Calls, email receipt, actual WhatsApp delivery and availability are external/manual actions; tests check links and handoff behavior, not clinic response. Browser tests are desktop emulation, not physical iOS/Android device testing. A final public deployment URL must be configured for absolute canonical and social-image metadata; this task upgrades and pushes the repository, not a newly authorized hosting service.
