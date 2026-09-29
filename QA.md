# MRN-6 redesign — QA record

Verified 29 September 2026 in Microsoft Edge using browser-driven clicks and keyboard input. No real patient request was sent.

## Visual review

- Reviewed desktop (1440px), tablet (768px) and mobile (390px) screenshots; regression checks also cover 1024px and 320px. No horizontal overflow.
- Original rounded green/cream composition, spacious typography, translucent portrait caption, pill navigation/actions, rounded booking form, expandable concern cards and large interior photograph. The supplied Dribbble direction informed visual qualities; its content, graphics and exact layout were not copied.
- New portrait is prominent in the hero and gallery. A deterministic top crop removes the background certificate; the face is unaltered. The new empty-chair interior is the large gallery image and appears first on mobile. Both images preserve proportions and are optimized to approximately 266 KiB combined.
- Reviewed booking, gallery, tablet hero, desktop hero, mobile hero and expanded concern screenshots for cropping, whitespace and hierarchy.

## Individual interaction audit

`node tests/click-audit.cjs` exercises each visible link and all 12 disclosure controls at desktop, tablet and mobile sizes: 154 individual checks, plus method shortcuts and gallery controls.

| Control                                  | Verified result                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Header/footer logos and skip link        | Reach the home/content anchors                                                        |
| Every navigation/footer/internal CTA     | Valid section target; booking CTAs reach the actual form                              |
| Every WhatsApp link                      | Clinic number 923178191818 with a useful encoded message                              |
| Both phone numbers and every Call action | Correct tel:+923178191818 or tel:+923009171002 handoff                                |
| Every Visit/Directions action            | Supplied maps.app.goo.gl/FdYHM3yxc6KPLa2T7 target                                     |
| Every email action                       | mailto:dr.ehsanpk@gmail.com                                                           |
| All six health-concern cards             | Mouse click, Enter and Space reveal/collapse description; each consultation CTA works |
| Call-method pills                        | Jump to booking and preselect the corresponding method                                |
| All six FAQ controls                     | Mouse and keyboard toggle native expanded state                                       |
| Both gallery controls                    | Open correct image, close button and Escape work; focus returns to trigger            |
| Mobile navigation                        | Every item works and closes menu; Escape closes and returns focus                     |
| Mobile sticky actions                    | Call, WhatsApp, booking and directions all activate correct targets                   |

External navigation is intercepted at the browser click boundary so test messages are not sent and installed phone/mail apps are not launched. Correct outgoing URLs are asserted individually; this does not establish delivery or clinic response.

## Booking, accessibility and regression checks

`npm test` checks all five responsive widths, image loads and internal anchors; axe WCAG 2 A/AA and 2.1 AA reports zero violations. This is automated coverage, not accessibility certification.

- All eight required fields; empty submission, phone format, past date, Sunday and out-of-hours validation.
- All three consultation methods; structured WhatsApp message includes every field, Pakistan time, PKR 1,000 and 20 minutes.
- Preview, open-WhatsApp status, copy action, editing invalidation and HTML-like input rendered safely as plain text.
- Request and confirmation remain distinct. The page explains that the patient must Send in WhatsApp and the clinic must confirm availability or suggest another time.
- Keyboard-visible focus, native disclosure semantics, reduced motion, focus return, responsive images and no JavaScript errors.
- No website local-storage writes, fake ratings, testimonials, invented credentials or cure guarantees. Heart-related highlighted concern removed; diabetes/blood sugar added. Friday wording keeps medicines charged separately.

## External-service limits

This is a static site. There is no appointment database, automatic availability lookup, slot reservation, staff dashboard, online payment processor, notification service or receipt verification. WhatsApp handles message sending; the clinic manually confirms appointments and supplies payment details. Physical device testing and end-to-end clinic receipt are not claimed. Hosting/domain configuration remains unchanged; this deliverable is committed and pushed to the existing repository.
