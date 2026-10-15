(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const menu = $(".menu-btn");
  const header = $(".header");
  if (menu && header) {
    menu.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const boot = $("#boot");
  if (boot) {
    const done = () => {
      boot.remove();
      try { sessionStorage.setItem("hy-loaded", "1"); } catch (e) {}
    };
    try { if (sessionStorage.getItem("hy-loaded")) done(); } catch (e) {}
    const skip = $(".skip", boot);
    if (skip) skip.addEventListener("click", done);
    setTimeout(done, 2800);
  }

  function money(n) {
    const v = Number(n);
    if (!isFinite(v)) return "";
    if (v >= 1) return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
    return "$" + v.toFixed(4);
  }

  $$("[data-filters]").forEach((bar) => {
    const target = document.querySelector(bar.getAttribute("data-filters"));
    if (!target) return;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      $$("button", bar).forEach((b) => b.classList.toggle("is-on", b === btn));
      const f = btn.getAttribute("data-filter");
      $$("[data-cat]", target).forEach((row) => {
        const cat = row.getAttribute("data-cat") || "";
        const chg = Number(row.getAttribute("data-chg") || 0);
        let show = f === "all";
        if (f === "gainers") show = chg > 0;
        else if (f === "losers") show = chg < 0;
        else if (f !== "all") show = cat.toLowerCase() === f;
        row.classList.toggle("hidden", !show);
      });
    });
  });

  const search = $("#market-search");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      $$("#market-table [data-cat]").forEach((row) => {
        const name = (row.getAttribute("data-name") || "").toLowerCase();
        row.classList.toggle("hidden", q && !name.includes(q));
      });
    });
  }

  $$("[data-swap]").forEach((box) => {
    const price = Number(box.getAttribute("data-price"));
    const fee = Number(box.getAttribute("data-fee") || 0.001);
    const amount = $("[data-amount]", box);
    const out = $("[data-out]", box);
    const range = $("[data-range]", box);
    const sync = () => {
      const qty = Number(amount.value || 0);
      const gross = qty * price;
      out.textContent = money(gross * (1 - fee));
      if (range && document.activeElement !== range) range.value = String(qty);
    };
    amount.addEventListener("input", sync);
    if (range) {
      range.addEventListener("input", () => {
        amount.value = range.value;
        sync();
      });
    }
    sync();
  });

  $$("[data-earn]").forEach((box) => {
    const amount = $("[data-amount]", box);
    const pick = $("[data-product]", box);
    const year = $("[data-year]", box);
    const month = $("[data-month]", box);
    const sync = () => {
      const opt = pick.selectedOptions[0];
      const apy = Number(opt.getAttribute("data-apy")) / 100;
      const v = Number(amount.value || 0) * apy;
      year.textContent = money(v) + " a year";
      month.textContent = money(v / 12) + " a month";
    };
    amount.addEventListener("input", sync);
    pick.addEventListener("change", sync);
    sync();
  });

  $$("[data-fee]").forEach((box) => {
    const volume = $("[data-volume]", box);
    const size = $("[data-size]", box);
    const pay = $("[data-pay]", box);
    const tier = $("[data-tier]", box);
    const tiers = [
      { name: "Tier 1", max: 50000, maker: 0.001, taker: 0.002 },
      { name: "Tier 2", max: 1000000, maker: 0.0008, taker: 0.0016 },
      { name: "Tier 3", max: 10000000, maker: 0.0005, taker: 0.001 },
      { name: "Tier 4", max: Infinity, maker: 0.0002, taker: 0.0006 }
    ];
    const sync = () => {
      const vol = Number(volume.value);
      const t = tiers.find((x) => vol <= x.max) || tiers[tiers.length - 1];
      const trade = Number(size.value || 10000);
      pay.textContent = money(trade * t.taker);
      tier.textContent = t.name + " · " + money(trade * t.maker) + " as a maker";
    };
    volume.addEventListener("input", sync);
    size.addEventListener("input", sync);
    sync();
  });

  $$("[data-tabs]").forEach((box) => {
    const buttons = $$("[data-tab]", box);
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.toggle("is-on", b === btn));
        const id = btn.getAttribute("data-tab");
        $$("[data-panel]", box).forEach((p) => p.classList.toggle("hidden", p.getAttribute("data-panel") !== id));
      });
    });
  });

  $$("[data-pairs]").forEach((box) => {
    $$("[data-pair]", box).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("[data-pair]", box).forEach((b) => b.classList.toggle("is-on", b === btn));
        const price = Number(btn.getAttribute("data-price"));
        const sym = btn.getAttribute("data-sym");
        const chg = btn.getAttribute("data-chg");
        const label = $("[data-pair-label]", box);
        const px = $("[data-pair-price]", box);
        const ch = $("[data-pair-chg]", box);
        if (label) label.textContent = sym + " / USD";
        if (px) px.textContent = money(price);
        if (ch) {
          ch.textContent = (Number(chg) > 0 ? "+" : "") + chg + "% 24H";
          ch.className = Number(chg) >= 0 ? "up" : "down";
        }
        const book = $("[data-book]", box);
        if (book) {
          const rows = [];
          for (let i = 8; i >= 1; i--) rows.push(`<div class="ob-row ask"><span>${(price * (1 + i * 0.0004)).toFixed(2)}</span><span>${(Math.random() * 1.8 + 0.2).toFixed(4)}</span></div>`);
          rows.push(`<div class="ob-row"><span>${price.toFixed(2)}</span><span>last</span></div>`);
          for (let i = 1; i <= 8; i++) rows.push(`<div class="ob-row bid"><span>${(price * (1 - i * 0.0004)).toFixed(2)}</span><span>${(Math.random() * 1.8 + 0.2).toFixed(4)}</span></div>`);
          book.innerHTML = rows.join("");
        }
      });
    });
  });

  $$("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = form.querySelector("[data-demo-note]") || form.nextElementSibling;
      if (note) note.classList.remove("hidden");
    });
  });

  $$("[data-choice]").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !group.contains(btn)) return;
      $$("button", group).forEach((b) => b.classList.toggle("is-on", b === btn));
    });
  });

  $$("[data-signup]").forEach((box) => {
    let step = 0;
    const panels = $$("[data-step]", box);
    const marks = $$("[data-step-mark]", box);
    const err = $("[data-step-error]", box);
    const show = () => {
      panels.forEach((p, i) => p.classList.toggle("hidden", i !== step));
      marks.forEach((m, i) => m.classList.toggle("is-on", i <= step));
    };
    const summary = () => {
      const email = ($("[data-email]", box) || {}).value || "";
      const country = ($("[data-country]", box) || {}).value || "";
      const plan = $("[data-plan].is-on", box);
      const set = (sel, val) => { const n = $(sel, box); if (n) n.textContent = val; };
      set("[data-sum-email]", email);
      set("[data-sum-country]", country);
      set("[data-sum-plan]", plan ? plan.getAttribute("data-plan") : "Trade");
    };
    box.addEventListener("click", (e) => {
      const planBtn = e.target.closest("[data-plan]");
      if (planBtn) {
        $$("[data-plan]", box).forEach((b) => b.classList.toggle("is-on", b === planBtn));
      }
      if (e.target.closest("[data-next]")) {
        if (step === 0) {
          const email = ($("[data-email]", box) || {}).value || "";
          const country = ($("[data-country]", box) || {}).value || "";
          const age = $("[data-age]", box);
          if (!email.includes("@")) { if (err) { err.textContent = "Please enter a valid email."; err.classList.remove("hidden"); } return; }
          if (!country) { if (err) { err.textContent = "Please pick your country."; err.classList.remove("hidden"); } return; }
          if (age && !age.checked) { if (err) { err.textContent = "Please confirm you are over 18."; err.classList.remove("hidden"); } return; }
          if (err) err.classList.add("hidden");
        }
        step = Math.min(step + 1, panels.length - 1);
        summary();
        show();
      }
      if (e.target.closest("[data-back]")) {
        step = Math.max(step - 1, 0);
        show();
      }
      if (e.target.closest("[data-copy-summary]")) {
        const text = $("[data-summary]", box);
        if (text && navigator.clipboard) navigator.clipboard.writeText(text.innerText);
        const note = $("[data-demo-note]", box);
        if (note) { note.textContent = "Summary copied. Online onboarding is not connected, so nothing was sent."; note.classList.remove("hidden"); }
      }
    });
  });

  $$("[data-reveal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = btn.closest("[data-seed]");
      if (!box) return;
      const on = box.classList.toggle("is-revealed");
      btn.textContent = on ? "Hide" : "Reveal";
    });
  });

  $$("[data-flip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = document.querySelector(btn.getAttribute("data-flip"));
      if (card) card.classList.toggle("is-flipped");
    });
  });

  const cardSpend = $("#card-spend");
  if (cardSpend) {
    const out = $("#card-back");
    const sync = () => {
      const year = Number(cardSpend.value || 0) * 0.02;
      const btc = year / 67412.8;
      out.textContent = money(year) + " ≈ " + btc.toFixed(4) + " BTC";
    };
    cardSpend.addEventListener("input", sync);
    sync();
  }
})();
