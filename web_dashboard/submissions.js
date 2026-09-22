// ==========================================================================
// Shows Submission — lists every form submitted via POST /api/submissions
// ==========================================================================

const API_BASE = window.location.origin;
const POLL_INTERVAL_MS = 2000;

const listEl = document.getElementById("submissionList");
const emptyEl = document.getElementById("emptyState");
const statusText = document.getElementById("statusText");
const syncBadge = document.getElementById("syncStatusBadge");
const totalCounter = document.getElementById("totalCounter");
const statTotal = document.getElementById("statTotal");
const statFlutter = document.getElementById("statFlutter");
const statWeb = document.getElementById("statWeb");
const statLast = document.getElementById("statLast");
const searchInput = document.getElementById("searchInput");
const screenFilter = document.getElementById("screenFilter");
const sourceFilter = document.getElementById("sourceFilter");
const resultCount = document.getElementById("resultCount");
const autoRefreshToggle = document.getElementById("autoRefreshToggle");
const appToast = document.getElementById("appToast");

let allSubmissions = [];
let knownIds = new Set();
let pollTimer = null;
let firstLoadDone = false;

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(msg, isError = false) {
  appToast.innerText = msg;
  appToast.style.background = isError ? "#EF4444" : "#10B981";
  appToast.classList.add("show");
  setTimeout(() => appToast.classList.remove("show"), 3000);
}

function formatTime(epochSeconds) {
  if (!epochSeconds) return "—";
  const d = new Date(epochSeconds * 1000);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}

function relativeTime(epochSeconds) {
  if (!epochSeconds) return "";
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - epochSeconds));
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function sourceLabel(source) {
  if (source === "web_simulator") return "🌐 Web Simulator";
  if (source === "flutter_app") return "📱 Flutter App";
  return `🔗 ${source || "unknown"}`;
}

function renderFieldValue(value) {
  if (value === true) return `<span class="sub-field-value bool-yes">✓ Yes</span>`;
  if (value === false) return `<span class="sub-field-value bool-no">✗ No</span>`;
  if (value === null || value === undefined || String(value).trim() === "") {
    return `<span class="sub-field-value empty">(empty)</span>`;
  }
  if (typeof value === "object") {
    return `<span class="sub-field-value">${escapeHtml(JSON.stringify(value))}</span>`;
  }
  return `<span class="sub-field-value">${escapeHtml(value)}</span>`;
}

function renderCard(sub, isNew) {
  const isWeb = sub.source === "web_simulator";
  const fields = Array.isArray(sub.fields) ? sub.fields : [];
  const rows = fields.length
    ? fields.map(f => `
        <tr>
          <td class="sub-field-label">${escapeHtml(f.label || f.id)}</td>
          <td>${renderFieldValue(f.value)}</td>
        </tr>`).join("")
    : `<tr><td class="sub-field-label" colspan="2"><span class="sub-field-value empty">No field values captured</span></td></tr>`;

  return `
    <article class="sub-card ${isNew ? "is-new" : ""}" data-id="${sub.id}">
      <div class="sub-card-head">
        <div>
          <span class="sub-card-title">${escapeHtml(sub.screen_title || sub.screen_id)}</span>
          <div class="sub-card-meta">
            <span>Screen <code>${escapeHtml(sub.screen_id)}</code></span>
            <span>Action <code>${escapeHtml(sub.action_id)}</code></span>
          </div>
        </div>
        <div class="sub-badges">
          <span class="sub-badge ${isWeb ? "web" : "flutter"}">${sourceLabel(sub.source)}</span>
          <span class="sub-badge id">#${sub.id}</span>
        </div>
      </div>
      <table class="sub-fields"><tbody>${rows}</tbody></table>
      <div class="sub-card-foot">🕒 ${escapeHtml(formatTime(sub.submitted_at))} · ${escapeHtml(relativeTime(sub.submitted_at))}</div>
    </article>`;
}

function applyFilters(items) {
  const q = searchInput.value.trim().toLowerCase();
  const screen = screenFilter.value;
  const source = sourceFilter.value;

  return items.filter(sub => {
    if (screen && sub.screen_id !== screen) return false;
    if (source && sub.source !== source) return false;
    if (!q) return true;
    const haystack = [
      sub.screen_title, sub.screen_id, sub.action_id, sub.source,
      ...(sub.fields || []).flatMap(f => [f.label, f.id, String(f.value)])
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

function updateScreenFilterOptions() {
  const current = screenFilter.value;
  const ids = new Map();
  allSubmissions.forEach(s => ids.set(s.screen_id, s.screen_title || s.screen_id));
  screenFilter.innerHTML = `<option value="">All screens</option>` +
    [...ids.entries()].map(([id, title]) =>
      `<option value="${escapeHtml(id)}">${escapeHtml(title)} (${escapeHtml(id)})</option>`).join("");
  screenFilter.value = ids.has(current) ? current : "";
}

function render(newIds = new Set()) {
  const visible = applyFilters(allSubmissions);

  statTotal.innerText = allSubmissions.length;
  statFlutter.innerText = allSubmissions.filter(s => s.source === "flutter_app").length;
  statWeb.innerText = allSubmissions.filter(s => s.source === "web_simulator").length;
  statLast.innerText = allSubmissions.length ? formatTime(allSubmissions[0].submitted_at) : "—";
  totalCounter.innerText = `${allSubmissions.length} submission${allSubmissions.length === 1 ? "" : "s"}`;

  if (allSubmissions.length === 0) {
    listEl.innerHTML = "";
    listEl.appendChild(emptyEl);
    emptyEl.style.display = "";
    resultCount.innerText = "";
    return;
  }

  if (visible.length === 0) {
    listEl.innerHTML = `<div class="sub-empty"><div class="sub-empty-icon">🔍</div><h3>No matches</h3><p>No submissions match the current search or filters.</p></div>`;
    resultCount.innerText = `0 of ${allSubmissions.length} shown`;
    return;
  }

  listEl.innerHTML = visible.map(sub => renderCard(sub, newIds.has(sub.id))).join("");
  resultCount.innerText = visible.length === allSubmissions.length
    ? `${visible.length} shown`
    : `${visible.length} of ${allSubmissions.length} shown`;
}

async function fetchSubmissions({ silent = true } = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/submissions`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.submissions) ? data.submissions : [];

    const newIds = new Set();
    if (firstLoadDone) {
      items.forEach(s => { if (!knownIds.has(s.id)) newIds.add(s.id); });
    }
    knownIds = new Set(items.map(s => s.id));
    allSubmissions = items;
    firstLoadDone = true;

    updateScreenFilterOptions();
    render(newIds);

    syncBadge.classList.remove("offline");
    statusText.innerText = "Live";
    if (newIds.size > 0) {
      showToast(`📥 ${newIds.size} new submission${newIds.size === 1 ? "" : "s"} received`);
    } else if (!silent) {
      showToast("🔄 Refreshed");
    }
  } catch (err) {
    syncBadge.classList.add("offline");
    statusText.innerText = "Server offline";
    if (!silent) showToast(`Cannot reach sync server: ${err.message}`, true);
  }
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(fetchSubmissions, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

// ---- Event wiring ----
document.getElementById("btnRefresh").addEventListener("click", () => fetchSubmissions({ silent: false }));

document.getElementById("btnClearAll").addEventListener("click", async () => {
  if (allSubmissions.length === 0) {
    showToast("Nothing to clear");
    return;
  }
  if (!confirm(`Delete all ${allSubmissions.length} stored submissions from the server?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/submissions/clear`, { method: "POST" });
    const data = await res.json();
    showToast(`🗑 Cleared ${data.cleared} submission${data.cleared === 1 ? "" : "s"}`);
    await fetchSubmissions();
  } catch (err) {
    showToast(`Clear failed: ${err.message}`, true);
  }
});

autoRefreshToggle.addEventListener("change", () => {
  if (autoRefreshToggle.checked) startPolling(); else stopPolling();
});

[searchInput, screenFilter, sourceFilter].forEach(el =>
  el.addEventListener("input", () => render())
);

// Refresh relative timestamps every 30s even when nothing changes
setInterval(() => { if (allSubmissions.length) render(); }, 30000);

const emptyApiHint = document.getElementById("emptyApiHint");
if (emptyApiHint) emptyApiHint.innerText = `POST ${API_BASE}/api/submissions`;

// ==========================================================================
// 🌓 Admin Theme Switcher (Light / Dark Mode)
// ==========================================================================
const THEME_STORAGE_KEY = "genui_admin_theme";

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || 
         localStorage.getItem(THEME_STORAGE_KEY) || 
         (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
}

function updateThemeToggleUI(theme) {
  const btn = document.getElementById("btnThemeToggle");
  const icon = document.getElementById("themeToggleIcon");
  const text = document.getElementById("themeToggleText");
  if (!btn) return;
  
  const isLight = theme === "light";
  if (icon) icon.innerText = isLight ? "🌙" : "☀️";
  if (text) text.innerText = isLight ? "Dark" : "Light";
  btn.setAttribute("title", isLight ? "Switch to Dark Mode (Alt+T)" : "Switch to Light Mode (Alt+T)");
}

function applyTheme(theme, save = true) {
  const validTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", validTheme);
  if (save) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    } catch (e) {
      console.warn("Could not persist theme preference", e);
    }
  }
  updateThemeToggleUI(validTheme);
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === "light" ? "dark" : "light";
  applyTheme(next, true);
  showToast(next === "light" ? "☀️ Light mode activated" : "🌙 Dark mode activated");
}

function initTheme() {
  const saved = getCurrentTheme();
  applyTheme(saved, false);
  
  const btn = document.getElementById("btnThemeToggle");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
  
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "t") {
      e.preventDefault();
      toggleTheme();
    }
  });

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark", false);
      }
    });
  }
}

initTheme();
fetchSubmissions({ silent: false });
startPolling();

