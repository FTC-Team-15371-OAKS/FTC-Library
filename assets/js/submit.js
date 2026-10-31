(() => {
  const config = window.SITE_CONFIG;
  const form = document.getElementById("submission-form");
  if (!form || !config) return;

  const els = {
    openIssue: document.getElementById("open-issue"),
    copyJson: document.getElementById("copy-json"),
    downloadJson: document.getElementById("download-json"),
    error: document.getElementById("form-error"),
    manualIssue: document.getElementById("manual-issue-link"),
    metadataPreview: document.getElementById("metadata-preview"),
    summaryName: document.getElementById("summary-name"),
    summaryTeam: document.getElementById("summary-team"),
    summarySeason: document.getElementById("summary-season"),
    summaryCategory: document.getElementById("summary-category"),
    summaryLicense: document.getElementById("summary-license"),
    summaryLinks: document.getElementById("summary-links"),
    season: document.getElementById("season"),
    category: document.getElementById("category"),
    links: document.getElementById("resource-links"),
  };

  const state = {
    categories: config.categoryFallback || [],
    categoryLabels: new Map(),
    fetchingCategories: false,
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

  function fieldValue(name) {
    const element = form.elements.namedItem(name);
    return element ? String(element.value || "") : "";
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "");
  }

  function makeId(name, teamNumber) {
    const team = teamNumber || "community";
    return `team-${team}-${slugify(name) || "resource"}`.slice(0, 96).replace(/-+$/g, "");
  }

  function isValidHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function parseTags(value) {
    const seen = new Set();
    return String(value || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => {
        if (!tag) return false;
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }

  function parseLinks(value) {
    const valid = [];
    const invalid = [];
    const seen = new Set();

    String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (!isValidHttpUrl(line)) {
          invalid.push(line);
          return;
        }
        const url = new URL(line).href;
        if (!seen.has(url)) {
          seen.add(url);
          valid.push(url);
        }
      });

    return { valid, invalid };
  }

  function linkLabel(url) {
    let hostname = "";
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Open link";
    }

    const hosts = {
      "github.com": "View GitHub repository",
      "cad.onshape.com": "Open Onshape document",
      "drive.google.com": "Open Google Drive file",
      "docs.google.com": "Open Google document",
      "youtube.com": "Watch on YouTube",
      "youtu.be": "Watch on YouTube",
    };

    return (hosts[hostname] || `Open ${hostname}`).slice(0, 80);
  }

  function buildSeasons() {
    const now = new Date();
    const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    const seasons = ["Every season", "Multiple seasons"];

    for (let year = startYear; year >= startYear - 10; year -= 1) {
      seasons.push(`${year}-${String((year + 1) % 100).padStart(2, "0")}`);
    }

    return seasons;
  }

  function populateSelect(select, placeholder, options) {
    const current = select.value;
    select.innerHTML = [
      `<option value="">${escapeHtml(placeholder)}</option>`,
      ...options.map(
        (option) =>
          `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
      ),
    ].join("");

    if ([...select.options].some((option) => option.value === current)) {
      select.value = current;
    }
  }

  function populateCategories(categories) {
    state.categories = categories;
    state.categoryLabels = new Map(categories.map((category) => [category.id, category.name]));
    populateSelect(
      els.category,
      "Select a category",
      categories.map((category) => ({ value: category.id, label: category.name }))
    );
  }

  function populateSeasons() {
    populateSelect(
      els.season,
      "Select a season",
      buildSeasons().map((season) => ({ value: season, label: season }))
    );
  }

  function readSubmission() {
    const links = parseLinks(fieldValue("links"));
    return {
      name: fieldValue("name").trim(),
      teamNumber: fieldValue("teamNumber").trim(),
      teamName: fieldValue("teamName").trim(),
      season: fieldValue("season"),
      category: fieldValue("category"),
      description: fieldValue("description").trim(),
      tags: parseTags(fieldValue("tags")),
      links,
      attribution: fieldValue("attribution").trim(),
      source: fieldValue("source").trim(),
      license: fieldValue("license"),
      contributor: fieldValue("contributor").trim(),
    };
  }

  function buildMetadata() {
    const submission = readSubmission();
    return {
      id: makeId(submission.name, submission.teamNumber),
      name: submission.name,
      description: submission.description,
      category: submission.category,
      season: submission.season,
      teamNumber: submission.teamNumber || null,
      teamName: submission.teamName || null,
      source: submission.source || null,
      attribution: submission.attribution,
      license: submission.license,
      tags: submission.tags,
      links: submission.links.valid.map((url) => ({ label: linkLabel(url), url })),
      files: [],
      addedAt: todayIso(),
    };
  }

  function teamSummary(submission) {
    if (submission.teamNumber && submission.teamName) {
      return `#${submission.teamNumber} · ${submission.teamName}`;
    }
    if (submission.teamNumber) return `#${submission.teamNumber}`;
    return submission.teamName || "Not added yet";
  }

  function categoryLabel(categoryId) {
    return state.categoryLabels.get(categoryId) || categoryId;
  }

  function updatePreview() {
    const submission = readSubmission();
    const metadata = buildMetadata();

    els.summaryName.textContent = submission.name || "Not added yet";
    els.summaryTeam.textContent = teamSummary(submission);
    els.summarySeason.textContent = submission.season || "Not added yet";
    els.summaryCategory.textContent = categoryLabel(submission.category) || "Not added yet";
    els.summaryLicense.textContent = submission.license || "Not added yet";

    const validCount = submission.links.valid.length;
    const invalidCount = submission.links.invalid.length;
    els.summaryLinks.textContent =
      invalidCount > 0
        ? `${validCount} valid · ${invalidCount} invalid`
        : String(validCount);

    els.metadataPreview.textContent = JSON.stringify(metadata, null, 2);
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.classList.add("is-visible");
  }

  function clearError() {
    els.error.textContent = "";
    els.error.classList.remove("is-visible");
  }

  function validateForIssue() {
    clearError();
    els.links.setCustomValidity("");

    const submission = readSubmission();
    if (submission.links.invalid.length > 0) {
      const message =
        submission.links.invalid.length === 1
          ? "One link is not a valid public http(s) URL. Fix it or remove the line."
          : `${submission.links.invalid.length} links are not valid public http(s) URLs. Fix them or remove those lines.`;
      els.links.setCustomValidity(
        "Enter one valid public http(s) URL per line, or leave the field blank."
      );
      els.links.reportValidity();
      showError(message);
      return false;
    }

    if (!form.reportValidity()) {
      showError("Please complete the required fields marked above.");
      return false;
    }

    return true;
  }

  function markdownValue(value, fallback = "Not provided") {
    const text = String(value || fallback).replace(/\s+/g, " ").trim();
    return text || fallback;
  }

  function buildIssue() {
    const submission = readSubmission();
    const metadata = buildMetadata();
    const category = categoryLabel(submission.category) || "Not selected";
    const source = submission.source || "Not provided";
    const contributor = submission.contributor || "Not provided";
    const links =
      submission.links.valid.length > 0
        ? submission.links.valid
            .map((url) => `- [${linkLabel(url)}](${url})`)
            .join("\n")
        : "_No links added. Please attach files or paste links below._";

    const title = `[Resource] ${markdownValue(submission.name, "Untitled resource")} — Team ${
      submission.teamNumber || "N/A"
    }`;

    const body = [
      "## Resource submission",
      "",
      "### Summary",
      `- **Resource:** ${markdownValue(submission.name)}`,
      `- **Team:** ${markdownValue(teamSummary(submission))}`,
      `- **Season:** ${markdownValue(submission.season)}`,
      `- **Category:** ${markdownValue(category)}`,
      `- **License:** ${markdownValue(submission.license)}`,
      `- **Attribution:** ${markdownValue(submission.attribution)}`,
      `- **Source:** ${markdownValue(source)}`,
      `- **Submitted by:** ${markdownValue(contributor)}`,
      "",
      "### Description",
      "",
      markdownValue(submission.description),
      "",
      "### Links",
      "",
      links,
      "",
      "### Files",
      "",
      "Attach PDF, STEP, STL, source archives, images, or documentation by dragging them into this issue. For files over 25 MB, paste a public link instead.",
      "",
      "- [ ] Files attached or public download links provided",
      "",
      "### Metadata for maintainers",
      "",
      "```json",
      JSON.stringify(metadata, null, 2),
      "```",
      "",
      "### Contributor checklist",
      "",
      "- [x] I created this resource or have permission to share it.",
      "- [x] The team number, season, attribution, and license are accurate.",
      "- [x] I understand approved resources are public.",
      "",
      "_This issue was generated by the FTC-Library submission form._",
    ].join("\n");

    return { title, body, metadata };
  }

  function issueUrl(issue) {
    const params = new URLSearchParams();
    params.set("title", issue.title);
    params.set("body", issue.body);
    if (config.issueLabels?.length) {
      params.set("labels", config.issueLabels.join(","));
    }
    return `https://github.com/${config.repo}/issues/new?${params.toString()}`;
  }

  function openIssue() {
    if (!validateForIssue()) return;

    const issue = buildIssue();
    const url = issueUrl(issue);
    const popup = window.open(url, "_blank");

    els.manualIssue.href = url;
    els.manualIssue.classList.add("is-visible");

    if (!popup) {
      showError(
        "Your browser blocked the new tab. Use the manual issue link below to continue."
      );
      return;
    }

    try {
      popup.opener = null;
    } catch {}
    window.showToast("GitHub issue opened. Attach your files there before submitting.");
  }

  async function copyMetadata() {
    const metadata = buildMetadata();
    const copied = await window.copyText(`${JSON.stringify(metadata, null, 2)}\n`);
    window.showToast(copied ? "Metadata JSON copied." : "Could not copy the metadata.");
  }

  function downloadMetadata() {
    const metadata = buildMetadata();
    const blob = new Blob([`${JSON.stringify(metadata, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${metadata.id || "resource-submission"}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.showToast("Metadata JSON downloaded.");
  }

  async function loadCategories() {
    if (state.fetchingCategories) return;
    state.fetchingCategories = true;

    try {
      const response = await fetch(config.dataPath, { cache: "no-cache" });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        populateCategories(data.categories);
        updatePreview();
      }
    } catch (error) {
      console.warn("Could not load categories; using the built-in list.", error);
    } finally {
      state.fetchingCategories = false;
    }
  }

  function bindEvents() {
    form.addEventListener("input", (event) => {
      if (event.target === els.links) els.links.setCustomValidity("");
      clearError();
      updatePreview();
    });

    form.addEventListener("change", () => {
      clearError();
      updatePreview();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openIssue();
    });

    els.copyJson.addEventListener("click", copyMetadata);
    els.downloadJson.addEventListener("click", downloadMetadata);
  }

  populateSeasons();
  populateCategories(state.categories);
  bindEvents();
  updatePreview();
  loadCategories();
})();
