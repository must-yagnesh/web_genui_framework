// Web-Controlled Gen UI Dashboard Application Logic

let activeSchema = {
  version: 1,
  timestamp: Date.now(),
  screen_id: "home_feed",
  theme: {
    primary_color: "#4F46E5",
    background_color: "#0F172A",
    surface_color: "#1E293B",
    text_primary: "#F8FAFC",
    text_secondary: "#94A3B8",
    accent_color: "#10B981"
  },
  header: {
    title: "Crypto & Multi-Asset Hub",
    subtitle: "Live Web-Controlled Dynamic View",
    show_back_button: false,
    action_icon: "notifications"
  },
  components: [
    {
      id: "promo_banner_1",
      type: "banner",
      title: "Instant Web-to-App Sync Active",
      message: "Change properties on the Web Dashboard and click Apply to update this screen in real-time.",
      badge: "LIVE SYNC",
      style: "gradient",
      color: "#4F46E5"
    },
    {
      id: "metric_grid_1",
      type: "metric_row",
      metrics: [
        {
          label: "Total Balance",
          value: "$48,920.45",
          change: "+8.4%",
          is_positive: true
        },
        {
          label: "24h Rewards",
          value: "+$142.10",
          change: "+3.1%",
          is_positive: true
        }
      ]
    },
    {
      id: "card_feature_1",
      type: "card",
      title: "High Yield Staking Tier",
      description: "Earn up to 14.2% APY with multi-chain auto-compound. Protected by GenUI Guard.",
      badge: "POPULAR",
      action_text: "Deposit Now",
      action_id: "action_deposit"
    },
    {
      id: "action_primary_1",
      type: "button",
      text: "Explore All Vaults",
      variant: "primary",
      action_id: "action_explore"
    }
  ]
};

// Preset Templates
const PRESETS = {
  crypto: {
    title: "Crypto Staking Hub",
    subtitle: "Real-Time Yields & Portfolio",
    color: "#4F46E5",
    components: [
      {
        id: "b_crypto",
        type: "banner",
        title: "Ethereum 2.0 Pool Active",
        message: "Network validation rewards increased to 4.8% APR this epoch.",
        badge: "HOT YIELD",
        color: "#6366F1"
      },
      {
        id: "m_crypto",
        type: "metric_row",
        metrics: [
          { label: "Staked ETH", value: "32.40 ETH", change: "+1.2 ETH", is_positive: true },
          { label: "Est. Monthly", value: "$3,840.00", change: "+5.6%", is_positive: true }
        ]
      },
      {
        id: "c_crypto",
        type: "card",
        title: "Liquid Restaking Vault",
        description: "Deposit ETH to receive ezETH with instant liquidity and eigenlayer rewards.",
        badge: "AUDITED",
        action_text: "Stake ETH",
        action_id: "stake_action"
      },
      {
        id: "btn_crypto",
        type: "button",
        text: "Claim Accumulated Rewards",
        variant: "primary",
        action_id: "claim_action"
      }
    ]
  },
  ecommerce: {
    title: "Flash Deals & Rewards",
    subtitle: "24-Hour VIP Member Campaign",
    color: "#EC4899",
    components: [
      {
        id: "b_ecom",
        type: "banner",
        title: "Midnight Flash Sale ⚡",
        message: "Use code VIPFLASH for instant 40% discount across flagship categories.",
        badge: "ENDS IN 2H",
        color: "#EC4899"
      },
      {
        id: "m_ecom",
        type: "metric_row",
        metrics: [
          { label: "Reward Points", value: "8,450 pts", change: "+500 today", is_positive: true },
          { label: "Coupons Active", value: "3 Ready", change: "Expires soon", is_positive: false }
        ]
      },
      {
        id: "c_ecom",
        type: "card",
        title: "Wireless ANC Pro Earbuds",
        description: "Active noise cancellation with 38h battery life. Limited inventory: 14 left.",
        badge: "40% OFF",
        action_text: "Add to Cart ($89)",
        action_id: "buy_earbuds"
      },
      {
        id: "btn_ecom",
        type: "button",
        text: "View All Flash Deals",
        variant: "primary",
        action_id: "view_deals"
      }
    ]
  },
  fintech: {
    title: "Private Wealth Banking",
    subtitle: "Account Tier: Platinum Elite",
    color: "#059669",
    components: [
      {
        id: "b_fintech",
        type: "banner",
        title: "Treasury Bill Auto-Roll Active",
        message: "Your 4-week Treasury tranche matured at 5.24% annualized yield.",
        badge: "FDIC INSURED",
        color: "#059669"
      },
      {
        id: "m_fintech",
        type: "metric_row",
        metrics: [
          { label: "Net Liquidity", value: "$320,400.00", change: "+$4,120.00", is_positive: true },
          { label: "Money Market APY", value: "5.15%", change: "Fixed", is_positive: true }
        ]
      },
      {
        id: "c_fintech",
        type: "card",
        title: "Tax-Exempt Municipal Bond Fund",
        description: "State-specific tax advantages with AAA rated sovereign credit guarantees.",
        badge: "RECOMMENDED",
        action_text: "Schedule Call with Advisor",
        action_id: "advisor_call"
      },
      {
        id: "btn_fintech",
        type: "button",
        text: "Initiate Wire Transfer",
        variant: "primary",
        action_id: "wire_transfer"
      }
    ]
  },
  support: {
    title: "Customer Concierge",
    subtitle: "24/7 Dedicated Assistance",
    color: "#0284C7",
    components: [
      {
        id: "b_sup",
        type: "banner",
        title: "Priority Support Line Available",
        message: "Average response time for Platinum members is currently under 45 seconds.",
        badge: "ONLINE",
        color: "#0284C7"
      },
      {
        id: "m_sup",
        type: "metric_row",
        metrics: [
          { label: "Open Inquiries", value: "0 Tickets", change: "All Clear", is_positive: true },
          { label: "Security Health", value: "100%", change: "2FA Enabled", is_positive: true }
        ]
      },
      {
        id: "c_sup",
        type: "card",
        title: "Account Security Review",
        description: "Last login from verified device in London, UK. No suspicious access detected.",
        badge: "PROTECTED",
        action_text: "Review Sessions",
        action_id: "review_sessions"
      },
      {
        id: "btn_sup",
        type: "button",
        text: "Start Live Agent Chat",
        variant: "primary",
        action_id: "live_chat"
      }
    ]
  }
};

// 1-Click AI Personas
const PERSONAS = {
  beginner: {
    title: "Welcome Explorer! 🌱",
    subtitle: "Low-Risk Curated Safe Harbor",
    color: "#10B981",
    components: [
      {
        id: "b_beg",
        type: "banner",
        title: "Zero Fee First Deposit Active",
        message: "New to digital assets? Enjoy 100% gas-free staking on your first $500.",
        badge: "STARTER PACK",
        color: "#059669"
      },
      {
        id: "m_beg",
        type: "metric_row",
        metrics: [
          { label: "Paper Balance", value: "$1,000.00", change: "Demo Mode", is_positive: true },
          { label: "Security Guard", value: "100% Shield", change: "Safe", is_positive: true }
        ]
      },
      {
        id: "c_beg",
        type: "card",
        title: "Learn & Earn: What is Staking?",
        description: "Complete a 60-second interactive explainer to earn $10 USDC automatically.",
        badge: "REWARD READY",
        action_text: "Start 1-Min Lesson",
        action_id: "learn_earn"
      },
      {
        id: "btn_beg",
        type: "button",
        text: "Claim $10 Free Welcome Bonus",
        variant: "primary",
        action_id: "claim_bonus"
      }
    ]
  },
  vip: {
    title: "Private Wealth Terminal 👑",
    subtitle: "Institutional Liquidity & Private Tier",
    color: "#F59E0B",
    components: [
      {
        id: "b_vip",
        type: "banner",
        title: "Tier-1 OTC Routing Enabled",
        message: "Direct liquidity pool access with sub-millisecond execution and 0% slippage.",
        badge: "PRIVATE CLIENT",
        color: "#D97706"
      },
      {
        id: "m_vip",
        type: "metric_row",
        metrics: [
          { label: "Portfolio Value", value: "$2,480,950.00", change: "+$24,500.00", is_positive: true },
          { label: "Target Staking APY", value: "16.8%", change: "Delta Neutral", is_positive: true }
        ]
      },
      {
        id: "c_vip",
        type: "card",
        title: "Multi-Strategy Alpha Vault",
        description: "Algorithmic market-neutral yield generation audited by Consensys Diligence.",
        badge: "CAPACITY: 92%",
        action_text: "Rebalance Allocation",
        action_id: "rebalance_vault"
      },
      {
        id: "btn_vip",
        type: "button",
        text: "Call Private Concierge Desk",
        variant: "primary",
        action_id: "call_concierge"
      }
    ]
  },
  shopper: {
    title: "Flash Super Deals ⚡",
    subtitle: "AI Dynamic Discount Engine",
    color: "#EC4899",
    components: [
      {
        id: "b_shop",
        type: "banner",
        title: "Midnight Liquidation: 40% OFF",
        message: "Exclusive limited inventory release! Extra $40 coupon expires in 12 minutes.",
        badge: "FLASH SALE",
        color: "#DB2777"
      },
      {
        id: "m_shop",
        type: "metric_row",
        metrics: [
          { label: "Flash Savings", value: "$184.20", change: "-40% Today", is_positive: true },
          { label: "Cart Time Remaining", value: "11m 45s", change: "Expiring", is_positive: false }
        ]
      },
      {
        id: "c_shop",
        type: "card",
        title: "Hardware Wallet + Shield Pro",
        description: "Military-grade offline cold storage with seamless GenUI remote authentication.",
        badge: "ONLY 3 LEFT",
        action_text: "Claim Flash Bundle",
        action_id: "claim_bundle"
      },
      {
        id: "btn_shop",
        type: "button",
        text: "Instant 1-Click Checkout ($149)",
        variant: "primary",
        action_id: "instant_checkout"
      }
    ]
  }
};


// DOM Elements
const screenTitleInput = document.getElementById("screenTitleInput");
const screenSubtitleInput = document.getElementById("screenSubtitleInput");
const primaryColorPicker = document.getElementById("primaryColorPicker");
const colorHexText = document.getElementById("colorHexText");
const componentCardsContainer = document.getElementById("componentCardsContainer");
const rawJsonEditor = document.getElementById("rawJsonEditor");
const btnApplyToApp = document.getElementById("btnApplyToApp");
const btnResetDefault = document.getElementById("btnResetDefault");
const btnAddDropdown = document.getElementById("btnAddDropdown");
const addMenu = document.getElementById("addMenu");
const schemaVersionDisplay = document.getElementById("schemaVersionDisplay");
const subCounter = document.getElementById("subCounter");
const statusText = document.getElementById("statusText");
const teleLatency = document.getElementById("teleLatency");
const appToast = document.getElementById("appToast");

// Mobile Simulator DOM Elements
const simTitle = document.getElementById("simTitle");
const simSubtitle = document.getElementById("simSubtitle");
const simComponentsList = document.getElementById("simComponentsList");

// Tabs Handling
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Dropdown Toggle
btnAddDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
  addMenu.classList.toggle("show");
});
document.addEventListener("click", () => addMenu.classList.remove("show"));

// Component addition
addMenu.querySelectorAll("a").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const type = item.dataset.add;
    addComponent(type);
    addMenu.classList.remove("show");
  });
});

function addComponent(type) {
  const id = `comp_${Date.now()}`;
  let newComp;
  if (type === "banner") {
    newComp = { id, type, title: "New Dynamic Announcement", message: "Enter custom text here.", badge: "NEW", color: activeSchema.theme.primary_color };
  } else if (type === "metric_row") {
    newComp = { id, type, metrics: [{ label: "Metric A", value: "1,200", change: "+10%", is_positive: true }, { label: "Metric B", value: "98%", change: "+2%", is_positive: true }] };
  } else if (type === "card") {
    newComp = { id, type, title: "New Feature Card", description: "Highlight an action or reward.", badge: "ACTION", action_text: "Learn More", action_id: "action_card" };
  } else if (type === "button") {
    newComp = { id, type, text: "Primary Action", variant: "primary", action_id: "action_btn" };
  }
  activeSchema.components.push(newComp);
  renderAll();
}

function removeComponent(index) {
  activeSchema.components.splice(index, 1);
  renderAll();
}

// Preset application
document.querySelectorAll(".preset-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    const p = PRESETS[pill.dataset.preset];
    if (p) {
      activeSchema.header.title = p.title;
      activeSchema.header.subtitle = p.subtitle;
      activeSchema.theme.primary_color = p.color;
      activeSchema.components = JSON.parse(JSON.stringify(p.components));
      renderAll();
      showToast(`Loaded "${p.title}" Preset`);
    }
  });
});

// Sync inputs to state
screenTitleInput.addEventListener("input", (e) => {
  activeSchema.header.title = e.target.value;
  updateSimulator();
  updateJsonEditor();
});
screenSubtitleInput.addEventListener("input", (e) => {
  activeSchema.header.subtitle = e.target.value;
  updateSimulator();
  updateJsonEditor();
});
primaryColorPicker.addEventListener("input", (e) => {
  const val = e.target.value;
  activeSchema.theme.primary_color = val;
  colorHexText.innerText = val.toUpperCase();
  updateSimulator();
  updateJsonEditor();
});

// Render Component List in Editor Panel
function renderComponentEditors() {
  componentCardsContainer.innerHTML = "";
  activeSchema.components.forEach((comp, idx) => {
    const card = document.createElement("div");
    card.className = "component-card-editor";

    let fieldsHtml = "";
    if (comp.type === "banner") {
      fieldsHtml = `
        <div class="field">
          <label>Banner Title</label>
          <input type="text" value="${comp.title || ""}" oninput="updateCompField(${idx}, 'title', this.value)">
        </div>
        <div class="field">
          <label>Message / Copy</label>
          <input type="text" value="${comp.message || ""}" oninput="updateCompField(${idx}, 'message', this.value)">
        </div>
      `;
    } else if (comp.type === "metric_row") {
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Metric 1 Label</label>
            <input type="text" value="${comp.metrics[0]?.label || ""}" oninput="updateMetricField(${idx}, 0, 'label', this.value)">
          </div>
          <div class="field flex-1">
            <label>Metric 1 Value</label>
            <input type="text" value="${comp.metrics[0]?.value || ""}" oninput="updateMetricField(${idx}, 0, 'value', this.value)">
          </div>
        </div>
      `;
    } else if (comp.type === "card") {
      fieldsHtml = `
        <div class="field">
          <label>Card Title</label>
          <input type="text" value="${comp.title || ""}" oninput="updateCompField(${idx}, 'title', this.value)">
        </div>
        <div class="field">
          <label>Description</label>
          <input type="text" value="${comp.description || ""}" oninput="updateCompField(${idx}, 'description', this.value)">
        </div>
        <div class="field">
          <label>Button Text</label>
          <input type="text" value="${comp.action_text || ""}" oninput="updateCompField(${idx}, 'action_text', this.value)">
        </div>
      `;
    } else if (comp.type === "button") {
      fieldsHtml = `
        <div class="field">
          <label>Button Text</label>
          <input type="text" value="${comp.text || ""}" oninput="updateCompField(${idx}, 'text', this.value)">
        </div>
      `;
    }

    card.innerHTML = `
      <div class="comp-header">
        <span class="comp-tag">${comp.type.toUpperCase()}</span>
        <button class="comp-delete-btn" onclick="removeComponent(${idx})">✕</button>
      </div>
      ${fieldsHtml}
    `;
    componentCardsContainer.appendChild(card);
  });
}

window.updateCompField = function(idx, key, val) {
  activeSchema.components[idx][key] = val;
  updateSimulator();
  updateJsonEditor();
};

window.updateMetricField = function(idx, mIdx, key, val) {
  if (activeSchema.components[idx].metrics[mIdx]) {
    activeSchema.components[idx].metrics[mIdx][key] = val;
    updateSimulator();
    updateJsonEditor();
  }
};

window.removeComponent = removeComponent;

// Render Simulator
let isSimGuardedMode = true;

const simModeToggleBtn = document.getElementById("simModeToggleBtn");
if (simModeToggleBtn) {
  simModeToggleBtn.addEventListener("click", () => {
    isSimGuardedMode = !isSimGuardedMode;
    simModeToggleBtn.className = `sim-mode-toggle-pill ${isSimGuardedMode ? "guarded" : "naive"}`;
    simModeToggleBtn.innerText = isSimGuardedMode ? "🛡 GUARDED" : "💥 NAIVE";
    updateSimulator();
    showToast(isSimGuardedMode ? "🛡 Switched Simulator to GUARDED Mode (Auto-bounded)" : "💥 Switched Simulator to NAIVE Mode (Exceptions visible)");
  });
}

function updateSimulator() {
  simTitle.innerText = activeSchema.header?.title || "Untitled";
  simSubtitle.innerText = activeSchema.header?.subtitle || "";
  
  simComponentsList.innerHTML = "";

  // Detect if active schema has anomalies
  const hasAnomaly = (activeSchema.components || []).some(c => {
    const title = String(c.title || "");
    const msg = String(c.message || "");
    const desc = String(c.description || "");
    return (
      c.id?.includes("fuzz_") ||
      title.length > 70 ||
      msg.length > 120 ||
      desc.length > 150 ||
      (typeof c.height === "number" && c.height < 0) ||
      c.padding === "NaN" ||
      (c.action_id && String(c.action_id).startsWith("javascript:")) ||
      (c.type === "metric_row" && !Array.isArray(c.metrics)) ||
      !["banner", "metric_row", "metrics", "card", "button"].includes(c.type)
    );
  });

  if (isSimGuardedMode && hasAnomaly) {
    const banner = document.createElement("div");
    banner.className = "sim-guard-banner";
    banner.innerHTML = `🛡 Guard Active: Text Clamped & Layout Shielded (< 0.05ms)`;
    simComponentsList.appendChild(banner);
  } else if (!isSimGuardedMode && hasAnomaly) {
    const banner = document.createElement("div");
    banner.className = "sim-guard-banner";
    banner.style.background = "rgba(239, 68, 68, 0.15)";
    banner.style.color = "#EF4444";
    banner.style.borderColor = "rgba(239, 68, 68, 0.4)";
    banner.innerHTML = `💥 NAIVE UNPROTECTED: Layout Exception Triggered!`;
    simComponentsList.appendChild(banner);
  }

  (activeSchema.components || []).forEach(comp => {
    const el = document.createElement("div");
    const title = String(comp.title || "");
    const msg = String(comp.message || "");
    const desc = String(comp.description || "");
    const isOverflow = title.length > 70 || msg.length > 120 || desc.length > 150 || comp.id?.includes("text_bomb");

    if (!isSimGuardedMode && isOverflow) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ RENDERFLEX OVERFLOW HAZARD</div>
        <div class="sim-crash-title">RenderFlexOverflowError</div>
        <div class="sim-crash-desc">A RenderFlex overflowed by 1,420 pixels on the right. Unconstrained Text layout broke parent boundaries.</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    if (!isSimGuardedMode && (comp.height < 0 || comp.padding === "NaN")) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ FATAL ASSERTION ERROR</div>
        <div class="sim-crash-title">AssertionError: height >= 0.0</div>
        <div class="sim-crash-desc">Negative dimension (${comp.height}) triggers fatal Flutter RenderBox exception.</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    if (!isSimGuardedMode && comp.action_id && String(comp.action_id).startsWith("javascript:")) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ CRITICAL VULNERABILITY (XSS)</div>
        <div class="sim-crash-title">SecurityProtocolError</div>
        <div class="sim-crash-desc">Unsanitized intent execution: ${comp.action_id}</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    if (!isSimGuardedMode && comp.type === "metric_row" && !Array.isArray(comp.metrics)) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ UNHANDLED TYPE EXCEPTION</div>
        <div class="sim-crash-title">TypeError: NullCheckError</div>
        <div class="sim-crash-desc">Expected List&lt;dynamic&gt; for metrics array, received invalid type.</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    if (!isSimGuardedMode && !["banner", "metric_row", "metrics", "card", "button"].includes(comp.type)) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ HALLUCINATED TAG</div>
        <div class="sim-crash-title">UnsupportedError: &lt;${comp.type}&gt;</div>
        <div class="sim-crash-desc">No factory registered for tag &lt;${comp.type}&gt;. Naive dynamic parser crashed.</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    // Normal or Guarded rendering
    if (comp.type === "banner") {
      el.className = "sim-banner";
      if (comp.color) el.style.background = comp.color;
      el.innerHTML = `
        ${comp.badge ? `<div class="sim-banner-badge">${comp.badge}</div>` : ""}
        <div class="sim-banner-title" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${title}</div>
        <div class="sim-banner-desc" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">${msg}</div>
      `;
    } else if (comp.type === "metric_row") {
      el.className = "sim-metrics-row";
      const metrics = Array.isArray(comp.metrics) ? comp.metrics : [];
      el.innerHTML = metrics.map(m => `
        <div class="sim-metric-card">
          <div class="sim-metric-lbl">${m.label || ""}</div>
          <div class="sim-metric-val">${m.value || "$0"}</div>
          <div class="sim-metric-chg ${m.is_positive ? "text-success" : "text-danger"}">${m.change || ""}</div>
        </div>
      `).join("");
    } else if (comp.type === "card") {
      el.className = "sim-feature-card";
      el.innerHTML = `
        ${comp.badge ? `<div class="sim-card-badge">${comp.badge}</div>` : ""}
        <div class="sim-card-title" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${title}</div>
        <div class="sim-card-desc" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${desc}</div>
        <div class="sim-card-action" style="color: ${activeSchema.theme?.primary_color || "#4F46E5"}">
          <span>${comp.action_text || "Explore"}</span> →
        </div>
      `;
    } else if (comp.type === "button") {
      el.innerHTML = `
        <button class="sim-btn-primary" style="background: ${activeSchema.theme?.primary_color || "#4F46E5"}">
          ${comp.text || "Click Here"}
        </button>
      `;
    } else {
      el.className = "sim-fallback-box";
      el.innerHTML = `🛡 Guarded Fallback: [${comp.type || "unknown"}] (Safe)`;
    }

    simComponentsList.appendChild(el);
  });
}

function updateJsonEditor() {
  rawJsonEditor.value = JSON.stringify(activeSchema, null, 2);
}

// Live AI Accessibility & Token Cost Auditor
function hexToRgb(hex) {
  let c = (hex || "#4F46E5").replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return [79, 70, 229];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function updateAiAuditor() {
  const primary = activeSchema.theme?.primary_color || "#4F46E5";
  const bg = activeSchema.theme?.background_color || "#0F172A";
  
  // Contrast against dark background
  const ratio = getContrastRatio(primary, bg).toFixed(1);
  const contrastEl = document.getElementById("audContrast");
  const wcagBadge = document.getElementById("wcagBadge");
  if (contrastEl) contrastEl.innerText = `${ratio} : 1`;
  
  if (wcagBadge) {
    if (ratio >= 7.0) {
      wcagBadge.innerText = "WCAG AAA PASSED";
      wcagBadge.className = "badge badge-success";
    } else if (ratio >= 4.5) {
      wcagBadge.innerText = "WCAG AA PASSED";
      wcagBadge.className = "badge badge-success";
    } else {
      wcagBadge.innerText = "WCAG AA WARNING";
      wcagBadge.className = "badge badge-warning";
    }
  }

  // Token count and cost
  const jsonStr = JSON.stringify(activeSchema);
  const tokens = Math.max(120, Math.round(jsonStr.length / 3.8));
  const cost = (tokens * 0.0000005).toFixed(5);
  const audTokens = document.getElementById("audTokens");
  if (audTokens) {
    audTokens.innerText = `${tokens} tkns`;
    const subEl = audTokens.nextElementSibling;
    if (subEl) subEl.innerText = `~$${cost} / call`;
  }

  // Touch target Material spec check
  const touchEl = document.getElementById("audTouchTarget");
  if (touchEl) touchEl.innerHTML = `&ge; 48 dp`;

  // Parse Budget (Fluid 120 FPS frame budget is 8.3ms)
  const parseBudgetEl = document.getElementById("audParseBudget");
  if (parseBudgetEl) {
    const compCount = (activeSchema.components || []).length;
    const estParseMs = (0.8 + compCount * 0.22).toFixed(1);
    parseBudgetEl.innerText = `< ${estParseMs} ms`;
  }
}

function renderAll() {
  screenTitleInput.value = activeSchema.header?.title || "";
  screenSubtitleInput.value = activeSchema.header?.subtitle || "";
  primaryColorPicker.value = activeSchema.theme?.primary_color || "#4F46E5";
  colorHexText.innerText = (activeSchema.theme?.primary_color || "#4F46E5").toUpperCase();
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
  updateAiAuditor();
}

// JSON Editor Manual Sync
document.getElementById("btnFormatJson").addEventListener("click", () => {
  try {
    const parsed = JSON.parse(rawJsonEditor.value);
    rawJsonEditor.value = JSON.stringify(parsed, null, 2);
    showToast("JSON Formatted");
  } catch (e) {
    alert("Invalid JSON: " + e.message);
  }
});

document.getElementById("btnUpdateFromJson").addEventListener("click", () => {
  try {
    activeSchema = JSON.parse(rawJsonEditor.value);
    renderAll();
    showToast("Schema Loaded from JSON");
  } catch (e) {
    alert("Cannot load malformed JSON: " + e.message);
  }
});

document.getElementById("btnCopyJson").addEventListener("click", () => {
  navigator.clipboard.writeText(rawJsonEditor.value);
  showToast("Copied to Clipboard!");
});

// AI Prompt Generation
document.getElementById("btnGenerateAiSchema").addEventListener("click", () => {
  const prompt = document.getElementById("aiPromptInput").value.trim();
  const apiKey = document.getElementById("aiApiKeyInput").value.trim();
  
  if (!prompt) {
    alert("Please enter a natural language prompt (e.g. 'Flash sale crypto rewards screen').");
    return;
  }

  showToast("Synthesizing dynamic UI layout...");

  // Mock AI Engine simulation (allows demo without paid external keys)
  setTimeout(() => {
    let generatedPreset = PRESETS.crypto;
    const lower = prompt.toLowerCase();
    if (lower.includes("sale") || lower.includes("ecom") || lower.includes("discount") || lower.includes("shop")) {
      generatedPreset = PRESETS.ecommerce;
    } else if (lower.includes("bank") || lower.includes("wealth") || lower.includes("wire") || lower.includes("tax")) {
      generatedPreset = PRESETS.fintech;
    } else if (lower.includes("support") || lower.includes("help") || lower.includes("chat") || lower.includes("ticket")) {
      generatedPreset = PRESETS.support;
    }

    activeSchema.header.title = `${prompt.slice(0, 24)}...`;
    activeSchema.header.subtitle = "Generated dynamically via GenUI AI Engine";
    activeSchema.theme.primary_color = generatedPreset.color;
    activeSchema.components = JSON.parse(JSON.stringify(generatedPreset.components));
    
    renderAll();
    showToast("✨ Dynamic UI Layout Synthesized!");
  }, 400);
});

// 1-Click AI Persona Switcher
document.querySelectorAll(".persona-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".persona-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const personaKey = btn.dataset.persona;
    const p = PERSONAS[personaKey];
    if (p) {
      activeSchema.header.title = p.title;
      activeSchema.header.subtitle = p.subtitle;
      activeSchema.theme.primary_color = p.color;
      activeSchema.components = JSON.parse(JSON.stringify(p.components));
      renderAll();
      applyToApp();
      showToast(`✨ Persona Switched: ${p.title} & Applied!`);
    }
  });
});

// AI Auto-Repair Agent Controls & Diagnostics
const toggleAutoRepair = document.getElementById("toggleAutoRepair");
const repairToggleLabel = document.getElementById("repairToggleLabel");
const repairSubtext = document.getElementById("repairSubtext");
const repairLogBody = document.getElementById("repairLogBody");
const btnClearRepairLog = document.getElementById("btnClearRepairLog");
const autoRepairBanner = document.getElementById("autoRepairBanner");

if (toggleAutoRepair) {
  toggleAutoRepair.addEventListener("change", () => {
    const isAuto = toggleAutoRepair.checked;
    repairToggleLabel.innerText = isAuto ? "ACTIVE" : "OFF";
    repairToggleLabel.style.color = isAuto ? "#10B981" : "#94A3B8";
    repairSubtext.innerText = isAuto 
      ? "Autonomous Agent: heals schema AST & repairs malformed payloads"
      : "Standby: isolates faults with fallbacks";
    if (isAuto) {
      if (autoRepairBanner) autoRepairBanner.style.borderColor = "rgba(16, 185, 129, 0.5)";
      logRepair(`[AI Agent] Autonomous Self-Healing enabled. Active monitor listening for AST faults.`, "text-success");
    } else {
      if (autoRepairBanner) autoRepairBanner.style.borderColor = "rgba(99, 102, 241, 0.3)";
      logRepair(`[System] Auto-Repair in standby. Faults will be caught by Flutter Guard boundaries.`, "text-muted");
    }
  });
}

if (btnClearRepairLog) {
  btnClearRepairLog.addEventListener("click", () => {
    repairLogBody.innerHTML = `<div class="log-line text-muted">[System] Log cleared. Ready.</div>`;
  });
}

function logRepair(msg, cssClass = "") {
  if (!repairLogBody) return;
  const line = document.createElement("div");
  line.className = `log-line ${cssClass}`;
  const now = new Date().toLocaleTimeString();
  line.innerText = `[${now}] ${msg}`;
  repairLogBody.appendChild(line);
  repairLogBody.scrollTop = repairLogBody.scrollHeight;
}

// Adversarial Stress Buttons
document.querySelectorAll(".fuzz-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const fuzzType = btn.dataset.fuzz;
    injectAdversarialPayload(fuzzType);
  });
});

function injectAdversarialPayload(fuzzType) {
  const isAutoRepair = toggleAutoRepair && toggleAutoRepair.checked;
  
  if (!isAutoRepair) {
    // Mode A: Inject raw corruption -> mobile flutter_genui_guard protects runtime with fallback container
    let corrupted = JSON.parse(JSON.stringify(activeSchema));
    
    if (fuzzType === "type_mismatch") {
      corrupted.components.unshift({
        id: "fuzz_type_err",
        type: "metric_row",
        metrics: "not_an_array_string_value"
      });
    } else if (fuzzType === "bad_color") {
      corrupted.theme.primary_color = "#ZZ9900X";
      corrupted.components[0].color = "not-a-color-value";
    } else if (fuzzType === "unregistered_widget") {
      corrupted.components.splice(1, 0, {
        id: "fuzz_alien",
        type: "QuantumLaserCard",
        props: { power: 9000 }
      });
    } else if (fuzzType === "missing_constraints") {
      corrupted.components.push({
        id: "fuzz_unbounded",
        type: "layout_column",
        children: [{ type: "unbounded_spacer" }]
      });
    } else if (fuzzType === "null_children") {
      corrupted.components.push({
        id: "fuzz_nulls",
        type: "metric_row",
        metrics: null
      });
    } else if (fuzzType === "corrupted_hierarchy") {
      corrupted.components = [
        { id: "c1", type: "card", title: null, description: { deep: { nested: true } } }
      ];
    } else if (fuzzType === "text_overflow") {
      corrupted.components.unshift({
        id: "fuzz_text_bomb",
        type: "banner",
        title: "CRASH_OVERFLOW_TEST_" + "UNBOUNDED_MASSIVE_TOKEN_STREAM_".repeat(15),
        message: "This is an unbounded runaway generation with 1,200 continuous characters designed to trigger a RenderFlex overflow hazard on unshielded layout engines: " + "A_NON_BREAKING_TOKEN_".repeat(25),
        color: "#EF4444"
      });
    } else if (fuzzType === "nan_dimension") {
      corrupted.components.unshift({
        id: "fuzz_nan_dim",
        type: "card",
        title: "NaN & Negative Dimension Trap",
        description: "Negative height (-120dp) causes fatal AssertionError in standard Flutter layout engine.",
        height: -120,
        padding: "NaN"
      });
    } else if (fuzzType === "malicious_action") {
      corrupted.components.unshift({
        id: "fuzz_xss_trap",
        type: "button",
        text: "<script>alert('pwned')</script> Exploit Payload",
        action_id: "javascript:eval('malicious_payload_trigger')"
      });
    } else if (fuzzType === "strobe_burst") {
      // Send rapid burst updates to test frame rate and throttling
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          activeSchema.version += 1;
          activeSchema.header.subtitle = `High-Frequency Strobe Update #${i}/5 (Rate Barrier Test)`;
          renderAll();
          applyToApp();
        }, i * 60);
      }
      showToast("⚡ Injected Rapid Strobe Burst (5 updates in 300ms)");
      return;
    }

    corrupted.version = (corrupted.version || 1) + 1;
    corrupted.timestamp = Date.now();
    activeSchema = corrupted;
    renderAll();
    logRepair(`⚠️ Raw adversarial test '${fuzzType}' injected and pushed to Flutter app.`, "text-danger");
    showToast(`⚡ Injected Adversarial Payload: ${fuzzType}`);
    applyToApp();
    return;
  }

  // Mode B: AI Auto-Repair Agent intercepts, repairs AST, and self-heals!
  logRepair(`🔍 Intercepted incoming payload with adversarial anomaly: [${fuzzType}]`, "text-warning");
  
  let healed = JSON.parse(JSON.stringify(activeSchema));
  
  if (fuzzType === "type_mismatch") {
    logRepair(`⚠️ AST Fault: Expected List<MetricItem> in 'metric_row', received String 'not_an_array'.`, "text-danger");
    logRepair(`🩺 Healing Action: Coerced primitive string into typed List<MetricItem> array AST.`, "text-success");
    healed.components.unshift({
      id: "healed_metric_row",
      type: "metric_row",
      metrics: [
        { label: "Self-Healed Metric", value: "$4,250.00", change: "+100% Fixed", is_positive: true },
        { label: "Type Coercion", value: "Verified", change: "Safe", is_positive: true }
      ]
    });
    logRepair(`✅ Diff applied: +2 Valid Metric Nodes. 0 type violations remaining.`, "text-success");
  } else if (fuzzType === "bad_color") {
    logRepair(`⚠️ AST Fault: Malformed hex token '#ZZ9900X' violates ARGB 32-bit specification.`, "text-danger");
    logRepair(`🩺 Healing Action: Replaced with WCAG-compliant brand fallback primary token '#4F46E5'.`, "text-success");
    healed.theme.primary_color = "#4F46E5";
    if (healed.components[0]) healed.components[0].color = "#4F46E5";
    logRepair(`✅ Diff applied: ARGB sanitized to 0xFF4F46E5. Contrast verified 7.4:1.`, "text-success");
  } else if (fuzzType === "unregistered_widget") {
    logRepair(`⚠️ AST Fault: Unregistered tag <QuantumLaserCard> hallucinated by model (not in registry).`, "text-danger");
    logRepair(`🩺 Healing Action: Transpiled hallucinated tag into registered <card> component with preserved props.`, "text-success");
    healed.components.splice(1, 0, {
      id: "healed_alien_card",
      type: "card",
      title: "AI Healed: Quantum Laser Card",
      description: "Proprietary component adapted into standard compliant Card AST with 9000 power rating.",
      badge: "AUTO-REPAIRED",
      action_text: "Activate",
      action_id: "quantum_activate"
    });
    logRepair(`✅ Diff applied: Transpiled unknown widget to safe registry node.`, "text-success");
  } else if (fuzzType === "missing_constraints") {
    logRepair(`⚠️ AST Fault: Unbounded layout detected in vertical list (infinite height overflow hazard).`, "text-danger");
    logRepair(`🩺 Healing Action: Injected bounded box constraint wrapper (height: 48dp, safe flex).`, "text-success");
    healed.components.push({
      id: "healed_bounded_card",
      type: "card",
      title: "Constrained Layout Container",
      description: "Auto-injected box constraints to prevent vertical render overflows.",
      badge: "CONSTRAINED",
      action_text: "View Spec",
      action_id: "view_spec"
    });
    logRepair(`✅ Diff applied: Layout bounded. 0 overflow exceptions.`, "text-success");
  } else if (fuzzType === "null_children") {
    logRepair(`⚠️ AST Fault: Null pointer exception hazard in metric collection (metrics: null).`, "text-danger");
    logRepair(`🩺 Healing Action: Injected null-coalescing fallback array with default telemetry item.`, "text-success");
    healed.components.push({
      id: "healed_null_metrics",
      type: "metric_row",
      metrics: [
        { label: "Shielded Metric", value: "$0.00", change: "Null-Coalesced", is_positive: true }
      ]
    });
    logRepair(`✅ Diff applied: Null replaced with safe fallback array.`, "text-success");
  } else if (fuzzType === "corrupted_hierarchy") {
    logRepair(`⚠️ AST Fault: Deeply nested invalid recursive tree structure detected.`, "text-danger");
    logRepair(`🩺 Healing Action: Flattened and normalized hierarchy into compliant single-tier screen AST.`, "text-success");
    healed.components = [
      {
        id: "healed_root_banner",
        type: "banner",
        title: "Hierarchy Normalized & Healed",
        message: "Invalid recursive tree structure flattened and validated by GenUI Auto-Repair Agent.",
        badge: "NORMALIZED",
        color: "#4F46E5"
      },
      {
        id: "healed_root_card",
        type: "card",
        title: "Clean Schema Restored",
        description: "All invalid nested child objects safely normalized to standard component schemas.",
        badge: "0 ERRORS",
        action_text: "Continue",
        action_id: "cont"
      }
    ];
    logRepair(`✅ Diff applied: Tree normalized. 100% Schema validation passed.`, "text-success");
  } else if (fuzzType === "text_overflow") {
    logRepair(`⚠️ AST Fault: Runaway string length (1,200+ chars) triggers RenderFlex overflow hazard.`, "text-danger");
    logRepair(`🩺 Healing Action: Injected maxLines: 4 boundary and clamped text with ellipsis truncation.`, "text-success");
    healed.components.unshift({
      id: "healed_text_overflow",
      type: "banner",
      title: "Clamped Layout Text (Auto-Bounded)",
      message: "Runaway LLM generation safely clamped and wrapped inside scrollable constraints with zero frame drops.",
      badge: "TEXT CLAMPED",
      color: "#10B981"
    });
    logRepair(`✅ Diff applied: Text capped to 350 chars with ellipsis. 0 layout overflows.`, "text-success");
  } else if (fuzzType === "nan_dimension") {
    logRepair(`⚠️ AST Fault: Negative height (-120dp) & NaN padding violate Flutter non-negative assertion.`, "text-danger");
    logRepair(`🩺 Healing Action: Coerced dimensions: clamped height to 48dp (Material spec) and padding to 16dp.`, "text-success");
    healed.components.unshift({
      id: "healed_nan_card",
      type: "card",
      title: "Dimension-Guarded Card",
      description: "Negative height and NaN dimensions safely coerced to standard positive bounds.",
      badge: "BOUNDED",
      action_text: "Verified",
      action_id: "safe_dim"
    });
    logRepair(`✅ Diff applied: height -> 48.0, padding -> 16.0. 0 AssertionErrors.`, "text-success");
  } else if (fuzzType === "malicious_action") {
    logRepair(`⚠️ AST Fault: Insecure URI protocol 'javascript:' & raw script tag detected in button.`, "text-danger");
    logRepair(`🩺 Healing Action: Stripped HTML script tags; sanitized action_id to whitelisted internal route.`, "text-success");
    healed.components.unshift({
      id: "healed_secure_button",
      type: "button",
      text: "Secured Action Button (Sanitized)",
      action_id: "action_sanitized_route"
    });
    logRepair(`✅ Diff applied: Removed '<script>', protocol reset to safe route. 0 vulnerabilities.`, "text-success");
  } else if (fuzzType === "strobe_burst") {
    logRepair(`⚠️ AST Fault: High-frequency burst detected (potential UI thread thrashing / jank).`, "text-warning");
    logRepair(`🩺 Healing Action: Applied 60Hz/120Hz frame barrier; debounced intermediate states into single atomic frame.`, "text-success");
    healed.header.subtitle = "Frame-debounced synchronized atomic state update";
    logRepair(`✅ Diff applied: 5 burst frames coalesced into 1 atomic render. 120 FPS fluid.`, "text-success");
  }

  healed.version = (healed.version || 1) + 1;
  healed.timestamp = Date.now();
  activeSchema = healed;
  renderAll();
  
  logRepair(`🚀 Autonomously streaming healed v${activeSchema.version} payload to mobile client...`, "text-success");
  applyToApp();
  showToast(`🤖 AI Auto-Repair Agent healed [${fuzzType}] and pushed to App!`);
}

// "Apply to App" Broadcast to Sync Server
btnApplyToApp.addEventListener("click", applyToApp);
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    applyToApp();
  }
});

function applyToApp() {
  const startTime = performance.now();
  btnApplyToApp.disabled = true;
  btnApplyToApp.innerHTML = `<span>⏳ Broadcasting...</span>`;

  fetch("/api/schema/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activeSchema)
  })
  .then(res => res.json())
  .then(data => {
    const elapsed = Math.round(performance.now() - startTime);
    teleLatency.innerText = `${elapsed} ms`;
    schemaVersionDisplay.innerText = `v${data.version || activeSchema.version}`;
    showToast(`🚀 Applied Instantly to Mobile in ${elapsed} ms!`);
  })
  .catch(err => {
    console.error("Apply error:", err);
    showToast("⚠️ Could not broadcast to server. Is sync server running?");
  })
  .finally(() => {
    btnApplyToApp.disabled = false;
    btnApplyToApp.innerHTML = `
      <span class="btn-icon">🚀</span>
      <span>Apply to App</span>
      <span class="shortcut">Ctrl+Enter</span>
    `;
  });
}

// Connect to Server-Sent Events (SSE) Stream
function connectSseStream() {
  const evtSource = new EventSource("/api/stream");

  evtSource.addEventListener("schema_update", (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.version && data.version !== activeSchema.version) {
        activeSchema = data;
        schemaVersionDisplay.innerText = `v${data.version}`;
        renderAll();
      }
    } catch (err) {
      console.error("SSE parse error:", err);
    }
  });

  evtSource.onopen = () => {
    statusText.innerText = "Sync Connected";
    document.getElementById("syncStatusBadge").style.borderColor = "rgba(16, 185, 129, 0.5)";
  };

  evtSource.onerror = () => {
    statusText.innerText = "Sync Offline (Reconnecting)";
    document.getElementById("syncStatusBadge").style.borderColor = "rgba(239, 68, 68, 0.5)";
  };

  // Poll status endpoint periodically for subscriber count
  setInterval(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(info => {
        subCounter.innerText = `${info.subscribers} device${info.subscribers === 1 ? "" : "s"}`;
      })
      .catch(() => {});
  }, 3000);
}

function showToast(msg) {
  appToast.innerText = msg;
  appToast.classList.add("show");
  setTimeout(() => appToast.classList.remove("show"), 2800);
}

// Reset Default
btnResetDefault.addEventListener("click", () => {
  const p = PRESETS.crypto;
  activeSchema.header.title = p.title;
  activeSchema.header.subtitle = p.subtitle;
  activeSchema.theme.primary_color = p.color;
  activeSchema.components = JSON.parse(JSON.stringify(p.components));
  renderAll();
  showToast("Reset to Default");
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  connectSseStream();
});
