/* main.js – behaviour for the portfolio.
   Each feature is a small function. They are all started at the bottom of the file. */
(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Footer year */
  function initYear() {
    $("#year").textContent = new Date().getFullYear();
  }

  /* Mobile menu: opens and closes the navigation panel */
  function initMenu() {
    const button = $("#menuBtn");
    const nav = $("#mainNav");
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    };
    button.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });
  }

  /* Highlights the menu link of the section you are reading */
  function initActiveLink() {
    if (!("IntersectionObserver" in window)) return;
    const links = $$('#mainNav a[href^="#"]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((section) => observer.observe(section));
  }

  /* Fades content in as it scrolls into view */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("in")); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  /* Back-to-top button: appears after scrolling down */
  function initBackToTop() {
    const button = $("#toTop");
    window.addEventListener("scroll", () => button.classList.toggle("show", window.scrollY > 600), { passive: true });
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* The email address is read from the visible email link, so you only edit it in one place */
  function getEmail() {
    return $('a[href^="mailto:"]', $("#contact")).getAttribute("href").replace("mailto:", "");
  }

  /* Copy email button */
  function initCopyEmail() {
    const button = $("#copyEmail");
    const label = $("span", button);
    const iconUse = $("use", button);
    button.addEventListener("click", async () => {
      const email = getEmail();
      try {
        await navigator.clipboard.writeText(email);
        label.textContent = "Copied";
        iconUse.setAttribute("href", "#i-check");
      } catch (error) {
        label.textContent = email; // if copying is blocked, show the address instead
      }
      setTimeout(() => {
        label.textContent = "Copy email address";
        iconUse.setAttribute("href", "#i-copy");
      }, 2500);
    });
  }

  /* Contact form: opens the visitor's email app with the message ready to send */
  function initMailForm() {
    const form = $("#mailForm");
    const status = $("#formStatus");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent("Portfolio enquiry from " + data.get("name"));
      const body = encodeURIComponent(data.get("message") + "\n\n" + data.get("name"));
      const email = getEmail();
      status.textContent = "Opening your email app…";
      window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
      setTimeout(() => { status.textContent = "If nothing opened, please email " + email + " directly."; }, 4000);
    });
  }

  // One broken feature must never stop the others from working
  [initYear, initMenu, initActiveLink, initReveal, initBackToTop, initCopyEmail, initMailForm]
    .forEach((feature) => {
      try { feature(); } catch (error) { console.error(feature.name + " failed:", error); }
    });
})();
