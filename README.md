# German Homeopathic Clinic website
Responsive single-page clinic site for Attock, Pakistan. Plain HTML, CSS and JavaScript; no build tool or runtime dependencies.

## Installation and local development
Clone or download this repository, then open index.html in a browser. For local HTTP serving, run npx serve . from the project folder.

## Build and deployment
No compilation is required. Deploy index.html, styles.css, and script.js from the repository root to any static host; configure a production HTTPS domain with that host.

## Clinic settings
Update the matching content and structured data in index.html:
- Phone links: +923178191818 and +923009171002.
- WhatsApp: https://wa.me/923178191818 (Pakistan country code, without domestic leading zero).
- Directions: https://maps.app.goo.gl/FdYHM3yxc6KPLa2T7.
- Address, weekly schedule, staff details and Friday consultation terms.
WhatsApp availability has not been independently confirmed.

## Replace the temporary logo
The current text and plus mark appear in the header and footer in index.html. Replace the logo element in both places with the clinic's supplied image or inline SVG. Keep the linked clinic name accessible, and adjust the logo styling in styles.css to fit the artwork.

## Research and content notes
Clinic profile, staff, credentials, opening hours, Friday terms, consultation areas and medicine brands are supplied by the clinic. Manufacturer details are distinguished in the Medicines section. Paul Brooks, Public Pharma and Mektum have manufacturer websites. DRAP's public provisional product application list names New Asco Homeo & Nutraceuticals, Mektum Homeo Pharma and Sonexo Homeo Labs; an application list does not establish a product's approval or registration. Exact ASCO and Sonexo brand details were not confidently verified. The website does not claim that all named products are imported or regulator-approved.

## Accessibility and responsive notes
Includes a skip link, visible keyboard focus, semantic section headings, accessible responsive menu state, reduced-motion handling and mobile quick actions. Verify behavior on actual Android and iPhone devices before launch.

