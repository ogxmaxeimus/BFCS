(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");

  $$("[data-split] > span").forEach((line) => {
    const inner = document.createElement("span");
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-loaded")));

  const nav = $("[data-nav]");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const fmt = (v) => v.toLocaleString("en-US");
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1700, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* Hero route */
  const STAGES = [
    { place: "Les Houches", title: "Up and over the Col de Voza", text: "We meet in Chamonix at eight, take the valley train to the trailhead and climb through larch woods to a first lunch with the whole massif in view.", meta: "14 km on foot · 1,050 m up" },
    { place: "Les Contamines", title: "Waterfalls and a Roman road", text: "A gentle morning along the river, then the old paved mule track up to a family-run refuge where the soup is the same recipe as 1960.", meta: "16 km on foot · 820 m up" },
    { place: "Les Mottets", title: "Two cols before tea", text: "The big day. Col du Bonhomme, then the Croix du Bonhomme, then a long descent to a stone farmhouse turned refuge at the head of the valley.", meta: "18 km on foot · 1,340 m up" },
    { place: "Courmayeur", title: "Into Italy on foot", text: "Cross the border at the Col de la Seigne, eat lunch beside a glacier lake and finish with espresso in town. Tonight is a hotel with real towels.", meta: "21 km on foot · 680 m up" },
    { place: "Val Ferret", title: "The balcony path", text: "The finest views on the route. A level trail that runs opposite the Grandes Jorasses for hours, ending at a hut built for exactly this view.", meta: "12 km on foot · 760 m up" },
    { place: "Champex-Lac", title: "Over to Switzerland", text: "Up through the Grand Col Ferret, down through hay meadows and cow bells, and into a lakeside village where rowing boats wait at the jetty.", meta: "19 km on foot · 930 m up" },
    { place: "Chamonix", title: "Back to where we began", text: "A short walk, a cable car and a final lunch together in Chamonix. Trains to Geneva leave hourly, and most people miss the first one on purpose.", meta: "9 km on foot · cable car down" },
  ];
  const track = $("[data-route-track]");
  const knob = $("[data-route-knob]");
  const fill = $("[data-route-fill]");
  const stops = $$("[data-route-stops] li");
  const card = $("[data-stage-card]");
  const stageImgs = $$("[data-stage-img]");
  let stage = 0;
  let swapTimer;

  const stopX = (i) => {
    const r = track.getBoundingClientRect();
    const s = stops[i].getBoundingClientRect();
    return s.left - r.left;
  };
  const placeKnob = (x) => {
    knob.style.left = x + "px";
    fill.style.width = x + "px";
  };
  const setStage = (i, { fromDrag = false } = {}) => {
    i = Math.max(0, Math.min(STAGES.length - 1, i));
    const changed = i !== stage;
    stage = i;
    if (!fromDrag) placeKnob(stopX(i));
    stops.forEach((li, n) => {
      li.classList.toggle("is-active", n === i);
      li.classList.toggle("is-past", n <= i);
    });
    stageImgs.forEach((img, n) => img.classList.toggle("is-active", n === i));
    const d = STAGES[i];
    track.setAttribute("aria-valuenow", String(i + 1));
    track.setAttribute("aria-valuetext", `Stage ${i + 1}, ${d.place}`);
    const apply = () => {
      $("[data-stage-num]").textContent = pad(i + 1);
      $("[data-stage-place]").textContent = d.place;
      $("[data-stage-title]").textContent = d.title;
      $("[data-stage-text]").textContent = d.text;
      $("[data-stage-meta]").textContent = d.meta;
      const next = STAGES[i + 1];
      $("[data-stage-next]").textContent = next ? next.place : "Home, the long way";
      const nextImg = stageImgs[i + 1] || stageImgs[0];
      $("[data-stage-next-img]").src = nextImg.src.replace(/w=2000/, "w=200&h=140");
      card.classList.remove("is-swapping");
    };
    if (!changed) { apply(); return; }
    clearTimeout(swapTimer);
    card.classList.add("is-swapping");
    swapTimer = setTimeout(apply, reduceMotion ? 0 : 220);
  };
  const nearestStage = (x) => {
    let best = 0;
    let bestD = Infinity;
    stops.forEach((_, n) => {
      const d = Math.abs(stopX(n) - x);
      if (d < bestD) { bestD = d; best = n; }
    });
    return best;
  };
  let dragging = false;
  const pointerX = (e) => {
    const r = track.getBoundingClientRect();
    return Math.max(0, Math.min(stopX(stops.length - 1), e.clientX - r.left));
  };
  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    track.classList.add("is-dragging");
    track.setPointerCapture(e.pointerId);
    const x = pointerX(e);
    placeKnob(x);
    setStage(nearestStage(x), { fromDrag: true });
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const x = pointerX(e);
    placeKnob(x);
    const n = nearestStage(x);
    if (n !== stage) setStage(n, { fromDrag: true });
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    setStage(stage);
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("keydown", (e) => {
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in map) { e.preventDefault(); setStage(stage + map[e.key]); }
    if (e.key === "Home") { e.preventDefault(); setStage(0); }
    if (e.key === "End") { e.preventDefault(); setStage(STAGES.length - 1); }
  });
  window.addEventListener("resize", () => setStage(stage));
  setStage(0);

  /* Finder: jump to departures filtered by region */
  const REGION_KIND = { "The Alps": "mountain", Japan: "culture", Morocco: "culture", Peru: "mountain", Norway: "coast", "Italian coast": "coast" };
  $("[data-finder]").addEventListener("submit", (e) => {
    e.preventDefault();
    const region = e.target.region.value;
    setFilter(REGION_KIND[region] || "all");
    $("#journeys").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* Departures rail */
  const rail = $("[data-rail]");
  const trips = $$(".trip", rail);
  const countEl = $("[data-rail-count]");
  const totalEl = $("[data-rail-total]");
  const visibleTrips = () => trips.filter((t) => !t.classList.contains("is-hidden"));
  const updateCount = () => {
    const vis = visibleTrips();
    totalEl.textContent = pad(vis.length);
    const left = rail.getBoundingClientRect().left;
    let idx = 0;
    vis.forEach((t, n) => { if (t.getBoundingClientRect().left - left < t.offsetWidth / 2) idx = n; });
    if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4) idx = vis.length - 1;
    countEl.textContent = pad(Math.min(idx + 1, vis.length));
  };
  rail.addEventListener("scroll", updateCount, { passive: true });
  let railDown = false;
  let railMoved = false;
  let startX = 0;
  let startScroll = 0;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    railDown = true;
    railMoved = false;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!railDown) return;
    const dx = e.clientX - startX;
    if (!railMoved && Math.abs(dx) > 4) { railMoved = true; rail.classList.add("is-dragging"); }
    if (railMoved) rail.scrollLeft = startScroll - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!railDown) return;
    railDown = false;
    if (!railMoved) return;
    rail.classList.remove("is-dragging");
    const left = rail.getBoundingClientRect().left;
    const vis = visibleTrips();
    let target = vis[0];
    let best = Infinity;
    vis.forEach((t) => {
      const d = Math.abs(t.getBoundingClientRect().left - left - parseFloat(getComputedStyle(rail).paddingLeft));
      if (d < best) { best = d; target = t; }
    });
    rail.scrollTo({ left: target.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft), behavior: reduceMotion ? "auto" : "smooth" });
  });
  rail.addEventListener("dragstart", (e) => e.preventDefault());
  rail.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const step = (trips[0].offsetWidth + 22) * (e.key === "ArrowRight" ? 1 : -1);
    rail.scrollBy({ left: step, behavior: reduceMotion ? "auto" : "smooth" });
  });

  const chips = $$("[data-filter] button");
  function setFilter(key) {
    chips.forEach((c) => c.setAttribute("aria-selected", String(c.dataset.filterKey === key)));
    trips.forEach((t) => t.classList.toggle("is-hidden", key !== "all" && t.dataset.kind !== key));
    rail.scrollTo({ left: 0 });
    updateCount();
  }
  chips.forEach((c) => c.addEventListener("click", () => setFilter(c.dataset.filterKey)));
  updateCount();

  /* Places hover */
  const places = $$("[data-places] li");
  const placesFig = $(".places__figure");
  const placesImg = $("[data-places-img]");
  const placesCap = $("[data-places-cap]");
  let placeTimer;
  const setPlace = (li) => {
    if (li.classList.contains("is-active")) return;
    places.forEach((p) => p.classList.toggle("is-active", p === li));
    clearTimeout(placeTimer);
    placesFig.classList.add("is-swapping");
    placeTimer = setTimeout(() => {
      placesImg.src = li.dataset.img;
      placesImg.alt = `${li.querySelector("strong").textContent} walking landscape`;
      placesCap.textContent = `${li.querySelector("strong").textContent} · best ${li.querySelector(".places__season").textContent.toLowerCase()}`;
      placesFig.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 180);
  };
  places.forEach((li) => {
    li.addEventListener("mouseenter", () => setPlace(li));
    li.addEventListener("click", () => setPlace(li));
  });
  places[0].classList.add("is-active");
  places.forEach((li) => { const img = new Image(); img.src = li.dataset.img; });

  /* A day on the trail: scroll-linked */
  const DAY = [
    { time: "05:50", title: "Porridge by headtorch", text: "The guardian has the stove going before anyone stirs. Boots on by half six, packs light because the bags travel by road." },
    { time: "08:15", title: "Sun on the Jorasses", text: "The first light hits the ridge across the valley. The leader stops the group at the same rock every time, because it is the best one." },
    { time: "12:30", title: "Lunch with a glacier", text: "Bread, local cheese and a flask of something hot, on a slab of granite with the ice close enough to hear it move." },
    { time: "15:45", title: "The last climb", text: "Forty minutes of steady switchbacks. Anyone who wants to go slower goes with the second leader, and nobody waits in the cold." },
    { time: "19:30", title: "Dinner at the long table", text: "Three courses, a carafe of red and the map spread out for tomorrow. Bunks are upstairs and the stars are outside." },
  ];
  const daySec = $("[data-day]");
  const dayImgs = $$("[data-day-img]");
  const dayTicks = $$("[data-day-ticks] li");
  const dayNow = $(".day__now");
  const clock = $("[data-day-clock]");
  let dayIdx = -1;
  let dayTimer;
  const setDay = (i) => {
    if (i === dayIdx) return;
    dayIdx = i;
    const d = DAY[i];
    dayImgs.forEach((img, n) => img.classList.toggle("is-active", n === i));
    dayTicks.forEach((t, n) => t.classList.toggle("is-active", n <= i));
    clock.textContent = d.time;
    clearTimeout(dayTimer);
    dayNow.classList.add("is-swapping");
    dayTimer = setTimeout(() => {
      $("[data-day-step]").textContent = `Moment ${pad(i + 1)} / ${pad(DAY.length)}`;
      $("[data-day-title]").textContent = d.title;
      $("[data-day-text]").textContent = d.text;
      dayNow.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 200);
  };
  const onDayScroll = () => {
    const r = daySec.getBoundingClientRect();
    const total = daySec.offsetHeight - window.innerHeight;
    const p = Math.max(0, Math.min(0.999, -r.top / total));
    setDay(Math.floor(p * DAY.length));
  };
  window.addEventListener("scroll", onDayScroll, { passive: true });
  onDayScroll();
  dayTicks.forEach((t, n) => {
    t.style.cursor = "pointer";
    t.addEventListener("click", () => {
      const total = daySec.offsetHeight - window.innerHeight;
      window.scrollTo({ top: daySec.offsetTop + total * ((n + 0.5) / DAY.length), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Leaders */
  const LEADERS = [
    { role: "Lead guide · Les Houches, France", bio: "Raised in a chalet above the Arve valley and qualified as a mountain leader at twenty. Knows every hut guardian on the route by first name, and most of their dogs.", count: "186 groups led" },
    { role: "Lead guide · Tanabe, Japan", bio: "Grew up two stops from the start of the pilgrim road and walked it first with his grandfather. Will teach you to bow at a shrine and to order at an onsen without fuss.", count: "142 groups led" },
    { role: "Lead guide · Imlil, Morocco", bio: "Born in a Berber village under Toubkal. Speaks four languages, plans every lunch at a cousin's house, and has never once let a group go hungry.", count: "203 groups led" },
    { role: "Lead guide · Ollantaytambo, Peru", bio: "Quechua speaker from a farming family in the Sacred Valley. Knows which passes the altitude hits hardest and paces every day so it never ruins one.", count: "97 groups led" },
    { role: "Lead guide · Reine, Norway", bio: "Fisherman's daughter from the outer Lofoten islands. Reads the weather off the sea and moves the plan before the forecast catches up.", count: "118 groups led" },
  ];
  const leaderBtns = $$(".leaders__names button");
  const leaderImgs = $$(".leaders__photos img");
  const leaderBio = $(".leaders__bio");
  leaderBtns.forEach((btn, i) => {
    const pick = () => {
      leaderBtns.forEach((b, n) => b.setAttribute("aria-selected", String(n === i)));
      leaderImgs.forEach((img, n) => img.classList.toggle("is-active", n === i));
      $("[data-leader-role]", leaderBio).textContent = LEADERS[i].role;
      $("[data-leader-bio]", leaderBio).textContent = LEADERS[i].bio;
      $("[data-leader-count]", leaderBio).textContent = LEADERS[i].count;
    };
    btn.addEventListener("click", pick);
    btn.addEventListener("mouseenter", () => { if (window.matchMedia("(hover: hover)").matches) pick(); });
  });

  /* Reviews */
  const REVIEWS = [
    { quote: "\u201cI booked for the mountains and came home talking about the people. Margaux set a pace where nobody felt slow and nobody felt held back.\u201d", name: "Priya Raman", trip: "Mont Blanc, hut to hut · July 2026" },
    { quote: "\u201cKenta knew which tea house had the best view and which one had the best cake, and somehow they were always the same place.\u201d", name: "Tom Adeyemi", trip: "The Kumano pilgrim road · April 2026" },
    { quote: "\u201cWe ate lunch in a different family kitchen every day. I have walked with three companies and this is the only one that felt like being a guest.\u201d", name: "Sofia Lindqvist", trip: "High Atlas, village to village · October 2025" },
    { quote: "\u201cThe planner rang me twice before we left just to check my knees. Small thing. It is why I booked again the next year.\u201d", name: "Greg Morales", trip: "Sacred Valley high trails · May 2026" },
    { quote: "\u201cIngrid moved our ferry a day early because of a storm nobody else had seen coming. We watched it roll in from a warm cabin.\u201d", name: "Aiko Brandt", trip: "Lofoten fjord crossings · July 2026" },
  ];
  const quoteBox = $(".reviews blockquote");
  const dots = $$(".reviews__dots button");
  let reviewIdx = 0;
  let reviewTimer;
  let reviewAuto;
  const setReview = (i) => {
    reviewIdx = (i + REVIEWS.length) % REVIEWS.length;
    dots.forEach((d, n) => d.setAttribute("aria-selected", String(n === reviewIdx)));
    clearTimeout(reviewTimer);
    quoteBox.classList.add("is-swapping");
    reviewTimer = setTimeout(() => {
      const r = REVIEWS[reviewIdx];
      $("[data-review-count]").textContent = `Review ${pad(reviewIdx + 1)} / ${pad(REVIEWS.length)}`;
      $("[data-review-quote]").textContent = r.quote;
      $("[data-review-name]").textContent = r.name;
      $("[data-review-trip]").textContent = r.trip;
      quoteBox.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 300);
  };
  const startAuto = () => {
    if (reduceMotion) return;
    clearInterval(reviewAuto);
    reviewAuto = setInterval(() => setReview(reviewIdx + 1), 7000);
  };
  dots.forEach((d, n) => d.addEventListener("click", () => { setReview(n); startAuto(); }));
  startAuto();

  /* Plan form */
  const planForm = $("[data-plan-form]");
  const planStatus = $("[data-plan-status]");
  planForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!planForm.reportValidity()) return;
    const region = planForm.region.value;
    planStatus.textContent = `Thanks. A planner will email you about ${region === "Anywhere" ? "the right walk for you" : region} within one working day.`;
    planForm.reset();
  });

  /* Gentle parallax on the closing image */
  const planBg = $(".plan__bg");
  if (!reduceMotion && planBg) {
    const onPar = () => {
      const r = planBg.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      planBg.style.transform = `translate3d(0, ${p * -60}px, 0)`;
    };
    window.addEventListener("scroll", onPar, { passive: true });
    onPar();
  }
})();
