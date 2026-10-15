// Theme toggle lives in script.js (loaded before this file). Do not redeclare
// root/themeBtn/etc. here — top-level const collisions abort this whole script
// and leave Sign in / Enter dead.

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");
const licenseList = document.getElementById("licenseList");
const addLicenseForm = document.getElementById("addLicenseForm");
const contractStageNav = document.getElementById("contractStageNav");
const contractLibrary = document.getElementById("contractLibrary");
const contractSearch = document.getElementById("contractSearch");
const contractCount = document.getElementById("contractCount");
const projectEditor = document.getElementById("projectEditor");
const saveStatus = document.getElementById("saveStatus");
const addProjectBtn = document.getElementById("addProjectBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const resetBtn = document.getElementById("resetBtn");

let portfolioData = typeof WorkStore !== "undefined" ? WorkStore.load() : { projects: [], licenses: [] };
let saveTimer = null;
let activeContractStage = "all";
let contractSearchQuery = "";
function setSaveStatus(message, kind) {
  if (!saveStatus) return;
  saveStatus.textContent = message;
  saveStatus.className = "ownership-status" + (kind ? " " + kind : "");
}

function persist(message) {
  WorkStore.save(portfolioData);
  if (message) {
    setSaveStatus(message, "success");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => setSaveStatus(""), 2400);
  }
}

function showAdmin() {
  if (loginPanel) loginPanel.hidden = true;
  if (adminPanel) adminPanel.hidden = false;
  if (logoutBtn) logoutBtn.hidden = false;
  renderAll();
}

function showLogin() {
  if (loginPanel) loginPanel.hidden = false;
  if (adminPanel) adminPanel.hidden = true;
  if (logoutBtn) logoutBtn.hidden = true;
}

function frequencyClass(frequency) {
  if (!frequency) return "";
  if (frequency.toLowerCase().includes("almost every")) return "frequency-always";
  if (frequency.toLowerCase().includes("often")) return "frequency-often";
  return "";
}

function filterContracts() {
  let contracts = ContractLibrary.CONTRACTS;

  if (activeContractStage !== "all") {
    contracts = contracts.filter((c) => c.stage === activeContractStage);
  }

  if (contractSearchQuery) {
    const q = contractSearchQuery.toLowerCase();
    contracts = contracts.filter((c) => {
      const cat = ContractLibrary.getCategory(c.category);
      const haystack = [
        c.title,
        c.description,
        c.frequency,
        c.example,
        c.note,
        cat?.label,
        ...(c.useFor || []),
        ...(c.includes || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return contracts;
}

function renderContractStageNav() {
  if (!contractStageNav) return;

  const counts = ContractLibrary.getStageCounts();
  const allCount = ContractLibrary.CONTRACTS.length;

  const allBtn = `
    <button type="button" class="contract-stage-btn${activeContractStage === "all" ? " active" : ""}" data-stage="all">
      <span class="contract-stage-icon">All</span>
      <span class="contract-stage-text">
        <strong>All contracts<span class="contract-stage-count">${allCount}</span></strong>
        <span>Complete template stack for every client stage</span>
      </span>
    </button>`;

  const stageBtns = ContractLibrary.STAGES.map(
    (stage) => `
    <button type="button" class="contract-stage-btn${activeContractStage === stage.id ? " active" : ""}" data-stage="${stage.id}">
      <span class="contract-stage-icon">${stage.icon}</span>
      <span class="contract-stage-text">
        <strong>${WorkStore.escapeHtml(stage.label)}<span class="contract-stage-count">${counts[stage.id]}</span></strong>
        <span>${WorkStore.escapeHtml(stage.description)}</span>
      </span>
    </button>`
  ).join("");

  contractStageNav.innerHTML = allBtn + stageBtns;
}

function renderContractCard(contract) {
  const tags = (contract.useFor || contract.includes || []).slice(0, 4);
  const example = contract.example
    ? `<p class="contract-card-example">${WorkStore.escapeHtml(contract.example)}</p>`
    : "";
  const note = contract.note
    ? `<p class="contract-card-note" style="font-size:0.78rem;color:var(--muted)">${WorkStore.escapeHtml(contract.note)}</p>`
    : "";

  return `
    <article class="contract-card">
      <div class="contract-card-head">
        <h4>${WorkStore.escapeHtml(contract.title)}</h4>
        ${contract.frequency ? `<span class="contract-frequency ${frequencyClass(contract.frequency)}">${WorkStore.escapeHtml(contract.frequency)}</span>` : ""}
      </div>
      <p>${WorkStore.escapeHtml(contract.description)}</p>
      ${example}
      ${note}
      ${
        tags.length
          ? `<div class="contract-card-tags">${tags.map((t) => `<span class="contract-tag">${WorkStore.escapeHtml(t)}</span>`).join("")}</div>`
          : ""
      }
      <div class="contract-card-actions">
        <a class="doc-link" href="${WorkStore.escapeHtml(contract.href)}" target="_blank" rel="noopener">
          <span class="doc-icon">DOC</span> Open template
        </a>
      </div>
    </article>`;
}

function renderContractLibrary() {
  if (!contractLibrary) return;

  const contracts = filterContracts();

  if (contractCount) {
    contractCount.textContent =
      contracts.length === ContractLibrary.CONTRACTS.length
        ? `${contracts.length} templates`
        : `${contracts.length} of ${ContractLibrary.CONTRACTS.length} templates`;
  }

  if (!contracts.length) {
    contractLibrary.innerHTML = '<p class="contract-empty">No contracts match your search.</p>';
    return;
  }

  const byCategory = {};
  contracts.forEach((c) => {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });

  const categoryOrder = ContractLibrary.CATEGORIES.map((c) => c.id).filter((id) => byCategory[id]);

  contractLibrary.innerHTML = categoryOrder
    .map((catId) => {
      const cat = ContractLibrary.getCategory(catId);
      const cards = byCategory[catId].map(renderContractCard).join("");
      return `
        <section class="contract-category">
          <div class="contract-category-head">
            <h3>${WorkStore.escapeHtml(cat.label)}</h3>
          </div>
          <div class="contract-grid">${cards}</div>
        </section>`;
    })
    .join("");
}

function renderLicenses() {
  if (!licenseList) return;
  if (!portfolioData.licenses.length) {
    licenseList.innerHTML = '<p class="ownership-empty">No license agreements yet.</p>';
    return;
  }

  licenseList.innerHTML = portfolioData.licenses
    .map(
      (license, index) => `
      <article class="license-item">
        <div class="license-item-body">
          <a class="doc-link" href="${WorkStore.escapeHtml(license.href)}" target="_blank" rel="noopener">
            <span class="doc-icon">DOC</span> ${WorkStore.escapeHtml(license.title)}
          </a>
          ${license.description ? `<p>${WorkStore.escapeHtml(license.description)}</p>` : ""}
        </div>
        <button type="button" class="ownership-icon-btn ownership-danger" data-remove-license="${index}" aria-label="Remove agreement">×</button>
      </article>`
    )
    .join("");
}

function renderFactFields(project, projectIndex) {
  return project.caseStudy.facts
    .map(
      (fact, factIndex) => `
      <div class="ownership-fact-row">
        <input type="text" value="${WorkStore.escapeHtml(fact.label)}" data-field="fact-label" data-project="${projectIndex}" data-fact="${factIndex}" placeholder="Label" />
        <input type="text" value="${WorkStore.escapeHtml(fact.value)}" data-field="fact-value" data-project="${projectIndex}" data-fact="${factIndex}" placeholder="Value" />
        <button type="button" class="ownership-icon-btn ownership-danger" data-remove-fact data-project="${projectIndex}" data-fact="${factIndex}" aria-label="Remove fact">×</button>
      </div>`
    )
    .join("");
}

function renderItemFields(project, projectIndex) {
  return (project.items || [])
    .map(
      (item, itemIndex) => `
      <details class="ownership-item-panel" ${itemIndex === 0 ? "open" : ""}>
        <summary>
          <span>${WorkStore.escapeHtml(item.title || "Untitled image")}</span>
          <button type="button" class="ownership-icon-btn ownership-danger" data-remove-item data-project="${projectIndex}" data-item="${itemIndex}" aria-label="Remove image">×</button>
        </summary>
        <div class="ownership-item-grid">
          <label class="field"><span>Category</span><input type="text" value="${WorkStore.escapeHtml(item.category)}" data-field="item-category" data-project="${projectIndex}" data-item="${itemIndex}" /></label>
          <label class="field"><span>Image title</span><input type="text" value="${WorkStore.escapeHtml(item.title)}" data-field="item-title" data-project="${projectIndex}" data-item="${itemIndex}" /></label>
          <label class="field"><span>Caption detail</span><input type="text" value="${WorkStore.escapeHtml(item.span)}" data-field="item-span" data-project="${projectIndex}" data-item="${itemIndex}" placeholder="Category • detail" /></label>
          <label class="field field-full"><span>Image path (PNG/JPG)</span><input type="text" value="${WorkStore.escapeHtml(item.src)}" data-field="item-src" data-project="${projectIndex}" data-item="${itemIndex}" placeholder="assets/work/example.png" /></label>
          <label class="field field-full"><span>WebP path (optional)</span><input type="text" value="${WorkStore.escapeHtml(item.webp || "")}" data-field="item-webp" data-project="${projectIndex}" data-item="${itemIndex}" placeholder="assets/work/example.webp" /></label>
          <label class="field field-full"><span>Alt text</span><input type="text" value="${WorkStore.escapeHtml(item.alt)}" data-field="item-alt" data-project="${projectIndex}" data-item="${itemIndex}" /></label>
          <label class="field"><span>Width</span><input type="number" value="${item.width || 1024}" data-field="item-width" data-project="${projectIndex}" data-item="${itemIndex}" min="1" /></label>
          <label class="field"><span>Height</span><input type="number" value="${item.height || 683}" data-field="item-height" data-project="${projectIndex}" data-item="${itemIndex}" min="1" /></label>
        </div>
      </details>`
    )
    .join("");
}

function renderProjects() {
  if (!projectEditor) return;

  projectEditor.innerHTML = portfolioData.projects
    .map((project, projectIndex) => {
      const preview = WorkStore.renderProject(project, { preview: true });
      return `
      <details class="ownership-project" data-project-index="${projectIndex}" open>
        <summary class="ownership-project-summary">
          <span>${WorkStore.escapeHtml(project.title)}${project.titleSub ? ` · ${WorkStore.escapeHtml(project.titleSub)}` : ""}</span>
          <span class="ownership-project-meta">${(project.items || []).length} image${project.items.length === 1 ? "" : "s"}</span>
        </summary>
        <div class="ownership-project-body">
          <div class="ownership-grid-2">
            <label class="field"><span>Project title</span><input type="text" value="${WorkStore.escapeHtml(project.title)}" data-field="title" data-project="${projectIndex}" /></label>
            <label class="field"><span>Title suffix (optional)</span><input type="text" value="${WorkStore.escapeHtml(project.titleSub || "")}" data-field="titleSub" data-project="${projectIndex}" placeholder="of Raleigh" /></label>
            <label class="field"><span>Meta line</span><input type="text" value="${WorkStore.escapeHtml(project.meta)}" data-field="meta" data-project="${projectIndex}" /></label>
            <label class="field"><span>Tag</span><input type="text" value="${WorkStore.escapeHtml(project.tag)}" data-field="tag" data-project="${projectIndex}" /></label>
            <label class="field"><span>Project ID</span><input type="text" value="${WorkStore.escapeHtml(project.id)}" data-field="id" data-project="${projectIndex}" /></label>
            <label class="field"><span>Case study eyebrow</span><input type="text" value="${WorkStore.escapeHtml(project.caseStudy.eyebrow)}" data-field="eyebrow" data-project="${projectIndex}" /></label>
            <label class="field field-full"><span>Case study subtitle</span><input type="text" value="${WorkStore.escapeHtml(project.caseStudy.sub)}" data-field="sub" data-project="${projectIndex}" /></label>
          </div>

          <div class="ownership-subsection">
            <div class="ownership-subsection-head">
              <h3>Case study facts</h3>
              <button type="button" class="btn btn-ghost btn-small" data-add-fact data-project="${projectIndex}">+ Add fact</button>
            </div>
            <div class="ownership-facts">${renderFactFields(project, projectIndex)}</div>
          </div>

          <div class="ownership-subsection">
            <label class="field field-full"><span>Overview</span><textarea rows="4" data-field="overview" data-project="${projectIndex}">${WorkStore.escapeHtml(project.caseStudy.overview)}</textarea></label>
            <label class="field field-full"><span>Outcome</span><textarea rows="4" data-field="outcome" data-project="${projectIndex}">${WorkStore.escapeHtml(project.caseStudy.outcome)}</textarea></label>
          </div>

          <div class="ownership-subsection">
            <div class="ownership-subsection-head">
              <h3>Work images</h3>
              <button type="button" class="btn btn-ghost btn-small" data-add-item data-project="${projectIndex}">+ Add image</button>
            </div>
            <div class="ownership-items">${renderItemFields(project, projectIndex)}</div>
          </div>

          <div class="ownership-subsection">
            <h3>Preview</h3>
            <div class="ownership-preview">${preview}</div>
          </div>

          <div class="ownership-project-footer">
            <button type="button" class="btn btn-ghost" data-restore-project data-project-id="${WorkStore.escapeHtml(project.id)}">Restore default</button>
            <button type="button" class="btn btn-ghost ownership-danger" data-remove-project data-project="${projectIndex}">Delete project</button>
          </div>
        </div>
      </details>`;
    })
    .join("");
}

function updatePreviews() {
  document.querySelectorAll(".ownership-project").forEach((panel) => {
    const projectIndex = Number(panel.dataset.projectIndex);
    const project = getProject(projectIndex);
    const preview = panel.querySelector(".ownership-preview");
    if (project && preview) preview.innerHTML = WorkStore.renderProject(project, { preview: true });
  });
}

function updateSummaryLabels() {
  document.querySelectorAll(".ownership-project").forEach((panel) => {
    const projectIndex = Number(panel.dataset.projectIndex);
    const project = getProject(projectIndex);
    if (!project) return;
    const summaryLabel = panel.querySelector(".ownership-project-summary > span:first-child");
    const summaryMeta = panel.querySelector(".ownership-project-meta");
    if (summaryLabel) {
      summaryLabel.textContent = project.titleSub
        ? `${project.title} · ${project.titleSub}`
        : project.title;
    }
    if (summaryMeta) {
      const count = (project.items || []).length;
      summaryMeta.textContent = `${count} image${count === 1 ? "" : "s"}`;
    }
  });
}

let previewTimer = null;
function schedulePreviewUpdate() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    updatePreviews();
    updateSummaryLabels();
  }, 280);
}

function renderMissingProjects() {
  const container = document.getElementById("missingProjects");
  if (!container) return;

  const missing = WorkStore.getMissingProjectIds(portfolioData);
  if (!missing.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const labels = {
    tradeverified: "TradeVerified",
    scopesignal: "ScopeSignal",
    maxeimus: "Maxeimus of Raleigh",
    bcm: "Blue Collar Millionaire",
    knightsplay: "Knights Play Golf Center — concept",
    ashfordvale: "Ashford Vale LLP — concept",
    harborglobal: "Harbor Global LLP — concept",
    saltmarsh: "Saltmarsh Co. — concept",
    halden: "Halden Build, concept",
    ashgrove: "Ashgrove Custom Homes, concept",
  };

  container.hidden = false;
  container.innerHTML = `
    <p><strong>Removed projects:</strong> ${missing.map((id) => labels[id] || id).join(", ")}</p>
    <div class="ownership-missing-actions">
      ${missing
        .map(
          (id) =>
            `<button type="button" class="btn btn-ghost" data-restore-project data-project-id="${WorkStore.escapeHtml(id)}">Restore ${WorkStore.escapeHtml(labels[id] || id)}</button>`
        )
        .join("")}
    </div>`;
}

function restoreProjectById(id) {
  const labels = {
    tradeverified: "TradeVerified",
    scopesignal: "ScopeSignal",
    maxeimus: "Maxeimus of Raleigh",
    bcm: "Blue Collar Millionaire",
    knightsplay: "Knights Play Golf Center — concept",
    ashfordvale: "Ashford Vale LLP — concept",
    harborglobal: "Harbor Global LLP — concept",
    saltmarsh: "Saltmarsh Co. — concept",
    halden: "Halden Build, concept",
    ashgrove: "Ashgrove Custom Homes, concept",
  };
  const label = labels[id] || id;
  if (!confirm(`Restore "${label}" to its original default content?`)) return;
  portfolioData = WorkStore.restoreProject(portfolioData, id);
  persist(`${label} restored`);
  renderAll();
}

function renderAll() {
  renderContractStageNav();
  renderContractLibrary();
  renderLicenses();
  renderMissingProjects();
  renderProjects();
}

function getProject(index) {
  return portfolioData.projects[index];
}

function bindAdminEvents() {
  contractStageNav?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stage]");
    if (!btn) return;
    activeContractStage = btn.dataset.stage;
    renderContractStageNav();
    renderContractLibrary();
  });

  contractSearch?.addEventListener("input", (e) => {
    contractSearchQuery = e.target.value.trim();
    renderContractLibrary();
  });

  projectEditor?.addEventListener("input", (e) => {
    const target = e.target;
    const projectIndex = Number(target.dataset.project);
    const itemIndex = Number(target.dataset.item);
    const factIndex = Number(target.dataset.fact);
    const project = getProject(projectIndex);
    if (!project) return;

    const field = target.dataset.field;
    if (!field) return;

    if (field === "title") project.title = target.value;
    else if (field === "titleSub") project.titleSub = target.value;
    else if (field === "meta") project.meta = target.value;
    else if (field === "tag") project.tag = target.value;
    else if (field === "id") project.id = WorkStore.slugify(target.value) || project.id;
    else if (field === "eyebrow") project.caseStudy.eyebrow = target.value;
    else if (field === "sub") project.caseStudy.sub = target.value;
    else if (field === "overview") project.caseStudy.overview = target.value;
    else if (field === "outcome") project.caseStudy.outcome = target.value;
    else if (field.startsWith("fact-")) {
      const fact = project.caseStudy.facts[factIndex];
      if (!fact) return;
      if (field === "fact-label") fact.label = target.value;
      if (field === "fact-value") fact.value = target.value;
    } else if (field.startsWith("item-")) {
      const item = project.items[itemIndex];
      if (!item) return;
      if (field === "item-category") item.category = target.value;
      if (field === "item-title") item.title = target.value;
      if (field === "item-span") item.span = target.value;
      if (field === "item-src") item.src = target.value;
      if (field === "item-webp") item.webp = target.value;
      if (field === "item-alt") item.alt = target.value;
      if (field === "item-width") item.width = Number(target.value) || 1024;
      if (field === "item-height") item.height = Number(target.value) || 683;
    }

    persist("Saved");
    schedulePreviewUpdate();
  });

  projectEditor?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const projectIndex = Number(btn.dataset.project);
    const itemIndex = Number(btn.dataset.item);
    const factIndex = Number(btn.dataset.fact);

    if (btn.hasAttribute("data-add-item")) {
      getProject(projectIndex)?.items.push(WorkStore.newWorkItem());
      persist("Image added");
      renderProjects();
      return;
    }

    if (btn.hasAttribute("data-add-fact")) {
      getProject(projectIndex)?.caseStudy.facts.push({ label: "Label", value: "Value" });
      persist("Fact added");
      renderProjects();
      return;
    }

    if (btn.hasAttribute("data-remove-item")) {
      e.preventDefault();
      e.stopPropagation();
      const item = getProject(projectIndex)?.items[itemIndex];
      const label = item?.title || "this image";
      if (!confirm(`Remove "${label}" from the project?`)) return;
      getProject(projectIndex)?.items.splice(itemIndex, 1);
      persist("Image removed");
      renderProjects();
      return;
    }

    if (btn.hasAttribute("data-remove-fact")) {
      if (!confirm("Remove this case study fact?")) return;
      getProject(projectIndex)?.caseStudy.facts.splice(factIndex, 1);
      persist("Fact removed");
      renderProjects();
      return;
    }

    if (btn.hasAttribute("data-restore-project")) {
      restoreProjectById(btn.dataset.projectId);
      return;
    }

    if (btn.hasAttribute("data-remove-project")) {
      if (!confirm(`Delete "${getProject(projectIndex)?.title}" from your portfolio?`)) return;
      portfolioData.projects.splice(projectIndex, 1);
      persist("Project deleted");
      renderProjects();
    }
  });

  licenseList?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-license]");
    if (!btn) return;
    const index = Number(btn.dataset.removeLicense);
    portfolioData.licenses.splice(index, 1);
    persist("Agreement removed");
    renderLicenses();
  });

  addLicenseForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("licenseTitle").value.trim();
    const href = document.getElementById("licenseHref").value.trim();
    const description = document.getElementById("licenseDesc").value.trim();
    if (!title || !href) return;
    portfolioData.licenses.push({ title, href, description });
    addLicenseForm.reset();
    persist("Agreement added");
    renderLicenses();
  });

  addProjectBtn?.addEventListener("click", () => {
    portfolioData.projects.push(WorkStore.newProject());
    persist("Project added");
    renderProjects();
  });

  exportBtn?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brandon-fonville-portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
    setSaveStatus("Portfolio exported", "success");
  });

  importInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.projects)) throw new Error("Invalid file");
      portfolioData = {
        projects: parsed.projects,
        licenses: Array.isArray(parsed.licenses) ? parsed.licenses : portfolioData.licenses,
      };
      persist("Portfolio imported");
      renderAll();
    } catch {
      setSaveStatus("Import failed — check the JSON file", "error");
    }
    importInput.value = "";
  });

  resetBtn?.addEventListener("click", () => {
    if (!confirm("Reset all work and license data to the original defaults? This cannot be undone.")) return;
    portfolioData = WorkStore.reset();
    persist("Reset to defaults");
    renderAll();
  });

  document.getElementById("missingProjects")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-restore-project]");
    if (!btn) return;
    restoreProjectById(btn.dataset.projectId);
  });
}

function setLoginStatus(message, kind) {
  if (!loginStatus) return;
  loginStatus.textContent = message || "";
  loginStatus.className = "form-status" + (kind ? " " + kind : "");
}

async function checkSession() {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.authenticated;
  } catch (err) {
    console.error("Session check failed:", err);
    return false;
  }
}

async function attemptLogin(e) {
  e?.preventDefault?.();
  e?.stopPropagation?.();
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = (emailInput?.value || "").trim();
  const password = passwordInput?.value || "";

  if (!email || !password) {
    setLoginStatus("Enter your email and password.", "error");
    (email ? passwordInput : emailInput)?.focus();
    return false;
  }

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.disabled = true;
  setLoginStatus("Signing in…");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      setLoginStatus(data?.error || "Incorrect email or password.", "error");
      passwordInput?.focus();
      return false;
    }
    setLoginStatus("");
    if (passwordInput) passwordInput.value = "";
    showAdmin();
    return true;
  } catch (err) {
    console.error("Ownership login failed:", err);
    setLoginStatus("Sign-in hit an error. Refresh and try again.", "error");
    return false;
  } finally {
    if (loginBtn) loginBtn.disabled = false;
  }
}

function wireLoginControls() {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  loginBtn?.addEventListener("click", attemptLogin);
  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      attemptLogin(e);
    }
  };
  emailInput?.addEventListener("keydown", onEnter);
  passwordInput?.addEventListener("keydown", onEnter);
  loginForm?.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter" && (e.target === emailInput || e.target === passwordInput)) {
        e.preventDefault();
        attemptLogin(e);
      }
    },
    true
  );
}

wireLoginControls();

logoutBtn?.addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }
  showLogin();
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";
  setLoginStatus("");
});

bindAdminEvents();

(async () => {
  try {
    if (await checkSession()) {
      showAdmin();
    } else {
      showLogin();
    }
  } catch (err) {
    console.error("Ownership init failed:", err);
    showLogin();
  }
})();
