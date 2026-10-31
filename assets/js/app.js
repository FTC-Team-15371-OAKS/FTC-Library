(() => {
  const config = window.SITE_CONFIG;
  const els = {
    search: document.getElementById("search-input"),
    categoryChips: document.getElementById("category-chips"),
    seasonFilter: document.getElementById("season-filter"),
    teamFilter: document.getElementById("team-filter"),
    clearFilters: document.getElementById("clear-filters"),
    resultCount: document.getElementById("result-count"),
    grid: document.getElementById("resource-grid"),
    empty: document.getElementById("empty-state"),
    emptyTitle: document.getElementById("empty-title"),
    emptyCopy: document.getElementById("empty-copy"),
    emptyAction: document.getElementById("empty-action"),
    statResources: document.getElementById("stat-resources"),
    statCategories: document.getElementById("stat-categories"),
    statSeasons: document.getElementById("stat-seasons"),
    dialog: document.getElementById("resource-dialog"),
    dialogContent: document.getElementById("dialog-content"),
    dialogClose: document.getElementById("dialog-close"),
  };

  if (!els.grid || !config) return;

  const ICONS = {
    library:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h5v13H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 5.5h5v13H9zM14 5.5h5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-5z" stroke="currentColor" stroke-width="1.7"/></svg>',
    portfolio:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3.75h7l4 4v12.5a1.75 1.75 0 0 1-1.75 1.75h-9.5A1.75 1.75 0 0 1 5 20.25V5.5A1.75 1.75 0 0 1 6.75 3.75Z" stroke="currentColor" stroke-width="1.7"/><path d="M13.5 3.75V8H18M8.5 12h7M8.5 15.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    cad:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    programming:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    electronics:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 4v3M14.5 4v3M9.5 17v3M14.5 17v3M4 9.5h3M4 14.5h3M17 9.5h3M17 14.5h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="10.5" y="10.5" width="3" height="3" rx=".5" fill="currentColor"/></svg>',
    documentation:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.5 5.5A2.5 2.5 0 0 1 8 3h10.5v16H8a2.5 2.5 0 0 0-2.5 2.5V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5.5 18.5A2.5 2.5 0 0 1 8 16h10.5M9 7h5M9 10.5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    tools:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.2L4 16.4 7.6 20l5.7-5.7a3.5 3.5 0 0 0 4.2-4.8l-2.3 2.3-2.6-.6-.6-2.6 2.5-2.1Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowUpRight:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowRight:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download:
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m-3-3 3 3 3-3M3 12.5h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const state = {
    resources: [],
    categories: [],
    categoryById: new Map(),
    resourceById: new Map(),
    query: "",
    category: "all",
    season: "",
    team: "",
    resourceId: null,
  };

  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => escapeMap[character]);
  }

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function isValidHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function safeUrl(value) {
    return isValidHttpUrl(value) ? value : "";
  }

  function encodePath(value) {
    return String(value ?? "")
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  function categoryFor(resource) {
    return state.categoryById.get(resource.category);
  }

  function categoryName(resource) {
    return categoryFor(resource)?.name || resource.category;
  }

  function categoryIcon(resource) {
    const icon = categoryFor(resource)?.icon || "tools";
    return ICONS[icon] || ICONS.tools;
  }

  function teamLabel(resource) {
    if (resource.teamNumber && resource.teamName) {
      return `Team ${resource.teamNumber} · ${resource.teamName}`;
    }
    if (resource.teamNumber) return `Team ${resource.teamNumber}`;
    return resource.teamName || "Community";
  }

  function sortedSeasons() {
    const seasons = [...new Set(state.resources.map((resource) => resource.season))];
    return seasons.sort((a, b) => {
      const aYear = /^(\d{4})-\d{2,4}$/.exec(a);
      const bYear = /^(\d{4})-\d{2,4}$/.exec(b);
      if (aYear && bYear) return Number(bYear[1]) - Number(aYear[1]);
      if (aYear) return -1;
      if (bYear) return 1;
      return a.localeCompare(b);
    });
  }

  function sortedTeams() {
    const teams = new Map();
    for (const resource of state.resources) {
      if (resource.teamNumber && !teams.has(resource.teamNumber)) {
        teams.set(resource.teamNumber, resource.teamName || "");
      }
    }
    return [...teams.entries()].sort(
      ([a], [b]) => Number(a) - Number(b) || a.localeCompare(b)
    );
  }

  function filterParams() {
    const params = new URLSearchParams();
    if (state.query.trim()) params.set("q", state.query.trim());
    if (state.category !== "all") params.set("category", state.category);
    if (state.season) params.set("season", state.season);
    if (state.team) params.set("team", state.team);
    return params;
  }

  function resourceUrl(id) {
    const params = filterParams();
    params.set("resource", id);
    return `?${params.toString()}`;
  }

  function updateUrl(mode = "replace") {
    const params = filterParams();
    if (state.resourceId) params.set("resource", state.resourceId);
    const nextUrl = `${location.pathname}${params.toString() ? `?${params}` : ""}${location.hash}`;
    if (mode === "push") {
      history.pushState({}, "", nextUrl);
    } else {
      history.replaceState({}, "", nextUrl);
    }
  }

  function applyUrlState() {
    const params = new URLSearchParams(location.search);
    state.query = params.get("q") || "";

    const requestedCategory = params.get("category") || "all";
    state.category =
      requestedCategory === "all" || state.categoryById.has(requestedCategory)
        ? requestedCategory
        : "all";

    const validSeasons = new Set(state.resources.map((resource) => resource.season));
    const requestedSeason = params.get("season") || "";
    state.season = validSeasons.has(requestedSeason) ? requestedSeason : "";

    const validTeams = new Set(
      state.resources.map((resource) => resource.teamNumber).filter(Boolean)
    );
    const requestedTeam = params.get("team") || "";
    state.team = validTeams.has(requestedTeam) ? requestedTeam : "";

    const requestedResource = params.get("resource") || "";
    state.resourceId = state.resourceById.has(requestedResource) ? requestedResource : null;

    els.search.value = state.query;
    els.seasonFilter.value = state.season;
    els.teamFilter.value = state.team;
  }

  function renderStats() {
    const seasons = new Set(state.resources.map((resource) => resource.season));
    els.statResources.textContent = String(state.resources.length);
    els.statCategories.textContent = String(state.categories.length);
    els.statSeasons.textContent = String(seasons.size);
  }

  function renderCategoryChips() {
    const counts = new Map();
    for (const resource of state.resources) {
      counts.set(resource.category, (counts.get(resource.category) || 0) + 1);
    }

    const chips = [
      { id: "all", name: "All resources", icon: "library", count: state.resources.length },
      ...state.categories.map((category) => ({
        ...category,
        count: counts.get(category.id) || 0,
      })),
    ];

    els.categoryChips.innerHTML = chips
      .map(
        (category) => `
          <button
            class="category-chip"
            type="button"
            data-category="${escapeHtml(category.id)}"
            aria-pressed="false"
          >
            ${ICONS[category.icon] || ICONS.library}
            <span>${escapeHtml(category.name)}</span>
            <span class="chip-count">${category.count}</span>
          </button>`
      )
      .join("");
    syncCategoryChips();
  }

  function syncCategoryChips() {
    els.categoryChips.querySelectorAll("[data-category]").forEach((chip) => {
      const active = chip.dataset.category === state.category;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }

  function renderSeasonOptions() {
    const current = state.season;
    els.seasonFilter.innerHTML = [
      '<option value="">All seasons</option>',
      ...sortedSeasons().map(
        (season) => `<option value="${escapeHtml(season)}">${escapeHtml(season)}</option>`
      ),
    ].join("");
    els.seasonFilter.value = current;
  }

  function renderTeamOptions() {
    const current = state.team;
    els.teamFilter.innerHTML = [
      '<option value="">All teams</option>',
      ...sortedTeams().map(([number, name]) => {
        const label = name ? `#${number} · ${name}` : `#${number}`;
        return `<option value="${escapeHtml(number)}">${escapeHtml(label)}</option>`;
      }),
    ].join("");
    els.teamFilter.value = current;
  }

  function filteredResources() {
    const tokens = normalize(state.query)
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token.replace(/^#/, ""));

    return state.resources
      .filter((resource) => {
        if (state.category !== "all" && resource.category !== state.category) return false;
        if (state.season && resource.season !== state.season) return false;
        if (state.team && resource.teamNumber !== state.team) return false;
        if (tokens.length === 0) return true;

        const category = categoryFor(resource);
        const haystack = normalize(
          [
            resource.name,
            resource.description,
            resource.teamNumber,
            resource.teamName,
            resource.teamNumber ? "team" : "",
            resource.season,
            resource.attribution,
            resource.license,
            category?.name,
            category?.id,
            (resource.tags || []).join(" "),
            (resource.links || []).map((link) => link.label).join(" "),
          ]
            .filter(Boolean)
            .join(" ")
        );

        return tokens.every((token) => haystack.includes(token));
      })
      .sort(
        (a, b) =>
          String(b.addedAt).localeCompare(String(a.addedAt)) ||
          a.name.localeCompare(b.name)
      );
  }

  function tagRow(tags, limit) {
    const visible = (tags || []).slice(0, limit ?? tags.length);
    if (visible.length === 0) return "";
    return `<div class="tag-row">${visible
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("")}</div>`;
  }

  function cardTemplate(resource) {
    return `
      <a
        class="resource-card"
        href="${escapeHtml(resourceUrl(resource.id))}"
        data-resource-id="${escapeHtml(resource.id)}"
        data-category="${escapeHtml(resource.category)}"
      >
        <div class="card-top">
          <span class="category-badge">
            ${categoryIcon(resource)}
            <span>${escapeHtml(categoryName(resource))}</span>
          </span>
          <span class="season-badge">${escapeHtml(resource.season)}</span>
        </div>
        <h3>${escapeHtml(resource.name)}</h3>
        <p>${escapeHtml(resource.description)}</p>
        ${tagRow(resource.tags, 3)}
        <div class="card-footer">
          <span class="card-team">${escapeHtml(teamLabel(resource))}</span>
          <span class="card-cta">View details ${ICONS.arrowRight}</span>
        </div>
      </a>`;
  }

  function hasActiveFilters() {
    return Boolean(
      state.query.trim() || state.category !== "all" || state.season || state.team
    );
  }

  function render() {
    const resources = filteredResources();
    const total = state.resources.length;
    const active = hasActiveFilters();

    syncCategoryChips();
    els.seasonFilter.value = state.season;
    els.teamFilter.value = state.team;
    els.clearFilters.hidden = !active;

    if (total === 0) {
      els.resultCount.textContent = "0 resources";
    } else if (active) {
      els.resultCount.innerHTML = `<strong>${resources.length}</strong> of ${total} resources`;
    } else {
      els.resultCount.innerHTML = `<strong>${total}</strong> ${
        total === 1 ? "resource" : "resources"
      }`;
    }

    els.grid.innerHTML = resources.map(cardTemplate).join("");
    els.grid.hidden = resources.length === 0;
    els.empty.hidden = resources.length !== 0;
    els.empty.classList.remove("empty-state--error");

    if (resources.length === 0) {
      if (total === 0) {
        els.emptyTitle.textContent = "The library is ready for its first resource.";
        els.emptyCopy.textContent =
          "Share an engineering portfolio, CAD model, programming library, or guide to get the library started.";
        els.emptyAction.textContent = "Submit a resource";
        els.emptyAction.dataset.action = "submit";
      } else {
        els.emptyTitle.textContent = "No resources match those filters.";
        els.emptyCopy.textContent =
          "Try a broader search, clear a filter, or submit the resource you were hoping to find.";
        els.emptyAction.textContent = "Clear filters";
        els.emptyAction.dataset.action = "clear";
      }
    }
  }

  function renderDialog(resource) {
    const category = categoryFor(resource);
    const links = (resource.links || []).filter(
      (link) => link && isValidHttpUrl(link.url)
    );
    const files = resource.files || [];
    const source = safeUrl(resource.source);

    const primaryLink = links[0];
    const primaryFile = files[0];
    const primaryLabel = primaryLink?.label || (source ? "View original source" : "");
    const isExternalPrimary = Boolean(primaryLink || source);

    const primaryHref = primaryLink?.url || source || (primaryFile ? encodePath(primaryFile.path) : "");
    const primaryAnchor = primaryHref
      ? `<a class="button button--primary" href="${escapeHtml(primaryHref)}"${
          isExternalPrimary ? ' target="_blank" rel="noopener noreferrer"' : " download"
        }>${escapeHtml(primaryLabel || `Download ${primaryFile.name}`)} ${ICONS.arrowUpRight}</a>`
      : "";

    els.dialogContent.innerHTML = `
      <div class="dialog-kicker">
        <span class="category-badge" data-category="${escapeHtml(resource.category)}">
          ${categoryIcon(resource)}
          <span>${escapeHtml(category?.name || resource.category)}</span>
        </span>
        <span class="season-badge">${escapeHtml(resource.season)}</span>
      </div>
      <h2 class="dialog-title" id="resource-dialog-title">${escapeHtml(resource.name)}</h2>
      <p class="dialog-description">${escapeHtml(resource.description)}</p>

      <dl class="dialog-meta">
        <div class="meta-item">
          <dt>Team</dt>
          <dd>${escapeHtml(teamLabel(resource))}</dd>
        </div>
        <div class="meta-item">
          <dt>Season</dt>
          <dd>${escapeHtml(resource.season)}</dd>
        </div>
        <div class="meta-item">
          <dt>Category</dt>
          <dd>${escapeHtml(category?.name || resource.category)}</dd>
        </div>
        <div class="meta-item">
          <dt>License</dt>
          <dd>${escapeHtml(resource.license)}</dd>
        </div>
        <div class="meta-item">
          <dt>Attribution</dt>
          <dd>${escapeHtml(resource.attribution)}</dd>
        </div>
        <div class="meta-item">
          <dt>Added</dt>
          <dd>${escapeHtml(formatDate(resource.addedAt))}</dd>
        </div>
      </dl>

      ${
        links.length
          ? `<div class="dialog-section">
              <h3>Links</h3>
              <div class="link-list">
                ${links
                  .map(
                    (link) => `
                      <a class="resource-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                        <span>${escapeHtml(link.label)}</span>
                        <span>Open ${ICONS.arrowUpRight}</span>
                      </a>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }

      ${
        files.length
          ? `<div class="dialog-section">
              <h3>Files</h3>
              <div class="file-list">
                ${files
                  .map(
                    (file) => `
                      <a class="resource-link" href="${escapeHtml(encodePath(file.path))}" download>
                        <span>${escapeHtml(file.name)}</span>
                        <span>${escapeHtml(file.type || "Download")} ${ICONS.download}</span>
                      </a>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }

      ${
        resource.tags?.length
          ? `<div class="dialog-section">
              <h3>Tags</h3>
              <div class="dialog-tags">${tagRow(resource.tags)}</div>
            </div>`
          : ""
      }

      <div class="dialog-actions">
        ${primaryAnchor}
        <button class="button button--outline" type="button" data-copy-resource-link>
          Copy link
        </button>
      </div>

      ${
        source
          ? `<p class="dialog-source">Original source: <a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source)}</a></p>`
          : ""
      }
    `;

  }

  function openResource(id, { push = false, focus = true } = {}) {
    const resource = state.resourceById.get(id);
    if (!resource) return;

    state.resourceId = id;
    renderDialog(resource);
    if (!els.dialog.open) els.dialog.showModal();
    document.body.classList.add("dialog-open");
    updateUrl(push ? "push" : "replace");

    if (focus) {
      requestAnimationFrame(() => els.dialogClose.focus());
    }
  }

  function closeResource() {
    if (els.dialog.open) els.dialog.close();
  }

  function clearFilters() {
    state.query = "";
    state.category = "all";
    state.season = "";
    state.team = "";
    els.search.value = "";
    els.seasonFilter.value = "";
    els.teamFilter.value = "";
    updateUrl();
    render();
  }

  function showLoadError(error) {
    console.error("FTC-Library data could not be loaded.", error);
    els.grid.innerHTML = "";
    els.grid.hidden = true;
    els.grid.setAttribute("aria-busy", "false");
    els.resultCount.textContent = "Library unavailable";
    els.empty.hidden = false;
    els.empty.classList.add("empty-state--error");
    els.emptyTitle.textContent = "The library could not load.";
    els.emptyCopy.textContent =
      "Check your connection or open the resource data directly. If you are running the site locally, start a local server instead of opening the file directly.";
    els.emptyAction.textContent = "View resource data";
    els.emptyAction.dataset.action = "data";
  }

  function bindEvents() {
    els.search.addEventListener("input", () => {
      state.query = els.search.value;
      updateUrl();
      render();
    });

    els.categoryChips.addEventListener("click", (event) => {
      const chip = event.target.closest("button[data-category]");
      if (!chip) return;
      state.category = chip.dataset.category;
      updateUrl();
      render();
    });

    els.seasonFilter.addEventListener("change", () => {
      state.season = els.seasonFilter.value;
      updateUrl();
      render();
    });

    els.teamFilter.addEventListener("change", () => {
      state.team = els.teamFilter.value;
      updateUrl();
      render();
    });

    els.clearFilters.addEventListener("click", clearFilters);

    els.emptyAction.addEventListener("click", () => {
      const action = els.emptyAction.dataset.action;
      if (action === "submit") {
        location.href = "submit.html";
      } else if (action === "data") {
        location.href = "data/resources.json";
      } else {
        clearFilters();
      }
    });

    els.grid.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const card = event.target.closest("[data-resource-id]");
      if (!card) return;
      event.preventDefault();
      openResource(card.dataset.resourceId, { push: true });
    });

    els.dialogClose.addEventListener("click", closeResource);

    els.dialog.addEventListener("click", async (event) => {
      if (event.target === els.dialog) {
        closeResource();
        return;
      }
      const copyButton = event.target.closest("[data-copy-resource-link]");
      if (copyButton) {
        const copied = await window.copyText(location.href);
        window.showToast(copied ? "Resource link copied." : "Could not copy the link.");
      }
    });

    els.dialog.addEventListener("close", () => {
      const hadResource = state.resourceId !== null;
      state.resourceId = null;
      document.body.classList.remove("dialog-open");
      if (hadResource) updateUrl();
    });

    window.addEventListener("popstate", () => {
      applyUrlState();
      render();
      if (state.resourceId) {
        openResource(state.resourceId, { push: false, focus: false });
      } else if (els.dialog.open) {
        els.dialog.close();
      }
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        els.search.focus();
        els.search.select();
        return;
      }

      if (event.key === "Escape" && document.activeElement === els.search) {
        if (state.query) {
          state.query = "";
          els.search.value = "";
          updateUrl();
          render();
        } else {
          els.search.blur();
        }
      }
    });
  }

  async function init() {
    bindEvents();

    try {
      const response = await fetch(config.dataPath, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Resource data returned ${response.status}.`);
      }
      const data = await response.json();

      if (
        !data ||
        !Array.isArray(data.categories) ||
        !Array.isArray(data.resources)
      ) {
        throw new Error("Resource data is missing categories or resources.");
      }

      state.categories = data.categories;
      state.resources = data.resources;
      state.categoryById = new Map(
        state.categories.map((category) => [category.id, category])
      );
      state.resourceById = new Map(
        state.resources.map((resource) => [resource.id, resource])
      );

      renderStats();
      renderCategoryChips();
      renderSeasonOptions();
      renderTeamOptions();
      applyUrlState();
      render();

      els.grid.setAttribute("aria-busy", "false");

      if (state.resourceId) {
        openResource(state.resourceId, { push: false, focus: false });
      }
    } catch (error) {
      showLoadError(error);
    }
  }

  init();
})();
