/**
 * Featured work carousel ? slides driven by WorkStore.
 * Scoped scroll, a11y controls, case-study open, cleanup via destroy().
 */
(function () {
  const throttle = (callback, limit) => {
    let waiting = false;
    return function () {
      if (!waiting) {
        callback.apply(this, arguments);
        waiting = true;
        setTimeout(() => {
          waiting = false;
        }, limit);
      }
    };
  };

  const debounce = (func, wait) => {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  /** Hero image + brand color per project (prefer lifestyle/merch / strong crops). */
  const HERO = {
    tradeverified: {
      color: "#0B3A66",
      src: "assets/work/hero-tradeverified.png",
      webp: "",
      alt: "TradeVerified marketing landing page",
    },
    scopesignal: {
      color: "#0A1628",
      src: "assets/work/ss-demo.png",
      webp: "",
      alt: "ScopeSignal AI risk analysis product demo",
    },
    maxeimus: {
      color: "#4A3420",
      src: "assets/work/work-apparel.png",
      webp: "assets/work/work-apparel.webp",
      alt: "Maxeimus athleisure apparel graphic",
    },
    bcm: {
      color: "#2C241C",
      src: "assets/work/bcm-lifestyle.png",
      webp: "assets/work/bcm-lifestyle.webp",
      alt: "Blue Collar Millionaire lifestyle campaign",
    },
    knightsplay: {
      color: "#1A3D2E",
      src: "assets/work/kp-staff-apparel.png",
      webp: "assets/work/kp-staff-apparel.webp",
      alt: "Knights Play branded apparel and merch",
    },
    ashfordvale: {
      color: "#1A2433",
      src: "assets/work/av-home.png",
      webp: "",
      alt: "Ashford Vale LLP prestige law firm website concept",
    },
    harborglobal: {
      color: "#083A68",
      src: "assets/work/hg-home.png",
      webp: "",
      alt: "Harbor Global LLP international law firm website concept",
    },
    saltmarsh: {
      color: "#1A4F4E",
      src: "assets/work/sm-home.png",
      webp: "",
      alt: "Saltmarsh Co. CPG product launch concept",
    },
    halden: {
      color: "#1c332b",
      src: "assets/work/hb-home.png",
      webp: "",
      alt: "Halden design-build practice website concept",
    },
  };

  const AUTOPLAY_DELAY = 5000;

  function buildSlides(projects) {
    return projects
      .filter((p) => HERO[p.id])
      .map((p) => {
        const hero = HERO[p.id];
        const fallback = p.items && p.items[0];
        return {
          id: p.id,
          name: p.titleSub ? `${p.title} ${p.titleSub}` : p.title,
          meta: p.meta || "",
          tag: p.tag || "",
          color: hero.color,
          image: hero.webp || hero.src || (fallback && (fallback.webp || fallback.src)),
          imageFallback: hero.src || (fallback && fallback.src),
          alt: hero.alt || (fallback && fallback.alt) || p.title,
        };
      });
  }

  class WorkSlider {
    constructor(root, options = {}) {
      this.root = root;
      this.slides = options.slides || [];
      this.onOpen = options.onOpen || null;
      this.current = 0;
      this.animating = false;
      this.total = this.slides.length;
      this.slideEls = [];
      this.currentLine = null;
      this.autoPlayId = null;
      this.inView = false;
      this.hovered = false;
      this.focused = false;
      this.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      this.listeners = [];

      if (!this.total) return;

      this.el = root.querySelector(".work-slider__stage");
      this.titleEl = root.querySelector(".work-slider__title");
      this.metaEl = root.querySelector(".work-slider__meta");
      this.tagEl = root.querySelector(".work-slider__tag");
      this.imagesEl = root.querySelector(".work-slider__images");
      this.statusEl = root.querySelector(".work-slider__status");
      this.dotsEl = root.querySelector(".work-slider__dots");
      this.prevBtn = root.querySelector('[data-slider="prev"]');
      this.nextBtn = root.querySelector('[data-slider="next"]');
      this.openBtn = root.querySelector('[data-slider="open"]');

      this.preload();
      this.buildDots();
      this.setTitle(this.slides[0].name);
      this.setMeta(this.slides[0]);
      this.updateStatus();
      gsap.set(this.el, { backgroundColor: this.slides[0].color });
      this.buildCarousel();
      this.bind();
      this.observeVisibility();
    }

    on(target, type, handler, opts) {
      target.addEventListener(type, handler, opts);
      this.listeners.push({ target, type, handler, opts });
    }

    destroy() {
      this.stopAutoPlay();
      this.listeners.forEach(({ target, type, handler, opts }) => {
        target.removeEventListener(type, handler, opts);
      });
      this.listeners = [];
      if (this.io) this.io.disconnect();
    }

    preload() {
      this.slides.forEach((s) => {
        const img = new Image();
        img.src = s.image;
      });
    }

    mod(n) {
      return ((n % this.total) + this.total) % this.total;
    }

    setMeta(slide) {
      if (this.metaEl) this.metaEl.textContent = slide.meta;
      if (this.tagEl) this.tagEl.textContent = slide.tag;
      if (this.openBtn) {
        this.openBtn.setAttribute(
          "aria-label",
          `View case study: ${slide.name}`
        );
      }
    }

    updateStatus() {
      if (this.statusEl) {
        this.statusEl.textContent = `Slide ${this.current + 1} of ${this.total}: ${this.slides[this.current].name}`;
      }
      if (this.dotsEl) {
        [...this.dotsEl.children].forEach((dot, i) => {
          const active = i === this.current;
          if (active) dot.setAttribute("aria-current", "true");
          else dot.removeAttribute("aria-current");
          dot.classList.toggle("is-active", active);
        });
      }
    }

    buildDots() {
      if (!this.dotsEl) return;
      this.dotsEl.innerHTML = "";
      this.slides.forEach((slide, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "work-slider__dot";
        btn.setAttribute("aria-label", `Go to ${slide.name}`);
        btn.addEventListener("click", () => this.goTo(i));
        this.dotsEl.appendChild(btn);
      });
    }

    startAutoPlay() {
      this.stopAutoPlay();
      if (this.reducedMotion) return;
      this.autoPlayId = setInterval(() => {
        if (!this.animating && this.inView && !this.hovered && !this.focused) {
          this.go("next");
        }
      }, AUTOPLAY_DELAY);
    }

    stopAutoPlay() {
      if (this.autoPlayId) {
        clearInterval(this.autoPlayId);
        this.autoPlayId = null;
      }
    }

    observeVisibility() {
      this.io = new IntersectionObserver(
        ([entry]) => {
          this.inView = entry.isIntersecting && entry.intersectionRatio > 0.35;
          if (this.inView) this.startAutoPlay();
          else this.stopAutoPlay();
        },
        { threshold: [0, 0.35, 0.6] }
      );
      this.io.observe(this.root);
    }

    fillLine(line, text) {
      // Per-letter only for short names � long titles animate as one block
      if (text.length <= 14) {
        [...text].forEach((ch) => {
          const span = document.createElement("span");
          span.textContent = ch === " " ? "\u00A0" : ch;
          line.appendChild(span);
        });
      } else {
        const span = document.createElement("span");
        span.className = "work-slider__word";
        span.textContent = text;
        line.appendChild(span);
      }
    }

    setTitle(text) {
      this.titleEl.innerHTML = "";
      const line = document.createElement("div");
      line.className = "work-slider__line";
      this.fillLine(line, text);
      this.titleEl.appendChild(line);
      this.currentLine = line;
    }

    animateTitle(newText, direction) {
      const h = Math.max(this.titleEl.offsetHeight, 72);
      const dir = direction === "next" ? 1 : -1;
      const oldLine = this.currentLine;
      const oldParts = [...oldLine.querySelectorAll("span")];

      this.titleEl.style.height = h + "px";
      oldLine.style.cssText = "position:absolute;top:0;left:0;width:100%";

      const newLine = document.createElement("div");
      newLine.className = "work-slider__line";
      newLine.style.cssText = "position:absolute;top:0;left:0;width:100%";
      this.fillLine(newLine, newText);
      this.titleEl.appendChild(newLine);

      const newParts = [...newLine.querySelectorAll("span")];
      gsap.set(newParts, { y: h * dir, opacity: 0 });

      const duration = this.reducedMotion ? 0.01 : 0.9;
      const stagger =
        this.reducedMotion || newParts.length === 1 ? 0 : 0.03;

      return gsap
        .timeline({
          onComplete: () => {
            oldLine.remove();
            newLine.style.cssText = "";
            gsap.set(newParts, { clearProps: "all" });
            this.titleEl.style.height = "";
            this.currentLine = newLine;
          },
        })
        .to(
          oldParts,
          {
            y: -h * dir,
            opacity: 0,
            stagger,
            duration,
            ease: "expo.inOut",
          },
          0
        )
        .to(
          newParts,
          { y: 0, opacity: 1, stagger, duration, ease: "expo.inOut" },
          0
        );
    }

    makeSlide(idx) {
      const slide = this.slides[idx];
      const div = document.createElement("div");
      div.className = "work-slider__slide";
      div.setAttribute("aria-hidden", "true");

      const img = document.createElement("img");
      img.src = slide.image;
      img.alt = "";
      img.width = 960;
      img.height = 600;
      img.decoding = "async";
      if (slide.imageFallback && slide.image !== slide.imageFallback) {
        img.onerror = () => {
          img.onerror = null;
          img.src = slide.imageFallback;
        };
      }
      div.appendChild(img);
      return div;
    }

    getSlideProps(step) {
      const h = this.imagesEl.offsetHeight;
      const absStep = Math.abs(step);
      const positions = [
        { x: -0.35, y: -0.95, rot: -30, s: 1.35, b: 16, o: 0 },
        { x: -0.18, y: -0.5, rot: -15, s: 1.15, b: 8, o: 0.55 },
        { x: 0, y: 0, rot: 0, s: 1, b: 0, o: 1 },
        { x: -0.06, y: 0.5, rot: 15, s: 0.75, b: 6, o: 0.55 },
        { x: -0.12, y: 0.95, rot: 30, s: 0.55, b: 14, o: 0 },
      ];
      const idx = Math.max(0, Math.min(4, step + 2));
      const p = positions[idx];
      return {
        x: p.x * h,
        y: p.y * h,
        rotation: p.rot,
        scale: p.s,
        blur: p.b,
        opacity: p.o,
        zIndex: absStep === 0 ? 3 : absStep === 1 ? 2 : 1,
      };
    }

    positionSlide(slide, step) {
      const props = this.getSlideProps(step);
      gsap.set(slide, {
        xPercent: -50,
        yPercent: -50,
        x: props.x,
        y: props.y,
        rotation: props.rotation,
        scale: props.scale,
        opacity: props.opacity,
        filter: "blur(" + props.blur + "px)",
        zIndex: props.zIndex,
      });
    }

    buildCarousel() {
      if (!this.imagesEl || this.imagesEl.offsetHeight === 0) return;
      this.imagesEl.innerHTML = "";
      this.slideEls = [];
      for (let step = -1; step <= 1; step++) {
        const idx = this.mod(this.current + step);
        const slide = this.makeSlide(idx);
        this.imagesEl.appendChild(slide);
        this.positionSlide(slide, step);
        this.slideEls.push({ el: slide, step });
      }
    }

    animateCarousel(direction) {
      if (!this.imagesEl || this.imagesEl.offsetHeight === 0)
        return gsap.timeline();

      const shift = direction === "next" ? -1 : 1;
      const enterStep = direction === "next" ? 2 : -2;
      const newIdx =
        direction === "next"
          ? this.mod(this.current + 2)
          : this.mod(this.current - 2);

      const newSlide = this.makeSlide(newIdx);
      this.imagesEl.appendChild(newSlide);
      this.positionSlide(newSlide, enterStep);
      this.slideEls.push({ el: newSlide, step: enterStep });
      this.slideEls.forEach((s) => {
        s.step += shift;
      });

      const duration = this.reducedMotion ? 0.01 : 1.15;
      const tl = gsap.timeline({
        onComplete: () => {
          this.slideEls = this.slideEls.filter((s) => {
            if (Math.abs(s.step) >= 2) {
              s.el.remove();
              return false;
            }
            return true;
          });
        },
      });

      this.slideEls.forEach((s) => {
        const props = this.getSlideProps(s.step);
        s.el.style.zIndex = props.zIndex;
        tl.to(
          s.el,
          {
            x: props.x,
            y: props.y,
            rotation: props.rotation,
            scale: props.scale,
            opacity: props.opacity,
            filter: "blur(" + props.blur + "px)",
            duration,
            ease: "power3.inOut",
          },
          0
        );
      });
      return tl;
    }

    go(direction) {
      if (this.animating || !this.total) return;
      const nextIdx =
        direction === "next"
          ? this.mod(this.current + 1)
          : this.mod(this.current - 1);
      this.animateTo(nextIdx, direction);
    }

    goTo(index) {
      if (this.animating || index === this.current) return;
      const target = this.mod(index);
      const forward = this.mod(target - this.current);
      const backward = this.mod(this.current - target);
      const direction = forward <= backward ? "next" : "prev";
      if (Math.min(forward, backward) === 1) {
        this.animateTo(target, direction);
        return;
      }
      // Non-adjacent: animate title/bg, rebuild stack at the target
      this.animating = true;
      if (this.inView) this.startAutoPlay();
      const slide = this.slides[target];
      const master = gsap.timeline({
        onComplete: () => {
          this.current = target;
          this.buildCarousel();
          this.animating = false;
          this.updateStatus();
        },
      });
      master.to(
        this.el,
        {
          backgroundColor: slide.color,
          duration: this.reducedMotion ? 0.01 : 0.8,
          ease: "power2.inOut",
        },
        0
      );
      master.add(this.animateTitle(slide.name, direction), 0);
      master.call(() => this.setMeta(slide), null, 0.1);
      master.to(
        this.imagesEl,
        {
          opacity: 0,
          duration: this.reducedMotion ? 0.01 : 0.35,
          ease: "power2.in",
        },
        0
      );
      master.add(() => {
        this.current = target;
        this.buildCarousel();
      });
      master.to(
        this.imagesEl,
        {
          opacity: 1,
          duration: this.reducedMotion ? 0.01 : 0.45,
          ease: "power2.out",
        }
      );
    }

    animateTo(nextIdx, direction) {
      this.animating = true;
      if (this.inView) this.startAutoPlay();

      const slide = this.slides[nextIdx];
      const master = gsap.timeline({
        onComplete: () => {
          this.current = nextIdx;
          this.animating = false;
          this.updateStatus();
        },
      });

      master.to(
        this.el,
        {
          backgroundColor: slide.color,
          duration: this.reducedMotion ? 0.01 : 1.15,
          ease: "power2.inOut",
        },
        0
      );
      master.add(this.animateTitle(slide.name, direction), 0);
      master.add(this.animateCarousel(direction), 0);
      master.call(() => this.setMeta(slide), null, 0.15);
    }

    openCurrent() {
      const slide = this.slides[this.current];
      if (slide && typeof this.onOpen === "function") this.onOpen(slide.id);
    }

    bind() {
      const wheelOpts = { passive: false };
      const onWheel = throttle((e) => {
        if (!this.inView || this.animating) return;
        e.preventDefault();
        this.go(e.deltaY > 0 ? "next" : "prev");
      }, 1600);
      this.on(this.el, "wheel", onWheel, wheelOpts);

      let touchStartY = 0;
      this.on(
        this.el,
        "touchstart",
        (e) => {
          touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );

      const onTouchMove = throttle((e) => {
        if (!this.inView || this.animating) return;
        const diff = touchStartY - e.touches[0].clientY;
        if (Math.abs(diff) < 36) return;
        e.preventDefault();
        this.go(diff > 0 ? "next" : "prev");
        touchStartY = e.touches[0].clientY;
      }, 1600);
      this.on(this.el, "touchmove", onTouchMove, { passive: false });

      if (this.prevBtn) this.on(this.prevBtn, "click", () => this.go("prev"));
      if (this.nextBtn) this.on(this.nextBtn, "click", () => this.go("next"));
      if (this.openBtn) this.on(this.openBtn, "click", () => this.openCurrent());

      this.on(this.el, "dblclick", () => this.openCurrent());
      this.on(this.imagesEl, "click", () => this.openCurrent());

      this.on(this.root, "mouseenter", () => {
        this.hovered = true;
        this.stopAutoPlay();
      });
      this.on(this.root, "mouseleave", () => {
        this.hovered = false;
        if (this.inView) this.startAutoPlay();
      });
      this.on(this.root, "focusin", () => {
        this.focused = true;
        this.stopAutoPlay();
      });
      this.on(this.root, "focusout", (e) => {
        if (!this.root.contains(e.relatedTarget)) {
          this.focused = false;
          if (this.inView) this.startAutoPlay();
        }
      });

      this.on(this.root, "keydown", (e) => {
        if (this.animating) return;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          this.go("next");
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          this.go("prev");
        }
        if (e.key === "Enter" || e.key === " ") {
          if (e.target === this.root || e.target === this.openBtn) {
            e.preventDefault();
            this.openCurrent();
          }
        }
      });

      const onResize = debounce(() => {
        if (!this.animating && this.imagesEl.offsetHeight > 0) {
          this.slideEls.forEach((s) => this.positionSlide(s.el, s.step));
        }
      }, 300);
      this.on(window, "resize", onResize, { passive: true });

      this.on(document, "visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.animating = false;
          this.stopAutoPlay();
        } else if (this.inView) {
          this.startAutoPlay();
        }
      });
    }
  }

  window.WorkSlider = {
    create(root, options) {
      return new WorkSlider(root, options);
    },
    buildSlides,
    HERO,
  };
})();
