(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Hero headline: wrap each line so it can slide up from behind a mask.
  $$("[data-split] > span").forEach((line) => {
    const inner = document.createElement("span");
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-loaded")));

  // Reveal on scroll
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // Count-up stats
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  // Nav: solid after hero, hide on scroll down, show on scroll up
  const nav = $("[data-nav]");
  const hero = $(".hero");
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  let lastY = window.scrollY;

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Scroll-driven effects share one rAF loop
  const parallaxLayers = $$("[data-parallax]");
  const parallaxImgs = $$("[data-parallax-img]");
  const steps = $("[data-steps]");
  const stepsFill = $("[data-steps-fill]");
  const stepItems = steps ? $$(".step", steps) : [];
  const navLinks = $$(".nav__links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    nav.classList.toggle("is-scrolled", y > hero.offsetHeight - 90);
    if (menu.hidden) nav.classList.toggle("is-hidden", y > lastY && y > vh * 0.6);
    lastY = y;

    if (!reduceMotion) {
      parallaxLayers.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(0, ${(r.top * -Number(el.dataset.parallax)).toFixed(1)}px, 0)`;
      });
      parallaxImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.translate = `0 ${(-8 + p * -8).toFixed(2)}%`;
      });
    }

    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
      stepsFill.parentElement.style.setProperty("--p", p.toFixed(3));
      stepItems.forEach((s) => {
        s.classList.toggle("is-active", s.getBoundingClientRect().top < vh * 0.6);
      });
    }

    let current = null;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top < vh * 0.4) current = navLinks[i];
    });
    navLinks.forEach((a) => a.classList.toggle("is-current", a === current));
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Homes filter
  const grid = $("[data-homes]");
  const homes = $$(".home", grid);
  $$("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      $$("[data-filter]").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      homes.forEach((h) => {
        const match = f === "all" || h.dataset.cat === f;
        h.classList.remove("is-showing");
        if (!match && !h.hidden) {
          h.classList.add("is-hiding");
          setTimeout(() => { h.hidden = true; h.classList.remove("is-hiding"); }, reduceMotion ? 0 : 340);
        } else if (match) {
          setTimeout(() => {
            const wasHidden = h.hidden;
            h.hidden = false;
            if (wasHidden || f !== "all") { void h.offsetWidth; h.classList.add("is-showing"); }
          }, reduceMotion ? 0 : 340);
        }
      });
    });
  });

  // Cursor badge over home cards (fine pointers only)
  const tag = $("[data-cursor]");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && tag) {
    window.addEventListener("pointermove", (e) => {
      tag.style.setProperty("--x", e.clientX + "px");
      tag.style.setProperty("--y", e.clientY + "px");
    }, { passive: true });
    homes.forEach((h) => {
      h.addEventListener("pointerenter", () => tag.classList.add("is-on"));
      h.addEventListener("pointerleave", () => tag.classList.remove("is-on"));
    });
  }

  // Testimonials slider
  const track = $("[data-track]");
  const step = () => {
    const card = $(".story", track);
    return card ? card.getBoundingClientRect().width + 20 : 400;
  };
  $("[data-prev]").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $("[data-next]").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

  // Accordion with animated height
  $$("[data-accordion] details").forEach((d) => {
    const summary = $("summary", d);
    const body = $(".accordion__body", d);
    summary.addEventListener("click", (e) => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    });
  });

  // Concept form: validate and show a success state, no network request
  const form = $("[data-form]");
  const note = $("[data-form-note]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = $$("input[required]", form);
    let ok = true;
    fields.forEach((f) => {
      const valid = f.value.trim() && f.checkValidity();
      f.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = "Please add your name and a valid email.";
      note.classList.remove("is-success");
      return;
    }
    note.textContent = "Thanks! A builder will reach out within one business day. (Concept demo, nothing was sent.)";
    note.classList.add("is-success");
    form.reset();
  });
})();
