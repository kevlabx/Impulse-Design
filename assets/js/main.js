/* ---------------------------------------------------
   Impulse Design — vanilla JS interactions
   - Mobile menu
   - Smooth scrolling with sticky-header offset
   - IntersectionObserver reveal + active nav
   - Lazy-load safety net
   - Contact form mailto fallback
   - Header shadow on scroll
   --------------------------------------------------- */
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const nav = $("#site-nav");
  const btn = $("#menuBtn");
  const header = document.querySelector("header");

  // Mobile menu toggle
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  }

  // Close menu when a link is clicked
  $$("#navList a").forEach(a => {
    a.addEventListener("click", () => {
      if (nav) nav.setAttribute("data-open","false");
      if (btn) btn.setAttribute("aria-expanded","false");
    });
  });

  // Smooth scroll with header offset (and reduced-motion support)
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);
  $$("#navList a[href^='#'], a.btn[href^='#']").forEach(link => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() - 8;

      if (prefersReduced) {
        window.scrollTo(0, y);
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      history.replaceState(null, "", id);
    });
  });

  // Reveal on scroll + active nav highlighting
  const revealEls = $$(".reveal");
  const navLinks = $$("#navList a[href^='#']");
  const setActive = (id) => {
    navLinks.forEach(a => a.removeAttribute("aria-current"));
    const active = $(`#navList a[href="#${id}"]`);
    if (active) active.setAttribute("aria-current", "page");
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        const id = entry.target.id;
        if (id) setActive(id);
        io.unobserve(entry.target); // reveal once
      }
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => io.observe(el));

  // Header drop shadow when scrolling
  const onScroll = () => {
    if (window.scrollY > 6) document.body.classList.add("scrolled");
    else document.body.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mailto fallback for contact form (no backend)
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = encodeURIComponent(data.get("name") || "");
      const email = encodeURIComponent(data.get("email") || "");
      const message = encodeURIComponent(data.get("message") || "");
      const subject = `New inquiry from ${decodeURIComponent(name)}`;
      const body = `Name: ${decodeURIComponent(name)}%0AEmail: ${decodeURIComponent(email)}%0A%0A${decodeURIComponent(message)}`;
      const to = "hello@impulsedesign.in"; // <- update in hand-off if needed
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    });
  }

  // Lazy-load safety net for older browsers (images)
  if (!("loading" in HTMLImageElement.prototype)) {
    $$(".work-grid img, .clients-grid img").forEach(img => {
      const src = img.getAttribute("src");
      if (src) {
        const pre = new Image();
        pre.src = src;
      }
    });
  }

  // Pause showreel when it exits viewport (saves battery)
  const video = document.querySelector(".showreel");
  if (video && "IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) { try { video.pause(); } catch(_){} }
        else { try { video.play(); } catch(_){} }
      });
    }, { threshold: 0.25 });
    vio.observe(video);
  }
})();
