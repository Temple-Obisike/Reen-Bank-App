/* Landing page (index.html) — mobile nav, FAQ accordion, footer CTA form */

initMobileNav("navToggle", "mobileNav");
initAccordion("[data-faq-list]");

document.getElementById("footerCtaForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("footerEmail").value;
  window.location.href = "register.html?email=" + encodeURIComponent(email);
});
