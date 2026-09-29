/* Interactive settings. Keep no-JavaScript HTML fallbacks in sync. */
window.CLINIC = Object.freeze({
  name: "German Homeopathic Clinic",
  phones: [
    { display: "0317-8191818", international: "+923178191818" },
    { display: "0300-9171002", international: "+923009171002" },
  ],
  whatsapp: "923178191818",
  email: "dr.ehsanpk@gmail.com",
  address:
    "Peoples Colony, Quaid-e-Azam Chowk, Main Market, Attock City, Pakistan",
  map: "https://maps.app.goo.gl/FdYHM3yxc6KPLa2T7",
  hours: "Monday–Saturday · 9:00 AM–5:00 PM",
  consultation: {
    fee: 1000,
    currency: "PKR",
    minutes: 20,
    timeZone: "Asia/Karachi",
    utcOffset: "+05:00",
    opens: "09:00",
    closes: "17:00",
    days: [1, 2, 3, 4, 5, 6],
  },
  paymentMethods: ["Easypaisa", "Allied Bank", "UBL"],
  booking: { transport: "whatsapp", endpoint: null },
  // Set actual public HTTPS URL for canonical and Open Graph image URLs.
  siteUrl: "",
});
