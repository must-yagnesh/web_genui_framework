// ==========================================================================
// 🎨 Design Templates Gallery
// MUST product widgets (MUST Mate, MustBreak, Global Footprint) and their
// linked detail screens. Admins load a widget into the current screen or
// create + apply a detail screen with one click.
//
// Loaded after app.js — shares activeSchema / screens / activeScreenId /
// DEFAULT_THEME / renderAll / switchScreen / applyToApp / showToast globals.
// Every component below uses only the whitelisted flutter_genui_guard tags
// (text, row, column, spacer, button, banner, metric_row, card, chip, listtile)
// so the same JSON renders on the phone simulator and on real devices.
// ==========================================================================

// Fallback if an older cached app.js (without DEFAULT_THEME) is still loaded in the browser.
const TPL_DEFAULT_THEME = (typeof DEFAULT_THEME !== "undefined") ? DEFAULT_THEME : {
  primary_color: "#4F46E5",
  background_color: "#0F172A",
  surface_color: "#1E293B",
  text_primary: "#F8FAFC",
  text_secondary: "#94A3B8",
  accent_color: "#10B981"
};

const DESIGN_THEMES = {
  must_light: {
    primary_color: "#15803D",
    background_color: "#EEF7F1",
    surface_color: "#FFFFFF",
    text_primary: "#14201A",
    text_secondary: "#5F6B65",
    accent_color: "#16A34A"
  },
  must_dark: {
    primary_color: "#16A34A",
    background_color: "#0F1714",
    surface_color: "#182320",
    text_primary: "#FFFFFF",
    text_secondary: "#A8B3AD",
    accent_color: "#22C55E"
  },
  footprint_light: {
    primary_color: "#15803D",
    background_color: "#F4F6F5",
    surface_color: "#FFFFFF",
    text_primary: "#1B1F1D",
    text_secondary: "#5C645F",
    accent_color: "#16A34A"
  }
};

// ---------- Small builders for the component JSON ----------
function tplText(id, text, opts = {}) {
  return Object.assign(
    { id, type: "text", text, font_size: 14, is_bold: false, align: "left", padding: 4 },
    opts
  );
}

// 2 × 2 checklist: Row → [Column(2 items), Column(2 items)].
// The ✅ glyph renders identically on Android, iOS and the web simulator,
// which avoids Flutter's Row/Flexible sizing quirks with icon + text pairs.
function tplFeatureGrid(prefix, items, color) {
  const col = (n, a, b) => ({
    id: `${prefix}_col${n}`,
    type: "column",
    main_axis_alignment: "start",
    cross_axis_alignment: "stretch",
    padding: 0,
    children: [
      tplText(`${prefix}_f${n}a`, `✅  ${a}`, { font_size: 13, color, padding: 3 }),
      tplText(`${prefix}_f${n}b`, `✅  ${b}`, { font_size: 13, color, padding: 3 })
    ]
  });
  return {
    id: `${prefix}_grid`,
    type: "row",
    main_axis_alignment: "spaceBetween",
    cross_axis_alignment: "start",
    padding: 4,
    children: [col(1, items[0], items[1]), col(2, items[2], items[3])]
  };
}

function tplLogoRow(prefix, emoji, tag, tagColor) {
  return {
    id: `${prefix}_top`,
    type: "row",
    main_axis_alignment: "spaceBetween",
    cross_axis_alignment: "center",
    padding: 2,
    children: [
      tplText(`${prefix}_logo`, emoji, { font_size: 30, padding: 2 }),
      tplText(`${prefix}_tag`, tag, { font_size: 11, is_bold: true, color: tagColor, align: "right", padding: 2 })
    ]
  };
}

function dartSnack(msg, argbHex) {
  return `ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(\n    content: Text('${msg}'),\n    backgroundColor: Color(0x${argbHex}),\n  ),\n);`;
}
function dartNav(route) {
  return `Navigator.pushNamed(context, '${route}');`;
}
function dartDialog(title, content) {
  return `showDialog(\n  context: context,\n  builder: (ctx) => AlertDialog(\n    title: Text('${title}'),\n    content: Text('${content}'),\n    actions: [\n      TextButton(\n        onPressed: () => Navigator.pop(ctx),\n        child: Text('Close'),\n      ),\n    ],\n  ),\n);`;
}
const DART_BACK = "Navigator.pop(context);";

// ---------- Template catalogue ----------
const DESIGN_TEMPLATES = [
  // ======================= MAIN WIDGETS =======================
  {
    key: "must_mate_widget",
    kind: "widget",
    name: "MUST Mate — Product Widget",
    description: "Light product hero: logo row, headline, green tagline, 2×2 feature checklist and a Learn more CTA that opens /must-mate.",
    preview: { emoji: "🗂️", tag: "PRODUCTIVITY SAAS", title: "MUST Mate", subtitle: "Where work gets tracked, billed, and shipped.", themeLabel: "Light green theme" },
    theme: DESIGN_THEMES.must_light,
    header: { title: "MUST Mate", subtitle: "Where work gets tracked, billed, and shipped.", show_back_button: false, action_icon: "notifications" },
    components: [
      tplLogoRow("mm", "🗂️", "PRODUCTIVITY SAAS", "#15803D"),
      tplText("mm_title", "MUST Mate", { font_size: 30, is_bold: true, padding: 4 }),
      tplText("mm_tagline", "Where work gets tracked, billed, and shipped.", { font_size: 17, is_bold: true, color: "#15803D", padding: 2 }),
      tplText("mm_desc", "The all-in-one work OS for distributed teams: automatic time-tracking, project dashboards, attendance, and invoicing in one place.", { font_size: 14, color: "#5F6B65", padding: 6 }),
      tplFeatureGrid("mm", [
        "Auto-Tracker & smart timesheets",
        "Attendance, payroll, and invoicing",
        "Project & task dashboards",
        "100+ native integrations"
      ], "#14201A"),
      { id: "mm_space", type: "spacer", height: 6 },
      { id: "mm_cta", type: "button", text: "Learn more  →", variant: "primary", action_id: "open_must_mate", custom_dart_code: dartNav("/must-mate") }
    ]
  },
  {
    key: "must_break_widget",
    kind: "widget",
    name: "MustBreak — AI Communication Widget",
    description: "Dark hero for the AI voice/translation product: logo row, headline, muted tagline, 2×2 checklist and a Learn more CTA that opens /must-break.",
    preview: { emoji: "🎙️", tag: "AI COMMUNICATION", title: "MustBreak", subtitle: "Speak any language, instantly.", themeLabel: "Dark theme" },
    theme: DESIGN_THEMES.must_dark,
    header: { title: "MustBreak", subtitle: "Speak any language, instantly.", show_back_button: false, action_icon: "notifications" },
    components: [
      tplLogoRow("mb", "🎙️", "AI COMMUNICATION", "#A8B3AD"),
      tplText("mb_title", "MustBreak", { font_size: 30, is_bold: true, padding: 4 }),
      tplText("mb_tagline", "Speak any language, instantly.", { font_size: 17, is_bold: true, color: "#FFFFFF", padding: 2 }),
      tplText("mb_desc", "Real-time AI translation and noise-cancelling voice for global teams. 60+ languages, accent-aware models, and a 10-second Slack install, built for cross-border collaboration.", { font_size: 14, color: "#A8B3AD", padding: 6 }),
      tplFeatureGrid("mb", [
        "Real-time translation in 60+ languages",
        "Studio-grade noise cancellation",
        "Non-native accent recognition",
        "Slack-native, 10-second setup"
      ], "#FFFFFF"),
      { id: "mb_space", type: "spacer", height: 6 },
      { id: "mb_cta", type: "button", text: "Learn more  →", variant: "primary", action_id: "open_must_break", custom_dart_code: dartNav("/must-break") }
    ]
  },
  {
    key: "global_footprint_widget",
    kind: "widget",
    name: "Global Footprint — Stats Widget",
    description: "Eyebrow label, two-tone headline, description and a 3-up stats row (offices / countries / engineers) with an outline CTA to /global-footprint.",
    preview: { emoji: "🌐", tag: "● OUR GLOBAL FOOTPRINT", title: "One team, every timezone.", subtitle: "06 offices · 21+ countries · 300+ engineers", themeLabel: "Light neutral theme" },
    theme: DESIGN_THEMES.footprint_light,
    header: { title: "Our Global Footprint", subtitle: "One team, every timezone", show_back_button: false, action_icon: "notifications" },
    components: [
      tplText("gf_tag", "●  OUR GLOBAL FOOTPRINT", { font_size: 11, is_bold: true, color: "#15803D", padding: 2 }),
      tplText("gf_title1", "One team,", { font_size: 32, is_bold: true, padding: 0 }),
      tplText("gf_title2", "every timezone.", { font_size: 32, is_bold: true, color: "#15803D", padding: 0 }),
      tplText("gf_desc", "A globally distributed team of engineers, structured to deliver consistently across time zones without compromising speed or quality.", { font_size: 14, color: "#5C645F", padding: 8 }),
      {
        id: "gf_stats",
        type: "metric_row",
        metrics: [
          { label: "OFFICES", value: "06", change: "", is_positive: true },
          { label: "COUNTRIES", value: "21+", change: "", is_positive: true },
          { label: "ENGINEERS", value: "300+", change: "", is_positive: true }
        ]
      },
      { id: "gf_cta", type: "button", text: "Meet the team  →", variant: "outline", action_id: "open_footprint", custom_dart_code: dartNav("/global-footprint") }
    ]
  },

  // ======================= DETAIL SCREENS =======================
  {
    key: "must_mate_detail",
    kind: "detail",
    name: "MUST Mate — Product Detail",
    description: "Full product page: trial banner, positioning copy, adoption stats, four module cards, pricing card and trial / sales CTAs.",
    screen_id: "must_mate",
    route: "/must-mate",
    preview: { emoji: "🗂️", tag: "PRODUCTIVITY SAAS", title: "MUST Mate", subtitle: "Everything your team needs, in one work OS", themeLabel: "Light green theme" },
    theme: DESIGN_THEMES.must_light,
    header: { title: "MUST Mate", subtitle: "Productivity SaaS · Work OS for distributed teams", show_back_button: true, action_icon: "share" },
    components: [
      { id: "mmd_hero", type: "banner", title: "14-day free trial, no card required", message: "Set up your workspace in under 5 minutes and invite unlimited teammates during the trial.", badge: "PRODUCTIVITY SAAS", color: "#15803D" },
      tplText("mmd_h1", "Where work gets tracked, billed, and shipped.", { font_size: 22, is_bold: true, padding: 8 }),
      tplText("mmd_p1", "MUST Mate replaces five disconnected tools with one work OS: time-tracking, projects, attendance, payroll, and invoicing share a single source of truth.", { font_size: 14, color: "#5F6B65", padding: 4 }),
      {
        id: "mmd_stats",
        type: "metric_row",
        metrics: [
          { label: "Teams onboarded", value: "12.4k", change: "+18% QoQ", is_positive: true },
          { label: "Hours tracked", value: "4.8M", change: "+22% YoY", is_positive: true },
          { label: "Invoices sent", value: "310k", change: "+9% QoQ", is_positive: true }
        ]
      },
      tplText("mmd_h2", "Core modules", { font_size: 16, is_bold: true, padding: 8 }),
      { id: "mmd_c1", type: "card", title: "Auto-Tracker & smart timesheets", description: "Automatic activity capture turns work into billable hours with zero manual timers or reminders.", badge: "TIME TRACKING", action_text: "See how it works", action_id: "view_tracker" },
      { id: "mmd_c2", type: "card", title: "Project & task dashboards", description: "Live burndown, workload, and budget views for every project, updated the moment work happens.", badge: "PROJECTS", action_text: "Explore dashboards", action_id: "view_dashboards" },
      { id: "mmd_c3", type: "card", title: "Attendance, payroll & invoicing", description: "Shift attendance flows straight into payroll runs and client invoices, with approvals built in.", badge: "FINANCE", action_text: "View finance tools", action_id: "view_finance" },
      { id: "mmd_c4", type: "card", title: "100+ native integrations", description: "Slack, Jira, GitHub, QuickBooks, Xero, Google Workspace and more, with two-way sync.", badge: "INTEGRATIONS", action_text: "Browse integrations", action_id: "view_integrations" },
      tplText("mmd_h3", "Simple pricing", { font_size: 16, is_bold: true, padding: 8 }),
      { id: "mmd_price", type: "card", title: "Business plan · $14 per user / month", description: "Unlimited projects, payroll, invoicing and priority support. Billed yearly, cancel anytime.", badge: "MOST POPULAR", action_text: "Compare all plans", action_id: "compare_plans" },
      { id: "mmd_cta", type: "button", text: "Start 14-day free trial", variant: "primary", action_id: "start_trial", custom_dart_code: dartSnack("Your MUST Mate trial workspace is being created!", "FF15803D") },
      { id: "mmd_sales", type: "button", text: "Talk to sales", variant: "outline", action_id: "talk_sales", custom_dart_code: dartSnack("Thanks! Our sales team will reach out within 1 business day.", "FF15803D") },
      { id: "mmd_back", type: "button", text: "‹  Back", variant: "outline", action_id: "go_back", custom_dart_code: DART_BACK }
    ]
  },
  {
    key: "must_break_detail",
    kind: "detail",
    name: "MustBreak — Product Detail",
    description: "Dark product page: release banner, latency / language stats, language chips, three capability cards, security tile and Add-to-Slack / demo CTAs.",
    screen_id: "must_break",
    route: "/must-break",
    preview: { emoji: "🎙️", tag: "AI COMMUNICATION", title: "MustBreak", subtitle: "60+ languages · 180 ms latency · 10 s setup", themeLabel: "Dark theme" },
    theme: DESIGN_THEMES.must_dark,
    header: { title: "MustBreak", subtitle: "AI Communication · Slack-native voice", show_back_button: true, action_icon: "share" },
    components: [
      { id: "mbd_hero", type: "banner", title: "Now live: accent-aware speech models v3", message: "Recognition accuracy for non-native English speakers improved by 31% in the latest release.", badge: "NEW RELEASE", color: "#16A34A" },
      tplText("mbd_h1", "Speak any language, instantly.", { font_size: 22, is_bold: true, padding: 8 }),
      tplText("mbd_p1", "Real-time AI translation and noise-cancelling voice for global teams. Join any huddle, speak your language, and everyone hears theirs.", { font_size: 14, color: "#A8B3AD", padding: 4 }),
      {
        id: "mbd_stats",
        type: "metric_row",
        metrics: [
          { label: "Languages", value: "60+", change: "+12 this year", is_positive: true },
          { label: "Avg. latency", value: "180 ms", change: "-40% vs v2", is_positive: true },
          { label: "Setup time", value: "10 sec", change: "Slack native", is_positive: true }
        ]
      },
      tplText("mbd_h2", "Supported languages", { font_size: 16, is_bold: true, padding: 8 }),
      {
        id: "mbd_lang1", type: "row", main_axis_alignment: "start", cross_axis_alignment: "center", padding: 2,
        children: [
          { id: "mbd_l_en", type: "chip", label: "English", is_selected: true, icon: "check" },
          { id: "mbd_l_ja", type: "chip", label: "日本語", is_selected: false },
          { id: "mbd_l_es", type: "chip", label: "Español", is_selected: false }
        ]
      },
      {
        id: "mbd_lang2", type: "row", main_axis_alignment: "start", cross_axis_alignment: "center", padding: 2,
        children: [
          { id: "mbd_l_de", type: "chip", label: "Deutsch", is_selected: false },
          { id: "mbd_l_ko", type: "chip", label: "한국어", is_selected: false },
          { id: "mbd_l_more", type: "chip", label: "+55 more", is_selected: false }
        ]
      },
      tplText("mbd_h3", "Built for cross-border teams", { font_size: 16, is_bold: true, padding: 8 }),
      { id: "mbd_c1", type: "card", title: "Real-time translation", description: "Speech is translated mid-sentence with speaker-matched voice, so conversations keep their natural rhythm.", badge: "TRANSLATION", action_text: "Hear a sample", action_id: "hear_sample" },
      { id: "mbd_c2", type: "card", title: "Studio-grade noise cancellation", description: "Keyboard clatter, traffic, and café noise are removed on-device before audio ever leaves your laptop.", badge: "AUDIO", action_text: "See the tech", action_id: "see_audio" },
      { id: "mbd_c3", type: "card", title: "Slack-native, 10-second setup", description: "Install from the Slack App Directory, join a huddle, and MustBreak is on. No admin tickets, no downloads.", badge: "INTEGRATION", action_text: "View install guide", action_id: "view_install" },
      { id: "mbd_sec", type: "listtile", title: "Security & compliance", subtitle: "SOC 2 Type II · GDPR · audio is never stored", leading_icon: "lock", trailing_text: "VERIFIED", action_id: "view_security" },
      { id: "mbd_cta", type: "button", text: "Add to Slack — free", variant: "primary", action_id: "add_to_slack", custom_dart_code: dartSnack("Opening Slack authorization for MustBreak…", "FF16A34A") },
      { id: "mbd_demo", type: "button", text: "Watch 2-minute demo", variant: "outline", action_id: "watch_demo", custom_dart_code: dartDialog("MustBreak in 2 minutes", "Watch how a Tokyo-Berlin huddle runs with live translation and zero background noise.") },
      { id: "mbd_back", type: "button", text: "‹  Back", variant: "outline", action_id: "go_back", custom_dart_code: DART_BACK }
    ]
  },
  {
    key: "global_footprint_detail",
    kind: "detail",
    name: "Global Footprint — Team Detail",
    description: "About-us page: two-tone headline, stats row, four office cards, coverage metrics, hiring banner and a careers CTA.",
    screen_id: "global_footprint",
    route: "/global-footprint",
    preview: { emoji: "🌐", tag: "● OUR GLOBAL FOOTPRINT", title: "One team, every timezone.", subtitle: "Tokyo · Ahmedabad · Singapore · Berlin", themeLabel: "Light neutral theme" },
    theme: DESIGN_THEMES.footprint_light,
    header: { title: "Our Global Footprint", subtitle: "One team, every timezone", show_back_button: true, action_icon: "share" },
    components: [
      tplText("gfd_tag", "●  OUR GLOBAL FOOTPRINT", { font_size: 11, is_bold: true, color: "#15803D", padding: 2 }),
      tplText("gfd_t1", "One team,", { font_size: 30, is_bold: true, padding: 0 }),
      tplText("gfd_t2", "every timezone.", { font_size: 30, is_bold: true, color: "#15803D", padding: 0 }),
      tplText("gfd_p1", "A globally distributed team of engineers, structured to deliver consistently across time zones without compromising speed or quality.", { font_size: 14, color: "#5C645F", padding: 8 }),
      {
        id: "gfd_stats",
        type: "metric_row",
        metrics: [
          { label: "OFFICES", value: "06", change: "", is_positive: true },
          { label: "COUNTRIES", value: "21+", change: "", is_positive: true },
          { label: "ENGINEERS", value: "300+", change: "", is_positive: true }
        ]
      },
      tplText("gfd_h2", "Where we work", { font_size: 16, is_bold: true, padding: 8 }),
      { id: "gfd_o1", type: "card", title: "Tokyo, Japan", description: "Global headquarters. Product, design and executive leadership, plus our enterprise customer success team.", badge: "HEADQUARTERS", action_text: "View office", action_id: "office_tokyo" },
      { id: "gfd_o2", type: "card", title: "Ahmedabad, India", description: "Largest engineering hub with 180+ engineers across mobile, web, platform and QA.", badge: "ENGINEERING HUB", action_text: "View office", action_id: "office_ahmedabad" },
      { id: "gfd_o3", type: "card", title: "Singapore", description: "APAC operations, security engineering and the 24/7 follow-the-sun support rotation.", badge: "APAC", action_text: "View office", action_id: "office_singapore" },
      { id: "gfd_o4", type: "card", title: "Berlin, Germany", description: "EMEA sales and a growing AI research group focused on speech and translation models.", badge: "EMEA", action_text: "View office", action_id: "office_berlin" },
      tplText("gfd_h3", "Always-on coverage", { font_size: 16, is_bold: true, padding: 8 }),
      {
        id: "gfd_cov",
        type: "metric_row",
        metrics: [
          { label: "Timezones covered", value: "14", change: "UTC-8 to UTC+9", is_positive: true },
          { label: "Support coverage", value: "24/7", change: "Follow-the-sun", is_positive: true }
        ]
      },
      { id: "gfd_hiring", type: "banner", title: "We're hiring across all 6 offices", message: "Remote-first roles open in engineering, design, and customer success. Relocation support available.", badge: "CAREERS", color: "#15803D" },
      { id: "gfd_cta", type: "button", text: "View open roles", variant: "primary", action_id: "view_roles", custom_dart_code: dartSnack("Opening 42 open roles across 6 offices…", "FF15803D") },
      { id: "gfd_back", type: "button", text: "‹  Back", variant: "outline", action_id: "go_back", custom_dart_code: DART_BACK }
    ]
  }
];

// ---------- Apply / install helpers ----------
function deepCloneTpl(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function findDesignTemplate(key) {
  return DESIGN_TEMPLATES.find(t => t.key === key) || null;
}

function buildSchemaFromDesignTemplate(tpl, opts = {}) {
  const screenId = opts.screenId || tpl.screen_id || activeScreenId;
  const route = opts.route || tpl.route || (screenId === "home" ? "/" : `/${screenId}`);
  const title = opts.name || tpl.header.title;
  return {
    version: 1,
    timestamp: Date.now(),
    screen_id: screenId,
    screen_name: title,
    route,
    theme: Object.assign({}, TPL_DEFAULT_THEME, tpl.theme),
    header: Object.assign({}, tpl.header, { title }),
    components: deepCloneTpl(tpl.components)
  };
}

// Template text nodes use the template theme's own text tokens as hex colors. When the widgets are
// dropped into a screen with a different theme (e.g. a dark dashboard), map those hex values onto the
// host theme's tokens so body copy never ends up dark-on-dark or light-on-light. Brand greens are kept.
function retintComponentsForTheme(components, fromTheme, toTheme) {
  const norm = (c) => String(c || "").trim().toUpperCase();
  const map = {};
  ["text_primary", "text_secondary"].forEach(key => {
    const from = norm(fromTheme[key]);
    const to = toTheme[key] || TPL_DEFAULT_THEME[key];
    if (from && to) map[from] = to;
  });
  const walk = (node) => {
    if (node && typeof node.color === "string" && map[norm(node.color)]) {
      node.color = map[norm(node.color)];
    }
    if (Array.isArray(node.children)) node.children.forEach(walk);
    return node;
  };
  return components.map(walk);
}

function focusDesignerOnChange() {
  const designerBody = document.querySelector(".editor-panel .panel-body");
  if (designerBody) designerBody.scrollTo({ top: 0, behavior: "smooth" });
  const phone = document.getElementById("phoneSimulatorScreen");
  if (phone) {
    phone.classList.remove("sim-flash");
    void phone.offsetWidth; // restart the animation
    phone.classList.add("sim-flash");
  }
}

// Replace the current designer screen (header + theme + components). Not broadcast until "Apply to App".
function loadDesignTemplateIntoDesigner(tpl) {
  activeSchema.header = Object.assign({}, activeSchema.header, tpl.header);
  activeSchema.theme = Object.assign({}, TPL_DEFAULT_THEME, tpl.theme);
  activeSchema.components = deepCloneTpl(tpl.components);
  renderAll();
  focusDesignerOnChange();
  showToast(`🎨 Loaded "${tpl.name}" into "${activeScreenId}" — press Apply to App to broadcast`);
}

// Append the template's widgets under the existing components, keeping the current theme
// (text colors are re-tinted to the current theme's tokens).
function appendDesignTemplateToDesigner(tpl) {
  const suffix = Date.now().toString(36).slice(-4);
  const reId = (node) => {
    node.id = `${node.id}_${suffix}`;
    if (Array.isArray(node.children)) node.children.forEach(reId);
    return node;
  };
  const hostTheme = Object.assign({}, TPL_DEFAULT_THEME, activeSchema.theme || {});
  const comps = retintComponentsForTheme(deepCloneTpl(tpl.components), tpl.theme, hostTheme).map(reId);
  activeSchema.components = (activeSchema.components || []).concat(comps);
  renderAll();
  focusDesignerOnChange();
  showToast(`➕ Appended ${comps.length} widgets from "${tpl.name}" to "${activeScreenId}" — press Apply to App to broadcast`);
}

async function pushSchemaToServer(schema) {
  const res = await fetch(`/api/schema/apply?screen=${encodeURIComponent(schema.screen_id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schema)
  });
  const data = await res.json();
  if (data.version && typeof schemaVersionDisplay !== "undefined" && schemaVersionDisplay) {
    schemaVersionDisplay.innerText = `v${data.version}`;
  }
  return data;
}

// Create (or overwrite) a routed screen from a detail template and broadcast it immediately.
async function installDesignTemplateAsScreen(tpl, opts = {}) {
  const schema = buildSchemaFromDesignTemplate(tpl, opts);
  const sid = schema.screen_id;
  if (screens[sid] && !opts.silent) {
    const existingName = screens[sid].screen_name || screens[sid].header?.title || sid;
    if (!confirm(`Screen "${existingName}" (${schema.route}) already exists. Overwrite it with the "${tpl.name}" template?`)) {
      return null;
    }
  }
  try {
    await pushSchemaToServer(schema);
  } catch (err) {
    console.error("Template install error:", err);
    showToast("⚠️ Could not reach sync server. Is it running on port 8080?", true);
    return null;
  }
  screens[sid] = schema;
  if (!opts.stayOnCurrentScreen) {
    await switchScreen(sid);
    focusDesignerOnChange();
  } else {
    renderScreenTabs();
  }
  return sid;
}

async function installAllDetailScreens() {
  const originalSid = activeScreenId;
  const details = DESIGN_TEMPLATES.filter(t => t.kind === "detail");
  const existing = details.filter(t => screens[t.screen_id]).map(t => t.route);
  if (existing.length > 0 && !confirm(`These routes already exist and will be overwritten: ${existing.join(", ")}. Continue?`)) {
    return;
  }
  const btn = document.getElementById("btnInstallAllDetailScreens");
  if (btn) { btn.disabled = true; btn.innerHTML = "⏳ Creating screens…"; }
  let created = 0;
  for (const tpl of details) {
    const sid = await installDesignTemplateAsScreen(tpl, { silent: true, stayOnCurrentScreen: true });
    if (sid) created += 1;
  }
  if (btn) { btn.disabled = false; btn.innerHTML = "🚀 Create & apply all 3 detail screens"; }
  if (screens[originalSid] && activeScreenId !== originalSid) await switchScreen(originalSid);
  renderScreenTabs();
  if (created === details.length) {
    showToast(`🚀 Created & applied ${created} detail screens: ${details.map(t => t.route).join(", ")}`);
  } else {
    showToast(`⚠️ Created ${created} of ${details.length} detail screens — check the sync server`, true);
  }
}

// Used by the "New Screen" modal when a design template is chosen as the starter.
async function installDesignTemplateFromModal(key, name, route) {
  const tpl = findDesignTemplate(key);
  if (!tpl) {
    alert("Unknown design template: " + key);
    return;
  }
  let cleanRoute = (route || tpl.route).trim();
  if (!cleanRoute.startsWith("/")) cleanRoute = "/" + cleanRoute;
  const screenId = cleanRoute.replaceAll("/", "").replace(/[^a-zA-Z0-9_-]/g, "_").replace(/-/g, "_").toLowerCase() || `screen_${Date.now()}`;
  closeNewScreenModal();
  const sid = await installDesignTemplateAsScreen(tpl, { screenId, route: cleanRoute, name: name || tpl.header.title });
  if (sid) showToast(`✨ Screen "${name || tpl.header.title}" created from "${tpl.name}" and applied to ${cleanRoute}`);
}

// ---------- Gallery UI ----------
function renderDesignTemplateGallery() {
  const wGrid = document.getElementById("templateGridWidgets");
  const dGrid = document.getElementById("templateGridDetails");
  if (!wGrid || !dGrid) return;
  wGrid.innerHTML = "";
  dGrid.innerHTML = "";

  DESIGN_TEMPLATES.forEach(tpl => {
    const t = tpl.theme;
    const p = tpl.preview;
    const isDetail = tpl.kind === "detail";
    const card = document.createElement("div");
    card.className = "tpl-card";
    card.dataset.tplKey = tpl.key;
    card.innerHTML = `
      <div class="tpl-preview" style="background:${t.background_color}; color:${t.text_primary};">
        <div class="tpl-preview-top">
          <span class="tpl-preview-emoji" style="background:${t.surface_color};">${p.emoji}</span>
          <span class="tpl-preview-tag" style="color:${t.primary_color}; border-color:${t.primary_color}; background:${t.surface_color};">${escapeHtml(p.tag)}</span>
        </div>
        <div class="tpl-preview-title">${escapeHtml(p.title)}</div>
        <div class="tpl-preview-sub" style="color:${t.primary_color};">${escapeHtml(p.subtitle)}</div>
        <div class="tpl-preview-lines"><span style="background:${t.text_secondary}"></span><span style="background:${t.text_secondary}"></span></div>
        ${isDetail ? `<div class="tpl-preview-cards"><span style="background:${t.surface_color}; border-color:${t.primary_color}"></span><span style="background:${t.surface_color}; border-color:${t.primary_color}"></span><span style="background:${t.surface_color}; border-color:${t.primary_color}"></span></div>` : ""}
        <div class="tpl-preview-btn" style="background:${t.primary_color};">${isDetail ? "Primary CTA" : "Learn more →"}</div>
      </div>
      <div class="tpl-body">
        <div class="tpl-name">${escapeHtml(tpl.name)}</div>
        <div class="tpl-meta">${isDetail ? `DETAIL SCREEN · route <code>${escapeHtml(tpl.route)}</code>` : `MAIN WIDGET · ${escapeHtml(p.themeLabel)}`}</div>
        <div class="tpl-desc">${escapeHtml(tpl.description)}</div>
        <div class="tpl-actions">
          ${isDetail
            ? `<button class="btn btn-primary btn-sm" data-tpl-action="install" data-tpl="${tpl.key}" title="Create the ${escapeHtml(tpl.route)} screen and broadcast it to devices">🚀 Create &amp; Apply Screen</button>
               <button class="btn btn-outline btn-sm" data-tpl-action="load" data-tpl="${tpl.key}" title="Load this layout into the screen currently open in the designer">🎨 Load Here</button>`
            : `<button class="btn btn-primary btn-sm" data-tpl-action="load" data-tpl="${tpl.key}" title="Replace the current screen with this widget (theme included)">🎨 Load in Designer</button>
               <button class="btn btn-outline btn-sm" data-tpl-action="append" data-tpl="${tpl.key}" title="Add these widgets below the existing components, keeping the current theme">➕ Append</button>`}
        </div>
      </div>`;
    (isDetail ? dGrid : wGrid).appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDesignTemplateGallery();

  const tab = document.getElementById("tab-templates");
  if (tab) {
    tab.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tpl-action]");
      if (!btn) return;
      const tpl = findDesignTemplate(btn.dataset.tpl);
      if (!tpl) return;
      switch (btn.dataset.tplAction) {
        case "load":
          loadDesignTemplateIntoDesigner(tpl);
          break;
        case "append":
          appendDesignTemplateToDesigner(tpl);
          break;
        case "install":
          installDesignTemplateAsScreen(tpl).then(sid => {
            if (sid) showToast(`🚀 "${tpl.name}" created at ${tpl.route} and applied to mobile`);
          });
          break;
      }
    });
  }

  const btnAll = document.getElementById("btnInstallAllDetailScreens");
  if (btnAll) btnAll.addEventListener("click", installAllDetailScreens);

  // "New Screen" modal: intercept design-template starters here (capture phase) so the gallery
  // keeps working even if an older app.js without the `tpl:` branch is cached in the browser.
  const btnCreate = document.getElementById("btnSubmitCreateScreen");
  const select = document.getElementById("newScreenTemplateSelect");
  if (btnCreate && select) {
    btnCreate.addEventListener("click", (e) => {
      const value = select.value || "";
      if (!value.startsWith("tpl:")) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      const name = (document.getElementById("newScreenNameInput")?.value || "").trim();
      const route = (document.getElementById("newScreenRouteInput")?.value || "").trim();
      if (!name) { alert("Please enter a screen name!"); return; }
      if (!route) { alert("Please enter a route path (e.g. /must-mate)!"); return; }
      installDesignTemplateFromModal(value.slice(4), name, route);
    }, true);
  }
});
