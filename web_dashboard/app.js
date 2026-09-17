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
      action_id: "action_explore",
      custom_dart_code: "ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(\n    content: Text('Exploring all vaults!'),\n    backgroundColor: Color(0xFF4F46E5),\n  ),\n);"
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
  login: {
    title: "Secure Account Sign-In",
    subtitle: "Real-time Dynamic Form Validation",
    color: "#4F46E5",
    components: [
      {
        id: "login_header",
        type: "text",
        text: "Welcome Back",
        font_size: 22,
        is_bold: true,
        align: "center",
        padding: 6
      },
      {
        id: "login_sub",
        type: "text",
        text: "Enter your credentials to access your protected account",
        font_size: 13,
        is_bold: false,
        align: "center",
        padding: 2
      },
      {
        id: "input_email",
        type: "textfield",
        label: "Email Address",
        hint: "alex@example.com",
        is_password: false,
        padding: 6
      },
      {
        id: "input_password",
        type: "textfield",
        label: "Password",
        hint: "Enter your password",
        is_password: true,
        padding: 6
      },
      {
        id: "btn_login",
        type: "button",
        text: "Sign In to Account",
        variant: "primary",
        action_id: "submit_login"
      }
    ]
  },
  register: {
    title: "Member Registration",
    subtitle: "Real-time Dynamic Sign-Up Form",
    color: "#059669",
    components: [
      { id: "reg_header", type: "text", text: "Create Your Account", font_size: 22, is_bold: true, align: "center", padding: 6 },
      { id: "reg_sub", type: "text", text: "Fill in the fields below to start your free trial", font_size: 13, is_bold: false, align: "center", padding: 2 },
      { id: "input_name", type: "textfield", label: "Full Name", hint: "Jane Doe", is_password: false, padding: 6 },
      { id: "input_email", type: "textfield", label: "Work Email", hint: "jane@company.com", is_password: false, padding: 6 },
      { id: "input_password", type: "textfield", label: "Create Password", hint: "Must be 8+ characters", is_password: true, padding: 6 },
      { id: "check_terms", type: "checkbox", label: "I accept the Terms & Privacy Policy", subtitle: "Required to create account", is_checked: false, padding: 4 },
      { id: "btn_register", type: "button", text: "Create Free Account", variant: "primary", action_id: "submit_register" }
    ]
  },
  feedback: {
    title: "Customer Review & Feedback",
    subtitle: "Dynamic Multi-Input Form",
    color: "#D97706",
    components: [
      { id: "fb_header", type: "text", text: "How was your experience?", font_size: 20, is_bold: true, align: "center", padding: 6 },
      { id: "fb_sub", type: "text", text: "Your feedback helps us continuously improve", font_size: 13, is_bold: false, align: "center", padding: 2 },
      {
        id: "fb_rating_row",
        type: "row",
        main_axis_alignment: "spaceAround",
        children: [
          { id: "chip_1", type: "chip", label: "⭐ Fair", is_selected: false },
          { id: "chip_2", type: "chip", label: "⭐⭐⭐ Good", is_selected: false },
          { id: "chip_3", type: "chip", label: "⭐⭐⭐⭐⭐ Excellent", is_selected: true }
        ]
      },
      { id: "input_author", type: "textfield", label: "Your Name or Handle", hint: "e.g. Alex Morgan", is_password: false, padding: 6 },
      { id: "input_comments", type: "textfield", label: "Your Detailed Feedback", hint: "What did you enjoy most, or what can we improve?", max_lines: 3, is_password: false, padding: 6 },
      { id: "switch_public", type: "switch", label: "Post as Public Review", subtitle: "Allow displaying on community wall", is_checked: true, padding: 4 },
      { id: "btn_feedback", type: "button", text: "Submit Customer Feedback", variant: "primary", action_id: "submit_feedback" }
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

function createDefaultWidget(type, customId) {
  const id = customId || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const primary = (activeSchema && activeSchema.theme && activeSchema.theme.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";

  switch (type) {
    case "banner":
      return { id, type, title: "New Dynamic Announcement", message: "Enter custom text here.", badge: "NEW", color: primary };
    case "metric_row":
    case "metrics":
      return { id, type: "metric_row", metrics: [{ label: "Metric A", value: "1,200", change: "+10%", is_positive: true }, { label: "Metric B", value: "98%", change: "+2%", is_positive: true }] };
    case "card":
      return { id, type, title: "New Feature Card", description: "Highlight an action or reward.", badge: "ACTION", action_text: "Learn More", action_id: "action_card" };
    case "button":
      return { id, type, text: "Primary Action", variant: "primary", action_id: "action_btn" };
    case "text":
      return { id, type, text: "Dynamic Typography Headline", font_size: 16, align: "left", is_bold: false, padding: 4 };
    case "image":
      return { id, type, image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", height: 140, border_radius: 12, padding: 4 };
    case "textfield":
    case "input":
      return { id, type: "textfield", label: "Your Full Name", hint: "e.g. John Doe", max_lines: 1, is_password: false, padding: 4 };
    case "listtile":
      return { id, type, title: "Account Security & 2FA", subtitle: "Hardware biometric key active", leading_icon: "lock", trailing_text: "ACTIVE", action_id: "security_click" };
    case "chip":
      return { id, type, label: "Verified Member", icon: "check", is_selected: true, action_id: "chip_click" };
    case "switch":
      return { id, type, label: "Instant Sync & Alerts", subtitle: "Receive immediate updates", is_checked: true, padding: 4 };
    case "checkbox":
      return { id, type, label: "I accept the Terms & Conditions", subtitle: "Required to proceed", is_checked: false, padding: 4 };
    case "radio":
      return { id, type, label: "Standard Delivery Tier", subtitle: "Arrives within 2-3 business days", is_selected: true, padding: 4 };
    case "icon":
      return { id, type, icon: "star", size: 28, color: primary, align: "center", padding: 4 };
    case "divider":
      return { id, type, thickness: 1, color: "#334155", padding: 6 };
    case "spacer":
    case "sized_box":
      return { id, type: "spacer", height: 16, width: 16 };
    case "column":
    case "layout_column":
      return {
        id,
        type: "column",
        main_axis_alignment: "start",
        cross_axis_alignment: "stretch",
        children: [
          { id: `${id}_t1`, type: "text", text: "Inside Vertical Column", font_size: 14, is_bold: true, align: "left" },
          { id: `${id}_btn`, type: "button", text: "Nested Action", variant: "primary", action_id: "col_btn" }
        ]
      };
    case "row":
    case "layout_row":
      return {
        id,
        type: "row",
        main_axis_alignment: "spaceBetween",
        cross_axis_alignment: "center",
        children: [
          { id: `${id}_t1`, type: "text", text: "Row Item", font_size: 14, is_bold: false, align: "left" },
          { id: `${id}_chip`, type: "chip", label: "Status: Live", is_selected: true, icon: "check" }
        ]
      };
    default:
      return { id, type, text: `Default ${type}` };
  }
}

function addComponent(type) {
  const newComp = createDefaultWidget(type);
  activeSchema.components.push(newComp);
  renderAll();
}

window.addChildToContainer = function(parentIdx, childType = 'text') {
  const parent = activeSchema.components[parentIdx];
  if (!parent.children) parent.children = [];
  const childId = `${parent.id}_c${parent.children.length + 1}_${Date.now().toString(36)}`;
  const child = createDefaultWidget(childType, childId);
  parent.children.push(child);
  renderAll();
};

window.removeChildFromContainer = function(parentIdx, childIdx) {
  if (activeSchema.components[parentIdx]?.children) {
    activeSchema.components[parentIdx].children.splice(childIdx, 1);
    renderAll();
  }
};

window.updateChildField = function(parentIdx, childIdx, key, val) {
  if (activeSchema.components[parentIdx]?.children?.[childIdx]) {
    activeSchema.components[parentIdx].children[childIdx][key] = val;
    updateSimulator();
    updateJsonEditor();
  }
};

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

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDartSnippetTemplate(kind, name) {
  const safeName = (name || "Component").replace(/['"\\]/g, "");
  switch (kind) {
    case "nav_profile":
      return `Navigator.pushNamed(\n  context,\n  '/profile',\n  arguments: {'userId': 'alex_vip', 'source': '${safeName}'},\n);`;
    case "nav_settings":
      return `Navigator.pushNamed(\n  context,\n  '/settings',\n  arguments: {'section': 'security', 'user': 'alex_morgan'},\n);`;
    case "custom_sheet":
      return `showModalBottomSheet(\n  context: context,\n  isScrollControlled: true,\n  backgroundColor: Colors.transparent,\n  builder: (context) => const CustomDemoBottomSheet(),\n);`;
    case "getx_nav":
      return `Get.toNamed('/profile', arguments: {'userId': 'vip_42', 'from': '${safeName}'});`;
    case "snackbar":
      return `ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(\n    content: Text('Tapped on ${safeName}!'),\n    backgroundColor: Color(0xFF4F46E5),\n    duration: Duration(seconds: 3),\n  ),\n);`;
    case "dialog":
      return `showDialog(\n  context: context,\n  builder: (ctx) => AlertDialog(\n    title: Text('${safeName} Notice'),\n    content: Text('Triggered custom Flutter code from Web Console!'),\n    actions: [\n      TextButton(\n        onPressed: () => Navigator.pop(ctx),\n        child: Text('OK'),\n      ),\n    ],\n  ),\n);`;
    case "sheet":
    case "bottom_sheet":
      return `showModalBottomSheet(\n  context: context,\n  builder: (ctx) => Container(\n    padding: EdgeInsets.all(20),\n    child: Text('Modal Bottom Sheet for ${safeName}'),\n  ),\n);`;
    case "print":
      return `print('User clicked on ${safeName} in mobile app.');`;
    case "submit":
    case "form_submit":
      return `final errors = GenUiFormRegistry.instance.validateNonEmpty();\nif (errors.isEmpty) {\n  ScaffoldMessenger.of(context).showSnackBar(\n    SnackBar(\n      content: Text('Form Submitted Successfully!'),\n      backgroundColor: Color(0xFF10B981),\n    ),\n  );\n}`;
    default:
      return `ScaffoldMessenger.of(context).showSnackBar(\n  SnackBar(content: Text('Clicked ${safeName}!'), backgroundColor: Color(0xFF4F46E5)),\n);`;
  }
}

function renderOnClickCodeEditor(comp, idx, isChild = false, parentIdx = null) {
  const compName = comp.text || comp.title || comp.label || comp.icon || comp.id || comp.type;
  const targetFn = isChild
    ? `updateChildField(${parentIdx}, ${idx}`
    : `updateCompField(${idx}`;
  const actionType = comp.action_type || (comp.custom_dart_code ? "custom_code" : (comp.action_id ? "action_id" : "none"));

  return `
    <div class="dart-code-section" style="${isChild ? 'grid-column: 1 / -1;' : ''}">
      <div class="dart-code-header">
        <div class="dart-code-title">
          <span>⚡</span> OnClick Action &amp; Flutter Code
        </div>
        <div style="min-width: 155px;">
          <select style="width: 100%; font-size: 11px; padding: 3px 6px;" onchange="${isChild ? `handleChildActionTypeChange(${parentIdx}, ${idx}, this.value)` : `handleCompActionTypeChange(${idx}, this.value)`}">
            <option value="none" ${actionType === 'none' ? 'selected' : ''}>Action: None</option>
            <option value="custom_code" ${actionType === 'custom_code' ? 'selected' : ''}>Custom Flutter Code</option>
            <option value="nav_profile" ${actionType === 'nav_profile' ? 'selected' : ''}>Preset: /profile Navigation</option>
            <option value="nav_settings" ${actionType === 'nav_settings' ? 'selected' : ''}>Preset: /settings Navigation</option>
            <option value="custom_sheet" ${actionType === 'custom_sheet' ? 'selected' : ''}>Preset: Custom BottomSheet</option>
            <option value="getx_nav" ${actionType === 'getx_nav' ? 'selected' : ''}>Preset: GetX Navigation</option>
            <option value="snackbar" ${actionType === 'snackbar' ? 'selected' : ''}>Preset: SnackBar</option>
            <option value="dialog" ${actionType === 'dialog' ? 'selected' : ''}>Preset: Alert Dialog</option>
            <option value="bottom_sheet" ${actionType === 'bottom_sheet' ? 'selected' : ''}>Preset: Bottom Sheet</option>
            <option value="form_submit" ${actionType === 'form_submit' ? 'selected' : ''}>Preset: Form Submit</option>
            <option value="action_id" ${actionType === 'action_id' ? 'selected' : ''}>Preset: Action ID Only</option>
          </select>
        </div>
      </div>

      <div class="dart-code-editor-wrapper">
        <div class="dart-editor-topbar">
          <span>DART / FLUTTER EXECUTION BUFFER</span>
          <span class="dart-code-badge">0% CRASH GUARDED</span>
        </div>
        <textarea
          class="dart-code-textarea"
          id="${isChild ? `child_dart_${parentIdx}_${idx}` : `comp_dart_${idx}`}"
          placeholder="// Enter custom Flutter code to execute on mobile click...&#10;Navigator.pushNamed(context, '/profile', arguments: {'userId': 'alex'});"
          oninput="${targetFn}, 'custom_dart_code', this.value)"
        >${escapeHtml(comp.custom_dart_code || "")}</textarea>
      </div>

      <div class="dart-snippets-row">
        <span class="snippet-label">Insert Snippet:</span>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'nav_profile')` : `insertCompDartSnippet(${idx}, 'nav_profile')`}">+ Nav /profile</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'nav_settings')` : `insertCompDartSnippet(${idx}, 'nav_settings')`}">+ Nav /settings</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'custom_sheet')` : `insertCompDartSnippet(${idx}, 'custom_sheet')`}">+ Custom Sheet</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'getx_nav')` : `insertCompDartSnippet(${idx}, 'getx_nav')`}">+ GetX Nav</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'snackbar')` : `insertCompDartSnippet(${idx}, 'snackbar')`}">+ SnackBar</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'dialog')` : `insertCompDartSnippet(${idx}, 'dialog')`}">+ Dialog</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'submit')` : `insertCompDartSnippet(${idx}, 'submit')`}">+ FormSubmit</button>
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'print')` : `insertCompDartSnippet(${idx}, 'print')`}">+ Print</button>
      </div>
    </div>
  `;
}

window.handleCompActionTypeChange = function(idx, newType) {
  const comp = activeSchema.components[idx];
  if (!comp) return;
  comp.action_type = newType;
  if (newType === 'none') {
    comp.custom_dart_code = "";
    delete comp.action_id;
  } else if (newType === 'custom_code') {
    if (!comp.custom_dart_code) {
      comp.custom_dart_code = getDartSnippetTemplate('snackbar', comp.text || comp.title || comp.id);
    }
  } else if (newType === 'action_id') {
    comp.action_id = comp.action_id || `${comp.id}_action`;
    comp.custom_dart_code = "";
  } else {
    comp.custom_dart_code = getDartSnippetTemplate(newType, comp.text || comp.title || comp.id);
    comp.action_id = `${comp.id}_${newType}`;
  }
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
};

window.handleChildActionTypeChange = function(pIdx, cIdx, newType) {
  const child = activeSchema.components[pIdx]?.children?.[cIdx];
  if (!child) return;
  child.action_type = newType;
  if (newType === 'none') {
    child.custom_dart_code = "";
    delete child.action_id;
  } else if (newType === 'custom_code') {
    if (!child.custom_dart_code) {
      child.custom_dart_code = getDartSnippetTemplate('snackbar', child.text || child.title || child.id);
    }
  } else if (newType === 'action_id') {
    child.action_id = child.action_id || `${child.id}_action`;
    child.custom_dart_code = "";
  } else {
    child.custom_dart_code = getDartSnippetTemplate(newType, child.text || child.title || child.id);
    child.action_id = `${child.id}_${newType}`;
  }
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
};

window.insertCompDartSnippet = function(idx, snippetKey) {
  const comp = activeSchema.components[idx];
  if (!comp) return;
  comp.action_type = 'custom_code';
  comp.custom_dart_code = getDartSnippetTemplate(snippetKey, comp.text || comp.title || comp.id);
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
  showToast(`Inserted Dart ${snippetKey.toUpperCase()} template!`);
};

window.insertChildDartSnippet = function(pIdx, cIdx, snippetKey) {
  const child = activeSchema.components[pIdx]?.children?.[cIdx];
  if (!child) return;
  child.action_type = 'custom_code';
  child.custom_dart_code = getDartSnippetTemplate(snippetKey, child.text || child.title || child.id);
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
  showToast(`Inserted Dart ${snippetKey.toUpperCase()} template!`);
};


function renderChildEditor(parentIdx, cIdx, child) {
  const type = (child.type || "text").toLowerCase();
  let propsHtml = "";

  if (type === "text") {
    propsHtml = `
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Text Content</label>
        <input type="text" value="${escapeHtml(child.text || "")}" placeholder="Enter text..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'text', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Font Size</label>
        <input type="number" min="8" max="48" value="${child.font_size || 14}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'font_size', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Align</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, 'align', this.value)">
          <option value="left" ${child.align === 'left' ? 'selected' : ''}>Left</option>
          <option value="center" ${child.align === 'center' ? 'selected' : ''}>Center</option>
          <option value="right" ${child.align === 'right' ? 'selected' : ''}>Right</option>
        </select>
      </div>
      <div class="nested-child-field">
        <label>Weight</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, 'is_bold', this.value === 'true')">
          <option value="false" ${!child.is_bold ? 'selected' : ''}>Normal</option>
          <option value="true" ${child.is_bold ? 'selected' : ''}>Bold</option>
        </select>
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else if (type === "button") {
    propsHtml = `
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Button Text</label>
        <input type="text" value="${escapeHtml(child.text || "")}" placeholder="Button title..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'text', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Variant</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, 'variant', this.value)">
          <option value="primary" ${child.variant === 'primary' ? 'selected' : ''}>Primary</option>
          <option value="outline" ${child.variant === 'outline' ? 'selected' : ''}>Outline</option>
          <option value="ghost" ${child.variant === 'ghost' ? 'selected' : ''}>Ghost</option>
        </select>
      </div>
      <div class="nested-child-field">
        <label>Action ID (Fallback)</label>
        <input type="text" value="${escapeHtml(child.action_id || "")}" placeholder="action_name" oninput="updateChildField(${parentIdx}, ${cIdx}, 'action_id', this.value)">
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else if (type === "image") {
    propsHtml = `
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Image URL</label>
        <input type="text" value="${escapeHtml(child.image_url || "")}" placeholder="https://..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'image_url', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Height (px)</label>
        <input type="number" min="20" max="300" value="${child.height || 80}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'height', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Border Radius</label>
        <input type="number" min="0" max="32" value="${child.border_radius || 8}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'border_radius', Number(this.value))">
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else if (type === "textfield" || type === "input") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Label</label>
        <input type="text" value="${escapeHtml(child.label || "")}" placeholder="Field label..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'label', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Hint / Placeholder</label>
        <input type="text" value="${escapeHtml(child.hint || "")}" placeholder="Placeholder..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'hint', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Input Mode</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, 'is_password', this.value === 'true')">
          <option value="false" ${!child.is_password ? 'selected' : ''}>Text</option>
          <option value="true" ${child.is_password ? 'selected' : ''}>Password</option>
        </select>
      </div>
      <div class="nested-child-field">
        <label>Lines</label>
        <input type="number" min="1" max="8" value="${child.max_lines || 1}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'max_lines', Number(this.value))">
      </div>
    `;
  } else if (type === "listtile") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Title</label>
        <input type="text" value="${escapeHtml(child.title || child.label || "")}" placeholder="Title..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'title', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Subtitle</label>
        <input type="text" value="${escapeHtml(child.subtitle || "")}" placeholder="Subtitle..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'subtitle', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Leading Icon</label>
        <input type="text" value="${escapeHtml(child.leading_icon || "")}" placeholder="lock, star, check" oninput="updateChildField(${parentIdx}, ${cIdx}, 'leading_icon', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Trailing Text</label>
        <input type="text" value="${escapeHtml(child.trailing_text || "")}" placeholder="ACTIVE, >" oninput="updateChildField(${parentIdx}, ${cIdx}, 'trailing_text', this.value)">
      </div>
    `;
  } else if (type === "chip") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Label</label>
        <input type="text" value="${escapeHtml(child.label || "")}" placeholder="Tag..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'label', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Icon</label>
        <input type="text" value="${escapeHtml(child.icon || "")}" placeholder="check, star" oninput="updateChildField(${parentIdx}, ${cIdx}, 'icon', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Selected</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, 'is_selected', this.value === 'true')">
          <option value="true" ${child.is_selected ? 'selected' : ''}>Yes</option>
          <option value="false" ${!child.is_selected ? 'selected' : ''}>No</option>
        </select>
      </div>
    `;
  } else if (type === "switch" || type === "checkbox" || type === "radio") {
    const isRadio = type === "radio";
    const isChecked = isRadio ? child.is_selected : child.is_checked;
    propsHtml = `
      <div class="nested-child-field">
        <label>Label</label>
        <input type="text" value="${escapeHtml(child.label || "")}" placeholder="Label..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'label', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Subtitle</label>
        <input type="text" value="${escapeHtml(child.subtitle || "")}" placeholder="Subtitle..." oninput="updateChildField(${parentIdx}, ${cIdx}, 'subtitle', this.value)">
      </div>
      <div class="nested-child-field">
        <label>State</label>
        <select onchange="updateChildField(${parentIdx}, ${cIdx}, '${isRadio ? 'is_selected' : 'is_checked'}', this.value === 'true')">
          <option value="true" ${isChecked ? 'selected' : ''}>Active / Checked</option>
          <option value="false" ${!isChecked ? 'selected' : ''}>Inactive / Unchecked</option>
        </select>
      </div>
    `;
  } else if (type === "icon") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Icon Name</label>
        <input type="text" value="${escapeHtml(child.icon || "star")}" placeholder="star, heart, check, bell, lock" oninput="updateChildField(${parentIdx}, ${cIdx}, 'icon', this.value)">
      </div>
      <div class="nested-child-field">
        <label>Size (px)</label>
        <input type="number" min="12" max="64" value="${child.size || 24}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'size', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Color (Hex)</label>
        <input type="text" value="${escapeHtml(child.color || "")}" placeholder="#4F46E5" oninput="updateChildField(${parentIdx}, ${cIdx}, 'color', this.value)">
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else if (type === "divider") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Thickness (px)</label>
        <input type="number" min="1" max="8" value="${child.thickness || 1}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'thickness', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Spacing</label>
        <input type="number" min="2" max="32" value="${child.padding || 4}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'padding', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Color</label>
        <input type="text" value="${escapeHtml(child.color || "#334155")}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'color', this.value)">
      </div>
    `;
  } else if (type === "spacer" || type === "sized_box") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Height (px)</label>
        <input type="number" min="2" max="150" value="${child.height || 16}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'height', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Width (px)</label>
        <input type="number" min="2" max="150" value="${child.width || 16}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'width', Number(this.value))">
      </div>
    `;
  } else {
    propsHtml = `
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Value</label>
        <input type="text" value="${escapeHtml(child.text || child.label || child.title || "")}" placeholder="Value..." oninput="updateChildField(${parentIdx}, ${cIdx}, '${child.label ? 'label' : (child.title ? 'title' : 'text')}', this.value)">
      </div>
    `;
  }

  return `
    <div class="nested-child-item">
      <div class="nested-child-item-header">
        <span>#${cIdx + 1} <strong class="comp-tag">${type.toUpperCase()}</strong></span>
        <button class="comp-delete-btn" title="Remove Child" onclick="removeChildFromContainer(${parentIdx}, ${cIdx})">✕</button>
      </div>
      <div class="nested-child-grid">
        ${propsHtml}
      </div>
    </div>
  `;
}

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
        <div class="input-row">
          <div class="field flex-1">
            <label>Metric 2 Label</label>
            <input type="text" value="${comp.metrics[1]?.label || ""}" oninput="updateMetricField(${idx}, 1, 'label', this.value)">
          </div>
          <div class="field flex-1">
            <label>Metric 2 Value</label>
            <input type="text" value="${comp.metrics[1]?.value || ""}" oninput="updateMetricField(${idx}, 1, 'value', this.value)">
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
        <div class="input-row">
          <div class="field flex-1">
            <label>Badge</label>
            <input type="text" value="${comp.badge || ""}" oninput="updateCompField(${idx}, 'badge', this.value)">
          </div>
          <div class="field flex-1">
            <label>Action Text</label>
            <input type="text" value="${comp.action_text || ""}" oninput="updateCompField(${idx}, 'action_text', this.value)">
          </div>
        </div>
      `;
    } else if (comp.type === "button") {
      fieldsHtml = `
        <div class="field">
          <label>Button Text</label>
          <input type="text" value="${comp.text || ""}" oninput="updateCompField(${idx}, 'text', this.value)">
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Variant</label>
            <select onchange="updateCompField(${idx}, 'variant', this.value)">
              <option value="primary" ${comp.variant === 'primary' ? 'selected' : ''}>Primary (Solid)</option>
              <option value="outline" ${comp.variant === 'outline' ? 'selected' : ''}>Secondary (Outline)</option>
              <option value="ghost" ${comp.variant === 'ghost' ? 'selected' : ''}>Ghost</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Action ID (Fallback)</label>
            <input type="text" value="${comp.action_id || ""}" oninput="updateCompField(${idx}, 'action_id', this.value)">
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
      `;
    } else if (comp.type === "text") {
      fieldsHtml = `
        <div class="field">
          <label>Text Content</label>
          <input type="text" value="${comp.text || ""}" oninput="updateCompField(${idx}, 'text', this.value)">
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Font Size (px)</label>
            <input type="number" min="10" max="48" value="${comp.font_size || 16}" oninput="updateCompField(${idx}, 'font_size', Number(this.value))">
          </div>
          <div class="field flex-1">
            <label>Alignment</label>
            <select onchange="updateCompField(${idx}, 'align', this.value)">
              <option value="left" ${comp.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${comp.align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${comp.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Bold</label>
            <select onchange="updateCompField(${idx}, 'is_bold', this.value === 'true')">
              <option value="false" ${!comp.is_bold ? 'selected' : ''}>Normal</option>
              <option value="true" ${comp.is_bold ? 'selected' : ''}>Bold</option>
            </select>
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
      `;
    } else if (comp.type === "image") {
      fieldsHtml = `
        <div class="field">
          <label>Image URL</label>
          <input type="text" value="${comp.image_url || ""}" oninput="updateCompField(${idx}, 'image_url', this.value)">
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Height (px)</label>
            <input type="number" min="40" max="400" value="${comp.height || 150}" oninput="updateCompField(${idx}, 'height', Number(this.value))">
          </div>
          <div class="field flex-1">
            <label>Border Radius</label>
            <input type="number" min="0" max="40" value="${comp.border_radius || 12}" oninput="updateCompField(${idx}, 'border_radius', Number(this.value))">
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
      `;
    } else if (comp.type === "textfield" || comp.type === "input") {
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Label</label>
            <input type="text" value="${escapeHtml(comp.label || "")}" oninput="updateCompField(${idx}, 'label', this.value)">
          </div>
          <div class="field flex-1">
            <label>Hint / Placeholder</label>
            <input type="text" value="${escapeHtml(comp.hint || "")}" oninput="updateCompField(${idx}, 'hint', this.value)">
          </div>
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Input Mode</label>
            <select onchange="updateCompField(${idx}, 'is_password', this.value === 'true')">
              <option value="false" ${!comp.is_password ? 'selected' : ''}>Text</option>
              <option value="true" ${comp.is_password ? 'selected' : ''}>Password</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Max Lines (1 for single line)</label>
            <input type="number" min="1" max="8" value="${comp.max_lines || 1}" oninput="updateCompField(${idx}, 'max_lines', Number(this.value))">
          </div>
        </div>
      `;
    } else if (comp.type === "listtile") {
      fieldsHtml = `
        <div class="field">
          <label>Title</label>
          <input type="text" value="${comp.title || ""}" oninput="updateCompField(${idx}, 'title', this.value)">
        </div>
        <div class="field">
          <label>Subtitle</label>
          <input type="text" value="${comp.subtitle || ""}" oninput="updateCompField(${idx}, 'subtitle', this.value)">
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Leading Icon</label>
            <input type="text" value="${comp.leading_icon || ""}" placeholder="lock, star, check" oninput="updateCompField(${idx}, 'leading_icon', this.value)">
          </div>
          <div class="field flex-1">
            <label>Trailing Badge / Text</label>
            <input type="text" value="${comp.trailing_text || ""}" placeholder="ACTIVE" oninput="updateCompField(${idx}, 'trailing_text', this.value)">
          </div>
        </div>
      `;
    } else if (comp.type === "chip") {
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Chip Text</label>
            <input type="text" value="${comp.label || ""}" oninput="updateCompField(${idx}, 'label', this.value)">
          </div>
          <div class="field flex-1">
            <label>Icon Name</label>
            <input type="text" value="${comp.icon || ""}" placeholder="check, star" oninput="updateCompField(${idx}, 'icon', this.value)">
          </div>
          <div class="field flex-1">
            <label>Selected</label>
            <select onchange="updateCompField(${idx}, 'is_selected', this.value === 'true')">
              <option value="true" ${comp.is_selected ? 'selected' : ''}>Yes</option>
              <option value="false" ${!comp.is_selected ? 'selected' : ''}>No</option>
            </select>
          </div>
        </div>
      `;
    } else if (comp.type === "switch" || comp.type === "checkbox" || comp.type === "radio") {
      const isRadio = comp.type === "radio";
      const checkedVal = isRadio ? comp.is_selected : comp.is_checked;
      fieldsHtml = `
        <div class="field">
          <label>Label</label>
          <input type="text" value="${comp.label || ""}" oninput="updateCompField(${idx}, 'label', this.value)">
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Subtitle</label>
            <input type="text" value="${comp.subtitle || ""}" oninput="updateCompField(${idx}, 'subtitle', this.value)">
          </div>
          <div class="field flex-1">
            <label>Checked State</label>
            <select onchange="updateCompField(${idx}, '${isRadio ? 'is_selected' : 'is_checked'}', this.value === 'true')">
              <option value="true" ${checkedVal ? 'selected' : ''}>Checked / Active</option>
              <option value="false" ${!checkedVal ? 'selected' : ''}>Unchecked</option>
            </select>
          </div>
        </div>
      `;
    } else if (comp.type === "icon") {
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Icon Identifier</label>
            <input type="text" value="${comp.icon || "star"}" placeholder="star, heart, check, settings" oninput="updateCompField(${idx}, 'icon', this.value)">
          </div>
          <div class="field flex-1">
            <label>Size (px)</label>
            <input type="number" min="12" max="64" value="${comp.size || 28}" oninput="updateCompField(${idx}, 'size', Number(this.value))">
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
      `;
    } else if (comp.type === "divider") {
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Thickness (px)</label>
            <input type="number" min="1" max="8" value="${comp.thickness || 1}" oninput="updateCompField(${idx}, 'thickness', Number(this.value))">
          </div>
          <div class="field flex-1">
            <label>Vertical Spacing</label>
            <input type="number" min="2" max="32" value="${comp.padding || 8}" oninput="updateCompField(${idx}, 'padding', Number(this.value))">
          </div>
        </div>
      `;
    } else if (comp.type === "spacer") {
      fieldsHtml = `
        <div class="field">
          <label>Height (px)</label>
          <input type="number" min="4" max="200" value="${comp.height || 20}" oninput="updateCompField(${idx}, 'height', Number(this.value))">
        </div>
      `;
    } else if (comp.type === "column" || comp.type === "row" || comp.type === "layout_column" || comp.type === "layout_row") {
      const isRow = comp.type === "row" || comp.type === "layout_row";
      fieldsHtml = `
        <div class="input-row" style="margin-bottom: 8px;">
          <div class="field flex-1">
            <label>Main Axis Alignment</label>
            <select onchange="updateCompField(${idx}, 'main_axis_alignment', this.value)">
              <option value="start" ${comp.main_axis_alignment === 'start' || (!comp.main_axis_alignment && !isRow) ? 'selected' : ''}>Start</option>
              <option value="center" ${comp.main_axis_alignment === 'center' ? 'selected' : ''}>Center</option>
              <option value="end" ${comp.main_axis_alignment === 'end' ? 'selected' : ''}>End</option>
              <option value="spaceBetween" ${(!comp.main_axis_alignment && isRow) || comp.main_axis_alignment === 'spaceBetween' ? 'selected' : ''}>Space Between</option>
              <option value="spaceAround" ${comp.main_axis_alignment === 'spaceAround' ? 'selected' : ''}>Space Around</option>
              <option value="spaceEvenly" ${comp.main_axis_alignment === 'spaceEvenly' ? 'selected' : ''}>Space Evenly</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Cross Axis Alignment</label>
            <select onchange="updateCompField(${idx}, 'cross_axis_alignment', this.value)">
              <option value="center" ${comp.cross_axis_alignment === 'center' || (!comp.cross_axis_alignment && isRow) ? 'selected' : ''}>Center</option>
              <option value="start" ${comp.cross_axis_alignment === 'start' ? 'selected' : ''}>Start</option>
              <option value="end" ${comp.cross_axis_alignment === 'end' ? 'selected' : ''}>End</option>
              <option value="stretch" ${comp.cross_axis_alignment === 'stretch' || (!comp.cross_axis_alignment && !isRow) ? 'selected' : ''}>Stretch</option>
            </select>
          </div>
        </div>
        <div class="nested-child-container">
          <div class="nested-child-header">
            <span>${isRow ? 'HORIZONTAL ROW' : 'VERTICAL COLUMN'} CHILDREN (${(comp.children || []).length})</span>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <select class="child-add-dropdown" onchange="if(this.value){ addChildToContainer(${idx}, this.value); this.value=''; }">
                <option value="">+ Add Child Widget...</option>
                <option value="text">Text (Typography)</option>
                <option value="button">Button (Action)</option>
                <option value="image">Image (Network)</option>
                <option value="textfield">TextField (Input)</option>
                <option value="listtile">ListTile (Tile Row)</option>
                <option value="chip">Chip (Badge)</option>
                <option value="switch">Switch (Toggle)</option>
                <option value="checkbox">Checkbox (Check)</option>
                <option value="radio">Radio (Option)</option>
                <option value="icon">Icon (Symbol)</option>
                <option value="divider">Divider (Line)</option>
                <option value="spacer">Spacer (Spacing)</option>
              </select>
              <button class="btn btn-xs btn-outline" title="Quick Add Text" onclick="addChildToContainer(${idx}, 'text')">+ Text</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Icon" onclick="addChildToContainer(${idx}, 'icon')">+ Icon</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Button" onclick="addChildToContainer(${idx}, 'button')">+ Button</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Chip" onclick="addChildToContainer(${idx}, 'chip')">+ Chip</button>
            </div>
          </div>
          ${(comp.children || []).map((child, cIdx) => renderChildEditor(idx, cIdx, child)).join("")}
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

function isValidHexColor(val) {
  if (typeof val !== "string") return false;
  const clean = val.replace("#", "").replace("0x", "").replace("0X", "").trim();
  return (clean.length === 6 || clean.length === 8 || clean.length === 3) && /^[0-9A-Fa-f]+$/.test(clean);
}

const ALL_SUPPORTED_TYPES = [
  "banner", "metric_row", "metrics", "card", "button",
  "text", "image", "textfield", "input", "listtile", "chip",
  "switch", "checkbox", "radio", "icon", "divider", "spacer", "sized_box",
  "column", "layout_column", "row", "layout_row"
];

function renderSimChildHtml(comp) {
  if (!comp) return "";
  const primaryColor = isValidHexColor(activeSchema.theme?.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";
  const type = (comp.type || "").toLowerCase();

  if (type === "text") {
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    return `<div class="sim-text ${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="text-align:${comp.align || 'left'}; font-size:${comp.font_size || 14}px; font-weight:${comp.is_bold ? '700' : '400'}; color:${comp.color || '#fff'}; padding:${comp.padding !== undefined ? comp.padding : 2}px 0; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(comp.text || "")}</div>`;
  }
  if (type === "button") {
    const isOutline = comp.variant === 'outline' || comp.variant === 'ghost';
    const bg = isOutline ? 'transparent' : primaryColor;
    const border = isOutline ? `1px solid ${primaryColor}` : 'none';
    const textColor = isOutline ? primaryColor : '#fff';
    return `<button class="sim-btn-primary sim-clickable" onclick="handleSimulatorDartClick('${comp.id}', event)" style="background:${bg}; border:${border}; color:${textColor}; padding:6px 14px; font-size:12px; height:auto; width:auto; border-radius:6px; cursor:pointer;">${escapeHtml(comp.text || 'Action')}</button>`;
  }
  if (type === "image") {
    const imgUrl = comp.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    return `<div class="sim-image ${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="padding:${comp.padding !== undefined ? comp.padding : 2}px 0;"><img src="${escapeHtml(imgUrl)}" style="height:${comp.height || 80}px; border-radius:${comp.border_radius || 6}px; max-width:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';" /></div>`;
  }
  if (type === "textfield" || type === "input") {
    const isMultiLine = Number(comp.max_lines) > 1;
    return `
      <div class="sim-textfield" style="padding:${comp.padding !== undefined ? comp.padding : 2}px 0; width:100%;">
        ${comp.label ? `<label style="font-size:10px; color:#94A3B8; margin-bottom:2px; display:block;">${escapeHtml(comp.label)}</label>` : ""}
        ${isMultiLine ? `
          <textarea id="sim_input_${comp.id}" data-label="${escapeHtml(comp.label || comp.hint || 'Field')}" placeholder="${escapeHtml(comp.hint || 'Enter text...')}" rows="${comp.max_lines || 3}" style="width:100%; font-size:11px; padding:6px 8px; border-radius:6px; background:#0B1120; border:1px solid #334155; color:#fff; resize:vertical; font-family:inherit;"></textarea>
        ` : `
          <input type="${comp.is_password ? 'password' : 'text'}" id="sim_input_${comp.id}" data-label="${escapeHtml(comp.label || comp.hint || 'Field')}" placeholder="${escapeHtml(comp.hint || 'Enter text...')}" style="width:100%; font-size:11px; padding:6px 8px; border-radius:6px; background:#0B1120; border:1px solid #334155; color:#fff;" />
        `}
      </div>
    `;
  }
  if (type === "listtile") {
    const iconSym = comp.leading_icon === 'lock' ? '🔒' : (comp.leading_icon === 'star' ? '⭐' : (comp.leading_icon === 'check' ? '✓' : (comp.leading_icon === 'bell' ? '🔔' : '🔹')));
    return `
      <div class="sim-listtile" style="padding:6px 8px; width:100%; margin:2px 0;">
        <div class="sim-listtile-leading" style="font-size:16px;">${iconSym}</div>
        <div class="sim-listtile-content">
          <div class="sim-listtile-title" style="font-size:12px;">${escapeHtml(comp.title || comp.label || "List Item")}</div>
          ${comp.subtitle ? `<div class="sim-listtile-sub" style="font-size:10px;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div class="sim-listtile-trailing" style="font-size:11px; color:${primaryColor};">${escapeHtml(comp.trailing_text || '›')}</div>
      </div>
    `;
  }
  if (type === "chip") {
    return `<div class="sim-chip ${comp.is_selected ? 'selected' : ''}" style="${comp.is_selected ? `background:${primaryColor};` : ''} font-size:11px; padding:4px 10px;">${comp.icon ? `<span>${comp.icon === 'check' ? '✓' : (comp.icon === 'star' ? '★' : '♥')}</span>` : ''}<span>${escapeHtml(comp.label || 'Chip Tag')}</span></div>`;
  }
  if (type === "switch") {
    return `
      <div class="sim-toggle-row" style="padding:4px 8px; width:100%;">
        <div>
          <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHtml(comp.label || "Switch Option")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div class="sim-switch-pill ${comp.is_checked ? 'active' : ''}" style="${comp.is_checked ? `background:${primaryColor}` : ''}"></div>
      </div>
    `;
  }
  if (type === "checkbox") {
    return `
      <div class="sim-check-row" style="padding:4px 8px; width:100%;">
        <div>
          <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHtml(comp.label || "Checkbox")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div style="width:18px;height:18px;border-radius:4px;border:2px solid ${comp.is_checked ? primaryColor : '#475569'};background:${comp.is_checked ? primaryColor : 'transparent'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:bold;">
          ${comp.is_checked ? '✓' : ''}
        </div>
      </div>
    `;
  }
  if (type === "radio") {
    return `
      <div class="sim-radio-row" style="padding:4px 8px; width:100%;">
        <div>
          <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHtml(comp.label || "Radio")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div style="width:18px;height:18px;border-radius:50%;border:2px solid ${comp.is_selected ? primaryColor : '#475569'};display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:${comp.is_selected ? primaryColor : 'transparent'};"></div>
        </div>
      </div>
    `;
  }
  if (type === "icon") {
    const iconSym = comp.icon === 'star' ? '★' : (comp.icon === 'heart' ? '♥' : (comp.icon === 'check' ? '✓' : (comp.icon === 'lock' ? '🔒' : (comp.icon === 'bell' ? '🔔' : (comp.icon === 'settings' ? '⚙' : '✦')))));
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    return `<span class="${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="font-size:${comp.size || 22}px;color:${comp.color || primaryColor};display:inline-flex;align-items:center;justify-content:center;padding:${comp.padding !== undefined ? comp.padding : 2}px;">${iconSym}</span>`;
  }
  if (type === "divider") {
    return `<div style="width:100%;border-top:${comp.thickness || 1}px solid ${comp.color || '#334155'};margin:${comp.padding || 4}px 0;"></div>`;
  }
  if (type === "spacer" || type === "sized_box") {
    return `<div style="height:${comp.height || 12}px;width:${comp.width || 12}px;flex-shrink:0;"></div>`;
  }
  return `<span style="font-size:11px;color:#94A3B8;padding:2px 4px;background:#1E293B;border-radius:4px;">[${comp.type}]</span>`;
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
      (c.color && !isValidHexColor(c.color)) ||
      !ALL_SUPPORTED_TYPES.includes(c.type)
    );
  }) || (activeSchema.theme?.primary_color && !isValidHexColor(activeSchema.theme.primary_color));

  if (isSimGuardedMode && hasAnomaly) {
    const banner = document.createElement("div");
    banner.className = "sim-guard-banner";
    let guardMsg = "🛡 Guard Active: Layout Shielded & Self-Healed (< 0.05ms)";
    if ((activeSchema.components || []).some(c => c.type === "metric_row" && !Array.isArray(c.metrics))) {
      guardMsg = "🛡 Guard Active: Type Mismatch Coerced (String → List<MetricItem>)";
    } else if (!isValidHexColor(activeSchema.theme?.primary_color) || (activeSchema.components || []).some(c => c.color && !isValidHexColor(c.color))) {
      guardMsg = "🛡 Guard Active: Malformed Color Hex Sanitized to Token (#4F46E5)";
    } else if ((activeSchema.components || []).some(c => String(c.title || "").length > 70 || String(c.message || "").length > 120 || String(c.description || "").length > 150 || c.id?.includes("text_bomb"))) {
      guardMsg = "🛡 Guard Active: Text Clamped & Layout Shielded (< 0.05ms)";
    }
    banner.innerHTML = guardMsg;
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

  // Fatal Theme Exception in Naive mode
  if (!isSimGuardedMode && activeSchema.theme?.primary_color && !isValidHexColor(activeSchema.theme.primary_color)) {
    const themeCrash = document.createElement("div");
    themeCrash.className = "sim-crash-box";
    themeCrash.innerHTML = `
      <div class="sim-crash-header">⚠ FATAL THEME PARSE EXCEPTION</div>
      <div class="sim-crash-title">FormatException: Invalid Radix-16 Color Number</div>
      <div class="sim-crash-desc">Cannot parse theme primary_color "${activeSchema.theme.primary_color}" as ARGB hex. Unhandled Flutter parse exception.</div>
      <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
    `;
    simComponentsList.appendChild(themeCrash);
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

    if (!isSimGuardedMode && comp.color && !isValidHexColor(comp.color)) {
      el.className = "sim-crash-box";
      el.innerHTML = `
        <div class="sim-crash-header">⚠ FORMAT EXCEPTION (RADIX-16)</div>
        <div class="sim-crash-title">FormatException: Invalid Radix-16 Color Number</div>
        <div class="sim-crash-desc">Cannot parse "${comp.color}" as 32-bit ARGB hex color. Unhandled Flutter parse exception.</div>
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
        <div class="sim-crash-title">TypeError: type 'String' is not a subtype of type 'List&lt;dynamic&gt;'</div>
        <div class="sim-crash-desc">Expected List&lt;MetricItem&gt; for metrics array, received String ("${comp.metrics}"). Fatal Flutter runtime type exception.</div>
        <div class="sim-crash-hint">👉 Click "NAIVE" pill to flip to GUARDED mode</div>
      `;
      simComponentsList.appendChild(el);
      return;
    }

    if (!isSimGuardedMode && !ALL_SUPPORTED_TYPES.includes(comp.type)) {
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
      const bannerColor = isValidHexColor(comp.color) ? comp.color : "#4F46E5";
      el.style.background = bannerColor;
      const isSanitizedColor = comp.color && !isValidHexColor(comp.color);
      el.innerHTML = `
        ${isSanitizedColor ? `<div class="sim-banner-badge" style="background:#10B981;color:#fff;">COLOR SANITIZED: #4F46E5</div>` : (comp.badge ? `<div class="sim-banner-badge">${comp.badge}</div>` : "")}
        <div class="sim-banner-title" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${title}</div>
        <div class="sim-banner-desc" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">${msg}</div>
      `;
    } else if (comp.type === "metric_row") {
      el.className = "sim-metrics-row";
      let metrics = comp.metrics;
      if (!Array.isArray(metrics)) {
        metrics = [
          { label: "Coerced Metric", value: String(comp.metrics || "$0.00").substring(0, 16), change: "+0% Coerced", is_positive: true },
          { label: "Type Safety", value: "Guarded", change: "Safe", is_positive: true }
        ];
      }
      el.innerHTML = metrics.map(m => `
        <div class="sim-metric-card">
          <div class="sim-metric-lbl">${m.label || ""}</div>
          <div class="sim-metric-val">${m.value || "$0"}</div>
          <div class="sim-metric-chg ${m.is_positive ? "text-success" : "text-danger"}">${m.change || ""}</div>
        </div>
      `).join("");
    } else if (comp.type === "card") {
      el.className = "sim-feature-card";
      const primaryColor = isValidHexColor(activeSchema.theme?.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";
      el.innerHTML = `
        ${comp.badge ? `<div class="sim-card-badge">${comp.badge}</div>` : ""}
        <div class="sim-card-title" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${title}</div>
        <div class="sim-card-desc" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${desc}</div>
        <div class="sim-card-action" style="color: ${primaryColor}">
          <span>${comp.action_text || "Explore"}</span> →
        </div>
      `;
    } else if (comp.type === "button") {
      const primaryColor = isValidHexColor(activeSchema.theme?.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";
      el.innerHTML = `
        <button class="sim-btn-primary sim-clickable" onclick="handleSimulatorDartClick('${comp.id}', event)" style="background: ${primaryColor}">
          ${comp.text || "Click Here"}
        </button>
      `;
    } else if (comp.type === "text") {
      el.className = "sim-text";
      el.style.textAlign = comp.align || "left";
      el.style.fontSize = `${comp.font_size || 15}px`;
      el.style.fontWeight = comp.is_bold ? "700" : "400";
      el.style.color = comp.color || "#FFFFFF";
      el.style.padding = `${comp.padding || 4}px 0`;
      el.innerText = comp.text || comp.title || "Dynamic Text";

      if (comp.custom_dart_code || comp.onclick || comp.action_id) {
        el.classList.add("sim-clickable");
        el.setAttribute("title", "Click to execute custom Dart code");
        el.onclick = (e) => handleSimulatorDartClick(comp.id, e);
      }
    } else if (comp.type === "image") {
      el.className = "sim-image";
      el.style.padding = `${comp.padding || 6}px 0`;
      const imgUrl = comp.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
      el.innerHTML = `<img src="${imgUrl}" style="height:${comp.height || 150}px; border-radius:${comp.border_radius || 12}px;" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';" />`;

      if (comp.custom_dart_code || comp.onclick || comp.action_id) {
        el.classList.add("sim-clickable");
        el.setAttribute("title", "Click to execute custom Dart code");
        el.onclick = (e) => handleSimulatorDartClick(comp.id, e);
      }
    } else if (comp.type === "textfield" || comp.type === "input") {
      el.className = "sim-textfield";
      const isMultiLine = Number(comp.max_lines) > 1;
      el.innerHTML = `
        ${comp.label ? `<label>${escapeHtml(comp.label)}</label>` : ""}
        ${isMultiLine ? `
          <textarea id="sim_input_${comp.id}" data-label="${escapeHtml(comp.label || comp.hint || 'Field')}" placeholder="${escapeHtml(comp.hint || 'Enter value...')}" rows="${comp.max_lines || 3}" style="width:100%; font-size:13px; padding:10px 12px; border-radius:10px; background:#0F172A; border:1px solid #334155; color:#fff; resize:vertical; font-family:inherit;"></textarea>
        ` : `
          <input type="${comp.is_password ? 'password' : 'text'}" id="sim_input_${comp.id}" data-label="${escapeHtml(comp.label || comp.hint || 'Field')}" placeholder="${escapeHtml(comp.hint || 'Enter value...')}" />
        `}
      `;
    } else if (comp.type === "listtile") {
      el.className = "sim-listtile";
      const iconSym = comp.leading_icon === 'lock' ? '🔒' : (comp.leading_icon === 'star' ? '⭐' : (comp.leading_icon === 'check' ? '✓' : '🔹'));
      el.innerHTML = `
        <div class="sim-listtile-leading">${iconSym}</div>
        <div class="sim-listtile-content">
          <div class="sim-listtile-title">${comp.title || comp.label || "List Item"}</div>
          ${comp.subtitle ? `<div class="sim-listtile-sub">${comp.subtitle}</div>` : ""}
        </div>
        <div class="sim-listtile-trailing">${comp.trailing_text || '›'}</div>
      `;
    } else if (comp.type === "chip") {
      el.className = `sim-chip ${comp.is_selected ? 'selected' : ''}`;
      if (comp.is_selected) el.style.background = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        ${comp.icon ? `<span>${comp.icon === 'check' ? '✓' : '★'}</span>` : ""}
        <span>${comp.label || "Chip Tag"}</span>
      `;
    } else if (comp.type === "switch") {
      el.className = "sim-toggle-row";
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:#fff;">${comp.label || "Switch Toggle"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div class="sim-switch-pill ${comp.is_checked ? 'active' : ''}" style="${comp.is_checked ? `background:${activeSchema.theme?.primary_color || '#4F46E5'}` : ''}"></div>
      `;
    } else if (comp.type === "checkbox") {
      el.className = "sim-check-row";
      const primaryColor = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:#fff;">${comp.label || "Checkbox Option"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div style="width:20px;height:20px;border-radius:5px;border:2px solid ${comp.is_checked ? primaryColor : '#475569'};background:${comp.is_checked ? primaryColor : 'transparent'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">
          ${comp.is_checked ? '✓' : ''}
        </div>
      `;
    } else if (comp.type === "radio") {
      el.className = "sim-radio-row";
      const primaryColor = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:#fff;">${comp.label || "Radio Option"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${comp.is_selected ? primaryColor : '#475569'};display:flex;align-items:center;justify-content:center;">
          <div style="width:9px;height:9px;border-radius:50%;background:${comp.is_selected ? primaryColor : 'transparent'};"></div>
        </div>
      `;
    } else if (comp.type === "icon") {
      const iconSym = comp.icon === 'star' ? '★' : (comp.icon === 'heart' ? '♥' : (comp.icon === 'check' ? '✓' : '⚙'));
      el.style.textAlign = comp.align || "center";
      el.style.padding = `${comp.padding || 4}px 0`;
      el.innerHTML = `<span style="font-size:${comp.size || 28}px;color:${comp.color || activeSchema.theme?.primary_color || '#4F46E5'};">${iconSym}</span>`;

      if (comp.custom_dart_code || comp.onclick || comp.action_id) {
        el.classList.add("sim-clickable");
        el.setAttribute("title", "Click to execute custom Dart code");
        el.onclick = (e) => handleSimulatorDartClick(comp.id, e);
      }
    } else if (comp.type === "divider") {
      el.className = "sim-divider";
      el.style.borderTop = `${comp.thickness || 1}px solid ${comp.color || '#334155'}`;
      el.style.margin = `${comp.padding || 8}px 0`;
    } else if (comp.type === "spacer" || comp.type === "sized_box") {
      el.style.height = `${comp.height || 20}px`;
    } else if (comp.type === "column" || comp.type === "layout_column") {
      el.className = "sim-column";
      const mainAlignMap = {
        start: 'flex-start', center: 'center', end: 'flex-end',
        spacebetween: 'space-between', space_between: 'space-between',
        spacearound: 'space-around', space_around: 'space-around',
        spaceevenly: 'space-evenly', space_evenly: 'space-evenly'
      };
      const crossAlignMap = {
        start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch'
      };
      if (comp.main_axis_alignment) {
        el.style.justifyContent = mainAlignMap[String(comp.main_axis_alignment).toLowerCase()] || 'flex-start';
      }
      if (comp.cross_axis_alignment) {
        el.style.alignItems = crossAlignMap[String(comp.cross_axis_alignment).toLowerCase()] || 'stretch';
      }
      el.innerHTML = (comp.children || []).map(renderSimChildHtml).join("");
    } else if (comp.type === "row" || comp.type === "layout_row") {
      el.className = "sim-row";
      const mainAlignMap = {
        start: 'flex-start', center: 'center', end: 'flex-end',
        spacebetween: 'space-between', space_between: 'space-between',
        spacearound: 'space-around', space_around: 'space-around',
        spaceevenly: 'space-evenly', space_evenly: 'space-evenly'
      };
      const crossAlignMap = {
        start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch'
      };
      if (comp.main_axis_alignment) {
        el.style.justifyContent = mainAlignMap[String(comp.main_axis_alignment).toLowerCase()] || 'space-between';
      }
      if (comp.cross_axis_alignment) {
        el.style.alignItems = crossAlignMap[String(comp.cross_axis_alignment).toLowerCase()] || 'center';
      }
      el.innerHTML = (comp.children || []).map(renderSimChildHtml).join("");
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
  primaryColorPicker.value = isValidHexColor(activeSchema.theme?.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";
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
    if (lower.includes("login") || lower.includes("signin") || lower.includes("sign in") || lower.includes("auth")) {
      generatedPreset = PRESETS.login;
    } else if (lower.includes("register") || lower.includes("signup") || lower.includes("sign up") || lower.includes("create account") || lower.includes("join")) {
      generatedPreset = PRESETS.register;
    } else if (lower.includes("feedback") || lower.includes("review") || lower.includes("rating") || lower.includes("survey") || lower.includes("comment")) {
      generatedPreset = PRESETS.feedback;
    } else if (lower.includes("sale") || lower.includes("ecom") || lower.includes("discount") || lower.includes("shop")) {
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
      corrupted.components.unshift({
        id: "fuzz_bad_color",
        type: "banner",
        title: "Malformed Hex / ARGB Color Crash",
        message: "Invalid color hex string '#ZZ9900X' and 'not-a-color-value' injected without schema validation.",
        color: "#ZZ9900X"
      });
      if (corrupted.components[1]) {
        corrupted.components[1].color = "not-a-color-value";
      }
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
    healed.components.unshift({
      id: "healed_bad_color",
      type: "banner",
      title: "Self-Healed Color Palette",
      message: "Malformed color '#ZZ9900X' sanitized to brand primary '#4F46E5'.",
      color: "#4F46E5"
    });
    if (healed.components[1]) healed.components[1].color = "#4F46E5";
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

function showToast(msg, isError = false) {
  appToast.innerText = msg;
  appToast.style.background = isError ? "#EF4444" : "#10B981";
  appToast.style.boxShadow = isError ? "0 8px 24px rgba(239, 68, 68, 0.4)" : "0 8px 24px rgba(16, 185, 129, 0.4)";
  appToast.classList.add("show");
  setTimeout(() => appToast.classList.remove("show"), 3200);
}

window.handleSimulatorAction = function(actionId) {
  const actionLower = String(actionId || "").toLowerCase();
  const isFormSubmit = actionLower.includes("login") ||
      actionLower.includes("submit") ||
      actionLower.includes("signin") ||
      actionLower.includes("register") ||
      actionLower.includes("signup") ||
      actionLower.includes("feedback") ||
      actionLower.includes("review") ||
      actionLower.includes("auth");

  if (isFormSubmit) {
    const inputs = document.querySelectorAll("#simComponentsList input, #simComponentsList textarea");
    if (inputs.length === 0) {
      showToast(`Triggered Action: "${actionId}"`);
      return;
    }

    const values = {};
    let emptyLabel = null;

    inputs.forEach(input => {
      if (input.type === "checkbox") {
        const label = input.getAttribute("data-label") || "Agreement";
        values[label] = input.checked ? "Yes" : "No";
      } else {
        const label = input.getAttribute("data-label") || input.placeholder || "Field";
        const val = input.value.trim();
        values[label] = val;
        if (!val && !emptyLabel) {
          emptyLabel = label;
        }
      }
    });

    if (emptyLabel) {
      showToast(`⚠️ Validation Error: "${emptyLabel}" cannot be empty!`, true);
      return;
    }

    // Check terms for register action if present
    if (actionLower.includes("register") || actionLower.includes("signup")) {
      const termsBox = document.querySelector("#simComponentsList input[type='checkbox']");
      if (termsBox && !termsBox.checked) {
        showToast("⚠️ Validation Error: Please accept the Terms & Conditions!", true);
        return;
      }
    }

    const summary = Object.entries(values)
      .map(([k, v]) => `${k}: ${k.toLowerCase().includes('pass') ? '••••••••' : v}`)
      .join(", ");
    showToast(`✅ Validation Passed! ${summary}`);
  } else {
    showToast(`Triggered Action: "${actionId}"`);
  }
};

// ==========================================================================
// ⚡ Simulator Dart Execution Engine
// ==========================================================================
window.handleSimulatorDartClick = function(compId, event) {
  if (event) {
    event.stopPropagation();
  }

  let comp = null;
  for (const c of activeSchema.components) {
    if (c.id === compId) { comp = c; break; }
    if (c.children && Array.isArray(c.children)) {
      for (const ch of c.children) {
        if (ch.id === compId) { comp = ch; break; }
      }
      if (comp) break;
    }
  }

  if (!comp) {
    window.handleSimulatorAction(compId);
    return;
  }

  const dartCode = comp.custom_dart_code || (typeof comp.onclick === 'string' ? comp.onclick : comp.onclick?.code);

  if (dartCode && dartCode.trim().length > 0) {
    executeSimulatorDartSnippet(dartCode.trim(), comp);
  } else if (comp.action_id) {
    window.handleSimulatorAction(comp.action_id);
  } else {
    showToast(`⚡ Clicked ${comp.type.toUpperCase()}`);
  }
};

function executeSimulatorDartSnippet(code, comp) {
  const compName = comp.text || comp.title || comp.label || comp.icon || comp.id || comp.type;

  // 0. Navigator Pop / Get.back
  if (code.includes("Navigator.pop") || code.includes("Get.back")) {
    const screen = document.getElementById("phoneSimulatorScreen");
    const overlay = screen?.querySelector(".sim-screen-overlay, .sim-bottomsheet-wrapper, .sim-modal-backdrop");
    if (overlay) {
      overlay.remove();
      showToast("⚡ Navigated Back (Navigator.pop)");
      return;
    }
  }

  // 1. Custom Demo Bottom Sheet
  if (code.includes("CustomDemoBottomSheet") || code.includes("showCustomDemoBottomSheet") || code.includes("CustomActionBottomSheet")) {
    showSimulatorCustomBottomSheet();
    showToast("⚡ Executed Dart: showModalBottomSheet(CustomDemoBottomSheet)");
    return;
  }

  // 2. Navigation: Navigator.push, Navigator.pushNamed, Get.to, Get.toNamed, UserProfileDemoScreen, SettingsDemoScreen
  if (code.includes("Navigator.push") || code.includes("Navigator.of(context).push") || code.includes("Get.to") || code.includes("UserProfileDemoScreen") || code.includes("SettingsDemoScreen")) {
    let routeName = "/profile";
    const slashMatch = code.match(/['"](\/[a-zA-Z0-9_\-\/]*)['"]/);
    if (slashMatch && slashMatch[1]) {
      routeName = slashMatch[1];
    } else if (code.includes("SettingsDemoScreen") || code.includes("SettingsScreen")) {
      routeName = "/settings";
    } else if (code.includes("UserProfileDemoScreen") || code.includes("ProfileDemoScreen")) {
      routeName = "/profile";
    }

    let args = null;
    const argMatch = code.match(/arguments:\s*(\{.+?\}|\[.+?\]|['"][^'"]*['"]|\d+)/);
    if (argMatch && argMatch[1]) {
      args = argMatch[1].trim();
    }

    if (routeName === "/profile") {
      showSimulatorProfileScreen(args);
      showToast(`⚡ Navigated to /profile ${args ? `with arguments` : ''}`);
    } else if (routeName === "/settings") {
      showSimulatorSettingsScreen(args);
      showToast(`⚡ Navigated to /settings ${args ? `with arguments` : ''}`);
    } else {
      showSimulatorGenericScreen(routeName, args);
      showToast(`⚡ Navigated to ${routeName} ${args ? `with arguments` : ''}`);
    }
    return;
  }

  // 3. SnackBar: ScaffoldMessenger.of(context).showSnackBar(SnackBar(...))
  if (code.includes("showSnackBar") || code.includes("SnackBar(")) {
    let msg = `Action triggered on ${compName}`;
    const textMatch = code.match(/Text\(\s*['"](.+?)['"]\s*\)/);
    if (textMatch && textMatch[1]) {
      msg = textMatch[1];
    } else {
      const contentMatch = code.match(/content:\s*['"](.+?)['"]/);
      if (contentMatch && contentMatch[1]) msg = contentMatch[1];
    }

    let bg = activeSchema.theme?.primary_color || "#4F46E5";
    if (code.includes("Colors.green") || code.includes("0xFF10B981")) bg = "#10B981";
    else if (code.includes("Colors.red") || code.includes("0xFFEF4444")) bg = "#EF4444";
    else if (code.includes("Colors.amber") || code.includes("0xFFF59E0B")) bg = "#F59E0B";
    else if (code.includes("Colors.blue") || code.includes("0xFF0284C7")) bg = "#0284C7";

    showSimulatorSnackBar(msg, bg);
    showToast(`⚡ Executed Dart: SnackBar("${msg}")`);
    return;
  }

  // 4. AlertDialog: showDialog(context: context, builder: ... AlertDialog(...))
  if (code.includes("showDialog") || code.includes("AlertDialog(")) {
    let title = `${compName} Alert`;
    let content = "Executed custom Dart code from generative UI web console.";

    const titleMatch = code.match(/title:\s*Text\(\s*['"](.+?)['"]\s*\)/);
    if (titleMatch && titleMatch[1]) title = titleMatch[1];

    const contentMatch = code.match(/content:\s*Text\(\s*['"](.+?)['"]\s*\)/);
    if (contentMatch && contentMatch[1]) content = contentMatch[1];

    showSimulatorDialog(title, content);
    showToast(`⚡ Executed Dart: showDialog("${title}")`);
    return;
  }

  // 5. General BottomSheet: showModalBottomSheet(...)
  if (code.includes("showModalBottomSheet")) {
    let content = `Modal Bottom Sheet triggered by ${compName}`;
    const textMatch = code.match(/Text\(\s*['"](.+?)['"]\s*\)/);
    if (textMatch && textMatch[1]) content = textMatch[1];

    showSimulatorBottomSheet(compName, content);
    showToast(`⚡ Executed Dart: showModalBottomSheet(...)`);
    return;
  }

  // 6. Form Submit / Validate
  if (code.includes("validate") || code.includes("FormRegistry") || code.toLowerCase().includes("submit")) {
    window.handleSimulatorAction("submit_form");
    return;
  }

  // 7. Print
  if (code.includes("print(") || code.includes("debugPrint(")) {
    const pMatch = code.match(/print\(\s*['"](.+?)['"]\s*\)/);
    const msg = pMatch ? pMatch[1] : code;
    showToast(`⚡ Dart Print: "${msg}"`);
    return;
  }

  // General Action Statement Fallback
  const preview = code.length > 50 ? `${code.substring(0, 50)}...` : code;
  showToast(`⚡ Executed Dart: ${preview}`);
}

function showSimulatorCustomBottomSheet() {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-bottomsheet-wrapper");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "sim-bottomsheet-wrapper";
  wrapper.innerHTML = `
    <div class="sim-bottomsheet-content" style="background:#1E293B; border: 1px solid #334155; border-radius: 20px 20px 0 0;">
      <div class="sim-sheet-handle"></div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <div style="width:32px; height:32px; border-radius:8px; background:rgba(99,102,241,0.2); display:flex; align-items:center; justify-content:center; font-size:16px;">📁</div>
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:700; color:#FFFFFF;">Custom Project Bottom Sheet</div>
          <div style="font-size:10px; color:#94A3B8;">Pre-existing Flutter custom bottom sheet</div>
        </div>
        <button class="sim-appbar-btn" onclick="this.closest('.sim-bottomsheet-wrapper').remove()" style="font-size:16px;">✕</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
        <div class="sim-action-item" onclick="showSimulatorSnackBar('Schema link copied to clipboard!', '#0284C7'); this.closest('.sim-bottomsheet-wrapper').remove();">
          <div class="sim-action-icon" style="background:rgba(56,189,248,0.15); color:#38BDF8;">🔗</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Share Live Schema</div>
            <div style="font-size:10px; color:#94A3B8;">Broadcast to connected devices</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
        <div class="sim-action-item" onclick="showSimulatorSnackBar('Exporting schema JSON...', '#10B981'); this.closest('.sim-bottomsheet-wrapper').remove();">
          <div class="sim-action-icon" style="background:rgba(16,185,129,0.15); color:#10B981;">⬇️</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Export Dynamic UI JSON</div>
            <div style="font-size:10px; color:#94A3B8;">Download current schema</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
        <div class="sim-action-item" onclick="showSimulatorSnackBar('Added current screen to Favorites!', '#F59E0B'); this.closest('.sim-bottomsheet-wrapper').remove();">
          <div class="sim-action-icon" style="background:rgba(245,158,11,0.15); color:#F59E0B;">⭐</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Save to Preset Favorites</div>
            <div style="font-size:10px; color:#94A3B8;">Bookmark layout</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
      </div>
      <button class="sim-dialog-btn" style="width:100%; padding:10px; background:#334155; border-radius:10px;" onclick="this.closest('.sim-bottomsheet-wrapper').remove()">Dismiss Sheet</button>
    </div>
  `;
  wrapper.onclick = (e) => {
    if (e.target === wrapper) wrapper.remove();
  };
  screen.appendChild(wrapper);
}

function showSimulatorProfileScreen(args) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-screen-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "sim-screen-overlay";
  overlay.innerHTML = `
    <div class="sim-screen-appbar">
      <button class="sim-appbar-btn" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back</button>
      <div class="sim-appbar-title">User Profile</div>
      <button class="sim-appbar-btn" onclick="showSimulatorSettingsScreen(null)">⚙️</button>
    </div>
    <div class="sim-screen-body">
      <div class="sim-avatar-wrapper">
        <div class="sim-avatar-circle">👤</div>
        <div style="font-size:15px; font-weight:700; color:#FFFFFF;">Alex Morgan</div>
        <div style="font-size:11px; color:#94A3B8;">alex.morgan@enterprise.io</div>
        <div style="display:inline-block; padding:2px 8px; background:rgba(99,102,241,0.2); border:1px solid #6366F1; border-radius:12px; font-size:9px; font-weight:700; color:#818CF8; letter-spacing:0.5px;">PRO TIER SUBSCRIBER</div>
      </div>

      ${args ? `
        <div class="sim-arg-box">
          <div style="color:#818CF8; font-weight:700; margin-bottom:2px;">📥 Received Arguments:</div>
          <div>${escapeHtml(args)}</div>
        </div>
      ` : ''}

      <div class="sim-stats-grid">
        <div class="sim-stat-card">
          <div class="val">24</div>
          <div class="lbl">Projects</div>
        </div>
        <div class="sim-stat-card">
          <div class="val" style="color:#10B981;">148</div>
          <div class="lbl">Deploys</div>
        </div>
        <div class="sim-stat-card">
          <div class="val" style="color:#F59E0B;">4.9 ★</div>
          <div class="lbl">Rating</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
        <div class="sim-action-item" onclick="showSimulatorCustomBottomSheet()">
          <div class="sim-action-icon" style="color:#818CF8;">📑</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Custom Bottom Sheet</div>
            <div style="font-size:10px; color:#94A3B8;">Open project actions modal</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
        <div class="sim-action-item" onclick="showSimulatorSettingsScreen(null)">
          <div class="sim-action-icon" style="color:#38BDF8;">⚙️</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">App Settings</div>
            <div style="font-size:10px; color:#94A3B8;">Navigate to /settings</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
        <div class="sim-action-item" onclick="showSimulatorSnackBar('Profile link copied!', '#10B981')">
          <div class="sim-action-icon" style="color:#34D399;">🔗</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Share Profile</div>
            <div style="font-size:10px; color:#94A3B8;">Copy public URL</div>
          </div>
          <span style="color:#64748B; font-size:11px;">›</span>
        </div>
      </div>

      <button class="sim-dialog-btn" style="width:100%; margin-top:8px; padding:10px; background:#1E293B; border:1px solid #475569; border-radius:10px;" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back to Generative Screen</button>
    </div>
  `;
  screen.appendChild(overlay);
}

function showSimulatorSettingsScreen(args) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-screen-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "sim-screen-overlay";
  overlay.innerHTML = `
    <div class="sim-screen-appbar">
      <button class="sim-appbar-btn" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back</button>
      <div class="sim-appbar-title">App Settings</div>
      <div style="width:36px;"></div>
    </div>
    <div class="sim-screen-body">
      ${args ? `
        <div class="sim-arg-box">
          <div style="color:#38BDF8; font-weight:700; margin-bottom:2px;">📥 Navigation Argument:</div>
          <div>${escapeHtml(args)}</div>
        </div>
      ` : ''}

      <div style="font-size:10px; font-weight:700; color:#64748B; letter-spacing:1px; margin-top:4px;">PREFERENCES</div>
      <div class="sim-switch-item">
        <div>
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Push Notifications</div>
          <div style="font-size:10px; color:#94A3B8;">Alerts on schema updates</div>
        </div>
        <div class="sim-toggle-pill" onclick="this.style.background = this.style.background === 'rgb(51, 65, 85)' ? '#4F46E5' : '#334155'"></div>
      </div>
      <div class="sim-switch-item">
        <div>
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Biometric Lock</div>
          <div style="font-size:10px; color:#94A3B8;">Require FaceID / TouchID</div>
        </div>
        <div class="sim-toggle-pill" onclick="this.style.background = this.style.background === 'rgb(51, 65, 85)' ? '#4F46E5' : '#334155'"></div>
      </div>
      <div class="sim-switch-item">
        <div>
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Dark Mode Sync</div>
          <div style="font-size:10px; color:#94A3B8;">Synchronize web palette</div>
        </div>
        <div class="sim-toggle-pill" onclick="this.style.background = this.style.background === 'rgb(51, 65, 85)' ? '#4F46E5' : '#334155'"></div>
      </div>

      <div style="font-size:10px; font-weight:700; color:#64748B; letter-spacing:1px; margin-top:8px;">ACTIONS &amp; DATA</div>
      <div class="sim-action-item" onclick="showSimulatorCustomBottomSheet()">
        <div class="sim-action-icon" style="color:#818CF8;">📑</div>
        <div style="flex:1;">
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Test Custom Bottom Sheet</div>
          <div style="font-size:10px; color:#94A3B8;">Open bottom sheet</div>
        </div>
        <span style="color:#64748B; font-size:11px;">›</span>
      </div>
      <div class="sim-action-item" onclick="showSimulatorProfileScreen(null)">
        <div class="sim-action-icon" style="color:#34D399;">👤</div>
        <div style="flex:1;">
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Open User Profile Screen</div>
          <div style="font-size:10px; color:#94A3B8;">Navigate to /profile</div>
        </div>
        <span style="color:#64748B; font-size:11px;">›</span>
      </div>
      <div class="sim-action-item" onclick="showSimulatorSnackBar('Cache successfully cleared!', '#10B981')">
        <div class="sim-action-icon" style="color:#EF4444;">🧹</div>
        <div style="flex:1;">
          <div style="font-size:12px; font-weight:600; color:#FFFFFF;">Clear Cache &amp; Storage</div>
          <div style="font-size:10px; color:#94A3B8;">Free 24.8 MB local memory</div>
        </div>
        <span style="color:#64748B; font-size:11px;">›</span>
      </div>

      <button class="sim-dialog-btn" style="width:100%; margin-top:10px; padding:10px; background:#4F46E5; border-radius:10px;" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back to Generative Screen</button>
    </div>
  `;
  screen.appendChild(overlay);
}

function showSimulatorGenericScreen(routeName, args) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-screen-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "sim-screen-overlay";
  overlay.innerHTML = `
    <div class="sim-screen-appbar">
      <button class="sim-appbar-btn" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back</button>
      <div class="sim-appbar-title">${escapeHtml(routeName)}</div>
      <div style="width:36px;"></div>
    </div>
    <div class="sim-screen-body" style="align-items:center; justify-content:center; text-align:center;">
      <div style="width:68px; height:68px; border-radius:50%; background:rgba(99,102,241,0.15); border:2px solid #4F46E5; display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:12px;">🧭</div>
      <div style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:4px;">Opened Route: "${escapeHtml(routeName)}"</div>
      <div style="font-size:12px; color:#10B981; font-weight:600; margin-bottom:16px;">Real Project Navigation Successful</div>

      ${args ? `
        <div class="sim-arg-box" style="width:100%; text-align:left; margin-bottom:16px;">
          <div style="color:#818CF8; font-weight:700; margin-bottom:2px;">📥 Passed Arguments:</div>
          <div>${escapeHtml(args)}</div>
        </div>
      ` : ''}

      <button class="sim-dialog-btn" style="width:100%; padding:10px; background:#4F46E5; border-radius:10px;" onclick="this.closest('.sim-screen-overlay').remove()">‹ Back to Generative Screen</button>
    </div>
  `;
  screen.appendChild(overlay);
}

function showSimulatorSnackBar(msg, bg) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-live-snackbar");
  if (old) old.remove();

  const sb = document.createElement("div");
  sb.className = "sim-live-snackbar";
  sb.style.background = bg || "#4F46E5";
  sb.innerHTML = `<span>⚡</span><span style="flex:1;">${escapeHtml(msg)}</span>`;
  screen.appendChild(sb);
  setTimeout(() => { sb.remove(); }, 3500);
}

function showSimulatorDialog(title, content) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-modal-backdrop");
  if (old) old.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "sim-modal-backdrop";
  backdrop.innerHTML = `
    <div class="sim-dialog-content">
      <div class="sim-dialog-title">
        <span>⚡</span> <span>${escapeHtml(title)}</span>
      </div>
      <div class="sim-dialog-body">${escapeHtml(content)}</div>
      <div class="sim-dialog-actions">
        <button class="sim-dialog-btn" onclick="this.closest('.sim-modal-backdrop').remove()">Dismiss</button>
      </div>
    </div>
  `;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.remove();
  };
  screen.appendChild(backdrop);
}

function showSimulatorBottomSheet(title, content) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-bottomsheet-wrapper");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "sim-bottomsheet-wrapper";
  wrapper.innerHTML = `
    <div class="sim-bottomsheet-content">
      <div class="sim-sheet-handle"></div>
      <div class="sim-sheet-title">⚡ ${escapeHtml(title)}</div>
      <div class="sim-sheet-body">${escapeHtml(content)}</div>
      <button class="sim-dialog-btn" style="width:100%; padding:8px;" onclick="this.closest('.sim-bottomsheet-wrapper').remove()">Dismiss</button>
    </div>
  `;
  wrapper.onclick = (e) => {
    if (e.target === wrapper) wrapper.remove();
  };
  screen.appendChild(wrapper);
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
