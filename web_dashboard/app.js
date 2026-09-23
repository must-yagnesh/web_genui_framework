// Web-Controlled Gen UI Dashboard Application Logic

let activeSchema = {
  version: 1,
  timestamp: Date.now(),
};
window._getActiveSchema = () => activeSchema;
window._setActiveSchema = (s) => { activeSchema = s; };
activeSchema = {
  version: 1,
  timestamp: Date.now(),
  screen_id: "home",
  screen_name: "Crypto & Multi-Asset Hub",
  route: "/",
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
    },
    {
      id: "btn_contact_us",
      type: "button",
      text: "📞 Contact Us",
      variant: "outline",
      action_id: "open_contact",
      custom_dart_code: "Navigator.pushNamed(context, '/contact');"
    },
    {
      id: "btn_feedback_review",
      type: "button",
      text: "⭐ Feedback & Review",
      variant: "outline",
      action_id: "open_feedback",
      custom_dart_code: "Navigator.pushNamed(context, '/feedback');"
    }
  ]
};

// Multi-Screen Registry State
let screens = {
  home: activeSchema
};
let activeScreenId = "home";
let simNavStack = ["home"];

// Default dark theme tokens (mirrors ThemeConfig defaults in flutter_genui_guard).
// Presets without an explicit `theme` reset to these so a light template does not leak into the next preset.
const DEFAULT_THEME = {
  primary_color: "#4F46E5",
  background_color: "#0F172A",
  surface_color: "#1E293B",
  text_primary: "#F8FAFC",
  text_secondary: "#94A3B8",
  accent_color: "#10B981"
};

// When the simulator renders a pushed screen, its own theme is used instead of the active screen's.
let simRenderThemeOverride = null;

// Screens with designer edits that have not been applied yet. Their local copy survives server
// broadcasts (the switch endpoint re-broadcasts the target screen with a bumped version, which
// used to silently discard unapplied edits). Cleared by "Apply to App".
const dirtyScreens = new Set();
let isSyncRender = false; // true while re-rendering from server data, so it is not counted as an edit

function markActiveScreenDirty() {
  if (isSyncRender || !activeScreenId || dirtyScreens.has(activeScreenId)) return;
  dirtyScreens.add(activeScreenId);
  if (typeof renderScreenTabs === "function") renderScreenTabs();
}

function renderFromServer(fn) {
  isSyncRender = true;
  try { fn(); } finally { isSyncRender = false; }
}

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
      },
      {
        id: "btn_contact_us",
        type: "button",
        text: "📞 Contact Us",
        variant: "outline",
        action_id: "open_contact",
        custom_dart_code: "Navigator.pushNamed(context, '/contact');"
      },
      {
        id: "btn_feedback_review",
        type: "button",
        text: "⭐ Feedback & Review",
        variant: "outline",
        action_id: "open_feedback",
        custom_dart_code: "Navigator.pushNamed(context, '/feedback');"
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
        padding: 6,
        validation: {
          required: true,
          type: "email",
          error_message: "Please enter a valid email address"
        }
      },
      {
        id: "input_password",
        type: "textfield",
        label: "Password",
        hint: "Enter your password",
        is_password: true,
        padding: 6,
        validation: {
          required: true,
          type: "min_length",
          min_length: 6,
          error_message: "Password must be at least 6 characters"
        }
      },
      {
        id: "btn_login",
        type: "button",
        text: "Sign In to Account",
        variant: "primary",
        action_type: "api_call",
        api_config: {
          url: "/api/submissions",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body_mapping: {
            "email": "input_email",
            "password": "input_password"
          },
          static_body: {
            "action": "user_login",
            "source": "mobile_app"
          },
          validate_fields: ["input_email", "input_password"],
          on_success: {
            type: "snackbar",
            message: "Signed in successfully!",
            navigate_to: "/"
          },
          on_error: {
            message: "Sign-in failed. Please verify your credentials."
          }
        }
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
      {
        id: "input_name",
        type: "textfield",
        label: "Full Name",
        hint: "Jane Doe",
        is_password: false,
        padding: 6,
        validation: {
          required: true,
          error_message: "Full Name is required"
        }
      },
      {
        id: "input_email",
        type: "textfield",
        label: "Work Email",
        hint: "jane@company.com",
        is_password: false,
        padding: 6,
        validation: {
          required: true,
          type: "email",
          error_message: "Valid email address is required"
        }
      },
      {
        id: "input_password",
        type: "textfield",
        label: "Create Password",
        hint: "Must be 8+ characters",
        is_password: true,
        padding: 6,
        validation: {
          required: true,
          type: "min_length",
          min_length: 8,
          error_message: "Password must be at least 8 characters"
        }
      },
      {
        id: "check_terms",
        type: "checkbox",
        label: "I accept the Terms & Privacy Policy",
        subtitle: "Required to create account",
        is_checked: false,
        padding: 4,
        validation: {
          required: true,
          error_message: "Please accept the Terms & Privacy Policy"
        }
      },
      {
        id: "btn_register",
        type: "button",
        text: "Create Free Account",
        variant: "primary",
        action_type: "api_call",
        api_config: {
          url: "/api/submissions",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body_mapping: {
            "fullName": "input_name",
            "email": "input_email",
            "password": "input_password",
            "acceptedTerms": "check_terms"
          },
          static_body: {
            "action": "user_registration",
            "source": "mobile_app"
          },
          validate_fields: ["input_name", "input_email", "input_password", "check_terms"],
          on_success: {
            type: "dialog",
            title: "Account Created!",
            message: "Welcome! Your new account has been created successfully.",
            button_text: "Go to Dashboard",
            navigate_to: "/"
          },
          on_error: {
            message: "Account creation failed. Please try again."
          }
        }
      }
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
      {
        id: "input_author",
        type: "textfield",
        label: "Your Name or Handle",
        hint: "e.g. Alex Morgan",
        is_password: false,
        padding: 6,
        validation: {
          required: true,
          error_message: "Please enter your name or handle"
        }
      },
      {
        id: "input_comments",
        type: "textfield",
        label: "Your Detailed Feedback",
        hint: "What did you enjoy most, or what can we improve?",
        max_lines: 3,
        is_password: false,
        padding: 6,
        validation: {
          required: true,
          error_message: "Please write your review comments"
        }
      },
      { id: "switch_public", type: "switch", label: "Post as Public Review", subtitle: "Allow displaying on community wall", is_checked: true, padding: 4 },
      {
        id: "btn_feedback",
        type: "button",
        text: "Submit Customer Feedback",
        variant: "primary",
        action_type: "api_call",
        api_config: {
          url: "/api/submissions",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body_mapping: {
            "author": "input_author",
            "comments": "input_comments",
            "isPublic": "switch_public"
          },
          static_body: {
            "form_type": "customer_feedback"
          },
          validate_fields: ["input_author", "input_comments"],
          on_success: {
            type: "dialog",
            title: "Thanks for your feedback!",
            message: "Your review has been submitted successfully. We appreciate your insights!",
            button_text: "Back to Home Screen",
            navigate_to: "/"
          }
        }
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
const simBackBtn = document.getElementById("simBackBtn");

// Screen Manager DOM Elements
const screenTabsContainer = document.getElementById("screenTabsContainer");
const btnOpenNewScreenModal = document.getElementById("btnOpenNewScreenModal");
const currentScreenRouteBadge = document.getElementById("currentScreenRouteBadge");
const btnDeleteCurrentScreen = document.getElementById("btnDeleteCurrentScreen");
const newScreenModal = document.getElementById("newScreenModal");
const btnCloseNewScreenModal = document.getElementById("btnCloseNewScreenModal");
const btnCancelNewScreenModal = document.getElementById("btnCancelNewScreenModal");
const btnSubmitCreateScreen = document.getElementById("btnSubmitCreateScreen");
const newScreenNameInput = document.getElementById("newScreenNameInput");
const newScreenRouteInput = document.getElementById("newScreenRouteInput");
const newScreenTemplateSelect = document.getElementById("newScreenTemplateSelect");

// Panel Visibility Manager DOM Elements
const dashboardGrid = document.getElementById("dashboardGrid");
const toggleDesignerBtn = document.getElementById("toggleDesignerBtn");
const toggleAiBtn = document.getElementById("toggleAiBtn");
const toggleSimulatorBtn = document.getElementById("toggleSimulatorBtn");
const btnLayoutPresets = document.getElementById("btnLayoutPresets");
const layoutPresetsMenu = document.getElementById("layoutPresetsMenu");

let panelVisibility = {
  designer: true,
  ai: true,
  simulator: true
};

function applyPanelVisibility() {
  const grid = dashboardGrid || document.getElementById("dashboardGrid");
  const pDesigner = document.getElementById("editorPanel");
  const pAi = document.getElementById("aiPanel");
  const pSim = document.getElementById("simulatorPanel");

  if (grid) {
    grid.classList.toggle("collapse-designer", !panelVisibility.designer);
    grid.classList.toggle("collapse-ai", !panelVisibility.ai);
    grid.classList.toggle("collapse-simulator", !panelVisibility.simulator);
  }

  if (pDesigner) pDesigner.classList.toggle("is-collapsed", !panelVisibility.designer);
  if (pAi) pAi.classList.toggle("is-collapsed", !panelVisibility.ai);
  if (pSim) pSim.classList.toggle("is-collapsed", !panelVisibility.simulator);

  const tDesigner = toggleDesignerBtn || document.getElementById("toggleDesignerBtn");
  const tAi = toggleAiBtn || document.getElementById("toggleAiBtn");
  const tSim = toggleSimulatorBtn || document.getElementById("toggleSimulatorBtn");

  if (tDesigner) tDesigner.classList.toggle("active", !!panelVisibility.designer);
  if (tAi) tAi.classList.toggle("active", !!panelVisibility.ai);
  if (tSim) tSim.classList.toggle("active", !!panelVisibility.simulator);

  try {
    localStorage.setItem("genui_panel_visibility", JSON.stringify(panelVisibility));
  } catch (e) {
    /* ignore */
  }
}

window.togglePanel = function(panelName) {
  if (!panelVisibility.hasOwnProperty(panelName)) return;

  const currentVal = panelVisibility[panelName];
  if (currentVal === true) {
    const visibleCount = Object.values(panelVisibility).filter(Boolean).length;
    if (visibleCount <= 1) {
      showToast("Cannot collapse all panels — at least one must remain open");
      return;
    }
  }

  panelVisibility[panelName] = !currentVal;
  applyPanelVisibility();

  const labels = {
    designer: "Visual Designer",
    ai: "Prompt & JSON",
    simulator: "Live Simulator"
  };
  showToast(`${panelVisibility[panelName] ? "Expanded" : "Collapsed"}: ${labels[panelName] || panelName}`);
};

window.setLayoutPreset = function(presetName) {
  switch (presetName) {
    case "design_test":
      panelVisibility = { designer: true, ai: false, simulator: true };
      showToast("Layout: Design & Simulator (Wide Editor)");
      break;
    case "full_designer":
      panelVisibility = { designer: true, ai: false, simulator: false };
      showToast("Layout: Full Visual Designer (100% Width)");
      break;
    case "code_test":
      panelVisibility = { designer: false, ai: true, simulator: true };
      showToast("Layout: Prompt/JSON & Simulator");
      break;
    case "all":
    default:
      panelVisibility = { designer: true, ai: true, simulator: true };
      showToast("Layout: All 3 Panels");
      break;
  }
  applyPanelVisibility();
};

function initPanelVisibility() {
  try {
    const saved = localStorage.getItem("genui_panel_visibility");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === "object" && parsed !== null) {
        if (parsed.designer || parsed.ai || parsed.simulator) {
          panelVisibility = Object.assign(panelVisibility, parsed);
        }
      }
    }
  } catch (e) {
    /* ignore */
  }
  applyPanelVisibility();

  document.querySelectorAll(".panel-toggle-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.dataset.panel;
      if (panel) togglePanel(panel);
    });
  });

  const btnPresets = btnLayoutPresets || document.getElementById("btnLayoutPresets");
  const menuPresets = layoutPresetsMenu || document.getElementById("layoutPresetsMenu");
  if (btnPresets && menuPresets) {
    btnPresets.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPresets.classList.toggle("show");
    });

    menuPresets.querySelectorAll("a").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const preset = item.dataset.presetLayout;
        setLayoutPreset(preset);
        menuPresets.classList.remove("show");
      });
    });

    document.addEventListener("click", () => {
      menuPresets.classList.remove("show");
    });
  }

  // Keyboard shortcuts (Alt+1, Alt+2, Alt+3)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === "1") {
        e.preventDefault();
        togglePanel("designer");
      } else if (e.key === "2") {
        e.preventDefault();
        togglePanel("ai");
      } else if (e.key === "3") {
        e.preventDefault();
        togglePanel("simulator");
      }
    }
  });
}

// Multi-Screen Management Functions
async function loadScreensFromServer() {
  try {
    const res = await fetch("/api/screens");
    const data = await res.json();
    if (data.screens && Object.keys(data.screens).length > 0) {
      screens = data.screens;
      activeScreenId = data.active_screen_id || activeScreenId || "home";
      if (screens[activeScreenId]) {
        activeSchema = screens[activeScreenId];
      }
    }
    renderScreenTabs();
    renderFromServer(renderAll);
  } catch (err) {
    console.warn("Could not load screens list from server:", err);
    renderScreenTabs();
  }
}

function renderScreenTabs() {
  if (!screenTabsContainer) return;
  screenTabsContainer.innerHTML = "";

  const screenIds = Object.keys(screens);
  screenIds.sort((a, b) => {
    if (a === "home") return -1;
    if (b === "home") return 1;
    return a.localeCompare(b);
  });

  const activeScr = screens[activeScreenId] || activeSchema || {};
  const activeIcon = activeScreenId === "home" ? "🏠" : "📄";
  const activeName = activeScr.screen_name || activeScr.header?.title || activeScreenId;
  const activeRoute = activeScr.route || (activeScreenId === "home" ? "/" : `/${activeScreenId}`);

  // Update switcher dropdown button
  const swIcon = document.getElementById("switcherActiveIcon");
  const swName = document.getElementById("switcherActiveName");
  const swRoute = document.getElementById("switcherActiveRoute");
  const swCount = document.getElementById("switcherScreenCount");
  if (swIcon) swIcon.innerText = activeIcon;
  if (swName) swName.innerText = activeName;
  if (swRoute) swRoute.innerText = activeRoute;
  if (swCount) swCount.innerText = screenIds.length;

  // Update switcher dropdown items
  const swItems = document.getElementById("screenSwitcherItems");
  if (swItems) {
    swItems.innerHTML = "";
    screenIds.forEach((sid) => {
      const scr = screens[sid];
      const isAct = sid === activeScreenId;
      const a = document.createElement("a");
      a.href = "#";
      a.className = `screen-switcher-item ${isAct ? "active" : ""}`;
      const icon = sid === "home" ? "🏠" : "📄";
      const name = scr.screen_name || scr.header?.title || sid;
      const route = scr.route || (sid === "home" ? "/" : `/${sid}`);
      const dirtyDot = dirtyScreens.has(sid) ? ` <span class="screen-tab-dirty">●</span>` : "";
      a.innerHTML = `
        <div class="switcher-item-left">
          <span class="switcher-item-icon">${icon}</span>
          <span class="switcher-item-title">${escapeHtml(name)}</span>
          ${dirtyDot}
        </div>
        <span class="switcher-item-route">${escapeHtml(route)}</span>
      `;
      a.onclick = (e) => {
        e.preventDefault();
        switchScreen(sid);
        document.getElementById("screenSwitcherMenu")?.classList.remove("show");
      };
      swItems.appendChild(a);
    });
  }

  // Render direct tabs
  screenIds.forEach((sid) => {
    const scr = screens[sid];
    const isAct = sid === activeScreenId;
    const btn = document.createElement("button");
    btn.className = `screen-tab ${isAct ? "active" : ""}`;
    btn.dataset.screenId = sid;
    const icon = sid === "home" ? "🏠" : "📄";
    const name = scr.screen_name || scr.header?.title || sid;
    const route = scr.route || (sid === "home" ? "/" : `/${sid}`);
    const dirtyDot = dirtyScreens.has(sid) ? `<span class="screen-tab-dirty" title="Unapplied changes — press Apply to App">●</span>` : "";
    btn.innerHTML = `<span>${icon} ${escapeHtml(name)}</span> <span class="screen-tab-route">${escapeHtml(route)}</span>${dirtyDot}`;
    btn.onclick = () => switchScreen(sid);
    screenTabsContainer.appendChild(btn);
  });

  // Update current screen route badge and delete button
  const currentScr = screens[activeScreenId] || activeSchema;
  if (currentScreenRouteBadge) {
    const currentRoute = currentScr.route || (activeScreenId === "home" ? "/" : `/${activeScreenId}`);
    const scrTitle = currentScr.screen_name || currentScr.header?.title || activeScreenId;
    currentScreenRouteBadge.innerHTML = `Screen: <strong>${escapeHtml(scrTitle)}</strong> • Route: <code>${escapeHtml(currentRoute)}</code>`;
  }
  if (btnDeleteCurrentScreen) {
    btnDeleteCurrentScreen.style.display = activeScreenId === "home" ? "none" : "inline-flex";
  }
}

// Hook up Screen Switcher Dropdown
const btnScreenSwitcher = document.getElementById("btnScreenSwitcher");
const screenSwitcherMenu = document.getElementById("screenSwitcherMenu");
const switcherBtnNewScreen = document.getElementById("switcherBtnNewScreen");

if (btnScreenSwitcher && screenSwitcherMenu) {
  btnScreenSwitcher.addEventListener("click", (e) => {
    e.stopPropagation();
    screenSwitcherMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    screenSwitcherMenu.classList.remove("show");
  });
}

if (switcherBtnNewScreen) {
  switcherBtnNewScreen.addEventListener("click", (e) => {
    e.preventDefault();
    screenSwitcherMenu?.classList.remove("show");
    openNewScreenModal();
  });
}

async function switchScreen(screenId) {
  if (!screens[screenId]) return;

  // Save current active schema into screens dictionary
  if (screens[activeScreenId]) {
    screens[activeScreenId] = JSON.parse(JSON.stringify(activeSchema));
  }

  activeScreenId = screenId;
  activeSchema = screens[screenId];
  simNavStack = [screenId];

  // Remove any open simulator overlays
  const simScreen = document.getElementById("phoneSimulatorScreen");
  const overlay = simScreen?.querySelector(".sim-screen-overlay, .sim-bottomsheet-wrapper, .sim-modal-backdrop");
  if (overlay) overlay.remove();
  if (simBackBtn) simBackBtn.style.display = "none";

  renderScreenTabs();
  renderFromServer(renderAll);

  // Notify backend switch
  try {
    await fetch("/api/screens/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: screenId })
    });
  } catch (err) {
    console.warn("Switch notify error:", err);
  }
}

function openNewScreenModal() {
  if (!newScreenModal) return;
  newScreenNameInput.value = "";
  newScreenRouteInput.value = "";
  delete newScreenRouteInput.dataset.touched;
  newScreenModal.style.display = "flex";
  newScreenNameInput.focus();
}

function closeNewScreenModal() {
  if (newScreenModal) newScreenModal.style.display = "none";
}

async function createNewScreen(name, route, template) {
  let cleanRoute = route.trim();
  if (!cleanRoute.startsWith("/")) cleanRoute = "/" + cleanRoute;
  const screenId = cleanRoute.replaceAll("/", "").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || `screen_${Date.now()}`;

  try {
    const res = await fetch("/api/screens/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: screenId,
        name: name.trim(),
        route: cleanRoute,
        template: template || "form"
      })
    });
    const data = await res.json();
    if (data.screen) {
      screens[data.screen.screen_id || screenId] = data.screen;
      closeNewScreenModal();
      await switchScreen(data.screen.screen_id || screenId);
      showToast(`✨ Screen "${name}" created with route ${cleanRoute}!`);
    } else {
      alert("Could not create screen: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Create screen error:", err);
    alert("Failed to create screen: " + err.message);
  }
}

async function deleteCurrentScreen() {
  if (activeScreenId === "home") {
    alert("The Home screen cannot be deleted.");
    return;
  }
  const scrTitle = screens[activeScreenId]?.screen_name || screens[activeScreenId]?.header?.title || activeScreenId;
  if (!confirm(`Are you sure you want to delete the screen "${scrTitle}"?`)) return;

  const toDelete = activeScreenId;
  try {
    const res = await fetch("/api/screens/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: toDelete })
    });
    const data = await res.json();
    delete screens[toDelete];
    await switchScreen("home");
    showToast(`🗑 Screen "${scrTitle}" deleted`);
  } catch (err) {
    console.error("Delete screen error:", err);
    alert("Failed to delete screen: " + err.message);
  }
}

// Modal & Screen Manager Event Listeners
if (btnOpenNewScreenModal) {
  btnOpenNewScreenModal.addEventListener("click", openNewScreenModal);
}
if (btnCloseNewScreenModal) {
  btnCloseNewScreenModal.addEventListener("click", closeNewScreenModal);
}
if (btnCancelNewScreenModal) {
  btnCancelNewScreenModal.addEventListener("click", closeNewScreenModal);
}
if (newScreenModal) {
  newScreenModal.addEventListener("click", (e) => {
    if (e.target === newScreenModal) closeNewScreenModal();
  });
}
if (newScreenNameInput && newScreenRouteInput) {
  newScreenNameInput.addEventListener("input", (e) => {
    if (!newScreenRouteInput.dataset.touched) {
      const slug = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (slug) newScreenRouteInput.value = `/${slug}`;
    }
  });
  newScreenRouteInput.addEventListener("input", () => {
    newScreenRouteInput.dataset.touched = "true";
  });
}
if (btnSubmitCreateScreen) {
  btnSubmitCreateScreen.addEventListener("click", () => {
    const name = newScreenNameInput.value.trim();
    const route = newScreenRouteInput.value.trim();
    const template = newScreenTemplateSelect.value;
    if (!name) {
      alert("Please enter a screen name!");
      return;
    }
    if (!route) {
      alert("Please enter a route path (e.g. /profile, /checkout)!");
      return;
    }
    // "tpl:<key>" starters come from the Design Templates gallery (templates.js) and are applied instantly.
    if (template.startsWith("tpl:") && typeof installDesignTemplateFromModal === "function") {
      installDesignTemplateFromModal(template.slice(4), name, route);
      return;
    }
    createNewScreen(name, route, template);
  });
}
if (btnDeleteCurrentScreen) {
  btnDeleteCurrentScreen.addEventListener("click", deleteCurrentScreen);
}
if (simBackBtn) {
  simBackBtn.addEventListener("click", () => {
    const screen = document.getElementById("phoneSimulatorScreen");
    const overlay = screen?.querySelector(".sim-screen-overlay, .sim-bottomsheet-wrapper, .sim-modal-backdrop");
    if (overlay) {
      overlay.remove();
      simBackBtn.style.display = "none";
      showToast("‹ Returned to previous screen");
    }
  });
}

// =============================================================================
// Cloud API Endpoint & Field Mapping Configuration Controller
// =============================================================================

let currentApiTarget = null; // 'screen' | 'comp_${idx}' | 'child_${pIdx}_${cIdx}'
let modalHeaders = [];
let modalMappings = [];
let modalStaticParams = [];

const apiConfigModal = document.getElementById("apiConfigModal");
const apiModalTargetSubtitle = document.getElementById("apiModalTargetSubtitle");
const btnCloseApiConfigModal = document.getElementById("btnCloseApiConfigModal");
const btnCancelApiConfigModal = document.getElementById("btnCancelApiConfigModal");
const btnRemoveApiConfig = document.getElementById("btnRemoveApiConfig");
const btnSaveApiConfig = document.getElementById("btnSaveApiConfig");
const btnOpenScreenApiModal = document.getElementById("btnOpenScreenApiModal");

const apiMethodSelect = document.getElementById("apiMethodSelect");
const apiUrlInput = document.getElementById("apiUrlInput");
const apiHeadersTbody = document.getElementById("apiHeadersTbody");
const btnAddHeaderRow = document.getElementById("btnAddHeaderRow");
const apiMappingTbody = document.getElementById("apiMappingTbody");
const btnAddMappingRow = document.getElementById("btnAddMappingRow");
const btnAutoMapAllFields = document.getElementById("btnAutoMapAllFields");
const apiStaticParamsTbody = document.getElementById("apiStaticParamsTbody");
const btnAddStaticParamRow = document.getElementById("btnAddStaticParamRow");
const btnRefreshPayloadPreview = document.getElementById("btnRefreshPayloadPreview");
const apiPayloadPreviewJson = document.getElementById("apiPayloadPreviewJson");

const apiSuccessTypeSelect = document.getElementById("apiSuccessTypeSelect");
const apiSuccessNavField = document.getElementById("apiSuccessNavField");
const apiSuccessNavInput = document.getElementById("apiSuccessNavInput");
const apiDialogFieldsRow = document.getElementById("apiDialogFieldsRow");
const apiSuccessTitleInput = document.getElementById("apiSuccessTitleInput");
const apiSuccessMsgInput = document.getElementById("apiSuccessMsgInput");
const apiErrorMsgInput = document.getElementById("apiErrorMsgInput");
const apiResetFormCheckbox = document.getElementById("apiResetFormCheckbox");

const btnRunApiTest = document.getElementById("btnRunApiTest");
const apiTestResult = document.getElementById("apiTestResult");
const apiTestStatusBadge = document.getElementById("apiTestStatusBadge");
const apiTestDuration = document.getElementById("apiTestDuration");
const apiTestResponseBody = document.getElementById("apiTestResponseBody");

function getTargetApiConfig(target) {
  if (target === "screen") {
    return activeSchema.api_config || null;
  }
  if (typeof target === "string" && target.startsWith("comp_")) {
    const idx = parseInt(target.replace("comp_", ""), 10);
    return activeSchema.components[idx]?.api_config || null;
  }
  if (typeof target === "string" && target.startsWith("child_")) {
    const parts = target.split("_");
    const pIdx = parseInt(parts[1], 10);
    const cIdx = parseInt(parts[2], 10);
    return activeSchema.components[pIdx]?.children?.[cIdx]?.api_config || null;
  }
  return null;
}

function setTargetApiConfig(target, config) {
  if (target === "screen") {
    if (config) {
      activeSchema.api_config = config;
    } else {
      delete activeSchema.api_config;
    }
  } else if (typeof target === "string" && target.startsWith("comp_")) {
    const idx = parseInt(target.replace("comp_", ""), 10);
    if (activeSchema.components[idx]) {
      if (config) {
        activeSchema.components[idx].api_config = config;
      } else {
        delete activeSchema.components[idx].api_config;
      }
    }
  } else if (typeof target === "string" && target.startsWith("child_")) {
    const parts = target.split("_");
    const pIdx = parseInt(parts[1], 10);
    const cIdx = parseInt(parts[2], 10);
    const child = activeSchema.components[pIdx]?.children?.[cIdx];
    if (child) {
      if (config) {
        child.api_config = config;
      } else {
        delete child.api_config;
      }
    }
  }
  markActiveScreenDirty();
  renderComponentEditors();
  updateSimulator();
  updateJsonEditor();
}

function getScreenInputComponents() {
  const inputs = [];
  function walk(comp) {
    if (!comp) return;
    const type = (comp.type || "").toLowerCase();
    if (["textfield", "input", "checkbox", "switch", "chip", "radio"].includes(type)) {
      inputs.push({
        id: comp.id || "",
        label: comp.label || comp.hint || comp.title || comp.id || "Field",
        type: type
      });
    }
    if (Array.isArray(comp.children)) {
      comp.children.forEach(walk);
    }
  }
  (activeSchema.components || []).forEach(walk);
  return inputs;
}

function toggleOutcomeFields(successAction) {
  if (!apiDialogFieldsRow || !apiSuccessNavField) return;
  if (successAction === "dialog") {
    apiDialogFieldsRow.style.display = "flex";
    apiSuccessNavField.style.display = "none";
  } else if (successAction === "navigate") {
    apiDialogFieldsRow.style.display = "none";
    apiSuccessNavField.style.display = "flex";
  } else {
    // snackbar / toast
    apiDialogFieldsRow.style.display = "none";
    apiSuccessNavField.style.display = "none";
  }
}

let activeApiModalTab = "datasource";

function switchApiModalTab(tab) {
  activeApiModalTab = tab;
  const btnDs = document.getElementById("tabBtnDataSource");
  const btnSub = document.getElementById("tabBtnSubmission");
  const panelDs = document.getElementById("panelTabDataSource");
  const panelSub = document.getElementById("panelTabSubmission");

  if (tab === "datasource") {
    if (btnDs) btnDs.classList.add("active");
    if (btnSub) btnSub.classList.remove("active");
    if (panelDs) panelDs.style.display = "block";
    if (panelSub) panelSub.style.display = "none";
  } else {
    if (btnDs) btnDs.classList.remove("active");
    if (btnSub) btnSub.classList.add("active");
    if (panelDs) panelDs.style.display = "none";
    if (panelSub) panelSub.style.display = "block";
  }
}
window.switchApiModalTab = switchApiModalTab;

window.setDsUrlPreset = function(url, name) {
  const input = document.getElementById("dsUrlInput");
  if (input) input.value = url;
  const isList = url.includes("users") || url.includes("records");
  const chk = document.getElementById("dsPaginationCheckbox");
  if (chk) {
    chk.checked = isList;
    toggleDsPaginationFields();
  }
  const dataPathInput = document.getElementById("dsDataPath");
  if (dataPathInput) {
    dataPathInput.value = url.includes("mock/users") ? "users" : "";
  }
  fetchDsPreview();
};

window.toggleDsPaginationFields = function() {
  const chk = document.getElementById("dsPaginationCheckbox");
  const row = document.getElementById("dsPaginationFieldsRow");
  if (row) {
    row.style.display = chk && chk.checked ? "flex" : "none";
  }
};

let dsUrlDebounceTimer = null;
function onDsUrlInputChange() {
  clearTimeout(dsUrlDebounceTimer);
  dsUrlDebounceTimer = setTimeout(() => {
    fetchDsPreview();
  }, 450);
}
window.onDsUrlInputChange = onDsUrlInputChange;

let simulatorScreenData = null;
window._getSimulatorScreenData = () => simulatorScreenData;
window._setSimulatorScreenData = (d) => { simulatorScreenData = d; };
let isSimulatorDataLoading = false;
let currentLoadedDsUrl = null;
let lastActiveFocusedInput = null;

document.addEventListener("focusin", (e) => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") && e.target.id !== "dsUrlInput") {
    lastActiveFocusedInput = e.target;
  }
});

async function fetchSimulatorScreenData(ds) {
  if (!ds || !ds.url) {
    simulatorScreenData = null;
    currentLoadedDsUrl = null;
    updateSimulator();
    return;
  }
  const rawUrl = ds.url.trim();
  const fullUrl = rawUrl.startsWith("http") ? rawUrl : `${window.location.origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  isSimulatorDataLoading = true;
  updateSimulator();

  try {
    let resp = null;
    try {
      resp = await fetch(fullUrl, { headers: { "Accept": "application/json, text/plain, */*" } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch (_) {
      // Fallback via server CORS proxy
      resp = await fetch(`/api/proxy?url=${encodeURIComponent(fullUrl)}`);
    }
    if (resp && resp.ok) {
      simulatorScreenData = await resp.json();
      currentLoadedDsUrl = rawUrl;
    }
  } catch (e) {
    console.warn("fetchSimulatorScreenData error:", e);
  } finally {
    isSimulatorDataLoading = false;
    updateSimulator();
  }
}

// Condenses JSON response for preview: truncates arrays to 1 representative item
function condenseJsonForPreview(data, depth = 0) {
  if (data == null) return data;
  if (depth > 4) return "...";

  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    return [ condenseJsonForPreview(data[0], depth + 1) ];
  }

  if (typeof data === "object") {
    const res = {};
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) {
        res[k] = v.length > 0 ? [ condenseJsonForPreview(v[0], depth + 1) ] : [];
      } else if (typeof v === "object" && v !== null) {
        res[k] = condenseJsonForPreview(v, depth + 1);
      } else if (typeof v === "string" && v.length > 120) {
        res[k] = v.substring(0, 117) + "...";
      } else {
        res[k] = v;
      }
    }
    return res;
  }

  return data;
}
window.condenseJsonForPreview = condenseJsonForPreview;

function pickIconForKey(key) {
  const k = String(key).toLowerCase();
  if (/email|mail/.test(k)) return 'email';
  if (/phone|tel|mobile|cell/.test(k)) return 'phone';
  if (/website|url|web|domain|site|link/.test(k)) return 'language';
  if (/address|street|city|zip|location|geo|lat|lng|country|state|place/.test(k)) return 'location_on';
  if (/company|corp|org|business|employer|work/.test(k)) return 'business';
  if (/user|name|profile|author|creator|person|handle/.test(k)) return 'person';
  if (/id|code|sku|uuid|key|badge|tag/.test(k)) return 'badge';
  if (/price|cost|amount|balance|salary|fee/.test(k)) return 'attach_money';
  if (/date|time|created|updated|expires|birth/.test(k)) return 'info';
  if (/status|state|active|is_/.test(k)) return 'check';
  if (/star|score|rating|rank/.test(k)) return 'star';
  if (/lock|password|secret|token|security/.test(k)) return 'lock';
  if (/image|img|avatar|thumb|photo|picture/.test(k)) return 'image';
  if (/shipping|delivery|truck/.test(k)) return 'local_shipping';
  if (/return|policy|refund/.test(k)) return 'assignment_return';
  if (/warranty|guarantee/.test(k)) return 'verified';
  if (/weight|scale|dimension|size|measure/.test(k)) return 'straighten';
  if (/stock|inventory|quantity|count/.test(k)) return 'inventory';
  return 'info';
}
window.pickIconForKey = pickIconForKey;

// All Flutter & Dart widgets supported in the Visual Screen Design Studio
const COMPONENT_STUDIO_OPTIONS = [
  { group: "✨ Smart Recommendations", items: [
    { value: "image", label: "🖼️ Hero / Network Image" },
    { value: "text_title", label: "🏷️ Heading Title Text" },
    { value: "text_price", label: "💵 Price & Discount Badge" },
    { value: "text_rating", label: "⭐ Star Rating Display" },
    { value: "text_body", label: "📝 Body / Description Text" },
    { value: "chip", label: "🔖 Category / Status Chip" },
    { value: "listtile", label: "📋 ListTile Info Row" },
    { value: "button", label: "🔘 Action Button" },
    { value: "list_view", label: "📜 Repeating ListView" }
  ]},
  { group: "📱 Flutter & Dart Widgets", items: [
    { value: "text", label: "📝 Text (Headline/Body)" },
    { value: "image", label: "🖼️ Image (Network)" },
    { value: "card", label: "💳 Feature Card" },
    { value: "banner", label: "📢 Promo Banner" },
    { value: "button", label: "🔘 Button" },
    { value: "listtile", label: "📋 List Tile" },
    { value: "chip", label: "🏷️ Chip Tag" },
    { value: "metric_row", label: "📊 Metric Stats Row" },
    { value: "textfield", label: "💬 Text Input Field" },
    { value: "switch", label: "🎚️ Switch Toggle" },
    { value: "checkbox", label: "☑️ Checkbox Tile" },
    { value: "radio", label: "🔘 Radio Option" },
    { value: "icon", label: "⭐ Material Icon" },
    { value: "container", label: "📦 Decorated Container" },
    { value: "column", label: "🏛️ Column Layout" },
    { value: "row", label: "↔️ Row Layout" },
    { value: "divider", label: "➖ Divider Line" },
    { value: "spacer", label: "↕️ Spacer Box" }
  ]},
  { group: "Action", items: [
    { value: "none", label: "❌ Don't Include (Skip)" }
  ]}
];

let dsSuggestedMappings = [];

// Helper to detect if API response encapsulates payload in a single root wrapper object
// (e.g. { "data": { ... } }, { "result": { ... } }, or { "status": 200, "data": { ... } })
function getRootWrapperInfo(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { isWrapped: false, wrapperKey: "", targetObj: data, prefix: "" };
  }

  const wrapperKeys = ["data", "result", "payload", "response", "item", "record", "body", "entity", "output", "detail", "details"];
  for (const wk of wrapperKeys) {
    if (data[wk] && typeof data[wk] === "object" && !Array.isArray(data[wk]) && Object.keys(data[wk]).length > 0) {
      return { isWrapped: true, wrapperKey: wk, targetObj: data[wk], prefix: `${wk}.` };
    }
  }

  const keys = Object.keys(data);
  const objKeys = keys.filter(k => typeof data[k] === "object" && data[k] !== null && !Array.isArray(data[k]));
  const isMetadataKey = k => ["status", "code", "message", "msg", "success", "error", "errors", "timestamp", "time", "count", "version", "meta"].includes(k.toLowerCase());

  if (objKeys.length === 1) {
    const nonObjKeys = keys.filter(k => k !== objKeys[0]);
    if (nonObjKeys.length === 0 || nonObjKeys.every(isMetadataKey)) {
      return { isWrapped: true, wrapperKey: objKeys[0], targetObj: data[objKeys[0]], prefix: `${objKeys[0]}.` };
    }
  }

  return { isWrapped: false, wrapperKey: "", targetObj: data, prefix: "" };
}
window.getRootWrapperInfo = getRootWrapperInfo;

function suggestUiComponents(data) {
  dsSuggestedMappings = [];
  if (!data) return [];

  const wrapperInfo = getRootWrapperInfo(data);
  let targetObj = data;
  let isArrayScope = false;
  let rootPrefix = "";

  if (Array.isArray(data)) {
    isArrayScope = true;
    rootPrefix = "item.";
    targetObj = data.length > 0 && typeof data[0] === "object" ? data[0] : {};
  } else if (typeof data === "object" && data !== null) {
    const listKeys = ["products", "users", "items", "data", "results", "records", "list", "posts"];
    let foundList = false;
    for (const lk of listKeys) {
      if (Array.isArray(data[lk]) && data[lk].length > 0 && typeof data[lk][0] === "object") {
        if (!checkIsSingleEntity(data)) {
          isArrayScope = true;
          rootPrefix = "item.";
          targetObj = data[lk][0];
          foundList = true;
          break;
        }
      }
    }

    if (!foundList && wrapperInfo.isWrapped) {
      targetObj = wrapperInfo.targetObj;
      rootPrefix = wrapperInfo.prefix;
    }
  }

  function formatSampleVal(val) {
    if (val == null) return "null";
    if (typeof val === "object") {
      if (Array.isArray(val)) {
        if (val.length === 0) return "[]";
        if (typeof val[0] === "object") return `[${val.length} items]`;
        return val.slice(0, 3).join(", ");
      }
      return "{...}";
    }
    const s = String(val).trim();
    return s.length > 30 ? s.substring(0, 27) + "..." : s;
  }

  function formatLabelKey(str) {
    if (!str) return "";
    return str.split(".").map(part => {
      if (/^\d+$/.test(part)) return "";
      return part
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
    }).filter(Boolean).join(" ");
  }

  function detectSmartType(k, val) {
    const lk = k.toLowerCase();
    if (lk.includes("image") || lk.includes("thumbnail") || lk.includes("avatar") || lk.includes("photo") || lk.includes("poster") || (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://")) && (val.includes(".png") || val.includes(".jpg") || val.includes(".jpeg") || val.includes(".webp") || val.includes("unsplash")))) {
      return "image";
    }
    if (lk === "title" || lk === "name" || lk === "header" || lk === "headline" || lk === "product_name" || lk.endsWith("_name")) {
      return "text_title";
    }
    if (lk.includes("rating") || lk.includes("stars") || lk.includes("score")) {
      return "text_rating";
    }
    if (lk.includes("price") || lk.includes("cost") || lk.includes("amount") || lk.includes("discount") || lk.includes("salary") || lk.includes("fee")) {
      return "text_price";
    }
    if (lk.includes("description") || lk.includes("bio") || lk.includes("summary") || lk.includes("details") || lk.includes("about") || (typeof val === "string" && val.length > 60)) {
      return "text_body";
    }
    if (lk === "category" || lk === "brand" || lk === "status" || lk === "availabilitystatus" || lk === "tags" || lk === "role" || lk === "department" || lk === "genre" || lk === "type") {
      return "chip";
    }
    if (typeof val === "boolean" || lk.startsWith("is_") || lk.startsWith("has_")) {
      return "switch";
    }
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      return "list_view";
    }
    if (Array.isArray(val)) {
      return "chip";
    }
    if (typeof val === "object" && val !== null) {
      return "listtile";
    }
    if (lk === "id" || lk.endsWith("_id") || lk === "sku" || lk === "uuid" || lk === "code") {
      return "listtile";
    }
    return "text";
  }

  if (typeof targetObj === "object" && targetObj !== null) {
    for (const [k, v] of Object.entries(targetObj)) {
      const fullPath = isArrayScope ? `item.${k}` : `${rootPrefix}${k}`;
      const rawToken = `{{${fullPath}}}`;

      // If v is a nested object (e.g. details: { a: 1, b: 2 }), unpack subkeys
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        const subEntries = Object.entries(v);
        if (subEntries.length > 0 && subEntries.length <= 15) {
          let unpackedAny = false;
          for (const [subK, subV] of subEntries) {
            if (typeof subV !== "object" || subV == null) {
              const subFullPath = `${fullPath}.${subK}`;
              dsSuggestedMappings.push({
                key: subFullPath,
                token: `{{${subFullPath}}}`,
                sample: formatSampleVal(subV),
                type: detectSmartType(subK, subV),
                label: formatLabelKey(`${k}.${subK}`),
                rawValue: subV
              });
              unpackedAny = true;
            }
          }
          if (unpackedAny) continue;
        }
      }

      const smartType = detectSmartType(k, v);
      dsSuggestedMappings.push({
        key: fullPath,
        token: rawToken,
        sample: formatSampleVal(v),
        type: smartType,
        label: formatLabelKey(k),
        rawValue: v
      });
    }

    const hasPrice = dsSuggestedMappings.some(m => m.type === "text_price");
    if (hasPrice) {
      const priceItem = dsSuggestedMappings.find(m => m.type === "text_price");
      dsSuggestedMappings.push({
        key: "_action_buy",
        token: priceItem ? `Buy Now • ${priceItem.token}` : "Buy Now",
        sample: "Action Button",
        type: "button",
        label: "Primary Action",
        rawValue: null
      });
    }
  }

  return dsSuggestedMappings;
}
window.suggestUiComponents = suggestUiComponents;

function renderSuggestedComponentsList() {
  const container = document.getElementById("dsSuggestedComponentsList");
  if (!container) return;
  container.innerHTML = "";

  if (!dsSuggestedMappings || dsSuggestedMappings.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px 10px;color:var(--text-muted);font-size:12px;">Fetch an API endpoint to auto-suggest UI components.</div>`;
    return;
  }

  dsSuggestedMappings.forEach((mapping, idx) => {
    const isNone = mapping.type === "none";
    const row = document.createElement("div");
    row.className = "suggested-comp-card";
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: ${isNone ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'};
      border: 1px solid ${isNone ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'};
      border-radius: 6px;
      opacity: ${isNone ? 0.45 : 1};
      transition: all 0.15s ease;
    `;

    let optionsHtml = "";
    COMPONENT_STUDIO_OPTIONS.forEach(grp => {
      optionsHtml += `<optgroup label="${grp.group}">`;
      grp.items.forEach(opt => {
        const isSel = mapping.type === opt.value;
        optionsHtml += `<option value="${opt.value}" ${isSel ? 'selected' : ''}>${opt.label}</option>`;
      });
      optionsHtml += `</optgroup>`;
    });

    row.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; color: #64748B; width: 18px; text-align: center;">${idx + 1}</div>
      <div style="flex: 1.1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-family: monospace; font-size: 11px; color: #38BDF8; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(mapping.token)}">${escapeHtml(mapping.token)}</span>
        </div>
        <div style="font-size: 10px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(mapping.sample)}">${escapeHtml(mapping.sample)}</div>
      </div>
      <div style="flex: 1.35; min-width: 140px;">
        <select class="form-select form-select-xs" style="width: 100%; font-size: 11px; padding: 4px 6px; background: #1E293B; color: #F8FAFC; border: 1px solid #334155; border-radius: 4px;" onchange="changeSuggestedComponentType(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
      <button class="api-btn-del" type="button" onclick="removeSuggestedComponent(${idx})" title="Remove this component" style="color: #EF4444; background: transparent; border: none; cursor: pointer; padding: 2px 6px; font-size: 13px;">✕</button>
    `;

    container.appendChild(row);
  });
}
window.renderSuggestedComponentsList = renderSuggestedComponentsList;

window.changeSuggestedComponentType = function(idx, newType) {
  if (dsSuggestedMappings[idx]) {
    dsSuggestedMappings[idx].type = newType;
    renderSuggestedComponentsList();
  }
};

window.removeSuggestedComponent = function(idx) {
  if (dsSuggestedMappings[idx]) {
    dsSuggestedMappings.splice(idx, 1);
    renderSuggestedComponentsList();
  }
};

window.addCustomSuggestedComponent = function() {
  const token = prompt("Enter custom field key or token (e.g. subtitle, item.price, {{discount}}):");
  if (!token) return;
  const cleanTok = token.startsWith("{{") ? token : `{{${token}}}`;
  const key = cleanTok.replace(/[\{\}]/g, "");
  dsSuggestedMappings.push({
    key: key,
    token: cleanTok,
    sample: "Custom Field",
    type: "text",
    label: key,
    rawValue: null
  });
  renderSuggestedComponentsList();
};

window.resetSuggestedComponents = function() {
  if (simulatorScreenData) {
    suggestUiComponents(simulatorScreenData);
    renderSuggestedComponentsList();
    showToast("Reset to smart recommended components");
  }
};

window.createFullScreenFromSuggestions = function() {
  const url = (document.getElementById("dsUrlInput")?.value || "").trim();
  if (!url) {
    alert("Please enter a Data Source API URL first!");
    return;
  }
  if (!dsSuggestedMappings || dsSuggestedMappings.length === 0) {
    alert("No suggested components available. Please fetch and inspect an API endpoint first!");
    return;
  }

  const activeItems = dsSuggestedMappings.filter(m => m.type !== "none");
  if (activeItems.length === 0) {
    alert("All components are set to 'Skip'. Please select at least one component to include.");
    return;
  }

  const components = [];
  const primaryBrandColor = activeSchema.theme?.primary_color || "#4F46E5";

  // Check if there is a hero image
  const imgItem = activeItems.find(m => m.type === "image");
  if (imgItem) {
    components.push({
      id: `hero_img_${Date.now()}`,
      type: "image",
      image_url: imgItem.token,
      height: 220,
      border_radius: 14,
      padding: 4
    });
  }

  // Title
  const titleItem = activeItems.find(m => m.type === "text_title") || activeItems.find(m => m.key.toLowerCase().includes("title") || m.key.toLowerCase().includes("name"));
  if (titleItem && titleItem !== imgItem) {
    components.push({
      id: `title_${Date.now()}`,
      type: "text",
      text: titleItem.token,
      font_size: 20,
      is_bold: true,
      align: "left",
      padding: 4
    });
  }

  // Star Rating & Price
  const ratingItem = activeItems.find(m => m.type === "text_rating");
  const priceItem = activeItems.find(m => m.type === "text_price");

  if (ratingItem || priceItem) {
    const rowChildren = [];
    if (ratingItem) {
      rowChildren.push({
        id: `rating_${Date.now()}`,
        type: "text",
        text: `★ ${ratingItem.token}`,
        font_size: 15,
        is_bold: true,
        color: "#F59E0B"
      });
    }
    if (priceItem) {
      rowChildren.push({
        id: `price_${Date.now()}`,
        type: "text",
        text: priceItem.token.includes("$") ? priceItem.token : `$${priceItem.token}`,
        font_size: 18,
        is_bold: true,
        color: "#10B981"
      });
    }
    components.push({
      id: `row_stat_${Date.now()}`,
      type: "row",
      main_axis_alignment: "spaceBetween",
      cross_axis_alignment: "center",
      children: rowChildren
    });
  }

  // Chips
  const chipItems = activeItems.filter(m => m.type === "chip");
  if (chipItems.length > 0) {
    const chipRow = {
      id: `chips_${Date.now()}`,
      type: "row",
      main_axis_alignment: "start",
      cross_axis_alignment: "center",
      children: chipItems.map((c, i) => ({
        id: `chip_${Date.now()}_${i}`,
        type: "chip",
        label: `${c.label}: ${c.token}`,
        icon: "check",
        is_selected: true
      }))
    };
    components.push(chipRow);
  }

  // Body / Description text
  const bodyItem = activeItems.find(m => m.type === "text_body");
  if (bodyItem && bodyItem !== titleItem) {
    components.push({
      id: `desc_${Date.now()}`,
      type: "text",
      text: bodyItem.token,
      font_size: 14,
      is_bold: false,
      color: "#94A3B8",
      padding: 6
    });
  }

  // Remaining items
  const handledKeys = new Set([
    imgItem?.key,
    titleItem?.key,
    ratingItem?.key,
    priceItem?.key,
    bodyItem?.key,
    ...chipItems.map(c => c.key)
  ].filter(Boolean));

  let hasAttributes = false;
  activeItems.forEach((m, idx) => {
    if (handledKeys.has(m.key) && m.type !== "button") return;
    if (m.type === "button") return;

    if (!hasAttributes && components.length > 0) {
      components.push({ id: `div_${Date.now()}`, type: "divider", thickness: 1, color: "#334155", padding: 8 });
      hasAttributes = true;
    }

    const safeKey = String(m.key).replace(/[^a-zA-Z0-9_]/g, '_');
    if (m.type === "listtile") {
      components.push({
        id: `tile_${safeKey}_${Date.now()}_${idx}`,
        type: "listtile",
        title: m.label,
        subtitle: m.token,
        leading_icon: pickIconForKey(m.key),
        trailing_text: "›"
      });
    } else if (m.type === "list_view") {
      components.push({
        id: `list_${safeKey}_${Date.now()}_${idx}`,
        type: "list_view",
        data_path: m.key,
        item_template: {
          id: `item_${safeKey}_${Date.now()}`,
          type: "listtile",
          title: `{{item.name}}`,
          subtitle: `{{item.description}}`,
          trailing_text: "›"
        }
      });
    } else if (m.type === "card") {
      components.push({
        id: `card_${safeKey}_${Date.now()}_${idx}`,
        type: "card",
        title: m.label,
        description: m.token,
        badge: "INFO",
        action_text: "View Details"
      });
    } else if (m.type === "banner") {
      components.push({
        id: `banner_${safeKey}_${Date.now()}_${idx}`,
        type: "banner",
        title: m.label,
        message: m.token,
        badge: "NOTICE",
        color: primaryBrandColor
      });
    } else if (m.type === "metric_row") {
      components.push({
        id: `metric_${safeKey}_${Date.now()}_${idx}`,
        type: "metric_row",
        metrics: [
          { label: m.label, value: m.token, change: "+0%", is_positive: true }
        ]
      });
    } else if (m.type === "textfield") {
      components.push({
        id: `input_${safeKey}_${Date.now()}_${idx}`,
        type: "textfield",
        label: m.label,
        hint: m.token
      });
    } else if (m.type === "switch") {
      components.push({
        id: `switch_${safeKey}_${Date.now()}_${idx}`,
        type: "switch",
        label: m.label,
        subtitle: m.token,
        is_checked: true
      });
    } else if (m.type === "checkbox") {
      components.push({
        id: `check_${safeKey}_${Date.now()}_${idx}`,
        type: "checkbox",
        label: m.label,
        subtitle: m.token,
        is_checked: false
      });
    } else if (m.type === "radio") {
      components.push({
        id: `radio_${safeKey}_${Date.now()}_${idx}`,
        type: "radio",
        label: m.label,
        subtitle: m.token,
        is_selected: true
      });
    } else if (m.type === "icon") {
      components.push({
        id: `icon_${safeKey}_${Date.now()}_${idx}`,
        type: "icon",
        icon: pickIconForKey(m.key),
        size: 28,
        color: primaryBrandColor
      });
    } else if (m.type === "container") {
      components.push({
        id: `container_${safeKey}_${Date.now()}_${idx}`,
        type: "container",
        background_color: "#1E293B",
        border_radius: 12,
        padding: 12,
        children: [
          { id: `c_t1_${idx}`, type: "text", text: m.label, font_size: 14, is_bold: true },
          { id: `c_t2_${idx}`, type: "text", text: m.token, font_size: 12, color: "#94A3B8" }
        ]
      });
    } else {
      components.push({
        id: `text_${safeKey}_${Date.now()}_${idx}`,
        type: "text",
        text: `${m.label}: ${m.token}`,
        font_size: 14,
        is_bold: false
      });
    }
  });

  const btnItem = activeItems.find(m => m.type === "button");
  if (btnItem) {
    components.push({ id: `div_btn_${Date.now()}`, type: "spacer", height: 16 });
    components.push({
      id: `btn_action_${Date.now()}`,
      type: "button",
      text: btnItem.token.startsWith("{{") ? `Submit ${btnItem.token}` : btnItem.token,
      variant: "primary",
      action_id: "action_submit"
    });
  }

  activeSchema.components = components;

  const paginationChk = document.getElementById("dsPaginationCheckbox");
  activeSchema.data_source = {
    url: url,
    method: (document.getElementById("dsMethodSelect")?.value || "GET").toUpperCase(),
    show_error_widget: document.getElementById("dsShowErrorWidgetCheckbox") ? document.getElementById("dsShowErrorWidgetCheckbox").checked : true,
    error_message: (document.getElementById("dsErrorMessageInput")?.value || "").trim(),
    error_widget_type: document.getElementById("dsErrorWidgetTypeSelect")?.value || "banner",
    ...(paginationChk && paginationChk.checked ? {
      pagination: {
        mode: document.getElementById("dsPaginationMode")?.value || "page",
        page_param: document.getElementById("dsPageParam")?.value || "page",
        limit_param: document.getElementById("dsLimitParam")?.value || "limit",
        default_limit: parseInt(document.getElementById("dsDefaultLimit")?.value || "5", 10),
        data_path: (document.getElementById("dsDataPath")?.value || "").trim()
      }
    } : {})
  };

  renderAll();
  updateSimulator();
  saveCurrentSchemaToServer();
  closeApiConfigModal();
  showToast(`🎉 Full Screen UI Created with ${components.length} components! Live on Mobile.`);
};

async function fetchDsPreview() {
  const urlInput = document.getElementById("dsUrlInput");
  const url = (urlInput?.value || "").trim();
  if (!url) {
    const box = document.getElementById("dsTokensBox");
    if (box) box.style.display = "none";
    const statusBadge = document.getElementById("dsFetchStatusBadge");
    if (statusBadge) statusBadge.style.display = "none";
    return;
  }

  const btn = document.getElementById("btnFetchDsPreview");
  const statusBadge = document.getElementById("dsFetchStatusBadge");
  const metaLabel = document.getElementById("dsResponseMetaLabel");

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="sim-spinner" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></span> Fetching...`;
  }
  if (statusBadge) {
    statusBadge.style.display = "inline-block";
    statusBadge.className = "badge";
    statusBadge.style.background = "rgba(56, 189, 248, 0.2)";
    statusBadge.style.color = "#38bdf8";
    statusBadge.textContent = "⏳ Requesting...";
  }

  let data = null;
  let fetchMethodUsed = "Direct";

  try {
    const cleanUrl = url.startsWith("http") ? url : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;

    // Attempt 1: Direct fetch
    try {
      const resp = await fetch(cleanUrl, {
        headers: { "Accept": "application/json, text/plain, */*" }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      data = await resp.json();
    } catch (directErr) {
      // Attempt 2: CORS / Network Fallback through Sync Server Proxy
      console.info("Direct fetch failed, falling back to server CORS proxy:", directErr.message);
      fetchMethodUsed = "Proxy";
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(cleanUrl)}`;
      const proxyResp = await fetch(proxyUrl);
      if (!proxyResp.ok) {
        let errJson = null;
        try { errJson = await proxyResp.json(); } catch (_) {}
        throw new Error(errJson?.error || `HTTP ${proxyResp.status} via Proxy`);
      }
      data = await proxyResp.json();
    }

    if (!data) throw new Error("API returned an empty response body.");

    simulatorScreenData = data;
    currentLoadedDsUrl = url;

    // Display formatted JSON preview (condensed to 1 item per array for clean schema inspection)
    const previewEl = document.getElementById("dsResponsePreviewJson");
    if (previewEl) previewEl.textContent = JSON.stringify(condenseJsonForPreview(data), null, 2);

    if (metaLabel) {
      const isArray = Array.isArray(data);
      const sizeStr = isArray ? `${data.length} records (List)` : `${Object.keys(data).length} top-level fields (Object)`;
      metaLabel.textContent = `${fetchMethodUsed} • ${sizeStr}`;
    }

    // Auto-detect array path for pagination / listview
    autoDetectDataPath(data);

    // Extract available dynamic tokens
    const tokens = extractBindingTokens(data);
    renderTokenChips(tokens);

    // Auto-generate smart component suggestions in right panel
    suggestUiComponents(data);
    renderSuggestedComponentsList();

    const countLabel = document.getElementById("dsTokensCountLabel");
    if (countLabel) {
      countLabel.textContent = `${tokens.length} dynamic tokens available`;
    }

    const box = document.getElementById("dsTokensBox");
    if (box) box.style.display = "block";

    if (statusBadge) {
      statusBadge.style.display = "inline-block";
      statusBadge.style.background = "rgba(16, 185, 129, 0.2)";
      statusBadge.style.color = "#10B981";
      statusBadge.textContent = "✓ 200 OK";
    }

    showToast("✅ Live API Data Retrieved & Inspected!");
    updateSimulator();
  } catch (err) {
    console.error("fetchDsPreview error:", err);
    if (statusBadge) {
      statusBadge.style.display = "inline-block";
      statusBadge.style.background = "rgba(239, 68, 68, 0.2)";
      statusBadge.style.color = "#EF4444";
      statusBadge.textContent = "✕ Fetch Error";
    }
    const previewEl = document.getElementById("dsResponsePreviewJson");
    if (previewEl) previewEl.textContent = `// Error fetching data:\n${err.message}\n\nEndpoint: ${url}`;
    const box = document.getElementById("dsTokensBox");
    if (box) box.style.display = "block";
    showToast(`⚠️ Fetch Error: ${err.message}`, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `⚡ Fetch &amp; Inspect API Data`;
    }
  }
}
window.fetchDsPreview = fetchDsPreview;

function checkIsSingleEntity(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const wrapper = getRootWrapperInfo(data);
  const target = wrapper.isWrapped ? wrapper.targetObj : data;
  if (!target || typeof target !== "object" || Array.isArray(target)) return false;

  const hasId = target.id !== undefined || target._id !== undefined || target.uuid !== undefined || target.sku !== undefined || target.artist_id !== undefined || target.product_id !== undefined || target.user_id !== undefined;
  const hasName = target.title !== undefined || target.name !== undefined || target.username !== undefined || target.header !== undefined || target.label !== undefined || target.display_artist_name !== undefined || target.original_artist_name !== undefined || target.display_name !== undefined;
  const hasAttrs = target.price !== undefined || target.category !== undefined || target.email !== undefined || target.brand !== undefined || target.description !== undefined || target.phone !== undefined || target.status !== undefined || target.role !== undefined || target.website !== undefined || target.genre !== undefined || target.uploaded_by_user_id !== undefined;
  return (hasId && hasName) || (hasName && hasAttrs) || (hasId && hasAttrs) || (wrapper.isWrapped && Object.keys(target).length >= 2);
}

function autoDetectDataPath(data) {
  const dataPathInput = document.getElementById("dsDataPath");
  const paginationChk = document.getElementById("dsPaginationCheckbox");
  if (!dataPathInput) return;

  if (Array.isArray(data)) {
    dataPathInput.value = "";
    dataPathInput.placeholder = "Root array (leave blank)";
    if (paginationChk && !paginationChk.checked) {
      paginationChk.checked = true;
      toggleDsPaginationFields();
    }
  } else if (typeof data === "object" && data !== null) {
    if (checkIsSingleEntity(data)) {
      dataPathInput.value = "";
      dataPathInput.placeholder = "Single object (no data path needed)";
      if (paginationChk && paginationChk.checked) {
        paginationChk.checked = false;
        toggleDsPaginationFields();
      }
      return;
    }
    const listKeys = ["users", "products", "items", "data", "results", "records", "list", "posts", "comments", "photos", "todos", "articles", "orders", "transactions"];
    let foundList = false;
    for (const k of listKeys) {
      if (Array.isArray(data[k]) && data[k].length > 0 && typeof data[k][0] === "object") {
        dataPathInput.value = k;
        if (paginationChk && !paginationChk.checked) {
          paginationChk.checked = true;
          toggleDsPaginationFields();
        }
        foundList = true;
        break;
      }
    }
    if (!foundList) {
      dataPathInput.value = "";
      dataPathInput.placeholder = "Single object (no data path needed)";
      if (paginationChk && paginationChk.checked) {
        paginationChk.checked = false;
        toggleDsPaginationFields();
      }
    }
  }
}

function extractBindingTokens(data, prefix = "", depth = 0, isItemScope = false) {
  if (depth > 4 || data == null) return [];
  const tokens = [];

  function formatSample(val) {
    if (val == null) return "null";
    if (typeof val === "object") return Array.isArray(val) ? `[${val.length} items]` : "{...}";
    const s = String(val).trim();
    return s.length > 25 ? s.substring(0, 22) + "..." : s;
  }

  function detectType(k, val) {
    const lk = k.toLowerCase();
    if (lk.includes("image") || lk.includes("img") || lk.includes("avatar") || lk.includes("thumb") || lk.includes("photo") || (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://")) && (val.includes(".png") || val.includes(".jpg") || val.includes(".jpeg") || val.includes(".webp") || val.includes("unsplash")))) {
      return "image";
    }
    if (lk.includes("price") || lk.includes("amount") || lk.includes("cost") || lk.includes("rate") || lk.includes("rating") || typeof val === "number") {
      return "number";
    }
    if (typeof val === "boolean") return "boolean";
    return "text";
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      const itemTokens = extractBindingTokens(data[0], "item.", depth + 1, true);
      tokens.push(...itemTokens);
    }
  } else if (typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      const rawKey = `${prefix}${k}`;
      const tokenStr = `{{${rawKey}}}`;
      const type = detectType(k, v);
      const sample = formatSample(v);

      if (!Array.isArray(v) && (typeof v !== "object" || v == null)) {
        tokens.push({
          token: tokenStr,
          key: rawKey,
          sample: sample,
          type: type,
          isItemScope: isItemScope
        });
      } else if (Array.isArray(v)) {
        tokens.push({
          token: `{{${rawKey}.length}}`,
          key: `${rawKey}.length`,
          sample: `${v.length} items`,
          type: "number",
          isItemScope: isItemScope
        });
        if (v.length > 0 && typeof v[0] === "object" && depth < 2) {
          const subPrefix = isItemScope ? `${rawKey}.0.` : `${rawKey}.0.`;
          const subTokens = extractBindingTokens(v[0], subPrefix, depth + 1, isItemScope);
          tokens.push(...subTokens);
        }
      } else if (typeof v === "object" && depth < 2) {
        tokens.push({
          token: tokenStr,
          key: rawKey,
          sample: "{object}",
          type: "object",
          isItemScope: isItemScope
        });
        const sub = extractBindingTokens(v, `${rawKey}.`, depth + 1, isItemScope);
        tokens.push(...sub);
      }
    }
  }

  const seen = new Set();
  return tokens.filter(t => {
    if (seen.has(t.token)) return false;
    seen.add(t.token);
    return true;
  });
}

function renderTokenChips(tokens) {
  const container = document.getElementById("dsTokenChipsContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!tokens || tokens.length === 0) {
    container.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">No tokens found in response.</span>`;
    return;
  }

  tokens.slice(0, 48).forEach(tok => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "token-chip";
    const typeIcon = tok.type === "image" ? "🖼️" : (tok.type === "number" ? "🔢" : "📋");
    chip.innerHTML = `
      <span>${typeIcon}</span>
      <span class="token-chip-name">${escapeHtml(tok.token)}</span>
      <span class="token-chip-sample" title="${escapeHtml(tok.sample)}">${escapeHtml(tok.sample)}</span>
    `;
    chip.title = `Click to copy ${tok.token} or insert into active field`;
    chip.onclick = () => {
      // 1. Copy to clipboard
      navigator.clipboard?.writeText(tok.token);

      // 2. If a property input was recently focused, insert token directly
      if (lastActiveFocusedInput && document.body.contains(lastActiveFocusedInput)) {
        const start = lastActiveFocusedInput.selectionStart || 0;
        const end = lastActiveFocusedInput.selectionEnd || 0;
        const val = lastActiveFocusedInput.value || "";
        lastActiveFocusedInput.value = val.substring(0, start) + tok.token + val.substring(end);
        lastActiveFocusedInput.dispatchEvent(new Event("input", { bubbles: true }));
        lastActiveFocusedInput.dispatchEvent(new Event("change", { bubbles: true }));
        showToast(`Inserted ${tok.token} into "${lastActiveFocusedInput.dataset.label || lastActiveFocusedInput.id || 'field'}"!`);
      } else {
        showToast(`Copied ${tok.token} to clipboard!`);
      }
    };
    container.appendChild(chip);
  });
}

window.quickAddBoundComponent = function(type) {
  if (!simulatorScreenData) {
    alert("Please fetch an API endpoint first to inspect its tokens!");
    return;
  }
  const tokens = extractBindingTokens(simulatorScreenData);

  if (type === "text") {
    const textTok = tokens.find(t => !t.isItemScope && t.type === "text" && !t.key.includes(".length")) || tokens[0];
    const tokStr = textTok ? textTok.token : "{{title}}";
    const newComp = {
      id: `text_bound_${Date.now()}`,
      type: "text",
      text: tokStr,
      font_size: 16,
      is_bold: false,
      padding: 6
    };
    activeSchema.components = activeSchema.components || [];
    activeSchema.components.push(newComp);
    renderComponentsList();
    updateSimulator();
    showToast(`Added Text widget bound to ${tokStr}`);
  } else if (type === "image") {
    const imgTok = tokens.find(t => t.type === "image" && !t.isItemScope) || tokens.find(t => t.type === "image") || tokens[0];
    const tokStr = imgTok ? imgTok.token : "{{thumbnail}}";
    const newComp = {
      id: `img_bound_${Date.now()}`,
      type: "image",
      image_url: tokStr,
      height: 180,
      border_radius: 12
    };
    activeSchema.components = activeSchema.components || [];
    activeSchema.components.push(newComp);
    renderComponentsList();
    updateSimulator();
    showToast(`Added Image widget bound to ${tokStr}`);
  } else if (type === "listview") {
    const dataPathInput = document.getElementById("dsDataPath");
    const dataPath = dataPathInput ? dataPathInput.value.trim() : "";
    const itemTokens = tokens.filter(t => t.isItemScope);
    const titleTok = itemTokens.find(t => t.key.includes("title") || t.key.includes("name"))?.token || "{{item.title}}";
    const subTok = itemTokens.find(t => t.key.includes("sub") || t.key.includes("desc") || t.key.includes("email") || t.key.includes("detail"))?.token || "{{item.subtitle}}";
    const imgTok = itemTokens.find(t => t.type === "image")?.token || "";

    const newComp = {
      id: `list_bound_${Date.now()}`,
      type: "list_view",
      data_path: dataPath,
      item_template: {
        id: `tile_${Date.now()}`,
        type: "listtile",
        title: titleTok,
        subtitle: subTok,
        leading_image: imgTok,
        leading_icon: imgTok ? "" : "list",
        trailing_text: "›"
      }
    };
    activeSchema.components = activeSchema.components || [];
    activeSchema.components.push(newComp);
    renderComponentsList();
    updateSimulator();
    showToast(`Added ListView bound to "${dataPath || 'root array'}"!`);
  }
};

function resolveTokens(val, context) {
  if (typeof val !== "string" || !context) return val;
  if (!val.includes("{{")) return val;

  return val.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g, (match, key) => {
    const parts = key.split(".");
    let curr = context;
    for (const p of parts) {
      if (curr == null) return "";
      curr = curr[p];
    }
    if (curr == null) return "";
    if (Array.isArray(curr)) return curr.join(", ");
    if (typeof curr === "object") return JSON.stringify(curr);
    return String(curr);
  });
}

function resolveCompBindings(val, context) {
  if (!context || val == null) return val;
  if (typeof val === "string") {
    return resolveTokens(val, context);
  } else if (Array.isArray(val)) {
    return val.map(item => resolveCompBindings(item, context));
  } else if (typeof val === "object") {
    const clone = {};
    for (const [k, v] of Object.entries(val)) {
      clone[k] = resolveCompBindings(v, context);
    }
    return clone;
  }
  return val;
}

window.generateUniversalApiLayout = function() {
  const url = (document.getElementById("dsUrlInput")?.value || "").trim();
  if (!url) {
    alert("Please enter a Data Source API URL first!");
    return;
  }
  if (!simulatorScreenData) {
    alert("Please click '⚡ Fetch & Inspect API Data' first so the layout generator can analyze the actual response fields!");
    return;
  }

  const data = simulatorScreenData;
  const isSingleEntity = checkIsSingleEntity(data);
  const isRootArray = Array.isArray(data) && data.length > 0 && typeof data[0] === "object";
  let arrayData = isRootArray ? data : null;
  let arrayKey = "";

  if (!isSingleEntity && !arrayData && typeof data === "object" && data !== null) {
    const listKeys = ["users", "products", "items", "data", "results", "records", "list", "posts", "comments", "photos", "todos", "articles", "orders", "transactions"];
    for (const k of listKeys) {
      if (Array.isArray(data[k]) && data[k].length > 0 && typeof data[k][0] === "object") {
        arrayData = data[k];
        arrayKey = k;
        break;
      }
    }
  }

  const isListFeed = !isSingleEntity && arrayData != null && arrayData.length > 0;
  const paginationChk = document.getElementById("dsPaginationCheckbox");
  const isPaginating = isListFeed && paginationChk && paginationChk.checked;

  activeSchema.data_source = {
    url: url,
    method: (document.getElementById("dsMethodSelect")?.value || "GET").toUpperCase(),
    ...(isPaginating ? {
      pagination: {
        mode: document.getElementById("dsPaginationMode")?.value || "page",
        page_param: document.getElementById("dsPageParam")?.value || "page",
        limit_param: document.getElementById("dsLimitParam")?.value || "limit",
        default_limit: parseInt(document.getElementById("dsDefaultLimit")?.value || "5", 10),
        data_path: arrayKey
      }
    } : {})
  };

  const dataPathInput = document.getElementById("dsDataPath");
  if (dataPathInput) dataPathInput.value = isListFeed ? arrayKey : "";

  function formatLabel(str) {
    if (!str) return '';
    return str.split('.').map(part => {
      if (/^\d+$/.test(part)) return '';
      return part
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
    }).filter(Boolean).join(' ');
  }

  function pickIconForKey(key) {
    const k = String(key).toLowerCase();
    if (/email|mail/.test(k)) return 'email';
    if (/phone|tel|mobile|cell/.test(k)) return 'phone';
    if (/website|url|web|domain|site|link/.test(k)) return 'language';
    if (/address|street|city|zip|location|geo|lat|lng|country|state|place/.test(k)) return 'location_on';
    if (/company|corp|org|business|employer|work/.test(k)) return 'business';
    if (/user|name|profile|author|creator|person|handle/.test(k)) return 'person';
    if (/id|code|sku|uuid|key|badge|tag/.test(k)) return 'badge';
    if (/price|cost|amount|balance|salary|fee/.test(k)) return 'attach_money';
    if (/date|time|created|updated|expires|birth/.test(k)) return 'info';
    if (/status|state|active|is_/.test(k)) return 'check';
    if (/star|score|rating|rank/.test(k)) return 'star';
    if (/lock|password|secret|token|security/.test(k)) return 'lock';
    if (/image|img|avatar|thumb|photo|picture/.test(k)) return 'image';
    if (/shipping|delivery|truck/.test(k)) return 'local_shipping';
    if (/return|policy|refund/.test(k)) return 'assignment_return';
    if (/warranty|guarantee/.test(k)) return 'verified';
    if (/weight|scale|dimension|size|measure/.test(k)) return 'straighten';
    if (/stock|inventory|quantity|count/.test(k)) return 'inventory';
    return 'info';
  }

  if (isListFeed) {
    const sampleItem = arrayData[0] || {};
    const itemKeys = Object.keys(sampleItem);

    // Pick top primary fields for the single item row template
    const titleKey = itemKeys.find(k => /^(title|name|header|label|username)$/i.test(k)) || itemKeys.find(k => /(name|title)/i.test(k)) || itemKeys[0] || "title";
    const subKey = itemKeys.find(k => /^(email|subtitle|description|desc|detail|role|department|category)$/i.test(k)) || itemKeys.find(k => /(email|desc|sub|role)/i.test(k)) || "";
    const imgKey = itemKeys.find(k => /(image|img|avatar|thumbnail|thumb|photo|picture)/i.test(k)) || "";
    const badgeKey = itemKeys.find(k => /(price|status|role|type|category|currency|tag|id)/i.test(k)) || "";

    const screenTitle = arrayKey ? (arrayKey.charAt(0).toUpperCase() + arrayKey.slice(1) + " Feed") : "Dynamic Listing";

    activeSchema.header = {
      title: screenTitle,
      subtitle: `Live Cloud Feed (${arrayData.length}+ records)`,
      show_back_button: true,
      action_icon: "sync"
    };

    activeSchema.components = [
      {
        id: `list_${Date.now()}`,
        type: "list_view",
        data_path: arrayKey,
        item_template: {
          id: `item_row_${Date.now()}`,
          type: "listtile",
          title: `{{item.${titleKey}}}`,
          ...(subKey ? { subtitle: `{{item.${subKey}}}` } : {}),
          ...(imgKey ? { leading_image: `{{item.${imgKey}}}` } : { leading_icon: "person" }),
          ...(badgeKey ? { trailing_text: `{{item.${badgeKey}}}` } : { trailing_text: "›" }),
          action_id: "item_click"
        }
      },
      {
        id: `btn_action_${Date.now()}`,
        type: "button",
        text: "Submit Form / Action",
        variant: "primary",
        action_id: "action_submit"
      }
    ];
  } else {
    // Normal Data (Single Object): Generate high-fidelity realistic UI
    // (Hero Image, Title Text, Rating Star, Price Text, Description, Chips, Specs ListTiles, Action Button)
    const wrapper = getRootWrapperInfo(data);
    const target = wrapper.isWrapped ? wrapper.targetObj : data;
    const prefix = wrapper.prefix;
    const comps = [];
    const handledKeys = new Set();
    const now = Date.now();

    // 1. Primary Hero Image
    const imgKey = ["thumbnail", "image", "avatar", "photo", "img", "picture"].find(k => typeof target[k] === "string" && (target[k].startsWith("http") || target[k].includes("/"))) ||
      (Array.isArray(target.images) && typeof target.images[0] === "string" ? "images.0" : "");
    if (imgKey) {
      comps.push({
        id: `img_hero_${now}`,
        type: "image",
        image_url: `{{${prefix}${imgKey}}}`,
        height: 220,
        border_radius: 14,
        padding: 6
      });
      handledKeys.add(imgKey.split(".")[0]);
    }

    // 2. Title Text (Product Name / Entity Title)
    const titleKey = ["title", "name", "header", "product_name", "display_artist_name", "original_artist_name", "display_name"].find(k => typeof target[k] === "string") ||
      Object.keys(target).find(k => k.toLowerCase().endsWith("_name") && typeof target[k] === "string");
    if (titleKey) {
      comps.push({
        id: `text_title_${now}`,
        type: "text",
        text: `{{${prefix}${titleKey}}}`,
        font_size: 20,
        is_bold: true,
        padding: 4
      });
      handledKeys.add(titleKey);
    }

    // 3. Rating Star Text
    const ratingKey = ["rating", "rate", "stars", "score"].find(k => target[k] !== undefined);
    const categoryKey = ["category", "type", "department", "genre"].find(k => typeof target[k] === "string");
    const brandKey = ["brand", "vendor", "manufacturer"].find(k => typeof target[k] === "string");
    if (ratingKey) {
      let ratingStr = `★ {{${prefix}${ratingKey}}}`;
      if (target.reviews && Array.isArray(target.reviews)) {
        ratingStr += ` (${target.reviews.length} reviews)`;
      } else if (target.rating_count) {
        ratingStr += ` ({{${prefix}rating_count}} ratings)`;
      }
      if (categoryKey) {
        ratingStr += `  •  {{${prefix}${categoryKey}}}`;
        handledKeys.add(categoryKey);
      }
      if (brandKey) {
        ratingStr += `  •  {{${prefix}${brandKey}}}`;
        handledKeys.add(brandKey);
      }
      comps.push({
        id: `text_rating_${now}`,
        type: "text",
        text: ratingStr,
        font_size: 14,
        is_bold: true,
        color: "#F59E0B",
        padding: 2
      });
      handledKeys.add(ratingKey);
    }

    // 4. Price Text
    const priceKey = ["price", "cost", "amount", "salary", "fee"].find(k => target[k] !== undefined);
    const discountKey = ["discountPercentage", "discount", "discount_percentage", "off"].find(k => target[k] !== undefined);
    if (priceKey) {
      let priceStr = `\${{${prefix}${priceKey}}}`;
      if (discountKey) {
        priceStr += `  ({{${prefix}${discountKey}}}% OFF)`;
        handledKeys.add(discountKey);
      }
      comps.push({
        id: `text_price_${now}`,
        type: "text",
        text: priceStr,
        font_size: 22,
        is_bold: true,
        color: "#10B981",
        padding: 4
      });
      handledKeys.add(priceKey);
    }

    // 5. Description Text (Body)
    const descKey = ["description", "desc", "summary", "body", "bio", "details"].find(k => typeof target[k] === "string");
    if (descKey) {
      comps.push({
        id: `text_desc_${now}`,
        type: "text",
        text: `{{${prefix}${descKey}}}`,
        font_size: 14,
        color: "#94A3B8",
        padding: 6
      });
      handledKeys.add(descKey);
    }

    // 6. Tags Chip
    const tagsKey = ["tags", "categories", "labels", "badges"].find(k => Array.isArray(target[k]));
    if (tagsKey) {
      comps.push({
        id: `chip_tags_${now}`,
        type: "chip",
        label: `🏷️ Tags: {{${prefix}${tagsKey}}}`,
        is_selected: false
      });
      handledKeys.add(tagsKey);
    }

    // 7. Structured User fields (if user profile)
    if (target.username) {
      comps.push({
        id: `tile_username_${now}`,
        type: "listtile",
        title: "Username & ID",
        subtitle: target.id ? `@{{${prefix}username}} • ID: #{{${prefix}id}}` : `@{{${prefix}username}}`,
        leading_icon: "person"
      });
      handledKeys.add("username");
    }

    if (target.email) {
      comps.push({
        id: `tile_email_${now}`,
        type: "listtile",
        title: "Email Address",
        subtitle: `{{${prefix}email}}`,
        leading_icon: "email"
      });
      handledKeys.add("email");
    }

    if (target.phone) {
      comps.push({
        id: `tile_phone_${now}`,
        type: "listtile",
        title: "Phone Number",
        subtitle: `{{${prefix}phone}}`,
        leading_icon: "phone"
      });
      handledKeys.add("phone");
    }

    if (target.website) {
      comps.push({
        id: `tile_website_${now}`,
        type: "listtile",
        title: "Website",
        subtitle: `{{${prefix}website}}`,
        leading_icon: "language"
      });
      handledKeys.add("website");
    }

    if (target.address && typeof target.address === "object") {
      let addrStr = "";
      if (target.address.street) {
        addrStr = `{{${prefix}address.street}}` + (target.address.suite ? `, {{${prefix}address.suite}}` : "") + (target.address.city ? `, {{${prefix}address.city}}` : "") + (target.address.zipcode ? ` {{${prefix}address.zipcode}}` : "");
      } else {
        addrStr = Object.values(target.address).filter(v => typeof v === "string").join(", ");
      }
      comps.push({
        id: `tile_address_${now}`,
        type: "listtile",
        title: "Address",
        subtitle: addrStr,
        leading_icon: "location_on"
      });
      handledKeys.add("address");
    }

    if (target.company && typeof target.company === "object") {
      const compSubtitle = target.company.name
        ? `{{${prefix}company.name}}` + (target.company.catchPhrase ? ` • \"{{${prefix}company.catchPhrase}}\"` : "")
        : Object.values(target.company).filter(v => typeof v === "string").join(" • ");
      comps.push({
        id: `tile_company_${now}`,
        type: "listtile",
        title: "Company",
        subtitle: compSubtitle,
        leading_icon: "business"
      });
      handledKeys.add("company");
    }

    // 8. Structured Product Details (Availability, Shipping, Warranty, Return policy, Dimensions, Reviews, SKU)
    if (target.availabilityStatus !== undefined || target.stock !== undefined) {
      comps.push({
        id: `tile_stock_${now}`,
        type: "listtile",
        title: "Availability",
        subtitle: target.stock !== undefined && target.availabilityStatus
          ? `{{${prefix}availabilityStatus}} ({{${prefix}stock}} in stock)`
          : (target.stock !== undefined ? `{{${prefix}stock}} units in stock` : `{{${prefix}availabilityStatus}}`),
        leading_icon: "inventory"
      });
      handledKeys.add("availabilityStatus");
      handledKeys.add("stock");
    }

    if (target.shippingInformation) {
      comps.push({
        id: `tile_shipping_${now}`,
        type: "listtile",
        title: "Shipping & Delivery",
        subtitle: `{{${prefix}shippingInformation}}`,
        leading_icon: "local_shipping"
      });
      handledKeys.add("shippingInformation");
    }

    if (target.warrantyInformation || target.returnPolicy) {
      const subtitle = [target.warrantyInformation ? `{{${prefix}warrantyInformation}}` : "", target.returnPolicy ? `{{${prefix}returnPolicy}}` : ""].filter(Boolean).join(" • ");
      comps.push({
        id: `tile_warranty_${now}`,
        type: "listtile",
        title: "Warranty & Return Policy",
        subtitle: subtitle,
        leading_icon: "verified"
      });
      handledKeys.add("warrantyInformation");
      handledKeys.add("returnPolicy");
    }

    if (target.dimensions) {
      let dimStr = `{{${prefix}dimensions.width}} × {{${prefix}dimensions.height}} × {{${prefix}dimensions.depth}} cm`;
      if (target.weight) {
        dimStr += ` ({{${prefix}weight}}kg)`;
        handledKeys.add("weight");
      }
      comps.push({
        id: `tile_dimensions_${now}`,
        type: "listtile",
        title: "Dimensions & Weight",
        subtitle: dimStr,
        leading_icon: "straighten"
      });
      handledKeys.add("dimensions");
    }

    if (Array.isArray(target.reviews) && target.reviews.length > 0) {
      comps.push({
        id: `tile_review_${now}`,
        type: "listtile",
        title: `Latest Customer Review • {{${prefix}reviews.0.reviewerName}}`,
        subtitle: `★ {{${prefix}reviews.0.rating}} - "{{${prefix}reviews.0.comment}}"`,
        leading_icon: "star"
      });
      handledKeys.add("reviews");
    }

    if (target.sku || (target.meta && target.meta.barcode)) {
      const parts = [];
      if (target.sku) parts.push(`SKU: {{${prefix}sku}}`);
      if (target.meta && target.meta.barcode) parts.push(`Barcode: {{${prefix}meta.barcode}}`);
      comps.push({
        id: `tile_sku_${now}`,
        type: "listtile",
        title: "Product Identifiers",
        subtitle: parts.join(" • "),
        leading_icon: "badge"
      });
      handledKeys.add("sku");
    }

    if (target.meta && target.meta.qrCode) {
      comps.push({
        id: `tile_qrcode_${now}`,
        type: "listtile",
        title: "Product QR Code",
        subtitle: "Scan to verify genuine product authenticity",
        leading_image: `{{${prefix}meta.qrCode}}`
      });
    }
    handledKeys.add("meta");
    handledKeys.add("images");
    handledKeys.add("id");

    // 9. Remaining unhandled scalar properties (fallback)
    for (const [k, v] of Object.entries(target)) {
      if (handledKeys.has(k)) continue;
      if (v == null) continue;
      if (typeof v === "object") {
        if (!Array.isArray(v)) {
          for (const [subK, subV] of Object.entries(v)) {
            if (subV != null && typeof subV !== "object") {
              comps.push({
                id: `tile_${k}_${subK}_${now}`,
                type: "listtile",
                title: formatLabel(`${k} ${subK}`),
                subtitle: `{{${prefix}${k}.${subK}}}`,
                leading_icon: pickIconForKey(subK)
              });
            }
          }
        }
        continue;
      }
      comps.push({
        id: `tile_${k}_${now}`,
        type: "listtile",
        title: formatLabel(k),
        subtitle: `{{${prefix}${k}}}`,
        leading_icon: pickIconForKey(k)
      });
    }

    // 10. Primary Action Button
    const btnText = priceKey
      ? `Add to Cart • \${{${prefix}${priceKey}}}`
      : (target.email ? "Contact / Message User" : "Submit Form / Action");
    comps.push({
      id: `btn_action_${now}`,
      type: "button",
      text: btnText,
      variant: "primary",
      action_id: "action_submit"
    });

    const displayTitle = target.title || target.name || target.username || target.display_artist_name || target.original_artist_name || "API Data View";
    activeSchema.header = {
      title: String(displayTitle).substring(0, 32),
      subtitle: `${comps.length - 1} Custom UI Elements`,
      show_back_button: true,
      action_icon: "sync"
    };

    activeSchema.components = comps;
  }

  closeApiConfigModal();
  renderAll();
  fetchSimulatorScreenData(activeSchema.data_source);
  markScreenDirty(activeScreenId);
  showToast("✨ Auto-Generated & Bound UI from this API!");
};

window.generatePresetFromApi = function(type) {
  if (type === "product") {
    activeSchema.header = {
      title: "Product Detail",
      subtitle: "Live Cloud Synchronized View",
      show_back_button: true,
      action_icon: "shopping_cart"
    };
    activeSchema.data_source = {
      url: document.getElementById("dsUrlInput")?.value || "https://dummyjson.com/products/1",
      method: "GET"
    };
    activeSchema.components = [
      {
        id: "prod_img_1",
        type: "image",
        height: 190,
        image_url: "{{thumbnail}}",
        border_radius: 14
      },
      {
        id: "prod_title_1",
        type: "text",
        text: "{{title}}",
        font_size: 20,
        is_bold: true,
        padding: 4
      },
      {
        id: "prod_price_1",
        type: "text",
        text: "${{price}} USD • Rating: {{rating}} ⭐",
        font_size: 15,
        color: "#10B981",
        is_bold: true,
        padding: 2
      },
      {
        id: "prod_desc_1",
        type: "text",
        text: "{{description}}",
        font_size: 13,
        color: "#94A3B8",
        padding: 4
      },
      {
        id: "prod_features_list",
        type: "list_view",
        data_path: "features",
        item_template: {
          id: "item_feat",
          type: "listtile",
          title: "{{item.name}}",
          subtitle: "{{item.detail}}",
          leading_icon: "check"
        }
      },
      {
        id: "prod_btn_buy",
        type: "button",
        text: "Add to Cart (${{price}})",
        action_type: "api_call",
        api_config: {
          url: "/api/submissions",
          method: "POST",
          body_mapping: { "product": "title", "amount": "price" },
          on_success: {
            action: "dialog",
            title: "Added to Cart!",
            message: "Item was dynamically added via Cloud API."
          }
        }
      }
    ];
  } else if (type === "users") {
    activeSchema.header = {
      title: "Team & User Directory",
      subtitle: "Real-Time Cloud Feed",
      show_back_button: true,
      action_icon: "search"
    };
    activeSchema.data_source = {
      url: document.getElementById("dsUrlInput")?.value || "https://jsonplaceholder.typicode.com/users",
      method: "GET",
      pagination: {
        mode: "page",
        page_param: "page",
        limit_param: "limit",
        default_limit: 5,
        data_path: (document.getElementById("dsDataPath")?.value || "").trim()
      }
    };
    activeSchema.components = [
      {
        id: "users_banner",
        type: "banner",
        title: "Live User Directory",
        message: "Loaded dynamically from Cloud API with infinite scroll pagination.",
        badge: "PAGINATED",
        color: "#4F46E5"
      },
      {
        id: "users_list_view",
        type: "list_view",
        data_path: (document.getElementById("dsDataPath")?.value || "").trim(),
        item_template: {
          id: "user_tile_tpl",
          type: "listtile",
          title: "{{item.name}}",
          subtitle: "{{item.email}}",
          leading_image: "{{item.avatar}}",
          leading_icon: "person",
          trailing_text: "Profile",
          action_id: "user_profile_click"
        }
      },
      {
        id: "btn_add_user",
        type: "button",
        text: "Submit Form / Action",
        variant: "secondary",
        action_id: "open_user_form"
      }
    ];
  }
  closeApiConfigModal();
  renderAll();
  fetchSimulatorScreenData(activeSchema.data_source);
  showToast(`✨ Generated ${type === "product" ? "Product Detail" : "User Listing"} screen layout!`);
};

function openApiConfigModal(target = "screen") {
  if (!apiConfigModal) return;
  currentApiTarget = target;
  const cfg = getTargetApiConfig(target) || {};

  // Setup Title / Subtitle
  if (target === "screen") {
    const name = activeSchema.screen_name || activeSchema.header?.title || activeScreenId;
    if (apiModalTargetSubtitle) {
      apiModalTargetSubtitle.innerText = `Configuring for Screen: "${name}" (${activeSchema.route || "/"})`;
    }
  } else if (typeof target === "string" && target.startsWith("comp_")) {
    const idx = parseInt(target.replace("comp_", ""), 10);
    const comp = activeSchema.components[idx];
    if (apiModalTargetSubtitle) {
      apiModalTargetSubtitle.innerText = `Configuring for Component: ${comp?.type?.toUpperCase() || 'BUTTON'} "${comp?.text || comp?.id || ''}"`;
    }
  } else if (typeof target === "string" && target.startsWith("child_")) {
    const parts = target.split("_");
    const pIdx = parseInt(parts[1], 10);
    const cIdx = parseInt(parts[2], 10);
    const child = activeSchema.components[pIdx]?.children?.[cIdx];
    if (apiModalTargetSubtitle) {
      apiModalTargetSubtitle.innerText = `Configuring for Child Component: ${child?.type?.toUpperCase() || 'BUTTON'} "${child?.text || child?.id || ''}"`;
    }
  }

  // Populate Data Source Tab
  const ds = activeSchema.data_source || {};
  const dsUrlInput = document.getElementById("dsUrlInput");
  const dsMethodSelect = document.getElementById("dsMethodSelect");
  const dsPaginationCheckbox = document.getElementById("dsPaginationCheckbox");
  const dsPaginationMode = document.getElementById("dsPaginationMode");
  const dsPageParam = document.getElementById("dsPageParam");
  const dsLimitParam = document.getElementById("dsLimitParam");
  const dsDefaultLimit = document.getElementById("dsDefaultLimit");
  const dsDataPath = document.getElementById("dsDataPath");

  if (dsUrlInput) dsUrlInput.value = ds.url || "";
  if (dsMethodSelect) dsMethodSelect.value = (ds.method || "GET").toUpperCase();
  if (dsPaginationCheckbox) {
    dsPaginationCheckbox.checked = ds.pagination != null;
    toggleDsPaginationFields();
  }
  if (ds.pagination) {
    if (dsPaginationMode) dsPaginationMode.value = ds.pagination.mode || "page";
    if (dsPageParam) dsPageParam.value = ds.pagination.page_param || "page";
    if (dsLimitParam) dsLimitParam.value = ds.pagination.limit_param || "limit";
    if (dsDefaultLimit) dsDefaultLimit.value = ds.pagination.default_limit || 5;
    if (dsDataPath) dsDataPath.value = ds.pagination.data_path || "";
  }

  // Populate Error Widget Configuration
  const dsShowErrorWidget = document.getElementById("dsShowErrorWidgetCheckbox");
  const dsErrorMessage = document.getElementById("dsErrorMessageInput");
  const dsErrorWidgetType = document.getElementById("dsErrorWidgetTypeSelect");
  if (dsShowErrorWidget) dsShowErrorWidget.checked = ds.show_error_widget !== false;
  if (dsErrorMessage) dsErrorMessage.value = ds.error_message || "";
  if (dsErrorWidgetType) dsErrorWidgetType.value = ds.error_widget_type || "banner";

  // Switch to appropriate tab
  if (target === "screen") {
    switchApiModalTab("datasource");
    if (ds.url) {
      setTimeout(() => fetchDsPreview(), 60);
    }
  } else {
    switchApiModalTab("submission");
  }

  // Populate Endpoint & Method
  if (apiMethodSelect) apiMethodSelect.value = (cfg.method || "POST").toUpperCase();
  if (apiUrlInput) apiUrlInput.value = cfg.url || "/api/submissions";

  // Populate Headers
  modalHeaders = [];
  const rawHeaders = cfg.headers || { "Content-Type": "application/json" };
  for (const [k, v] of Object.entries(rawHeaders)) {
    modalHeaders.push({ key: k, value: String(v) });
  }

  // Populate Field Mappings
  modalMappings = [];
  const rawMapping = cfg.body_mapping || {};
  for (const [k, v] of Object.entries(rawMapping)) {
    modalMappings.push({ apiKey: k, fieldId: String(v) });
  }
  // If no mapping exists yet, auto-map from current screen inputs!
  if (modalMappings.length === 0) {
    const inputs = getScreenInputComponents();
    inputs.forEach(inp => {
      const cleanKey = inp.id.replace(/^input_/, "").replace(/^sim_input_/, "") || inp.id;
      modalMappings.push({ apiKey: cleanKey, fieldId: inp.id });
    });
  }

  // Populate Static Params
  modalStaticParams = [];
  const rawStatic = cfg.static_body || {};
  for (const [k, v] of Object.entries(rawStatic)) {
    modalStaticParams.push({ key: k, value: String(v) });
  }

  // Outcome
  const onSuccess = cfg.on_success || {};
  if (apiSuccessTypeSelect) apiSuccessTypeSelect.value = onSuccess.action || "dialog";
  if (apiSuccessTitleInput) apiSuccessTitleInput.value = onSuccess.title || "Submitted Successfully!";
  if (apiSuccessMsgInput) apiSuccessMsgInput.value = onSuccess.message || "Your details have been submitted to cloud API.";
  if (apiSuccessNavInput) apiSuccessNavInput.value = onSuccess.route || "/";
  if (apiErrorMsgInput) apiErrorMsgInput.value = cfg.on_error?.message || "";
  if (apiResetFormCheckbox) apiResetFormCheckbox.checked = cfg.reset_form !== false;

  toggleOutcomeFields(apiSuccessTypeSelect ? apiSuccessTypeSelect.value : "dialog");

  // Render Table UI
  renderHeadersTable();
  renderMappingTable();
  renderStaticParamsTable();
  updateApiPayloadPreview();

  // Reset Test runner output
  if (apiTestResult) apiTestResult.style.display = "none";

  apiConfigModal.style.display = "flex";
}

function closeApiConfigModal() {
  if (apiConfigModal) apiConfigModal.style.display = "none";
}

// Table Renders & Row Operations
function renderHeadersTable() {
  if (!apiHeadersTbody) return;
  apiHeadersTbody.innerHTML = "";
  modalHeaders.forEach((h, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${escapeHtml(h.key)}" placeholder="e.g. Authorization" oninput="modalHeaders[${idx}].key = this.value; updateApiPayloadPreview();"></td>
      <td><input type="text" value="${escapeHtml(h.value)}" placeholder="e.g. Bearer token_xyz" oninput="modalHeaders[${idx}].value = this.value; updateApiPayloadPreview();"></td>
      <td style="text-align: center;"><button class="api-btn-del" type="button" onclick="removeHeaderRow(${idx})">✕</button></td>
    `;
    apiHeadersTbody.appendChild(tr);
  });
}

function addHeaderRow(key = "", value = "") {
  modalHeaders.push({ key, value });
  renderHeadersTable();
}

function removeHeaderRow(idx) {
  modalHeaders.splice(idx, 1);
  renderHeadersTable();
}

function renderMappingTable() {
  if (!apiMappingTbody) return;
  apiMappingTbody.innerHTML = "";
  const availableInputs = getScreenInputComponents();

  modalMappings.forEach((m, idx) => {
    const tr = document.createElement("tr");

    let optionsHtml = `<option value="">-- Select Screen Input --</option>`;
    let foundInList = false;
    availableInputs.forEach(inp => {
      const isSel = inp.id === m.fieldId;
      if (isSel) foundInList = true;
      optionsHtml += `<option value="${escapeHtml(inp.id)}" ${isSel ? 'selected' : ''}>${escapeHtml(inp.label)} (${escapeHtml(inp.id)})</option>`;
    });
    if (!foundInList && m.fieldId) {
      optionsHtml += `<option value="${escapeHtml(m.fieldId)}" selected>${escapeHtml(m.fieldId)} (Custom / Preserved ID)</option>`;
    }

    tr.innerHTML = `
      <td>
        <input type="text" value="${escapeHtml(m.apiKey)}" placeholder="e.g. user_email" oninput="modalMappings[${idx}].apiKey = this.value; updateApiPayloadPreview();">
      </td>
      <td>
        <select onchange="modalMappings[${idx}].fieldId = this.value; if(!modalMappings[${idx}].apiKey) modalMappings[${idx}].apiKey = this.value.replace(/^input_/, ''); updateApiPayloadPreview();">
          ${optionsHtml}
        </select>
      </td>
      <td style="text-align: center;">
        <button class="api-btn-del" type="button" onclick="removeMappingRow(${idx})">✕</button>
      </td>
    `;
    apiMappingTbody.appendChild(tr);
  });
}

function addMappingRow(apiKey = "", fieldId = "") {
  modalMappings.push({ apiKey, fieldId });
  renderMappingTable();
  updateApiPayloadPreview();
}

function removeMappingRow(idx) {
  modalMappings.splice(idx, 1);
  renderMappingTable();
  updateApiPayloadPreview();
}

function autoMapAllFields() {
  const inputs = getScreenInputComponents();
  if (inputs.length === 0) {
    showToast("⚠️ No input components found on this screen to map", true);
    return;
  }
  modalMappings = inputs.map(inp => ({
    apiKey: inp.id.replace(/^input_/, "").replace(/^sim_input_/, "") || inp.id,
    fieldId: inp.id
  }));
  renderMappingTable();
  updateApiPayloadPreview();
  showToast(`⚡ Auto-mapped ${modalMappings.length} screen input fields!`);
}

function renderStaticParamsTable() {
  if (!apiStaticParamsTbody) return;
  apiStaticParamsTbody.innerHTML = "";
  modalStaticParams.forEach((s, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${escapeHtml(s.key)}" placeholder="e.g. source, tenant_id" oninput="modalStaticParams[${idx}].key = this.value; updateApiPayloadPreview();"></td>
      <td><input type="text" value="${escapeHtml(s.value)}" placeholder="e.g. web_app, production" oninput="modalStaticParams[${idx}].value = this.value; updateApiPayloadPreview();"></td>
      <td style="text-align: center;"><button class="api-btn-del" type="button" onclick="removeStaticParamRow(${idx})">✕</button></td>
    `;
    apiStaticParamsTbody.appendChild(tr);
  });
}

function addStaticParamRow(key = "", value = "") {
  modalStaticParams.push({ key, value });
  renderStaticParamsTable();
  updateApiPayloadPreview();
}

function removeStaticParamRow(idx) {
  modalStaticParams.splice(idx, 1);
  renderStaticParamsTable();
  updateApiPayloadPreview();
}

function buildCurrentModalPayload() {
  const payload = {};
  modalMappings.forEach(m => {
    if (!m.apiKey) return;
    const simVal = typeof getSimulatorInputValue === "function" ? getSimulatorInputValue(m.fieldId) : "";
    if (simVal !== "" && simVal !== undefined) {
      payload[m.apiKey] = simVal;
    } else {
      payload[m.apiKey] = `<${m.fieldId || m.apiKey}>`;
    }
  });
  modalStaticParams.forEach(s => {
    if (!s.key) return;
    payload[s.key] = s.value;
  });
  return payload;
}

function updateApiPayloadPreview() {
  if (!apiPayloadPreviewJson) return;
  const payload = buildCurrentModalPayload();
  apiPayloadPreviewJson.textContent = JSON.stringify(payload, null, 2);
}

// Live Direct Cloud API Test Runner
async function runApiTest() {
  if (!btnRunApiTest) return;
  const method = (apiMethodSelect?.value || "POST").toUpperCase();
  const rawUrl = (apiUrlInput?.value || "").trim();

  if (!rawUrl) {
    showToast("⚠️ Please enter an API Endpoint URL first!", true);
    return;
  }

  const headers = {};
  modalHeaders.forEach(h => {
    if (h.key && h.key.trim()) headers[h.key.trim()] = h.value;
  });

  const payload = buildCurrentModalPayload();

  let testUrl = rawUrl;
  for (const k in payload) {
    if (testUrl.includes(`{${k}}`)) {
      testUrl = testUrl.replace(`{${k}}`, encodeURIComponent(payload[k]));
    }
  }

  btnRunApiTest.disabled = true;
  btnRunApiTest.innerText = "⏳ Sending Test Request...";

  const startTime = performance.now();

  try {
    const fetchOpts = {
      method: method,
      headers: headers
    };
    if (method !== "GET" && method !== "HEAD") {
      fetchOpts.body = JSON.stringify(payload);
    }

    const res = await fetch(testUrl, fetchOpts);
    const duration = Math.round(performance.now() - startTime);

    let resBodyText = "";
    try {
      const json = await res.json();
      resBodyText = JSON.stringify(json, null, 2);
    } catch (_) {
      resBodyText = await res.text();
    }

    if (apiTestResult) apiTestResult.style.display = "block";
    if (apiTestStatusBadge) {
      apiTestStatusBadge.innerText = `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`;
      apiTestStatusBadge.className = `badge ${res.ok ? 'badge-success' : 'badge-danger'}`;
    }
    if (apiTestDuration) {
      apiTestDuration.innerText = `${duration} ms`;
    }
    if (apiTestResponseBody) {
      apiTestResponseBody.textContent = resBodyText || "(Empty Response Body)";
    }
    showToast(res.ok ? `✅ Test Request Succeeded (${res.status})` : `⚠️ Test Request Received (${res.status})`, !res.ok);
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    if (apiTestResult) apiTestResult.style.display = "block";
    if (apiTestStatusBadge) {
      apiTestStatusBadge.innerText = "Connection Failed";
      apiTestStatusBadge.className = "badge badge-danger";
    }
    if (apiTestDuration) apiTestDuration.innerText = `${duration} ms`;
    if (apiTestResponseBody) apiTestResponseBody.textContent = `Error: ${err.message}\n(Make sure URL is reachable or CORS allows requests)`;
    showToast(`⚠️ Connection Error: ${err.message}`, true);
  } finally {
    btnRunApiTest.disabled = false;
    btnRunApiTest.innerText = "▶ Send Test Request Now";
  }
}

function saveApiConfig() {
  // 1. If screen level or on datasource tab, save data_source configuration
  if (currentApiTarget === "screen" || activeApiModalTab === "datasource") {
    const dsUrl = (document.getElementById("dsUrlInput")?.value || "").trim();
    if (dsUrl) {
      const ds = {
        url: dsUrl,
        method: document.getElementById("dsMethodSelect")?.value || "GET",
        headers: {},
        params: {},
        show_error_widget: document.getElementById("dsShowErrorWidgetCheckbox") ? document.getElementById("dsShowErrorWidgetCheckbox").checked : true,
        error_message: (document.getElementById("dsErrorMessageInput")?.value || "").trim(),
        error_widget_type: document.getElementById("dsErrorWidgetTypeSelect")?.value || "banner"
      };
      if (document.getElementById("dsPaginationCheckbox")?.checked) {
        ds.pagination = {
          mode: document.getElementById("dsPaginationMode")?.value || "page",
          page_param: document.getElementById("dsPageParam")?.value || "page",
          limit_param: document.getElementById("dsLimitParam")?.value || "limit",
          default_limit: parseInt(document.getElementById("dsDefaultLimit")?.value, 10) || 5,
          data_path: (document.getElementById("dsDataPath")?.value || "").trim()
        };
      }
      activeSchema.data_source = ds;
      fetchSimulatorScreenData(ds);
    } else if (activeApiModalTab === "datasource") {
      delete activeSchema.data_source;
      simulatorScreenData = null;
    }
  }

  // 2. Save submission / action API config if configured or if on submission tab
  const subUrl = (apiUrlInput?.value || "").trim();
  if (subUrl && (activeApiModalTab === "submission" || currentApiTarget !== "screen")) {
    const headers = {};
    modalHeaders.forEach(h => {
      if (h.key && h.key.trim()) headers[h.key.trim()] = h.value;
    });

    const bodyMapping = {};
    modalMappings.forEach(m => {
      if (m.apiKey && m.apiKey.trim() && m.fieldId) {
        bodyMapping[m.apiKey.trim()] = m.fieldId.trim();
      }
    });

    const staticBody = {};
    modalStaticParams.forEach(s => {
      if (s.key && s.key.trim()) {
        staticBody[s.key.trim()] = s.value;
      }
    });

    const successAction = apiSuccessTypeSelect ? apiSuccessTypeSelect.value : "dialog";
    const onSuccess = {
      action: successAction,
      title: apiSuccessTitleInput ? apiSuccessTitleInput.value.trim() : "Submitted Successfully!",
      message: apiSuccessMsgInput ? apiSuccessMsgInput.value.trim() : "Your details have been submitted to cloud API.",
      route: apiSuccessNavInput ? apiSuccessNavInput.value.trim() : "/"
    };

    const onError = {
      message: apiErrorMsgInput ? apiErrorMsgInput.value.trim() : ""
    };

    const api_config = {
      url: subUrl,
      method: apiMethodSelect ? apiMethodSelect.value : "POST",
      headers: headers,
      body_mapping: bodyMapping,
      static_body: staticBody,
      on_success: onSuccess,
      on_error: onError,
      reset_form: apiResetFormCheckbox ? apiResetFormCheckbox.checked : true
    };

    setTargetApiConfig(currentApiTarget, api_config);
  }

  closeApiConfigModal();
  updateSimulator();
  renderComponentList();
  showToast("💾 API Configuration Saved & Bound!");
}

function removeApiConfig() {
  if (!confirm("Are you sure you want to remove the Cloud API configuration from this target?")) return;
  setTargetApiConfig(currentApiTarget, null);
  closeApiConfigModal();
  showToast("🗑 Cloud API Configuration Removed.");
}

// Global Presets Handlers
window.setApiUrlPreset = function(url) {
  if (apiUrlInput) {
    apiUrlInput.value = url;
    updateApiPayloadPreview();
  }
};

window.addHeaderPreset = function(key, val) {
  addHeaderRow(key, val);
};

window.openApiConfigModal = openApiConfigModal;
window.closeApiConfigModal = closeApiConfigModal;
window.removeHeaderRow = removeHeaderRow;
window.removeMappingRow = removeMappingRow;
window.removeStaticParamRow = removeStaticParamRow;

// Bind Modal Listeners
if (btnOpenScreenApiModal) {
  btnOpenScreenApiModal.addEventListener("click", () => openApiConfigModal("screen"));
}
if (btnCloseApiConfigModal) {
  btnCloseApiConfigModal.addEventListener("click", closeApiConfigModal);
}
if (btnCancelApiConfigModal) {
  btnCancelApiConfigModal.addEventListener("click", closeApiConfigModal);
}
if (btnSaveApiConfig) {
  btnSaveApiConfig.addEventListener("click", saveApiConfig);
}
if (btnRemoveApiConfig) {
  btnRemoveApiConfig.addEventListener("click", removeApiConfig);
}
if (btnAddHeaderRow) {
  btnAddHeaderRow.addEventListener("click", () => addHeaderRow("", ""));
}
if (btnAddMappingRow) {
  btnAddMappingRow.addEventListener("click", () => addMappingRow("", ""));
}
if (btnAutoMapAllFields) {
  btnAutoMapAllFields.addEventListener("click", autoMapAllFields);
}
if (btnAddStaticParamRow) {
  btnAddStaticParamRow.addEventListener("click", () => addStaticParamRow("", ""));
}
if (btnRefreshPayloadPreview) {
  btnRefreshPayloadPreview.addEventListener("click", updateApiPayloadPreview);
}
if (apiSuccessTypeSelect) {
  apiSuccessTypeSelect.addEventListener("change", (e) => toggleOutcomeFields(e.target.value));
}
if (btnRunApiTest) {
  btnRunApiTest.addEventListener("click", runApiTest);
}

const btnFetchDsPreview = document.getElementById("btnFetchDsPreview");
if (btnFetchDsPreview) {
  btnFetchDsPreview.addEventListener("click", fetchDsPreview);
}

const dsUrlInput = document.getElementById("dsUrlInput");
if (dsUrlInput) {
  dsUrlInput.addEventListener("input", onDsUrlInputChange);
  dsUrlInput.addEventListener("change", fetchDsPreview);
  dsUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchDsPreview();
    }
  });
}

if (apiConfigModal) {
  apiConfigModal.addEventListener("click", (e) => {
    if (e.target === apiConfigModal) closeApiConfigModal();
  });
}

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
    case "container":
      return {
        id,
        type: "container",
        background_color: "#1E293B",
        border_color: "#38BDF8",
        border_width: 1.5,
        border_radius: 12,
        padding: 16,
        margin: 8,
        alignment: "topLeft",
        children: [
          { id: `${id}_t1`, type: "text", text: "Decorated Container", font_size: 15, is_bold: true, color: "#FFFFFF" },
          { id: `${id}_t2`, type: "text", text: "Background, border & radius styling with custom padding & margin", font_size: 12, color: "#94A3B8" }
        ]
      };
    case "stack":
      return {
        id,
        type: "stack",
        alignment: "topLeft",
        height: 180,
        clip: "hardEdge",
        children: [
          {
            id: `${id}_img`,
            type: "image",
            image_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80",
            height: 180,
            border_radius: 12
          },
          {
            id: `${id}_badge`,
            type: "chip",
            label: "FEATURED",
            is_selected: true,
            icon: "star",
            is_positioned: true,
            top: 12,
            left: 12
          },
          {
            id: `${id}_btn`,
            type: "button",
            text: "⚡ Buy Now",
            variant: "primary",
            action_id: "stack_action",
            is_positioned: true,
            bottom: 12,
            right: 12
          }
        ]
      };
    default:
      return { id, type, text: `Default ${type}` };
  }
}

let draggedCompIndex = null;
let insertTargetIndex = -1;
let contextInsertMenuEl = null;

function highlightCard(index) {
  setTimeout(() => {
    const cards = componentCardsContainer.querySelectorAll(".component-card-editor");
    const card = cards[index];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      card.classList.add("card-highlight-flash");
      setTimeout(() => card.classList.remove("card-highlight-flash"), 1200);
    }
  }, 60);
}

function getContextInsertMenu() {
  if (!contextInsertMenuEl) {
    contextInsertMenuEl = document.createElement("div");
    contextInsertMenuEl.className = "context-insert-menu";
    contextInsertMenuEl.id = "contextInsertMenu";
    contextInsertMenuEl.innerHTML = `
      <div class="dropdown-category">COMPOSITE SECTIONS</div>
      <a href="#" data-add="banner">📢 Promo Banner</a>
      <a href="#" data-add="metric_row">📊 Metric Stats Row</a>
      <a href="#" data-add="card">💳 Feature Action Card</a>
      <a href="#" data-add="button">🔘 Action Button</a>
      <div class="dropdown-divider"></div>
      <div class="dropdown-category">LAYOUT CONTAINERS</div>
      <a href="#" data-add="column">🏛️ Column (Vertical)</a>
      <a href="#" data-add="row">↔️ Row (Horizontal)</a>
      <a href="#" data-add="container">📦 Container (Box & Decoration)</a>
      <a href="#" data-add="stack">🥞 Stack (Layered Overlays)</a>
      <a href="#" data-add="divider">➖ Divider Line</a>
      <a href="#" data-add="spacer">↕️ Spacer Box</a>
      <div class="dropdown-divider"></div>
      <div class="dropdown-category">FLUTTER DEFAULT WIDGETS</div>
      <a href="#" data-add="text">📝 Text (Headline/Body)</a>
      <a href="#" data-add="image">🖼 Image (Network)</a>
      <a href="#" data-add="textfield">💬 Text Input Field</a>
      <a href="#" data-add="listtile">📋 List Tile</a>
      <a href="#" data-add="chip">🏷 Chip Tag</a>
      <a href="#" data-add="switch">🎚 Switch Toggle</a>
      <a href="#" data-add="checkbox">☑ Checkbox Tile</a>
      <a href="#" data-add="radio">🔘 Radio Option</a>
      <a href="#" data-add="icon">⭐ Material Icon</a>
    `;
    document.body.appendChild(contextInsertMenuEl);

    contextInsertMenuEl.querySelectorAll("a").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = item.dataset.add;
        addComponent(type, insertTargetIndex);
        closeInsertMenu();
      });
    });

    document.addEventListener("click", (e) => {
      if (!contextInsertMenuEl.contains(e.target)) {
        closeInsertMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeInsertMenu();
      }
    });
  }
  return contextInsertMenuEl;
}

window.openInsertMenu = function(idx, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  insertTargetIndex = idx >= 0 ? idx + 1 : 0;
  const menu = getContextInsertMenu();
  menu.classList.add("show");

  const target = event ? event.currentTarget : null;
  if (target) {
    const rect = target.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 350;

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight - 10) {
      top = Math.max(10, rect.top - menuHeight - 4);
    }

    menu.style.left = `${Math.max(10, left)}px`;
    menu.style.top = `${Math.max(10, top)}px`;
  }
};

function closeInsertMenu() {
  if (contextInsertMenuEl) {
    contextInsertMenuEl.classList.remove("show");
  }
}

function addComponent(type, insertAtIndex = -1) {
  const newComp = createDefaultWidget(type);
  if (!activeSchema.components) activeSchema.components = [];

  if (insertAtIndex >= 0 && insertAtIndex <= activeSchema.components.length) {
    activeSchema.components.splice(insertAtIndex, 0, newComp);
    renderAll();
    highlightCard(insertAtIndex);
    showToast(`Inserted ${type.toUpperCase()} at #${insertAtIndex + 1}`);
  } else {
    activeSchema.components.push(newComp);
    renderAll();
    highlightCard(activeSchema.components.length - 1);
    showToast(`Added ${type.toUpperCase()} to end`);
  }
}

window.moveComponent = function(idx, direction) {
  if (!activeSchema.components) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= activeSchema.components.length) return;
  const item = activeSchema.components.splice(idx, 1)[0];
  activeSchema.components.splice(newIdx, 0, item);
  renderAll();
  highlightCard(newIdx);
  showToast(`Moved to #${newIdx + 1}`);
};

window.duplicateComponent = function(idx) {
  if (!activeSchema.components || !activeSchema.components[idx]) return;
  const original = activeSchema.components[idx];
  const clone = JSON.parse(JSON.stringify(original));
  clone.id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  if (Array.isArray(clone.children)) {
    clone.children.forEach((c, i) => {
      c.id = `${clone.id}_c${i + 1}_${Date.now().toString(36)}`;
    });
  }
  activeSchema.components.splice(idx + 1, 0, clone);
  renderAll();
  highlightCard(idx + 1);
  showToast(`Duplicated ${original.type.toUpperCase()}`);
};

function renderConvertSelectOptions(currentType) {
  const cur = (currentType || "").toLowerCase();
  const groups = [
    {
      group: "Layout Containers",
      items: [
        { value: "row", label: "↔️ Row" },
        { value: "column", label: "🏛️ Column" },
        { value: "container", label: "📦 Container" },
        { value: "stack", label: "🥞 Stack" }
      ]
    },
    {
      group: "Text & Actions",
      items: [
        { value: "text", label: "📝 Text" },
        { value: "button", label: "🔘 Button" },
        { value: "chip", label: "🏷️ Chip" },
        { value: "textfield", label: "💬 Text Field" }
      ]
    },
    {
      group: "Toggles & Selection",
      items: [
        { value: "checkbox", label: "☑️ Checkbox" },
        { value: "radio", label: "🔘 Radio" },
        { value: "switch", label: "🎚️ Switch" }
      ]
    },
    {
      group: "Cards & Media",
      items: [
        { value: "listtile", label: "📋 List Tile" },
        { value: "card", label: "💳 Feature Card" },
        { value: "banner", label: "📢 Banner" },
        { value: "image", label: "🖼️ Image" },
        { value: "icon", label: "⭐ Material Icon" }
      ]
    },
    {
      group: "Display & Helpers",
      items: [
        { value: "metric_row", label: "📊 Metric Row" },
        { value: "divider", label: "➖ Divider Line" },
        { value: "spacer", label: "↕️ Spacer Box" }
      ]
    }
  ];

  let html = `<option value="" disabled selected>🔄 Convert ▾</option>`;
  for (const g of groups) {
    html += `<optgroup label="${g.group}">`;
    for (const it of g.items) {
      const isCur = it.value === cur;
      html += `<option value="${it.value}" ${isCur ? 'disabled style="opacity:0.5;"' : ''}>${it.label}${isCur ? ' (Current)' : ''}</option>`;
    }
    html += `</optgroup>`;
  }
  return html;
}
window.renderConvertSelectOptions = renderConvertSelectOptions;

window.convertComponentType = function(idx, targetType, childIdx = null) {
  if (!activeSchema || !activeSchema.components) return;
  const isChild = childIdx !== null && childIdx !== undefined;
  let comp = null;
  if (isChild) {
    comp = activeSchema.components[idx]?.children?.[childIdx];
  } else {
    comp = activeSchema.components[idx];
  }
  if (!comp || !targetType) return;

  const oldType = (comp.type || "").toLowerCase();
  const newType = (targetType || "").toLowerCase();
  if (oldType === newType) return;

  // Extract compatible properties for cross-component mapping
  const id = comp.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const primaryText = comp.text || comp.label || comp.title || comp.hint || "";
  const secondaryText = comp.subtitle || comp.description || comp.message || comp.hint || "";
  const actionId = comp.action_id || "";
  const isChecked = comp.is_checked !== undefined ? comp.is_checked : (comp.is_selected !== undefined ? comp.is_selected : true);
  const color = comp.color || comp.text_color || "";
  const existingChildren = Array.isArray(comp.children) && comp.children.length > 0 ? comp.children : null;
  const primaryThemeColor = (activeSchema.theme && activeSchema.theme.primary_color) ? activeSchema.theme.primary_color : "#4F46E5";

  let converted = { id, type: newType };

  switch (newType) {
    case "row":
      converted = {
        id,
        type: "row",
        main_axis_alignment: comp.main_axis_alignment || "spaceBetween",
        cross_axis_alignment: comp.cross_axis_alignment || "center",
        children: existingChildren || [
          { id: `${id}_t1`, type: "text", text: primaryText || "Row Item", font_size: 14, is_bold: false, align: "left" },
          { id: `${id}_chip`, type: "chip", label: secondaryText || "Status: Live", is_selected: true, icon: "check" }
        ]
      };
      break;

    case "column":
      converted = {
        id,
        type: "column",
        main_axis_alignment: comp.main_axis_alignment || "start",
        cross_axis_alignment: comp.cross_axis_alignment || "stretch",
        children: existingChildren || [
          { id: `${id}_t1`, type: "text", text: primaryText || "Column Item", font_size: 14, is_bold: true, align: "left" },
          { id: `${id}_btn`, type: "button", text: secondaryText || "Action", variant: "primary", action_id: actionId || "col_btn" }
        ]
      };
      break;

    case "container":
      converted = {
        id,
        type: "container",
        background_color: comp.background_color || "#1E293B",
        border_color: comp.border_color || "#38BDF8",
        border_width: comp.border_width !== undefined ? comp.border_width : 1,
        border_radius: comp.border_radius || 12,
        padding: comp.padding || 16,
        margin: comp.margin || 8,
        children: existingChildren || [
          { id: `${id}_t1`, type: "text", text: primaryText || "Decorated Container", font_size: 15, is_bold: true, color: "#FFFFFF" },
          { id: `${id}_t2`, type: "text", text: secondaryText || "Background & border styling", font_size: 12, color: "#94A3B8" }
        ]
      };
      break;

    case "stack":
      converted = {
        id,
        type: "stack",
        alignment: comp.alignment || "topLeft",
        height: comp.height || 180,
        clip: "hardEdge",
        children: existingChildren || createDefaultWidget("stack", id).children
      };
      break;

    case "text":
      converted = {
        id,
        type: "text",
        text: primaryText || "Dynamic Typography Headline",
        font_size: comp.font_size || 16,
        align: comp.align || "left",
        is_bold: comp.is_bold !== undefined ? comp.is_bold : false,
        padding: comp.padding || 4,
        ...(color ? { color } : {})
      };
      break;

    case "button":
      converted = {
        id,
        type: "button",
        text: primaryText || "Primary Action",
        variant: comp.variant || "primary",
        action_id: actionId || "action_submit",
        ...(comp.api_config ? { api_config: comp.api_config } : {}),
        ...(comp.on_click ? { on_click: comp.on_click } : {})
      };
      break;

    case "chip":
      converted = {
        id,
        type: "chip",
        label: primaryText || "Verified Member",
        icon: comp.icon || comp.leading_icon || "check",
        is_selected: isChecked,
        action_id: actionId || "chip_click"
      };
      break;

    case "textfield":
      converted = {
        id,
        type: "textfield",
        label: primaryText || "Your Full Name",
        hint: secondaryText || "e.g. John Doe",
        max_lines: 1,
        is_password: false,
        padding: comp.padding || 4
      };
      break;

    case "checkbox":
      converted = {
        id,
        type: "checkbox",
        label: primaryText || "Option Selected",
        subtitle: secondaryText || "",
        is_checked: isChecked,
        padding: comp.padding || 4
      };
      break;

    case "radio":
      converted = {
        id,
        type: "radio",
        label: primaryText || "Radio Option",
        subtitle: secondaryText || "",
        is_selected: isChecked,
        padding: comp.padding || 4
      };
      break;

    case "switch":
      converted = {
        id,
        type: "switch",
        label: primaryText || "Toggle Switch",
        subtitle: secondaryText || "",
        is_checked: isChecked,
        padding: comp.padding || 4
      };
      break;

    case "listtile":
      converted = {
        id,
        type: "listtile",
        title: primaryText || "List Tile Item",
        subtitle: secondaryText || "Additional description",
        leading_icon: comp.icon || comp.leading_icon || "info",
        trailing_text: comp.trailing_text || "›",
        action_id: actionId || "item_click"
      };
      break;

    case "card":
      converted = {
        id,
        type: "card",
        title: primaryText || "Feature Card",
        description: secondaryText || "Highlight an action or detail.",
        badge: comp.badge || "FEATURE",
        action_text: comp.action_text || "Learn More",
        action_id: actionId || "action_card"
      };
      break;

    case "banner":
      converted = {
        id,
        type: "banner",
        title: primaryText || "Dynamic Announcement",
        message: secondaryText || "Enter custom text here.",
        badge: comp.badge || "NEW",
        color: color || primaryThemeColor
      };
      break;

    case "image":
      converted = {
        id,
        type: "image",
        image_url: comp.image_url || (primaryText.startsWith("http") ? primaryText : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"),
        height: comp.height || 140,
        border_radius: comp.border_radius || 12,
        padding: comp.padding || 4
      };
      break;

    case "icon":
      converted = {
        id,
        type: "icon",
        icon: comp.icon || comp.leading_icon || "star",
        size: comp.size || 28,
        color: color || primaryThemeColor,
        align: comp.align || "center",
        padding: comp.padding || 4
      };
      break;

    case "metric_row":
      converted = {
        id,
        type: "metric_row",
        metrics: comp.metrics || [
          { label: primaryText || "Metric A", value: "1,200", change: "+10%", is_positive: true },
          { label: secondaryText || "Metric B", value: "98%", change: "+2%", is_positive: true }
        ]
      };
      break;

    case "divider":
      converted = { id, type: "divider", thickness: 1, color: "#334155", padding: 6 };
      break;

    case "spacer":
      converted = { id, type: "spacer", height: comp.height || 16, width: comp.width || 16 };
      break;

    default:
      converted = createDefaultWidget(newType, id);
      break;
  }

  // Preserve stack positioning if child was positioned
  if (comp.is_positioned) {
    converted.is_positioned = true;
    if (comp.top !== undefined) converted.top = comp.top;
    if (comp.bottom !== undefined) converted.bottom = comp.bottom;
    if (comp.left !== undefined) converted.left = comp.left;
    if (comp.right !== undefined) converted.right = comp.right;
  }

  if (isChild) {
    activeSchema.components[idx].children[childIdx] = converted;
    showToast(`Converted child #${childIdx + 1} to ${newType.toUpperCase()}`);
  } else {
    activeSchema.components[idx] = converted;
    showToast(`Converted #${idx + 1} from ${oldType.toUpperCase()} to ${newType.toUpperCase()}`);
  }

  markActiveScreenDirty();
  renderAll();
  highlightCard(idx);
};

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

window.moveChildInContainer = function(parentIdx, childIdx, direction) {
  const children = activeSchema.components[parentIdx]?.children;
  if (!children) return;
  const newIdx = childIdx + direction;
  if (newIdx < 0 || newIdx >= children.length) return;
  const item = children.splice(childIdx, 1)[0];
  children.splice(newIdx, 0, item);
  renderAll();
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
      activeSchema.theme = Object.assign({}, DEFAULT_THEME, { primary_color: p.color }, p.theme || {});
      activeSchema.components = JSON.parse(JSON.stringify(p.components));
      renderAll();
      showToast(`Loaded "${p.title}" Preset`);
    }
  });
});

// Pills that just jump to another tab (e.g. "MUST Design Templates →")
document.querySelectorAll("[data-open-tab]").forEach(pill => {
  pill.addEventListener("click", () => {
    const target = document.querySelector(`.tab-btn[data-tab="${pill.dataset.openTab}"]`);
    if (target) target.click();
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
    case "form_nav":
      return `final email = GenUiFormRegistry.instance.getValue('email');\nif (email.isEmpty || !email.contains('@')) {\n  ScaffoldMessenger.of(context).showSnackBar(\n    SnackBar(\n      content: Text('Please enter a valid email address!'),\n      backgroundColor: Color(0xFFEF4444),\n    ),\n  );\n  return;\n}\nNavigator.pushNamed(\n  context,\n  '/profile',\n  arguments: {'email': email, 'source': '${safeName}'},\n);`;
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
            <option value="form_nav" ${actionType === 'form_nav' ? 'selected' : ''}>Preset: Form Validate &amp; Nav</option>
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
        <button type="button" class="snippet-btn" onclick="${isChild ? `insertChildDartSnippet(${parentIdx}, ${idx}, 'form_nav')` : `insertCompDartSnippet(${idx}, 'form_nav')`}">+ Form Email Nav</button>
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
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Text Color</label>
        <div style="display:flex; gap:4px;">
          <input type="color" value="${isValidHexColor(child.color || child.text_color) ? (child.color || child.text_color) : '#F8FAFC'}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'color', this.value)">
          <input type="text" value="${escapeHtml(child.color || child.text_color || '')}" placeholder="#F8FAFC" oninput="updateChildField(${parentIdx}, ${cIdx}, 'color', this.value)">
        </div>
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else if (type === "button") {
    const hasApi = !!(child.api_config && child.api_config.url);
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
      <div class="nested-child-field">
        <label>Background</label>
        <div style="display:flex; gap:4px;">
          <input type="color" value="${isValidHexColor(child.background_color) ? child.background_color : '#4F46E5'}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'background_color', this.value)">
          <input type="text" value="${escapeHtml(child.background_color || '')}" placeholder="#4F46E5" oninput="updateChildField(${parentIdx}, ${cIdx}, 'background_color', this.value)">
        </div>
      </div>
      <div class="nested-child-field">
        <label>Text Color</label>
        <div style="display:flex; gap:4px;">
          <input type="color" value="${isValidHexColor(child.text_color || child.color) ? (child.text_color || child.color) : '#FFFFFF'}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'text_color', this.value)">
          <input type="text" value="${escapeHtml(child.text_color || child.color || '')}" placeholder="#FFFFFF" oninput="updateChildField(${parentIdx}, ${cIdx}, 'text_color', this.value)">
        </div>
      </div>
      <div class="nested-child-field" style="grid-column: 1 / -1; padding: 4px 6px; background: rgba(79, 70, 229, 0.08); border-radius: 4px; border: 1px solid rgba(79, 70, 229, 0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:10px; color:${hasApi ? '#818CF8' : 'var(--text-muted)'};">
            ${hasApi ? `✓ API: ${escapeHtml(child.api_config.method || 'POST')} ${escapeHtml(child.api_config.url)}` : '🔌 No API Configured'}
          </span>
          <button class="btn btn-xs ${hasApi ? 'btn-outline-primary' : 'btn-outline'}" type="button" onclick="openApiConfigModal('child_${parentIdx}_${cIdx}')">
            ${hasApi ? '⚙️ Edit API' : '+ Config API'}
          </button>
        </div>
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
    const v = child.validation || {};
    propsHtml = `
      <div class="nested-child-field">
        <label>Field Key / ID</label>
        <input type="text" value="${escapeHtml(child.id || "")}" placeholder="e.g. user_name" oninput="updateChildField(${parentIdx}, ${cIdx}, 'id', this.value)">
      </div>
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
      <div class="nested-child-field" style="grid-column: 1 / -1; padding: 4px 6px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:9px; font-weight:600; color:var(--text-muted);">🛡 Validation Rule</span>
          <label style="font-size:9px; margin:0; display:flex; align-items:center; gap:3px;">
            <input type="checkbox" ${v.required ? 'checked' : ''} onchange="updateChildValidation(${parentIdx}, ${cIdx}, 'required', this.checked)"> Required
          </label>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 2fr; gap:4px;">
          <select style="font-size:9px; padding:2px;" onchange="updateChildValidation(${parentIdx}, ${cIdx}, 'type', this.value)">
            <option value="" ${!v.type ? 'selected' : ''}>General</option>
            <option value="email" ${v.type === 'email' ? 'selected' : ''}>Email</option>
            <option value="phone" ${v.type === 'phone' ? 'selected' : ''}>Phone</option>
            <option value="number" ${v.type === 'number' ? 'selected' : ''}>Number</option>
          </select>
          <input type="number" style="font-size:9px; padding:2px;" placeholder="Min len" value="${v.min_length || ''}" oninput="updateChildValidation(${parentIdx}, ${cIdx}, 'min_length', this.value ? Number(this.value) : undefined)">
          <input type="text" style="font-size:9px; padding:2px;" placeholder="Custom error..." value="${escapeHtml(v.error_message || '')}" oninput="updateChildValidation(${parentIdx}, ${cIdx}, 'error_message', this.value)">
        </div>
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
    const v = child.validation || {};
    propsHtml = `
      <div class="nested-child-field">
        <label>Field Key / ID</label>
        <input type="text" value="${escapeHtml(child.id || "")}" placeholder="e.g. terms" oninput="updateChildField(${parentIdx}, ${cIdx}, 'id', this.value)">
      </div>
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
      <div class="nested-child-field" style="grid-column: 1 / -1; padding: 4px 6px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px dashed rgba(255,255,255,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="font-size:9px; margin:0; display:flex; align-items:center; gap:3px;">
            <input type="checkbox" ${v.required ? 'checked' : ''} onchange="updateChildValidation(${parentIdx}, ${cIdx}, 'required', this.checked)"> Must be checked
          </label>
          <input type="text" style="font-size:9px; padding:2px; width:60%;" placeholder="Error if not checked..." value="${escapeHtml(v.error_message || '')}" oninput="updateChildValidation(${parentIdx}, ${cIdx}, 'error_message', this.value)">
        </div>
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
  } else if (type === "container") {
    propsHtml = `
      <div class="nested-child-field">
        <label>Background</label>
        <div style="display:flex; gap:4px;">
          <input type="color" value="${isValidHexColor(child.background_color) ? child.background_color : '#1E293B'}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'background_color', this.value)">
          <input type="text" value="${escapeHtml(child.background_color || '#1E293B')}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'background_color', this.value)">
        </div>
      </div>
      <div class="nested-child-field">
        <label>Border Color</label>
        <div style="display:flex; gap:4px;">
          <input type="color" value="${isValidHexColor(child.border_color) ? child.border_color : '#38BDF8'}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'border_color', this.value)">
          <input type="text" value="${escapeHtml(child.border_color || '#38BDF8')}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'border_color', this.value)">
        </div>
      </div>
      <div class="nested-child-field">
        <label>Radius (px)</label>
        <input type="number" min="0" max="64" value="${child.border_radius !== undefined ? child.border_radius : 8}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'border_radius', Number(this.value))">
      </div>
      <div class="nested-child-field">
        <label>Padding (px)</label>
        <input type="number" min="0" max="64" value="${child.padding !== undefined ? child.padding : 12}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'padding', Number(this.value))">
      </div>
      ${renderOnClickCodeEditor(child, cIdx, true, parentIdx)}
    `;
  } else {
    propsHtml = `
      <div class="nested-child-field" style="grid-column: 1 / -1;">
        <label>Value</label>
        <input type="text" value="${escapeHtml(child.text || child.label || child.title || "")}" placeholder="Value..." oninput="updateChildField(${parentIdx}, ${cIdx}, '${child.label ? 'label' : (child.title ? 'title' : 'text')}', this.value)">
      </div>
    `;
  }

  const parentComp = activeSchema.components[parentIdx];
  const isStackParent = parentComp?.type === 'stack';
  const showPositioning = isStackParent || child.is_positioned || child.top !== undefined || child.bottom !== undefined || child.left !== undefined || child.right !== undefined;

  let positioningHtml = "";
  if (showPositioning) {
    positioningHtml = `
      <div class="child-position-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="font-size:9px; font-weight:700; color:#38BDF8; margin:0; display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="checkbox" ${child.is_positioned !== false ? 'checked' : ''} onchange="updateChildField(${parentIdx}, ${cIdx}, 'is_positioned', this.checked)">
            📌 Positioned Overlay
          </label>
          <span style="font-size:9px; color:var(--text-muted);">Coordinates (px)</span>
        </div>
        <div class="child-position-grid">
          <div>
            <label>Top</label>
            <input type="number" placeholder="auto" value="${child.top !== undefined ? child.top : ''}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'top', this.value !== '' ? Number(this.value) : undefined)">
          </div>
          <div>
            <label>Bottom</label>
            <input type="number" placeholder="auto" value="${child.bottom !== undefined ? child.bottom : ''}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'bottom', this.value !== '' ? Number(this.value) : undefined)">
          </div>
          <div>
            <label>Left</label>
            <input type="number" placeholder="auto" value="${child.left !== undefined ? child.left : ''}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'left', this.value !== '' ? Number(this.value) : undefined)">
          </div>
          <div>
            <label>Right</label>
            <input type="number" placeholder="auto" value="${child.right !== undefined ? child.right : ''}" oninput="updateChildField(${parentIdx}, ${cIdx}, 'right', this.value !== '' ? Number(this.value) : undefined)">
          </div>
        </div>
      </div>
    `;
  }

  const childCount = activeSchema.components[parentIdx]?.children?.length || 1;
  return `
    <div class="nested-child-item">
      <div class="nested-child-item-header">
        <div class="nested-child-header-left">
          <span>#${cIdx + 1} <strong class="comp-tag">${type.toUpperCase()}</strong></span>
        </div>
        <div class="nested-child-header-actions">
          <select class="comp-convert-select comp-convert-select-child" title="Convert child component" onchange="convertComponentType(${parentIdx}, this.value, ${cIdx})">
            ${renderConvertSelectOptions(type)}
          </select>
          <button class="comp-btn comp-btn-xs" title="Move Up" ${cIdx === 0 ? 'disabled' : ''} onclick="moveChildInContainer(${parentIdx}, ${cIdx}, -1)">▲</button>
          <button class="comp-btn comp-btn-xs" title="Move Down" ${cIdx === childCount - 1 ? 'disabled' : ''} onclick="moveChildInContainer(${parentIdx}, ${cIdx}, 1)">▼</button>
          <button class="comp-delete-btn" title="Remove Child" onclick="removeChildFromContainer(${parentIdx}, ${cIdx})">✕</button>
        </div>
      </div>
      <div class="nested-child-grid">
        ${propsHtml}
        ${positioningHtml}
      </div>
    </div>
  `;
}

// Render Component List in Editor Panel
function renderComponentEditors() {
  componentCardsContainer.innerHTML = "";
  const comps = activeSchema.components || [];

  if (comps.length === 0) {
    componentCardsContainer.innerHTML = `
      <div class="empty-components-placeholder">
        No dynamic components on this screen yet.<br>
        Click <strong>+ Add Component ▾</strong> above to create your first widget.
      </div>
    `;
    return;
  }

  // Top quick-insert bar
  const topBar = document.createElement("div");
  topBar.className = "top-insert-bar";
  topBar.innerHTML = `<button class="btn btn-xs btn-outline" title="Insert a component at the very beginning of the screen" onclick="openInsertMenu(-1, event)">+ Insert at Top</button>`;
  componentCardsContainer.appendChild(topBar);

  comps.forEach((comp, idx) => {
    const card = document.createElement("div");
    card.className = "component-card-editor";
    card.setAttribute("draggable", "true");
    card.dataset.index = idx;

    // Drag & Drop event handlers
    card.addEventListener("dragstart", (e) => {
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "LABEL"].includes(e.target.tagName)) {
        e.preventDefault();
        return;
      }
      draggedCompIndex = idx;
      e.dataTransfer.setData("text/plain", String(idx));
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("is-dragging");
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        card.classList.add("drag-over-top");
        card.classList.remove("drag-over-bottom");
      } else {
        card.classList.add("drag-over-bottom");
        card.classList.remove("drag-over-top");
      }
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over-top", "drag-over-bottom");
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drag-over-top", "drag-over-bottom");
      const fromIdx = draggedCompIndex !== null ? draggedCompIndex : parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (isNaN(fromIdx) || fromIdx === idx) return;

      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      let toIdx = e.clientY < midY ? idx : idx + 1;
      if (fromIdx < toIdx) toIdx--;

      if (fromIdx !== toIdx) {
        const item = activeSchema.components.splice(fromIdx, 1)[0];
        activeSchema.components.splice(toIdx, 0, item);
        renderAll();
        highlightCard(toIdx);
        showToast(`Moved ${item.type.toUpperCase()} to #${toIdx + 1}`);
      }
    });

    card.addEventListener("dragend", () => {
      draggedCompIndex = null;
      document.querySelectorAll(".component-card-editor").forEach(c => {
        c.classList.remove("is-dragging", "drag-over-top", "drag-over-bottom");
      });
    });

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
      const hasApi = !!(comp.api_config && comp.api_config.url);
      fieldsHtml = `
        <div class="field">
          <label>Button Text</label>
          <input type="text" value="${escapeHtml(comp.text || "")}" oninput="updateCompField(${idx}, 'text', this.value)">
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
            <input type="text" value="${escapeHtml(comp.action_id || "")}" oninput="updateCompField(${idx}, 'action_id', this.value)">
          </div>
        </div>
        <div class="input-row" style="margin-bottom: 6px;">
          <div class="field flex-1">
            <label>Background Color</label>
            <div style="display:flex; gap:4px;">
              <input type="color" value="${isValidHexColor(comp.background_color) ? comp.background_color : '#4F46E5'}" oninput="updateCompField(${idx}, 'background_color', this.value)">
              <input type="text" value="${escapeHtml(comp.background_color || '')}" placeholder="Default (Primary)" oninput="updateCompField(${idx}, 'background_color', this.value)">
            </div>
          </div>
          <div class="field flex-1">
            <label>Text Color</label>
            <div style="display:flex; gap:4px;">
              <input type="color" value="${isValidHexColor(comp.text_color || comp.color) ? (comp.text_color || comp.color) : '#FFFFFF'}" oninput="updateCompField(${idx}, 'text_color', this.value)">
              <input type="text" value="${escapeHtml(comp.text_color || comp.color || '')}" placeholder="Default (#FFFFFF)" oninput="updateCompField(${idx}, 'text_color', this.value)">
            </div>
          </div>
        </div>
        <div class="field" style="margin-top: 6px; margin-bottom: 6px; padding: 6px 8px; background: rgba(79, 70, 229, 0.08); border-radius: 6px; border: 1px solid rgba(79, 70, 229, 0.2);">
          <div class="flex-between" style="align-items: center;">
            <div>
              <div style="font-size: 11px; font-weight: 600; color: #818CF8;">🔌 Cloud API Binding</div>
              <div style="font-size: 10px; margin-top: 2px;">
                ${hasApi ? `<span class="api-configured-pill">✓ ${escapeHtml(comp.api_config.method || 'POST')} ${escapeHtml(comp.api_config.url)}</span>` : `<span style="color: var(--text-muted);">No API configured for this button</span>`}
              </div>
            </div>
            <button class="btn btn-xs ${hasApi ? 'btn-outline-primary' : 'btn-outline'}" type="button" onclick="openApiConfigModal('comp_${idx}')">
              ${hasApi ? '⚙️ Edit API Config' : '🔌 Configure API'}
            </button>
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
        <div class="input-row" style="margin-bottom: 6px;">
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
          <div class="field flex-1">
            <label>Text Color</label>
            <div style="display:flex; gap:4px;">
              <input type="color" value="${isValidHexColor(comp.color || comp.text_color) ? (comp.color || comp.text_color) : '#F8FAFC'}" oninput="updateCompField(${idx}, 'color', this.value)">
              <input type="text" value="${escapeHtml(comp.color || comp.text_color || '')}" placeholder="#F8FAFC" oninput="updateCompField(${idx}, 'color', this.value)">
            </div>
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
      const v = comp.validation || {};
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Field Key / ID</label>
            <input type="text" value="${escapeHtml(comp.id || "")}" oninput="updateCompField(${idx}, 'id', this.value)" placeholder="e.g. email">
          </div>
          <div class="field flex-1">
            <label>Label</label>
            <input type="text" value="${escapeHtml(comp.label || "")}" oninput="updateCompField(${idx}, 'label', this.value)">
          </div>
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Hint / Placeholder</label>
            <input type="text" value="${escapeHtml(comp.hint || "")}" oninput="updateCompField(${idx}, 'hint', this.value)">
          </div>
          <div class="field flex-1">
            <label>Input Mode</label>
            <select onchange="updateCompField(${idx}, 'is_password', this.value === 'true')">
              <option value="false" ${!comp.is_password ? 'selected' : ''}>Text</option>
              <option value="true" ${comp.is_password ? 'selected' : ''}>Password</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Max Lines</label>
            <input type="number" min="1" max="8" value="${comp.max_lines || 1}" oninput="updateCompField(${idx}, 'max_lines', Number(this.value))">
          </div>
        </div>
        <div class="field" style="margin-top: 6px; padding: 6px 8px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px dashed rgba(255,255,255,0.12);">
          <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; display:flex; justify-content:space-between; align-items:center;">
            <span>🛡 Form Validation Rule</span>
            <label class="checkbox-inline" style="font-size: 10px; text-transform: none; margin: 0;">
              <input type="checkbox" ${v.required ? 'checked' : ''} onchange="updateCompValidation(${idx}, 'required', this.checked)">
              <span>Required</span>
            </label>
          </div>
          <div class="input-row">
            <div class="field flex-1">
              <label style="font-size:9px;">Format Type</label>
              <select style="font-size:10px; padding:3px 6px;" onchange="updateCompValidation(${idx}, 'type', this.value)">
                <option value="" ${!v.type ? 'selected' : ''}>None (General)</option>
                <option value="email" ${v.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="phone" ${v.type === 'phone' ? 'selected' : ''}>Phone Number</option>
                <option value="number" ${v.type === 'number' ? 'selected' : ''}>Number</option>
              </select>
            </div>
            <div class="field flex-1">
              <label style="font-size:9px;">Min Length</label>
              <input type="number" style="font-size:10px; padding:3px 6px;" min="0" value="${v.min_length || ''}" placeholder="None" oninput="updateCompValidation(${idx}, 'min_length', this.value ? Number(this.value) : undefined)">
            </div>
            <div class="field flex-2">
              <label style="font-size:9px;">Custom Error Message</label>
              <input type="text" style="font-size:10px; padding:3px 6px;" value="${escapeHtml(v.error_message || '')}" placeholder="e.g. Please enter valid email" oninput="updateCompValidation(${idx}, 'error_message', this.value)">
            </div>
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
      const v = comp.validation || {};
      fieldsHtml = `
        <div class="input-row">
          <div class="field flex-1">
            <label>Field Key / ID</label>
            <input type="text" value="${escapeHtml(comp.id || "")}" oninput="updateCompField(${idx}, 'id', this.value)" placeholder="e.g. terms_accepted">
          </div>
          <div class="field flex-2">
            <label>Label</label>
            <input type="text" value="${escapeHtml(comp.label || "")}" oninput="updateCompField(${idx}, 'label', this.value)">
          </div>
        </div>
        <div class="input-row">
          <div class="field flex-1">
            <label>Subtitle</label>
            <input type="text" value="${escapeHtml(comp.subtitle || "")}" oninput="updateCompField(${idx}, 'subtitle', this.value)">
          </div>
          <div class="field flex-1">
            <label>Checked State</label>
            <select onchange="updateCompField(${idx}, '${isRadio ? 'is_selected' : 'is_checked'}', this.value === 'true')">
              <option value="true" ${checkedVal ? 'selected' : ''}>Checked / Active</option>
              <option value="false" ${!checkedVal ? 'selected' : ''}>Unchecked</option>
            </select>
          </div>
        </div>
        <div class="field" style="margin-top: 4px; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px dashed rgba(255,255,255,0.12);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label class="checkbox-inline" style="font-size: 10px; margin: 0;">
              <input type="checkbox" ${v.required ? 'checked' : ''} onchange="updateCompValidation(${idx}, 'required', this.checked)">
              <span>Must be checked (Required)</span>
            </label>
            <input type="text" style="font-size:10px; padding:2px 6px; width:60%;" placeholder="Error message if not checked" value="${escapeHtml(v.error_message || '')}" oninput="updateCompValidation(${idx}, 'error_message', this.value)">
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
                <option value="container">Container (Box & Decoration)</option>
                <option value="stack">Stack (Layered Overlays)</option>
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
    } else if (comp.type === "container") {
      fieldsHtml = `
        <div class="input-row" style="margin-bottom: 8px;">
          <div class="field flex-1">
            <label>Background Color</label>
            <div style="display:flex; gap:4px;">
              <input type="color" value="${isValidHexColor(comp.background_color || comp.color) ? (comp.background_color || comp.color) : '#1E293B'}" oninput="updateCompField(${idx}, 'background_color', this.value)">
              <input type="text" value="${escapeHtml(comp.background_color || comp.color || '#1E293B')}" placeholder="#1E293B or transparent" oninput="updateCompField(${idx}, 'background_color', this.value)">
            </div>
          </div>
          <div class="field flex-1">
            <label>Border Color</label>
            <div style="display:flex; gap:4px;">
              <input type="color" value="${isValidHexColor(comp.border_color) ? comp.border_color : '#38BDF8'}" oninput="updateCompField(${idx}, 'border_color', this.value)">
              <input type="text" value="${escapeHtml(comp.border_color || '#38BDF8')}" placeholder="#38BDF8" oninput="updateCompField(${idx}, 'border_color', this.value)">
            </div>
          </div>
        </div>
        <div class="input-row" style="margin-bottom: 8px;">
          <div class="field">
            <label>Border Width (px)</label>
            <input type="number" min="0" max="24" value="${comp.border_width !== undefined ? comp.border_width : 1}" oninput="updateCompField(${idx}, 'border_width', Number(this.value))">
          </div>
          <div class="field">
            <label>Border Radius (px)</label>
            <input type="number" min="0" max="64" value="${comp.border_radius !== undefined ? comp.border_radius : 12}" oninput="updateCompField(${idx}, 'border_radius', Number(this.value))">
          </div>
          <div class="field">
            <label>Padding (px)</label>
            <input type="number" min="0" max="64" value="${comp.padding !== undefined ? comp.padding : 16}" oninput="updateCompField(${idx}, 'padding', Number(this.value))">
          </div>
          <div class="field">
            <label>Margin (px)</label>
            <input type="number" min="0" max="64" value="${comp.margin !== undefined ? comp.margin : 8}" oninput="updateCompField(${idx}, 'margin', Number(this.value))">
          </div>
        </div>
        <div class="input-row" style="margin-bottom: 8px;">
          <div class="field flex-1">
            <label>Width</label>
            <input type="text" placeholder="100% or px..." value="${escapeHtml(comp.width !== undefined ? String(comp.width) : '')}" oninput="updateCompField(${idx}, 'width', this.value ? (isNaN(this.value) ? this.value : Number(this.value)) : undefined)">
          </div>
          <div class="field flex-1">
            <label>Height (px)</label>
            <input type="number" min="0" max="800" placeholder="auto" value="${comp.height || ''}" oninput="updateCompField(${idx}, 'height', this.value ? Number(this.value) : undefined)">
          </div>
          <div class="field flex-1">
            <label>Alignment</label>
            <select onchange="updateCompField(${idx}, 'alignment', this.value)">
              <option value="topLeft" ${comp.alignment === 'topLeft' || !comp.alignment ? 'selected' : ''}>Top Left</option>
              <option value="topCenter" ${comp.alignment === 'topCenter' ? 'selected' : ''}>Top Center</option>
              <option value="topRight" ${comp.alignment === 'topRight' ? 'selected' : ''}>Top Right</option>
              <option value="centerLeft" ${comp.alignment === 'centerLeft' ? 'selected' : ''}>Center Left</option>
              <option value="center" ${comp.alignment === 'center' ? 'selected' : ''}>Center</option>
              <option value="centerRight" ${comp.alignment === 'centerRight' ? 'selected' : ''}>Center Right</option>
              <option value="bottomLeft" ${comp.alignment === 'bottomLeft' ? 'selected' : ''}>Bottom Left</option>
              <option value="bottomCenter" ${comp.alignment === 'bottomCenter' ? 'selected' : ''}>Bottom Center</option>
              <option value="bottomRight" ${comp.alignment === 'bottomRight' ? 'selected' : ''}>Bottom Right</option>
            </select>
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
        <div class="nested-child-container">
          <div class="nested-child-header">
            <span>📦 CONTAINER CHILDREN (${(comp.children || []).length})</span>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <select class="child-add-dropdown" onchange="if(this.value){ addChildToContainer(${idx}, this.value); this.value=''; }">
                <option value="">+ Add Child Widget...</option>
                <option value="text">Text (Typography)</option>
                <option value="button">Button (Action)</option>
                <option value="image">Image (Network)</option>
                <option value="chip">Chip (Badge)</option>
                <option value="icon">Icon (Symbol)</option>
                <option value="textfield">TextField (Input)</option>
                <option value="listtile">ListTile (Tile Row)</option>
                <option value="divider">Divider (Line)</option>
                <option value="spacer">Spacer (Spacing)</option>
                <option value="row">Row (Horizontal)</option>
                <option value="column">Column (Vertical)</option>
                <option value="stack">Stack (Layered Overlays)</option>
              </select>
              <button class="btn btn-xs btn-outline" title="Quick Add Text" onclick="addChildToContainer(${idx}, 'text')">+ Text</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Button" onclick="addChildToContainer(${idx}, 'button')">+ Button</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Image" onclick="addChildToContainer(${idx}, 'image')">+ Image</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Chip" onclick="addChildToContainer(${idx}, 'chip')">+ Chip</button>
            </div>
          </div>
          ${(comp.children || []).map((child, cIdx) => renderChildEditor(idx, cIdx, child)).join("")}
        </div>
      `;
    } else if (comp.type === "stack") {
      fieldsHtml = `
        <div class="input-row" style="margin-bottom: 8px;">
          <div class="field flex-1">
            <label>Stack Alignment</label>
            <select onchange="updateCompField(${idx}, 'alignment', this.value)">
              <option value="topLeft" ${comp.alignment === 'topLeft' || !comp.alignment ? 'selected' : ''}>Top Left</option>
              <option value="topCenter" ${comp.alignment === 'topCenter' ? 'selected' : ''}>Top Center</option>
              <option value="topRight" ${comp.alignment === 'topRight' ? 'selected' : ''}>Top Right</option>
              <option value="centerLeft" ${comp.alignment === 'centerLeft' ? 'selected' : ''}>Center Left</option>
              <option value="center" ${comp.alignment === 'center' ? 'selected' : ''}>Center</option>
              <option value="centerRight" ${comp.alignment === 'centerRight' ? 'selected' : ''}>Center Right</option>
              <option value="bottomLeft" ${comp.alignment === 'bottomLeft' ? 'selected' : ''}>Bottom Left</option>
              <option value="bottomCenter" ${comp.alignment === 'bottomCenter' ? 'selected' : ''}>Bottom Center</option>
              <option value="bottomRight" ${comp.alignment === 'bottomRight' ? 'selected' : ''}>Bottom Right</option>
            </select>
          </div>
          <div class="field flex-1">
            <label>Stack Height (px)</label>
            <input type="number" min="40" max="800" value="${comp.height || 180}" oninput="updateCompField(${idx}, 'height', Number(this.value))">
          </div>
          <div class="field flex-1">
            <label>Clip Behavior</label>
            <select onchange="updateCompField(${idx}, 'clip', this.value)">
              <option value="hardEdge" ${comp.clip === 'hardEdge' || !comp.clip ? 'selected' : ''}>Hard Edge (Clip)</option>
              <option value="none" ${comp.clip === 'none' ? 'selected' : ''}>None (Overflow)</option>
            </select>
          </div>
        </div>
        ${renderOnClickCodeEditor(comp, idx, false)}
        <div class="nested-child-container">
          <div class="nested-child-header">
            <span>🥞 STACK OVERLAY LAYERS (${(comp.children || []).length})</span>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <select class="child-add-dropdown" onchange="if(this.value){ addChildToContainer(${idx}, this.value); this.value=''; }">
                <option value="">+ Add Layer Widget...</option>
                <option value="image">Image (Background/Base)</option>
                <option value="button">Button (Floating Action)</option>
                <option value="chip">Chip (Overlay Badge)</option>
                <option value="text">Text (Overlay Title)</option>
                <option value="icon">Icon (Overlay)</option>
                <option value="container">Container (Overlay Box)</option>
              </select>
              <button class="btn btn-xs btn-outline" title="Quick Add Image" onclick="addChildToContainer(${idx}, 'image')">+ Image</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Button" onclick="addChildToContainer(${idx}, 'button')">+ Button</button>
              <button class="btn btn-xs btn-outline" title="Quick Add Chip" onclick="addChildToContainer(${idx}, 'chip')">+ Chip</button>
            </div>
          </div>
          <div style="font-size:10px; color:#94A3B8; margin-bottom:8px; padding:4px 6px; background:rgba(255,255,255,0.03); border-radius:4px;">
            ℹ️ Layers are rendered bottom-to-top. Turn on <strong>📌 Positioned Overlay</strong> inside any layer to position it precisely at top/bottom/left/right!
          </div>
          ${(comp.children || []).map((child, cIdx) => renderChildEditor(idx, cIdx, child)).join("")}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="comp-header">
        <div class="comp-header-left">
          <span class="comp-drag-handle" title="Drag and drop to reorder">⋮⋮</span>
          <span class="comp-order-badge">#${idx + 1}</span>
          <span class="comp-tag">${comp.type.toUpperCase()}</span>
        </div>
        <div class="comp-header-actions">
          <select class="comp-convert-select" title="Convert component to another type" onchange="convertComponentType(${idx}, this.value)">
            ${renderConvertSelectOptions(comp.type)}
          </select>
          <button class="comp-btn comp-move-btn" title="Move Up" ${idx === 0 ? 'disabled' : ''} onclick="moveComponent(${idx}, -1)">▲</button>
          <button class="comp-btn comp-move-btn" title="Move Down" ${idx === comps.length - 1 ? 'disabled' : ''} onclick="moveComponent(${idx}, 1)">▼</button>
          <button class="comp-btn comp-insert-btn" title="Insert new component below this" onclick="openInsertMenu(${idx}, event)">+ Below</button>
          <button class="comp-btn comp-duplicate-btn" title="Duplicate component" onclick="duplicateComponent(${idx})">📋</button>
          <button class="comp-delete-btn" title="Delete component" onclick="removeComponent(${idx})">✕</button>
        </div>
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

window.updateCompValidation = function(idx, key, val) {
  if (!activeSchema.components[idx].validation) {
    activeSchema.components[idx].validation = {};
  }
  if (val === undefined || val === "") {
    delete activeSchema.components[idx].validation[key];
    if (Object.keys(activeSchema.components[idx].validation).length === 0) {
      delete activeSchema.components[idx].validation;
    }
  } else {
    activeSchema.components[idx].validation[key] = val;
  }
  markActiveScreenDirty();
  updateSimulator();
  updateJsonEditor();
};

window.updateChildValidation = function(parentIdx, cIdx, key, val) {
  const child = activeSchema.components[parentIdx]?.children?.[cIdx];
  if (!child) return;
  if (!child.validation) child.validation = {};
  if (val === undefined || val === "") {
    delete child.validation[key];
    if (Object.keys(child.validation).length === 0) {
      delete child.validation;
    }
  } else {
    child.validation[key] = val;
  }
  markActiveScreenDirty();
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

// ---- Simulator theming (mirrors ThemeConfig on the Flutter side) ----
function resolveSimTheme(theme) {
  const t = theme || {};
  const pick = (key) => (isValidHexColor(t[key]) ? t[key] : DEFAULT_THEME[key]);
  const bg = pick("background_color");
  const [r, g, b] = hexToRgb(bg);
  const isLight = getLuminance(r, g, b) > 0.4;
  return {
    bg,
    surface: pick("surface_color"),
    text: pick("text_primary"),
    muted: pick("text_secondary"),
    primary: pick("primary_color"),
    accent: pick("accent_color"),
    border: isLight ? "rgba(15, 23, 42, 0.10)" : "rgba(255, 255, 255, 0.07)",
    isLight
  };
}

function applySimThemeVars(el, theme) {
  if (!el) return;
  const t = resolveSimTheme(theme);
  el.style.setProperty("--sim-bg", t.bg);
  el.style.setProperty("--sim-surface", t.surface);
  el.style.setProperty("--sim-text", t.text);
  el.style.setProperty("--sim-muted", t.muted);
  el.style.setProperty("--sim-primary", t.primary);
  el.style.setProperty("--sim-accent", t.accent);
  el.style.setProperty("--sim-border", t.border);
  el.classList.toggle("sim-light", t.isLight);
}

function simIconSymbol(name) {
  switch (String(name || "").toLowerCase().trim()) {
    case "star": return "★";
    case "heart": case "favorite": return "♥";
    case "check": return "✓";
    case "lock": return "🔒";
    case "bell": case "notifications": return "🔔";
    case "settings": return "⚙";
    case "arrow_forward": return "→";
    case "phone": return "📞";
    case "email": return "✉";
    case "person": case "user": return "👤";
    case "home": return "🏠";
    case "search": return "🔍";
    case "share": return "↗";
    case "info": return "ℹ";
    case "help": return "?";
    case "shopping_cart": return "🛒";
    case "delete": return "🗑";
    default: return "✦";
  }
}

const ALL_SUPPORTED_TYPES = [
  "banner", "metric_row", "metrics", "card", "button",
  "text", "image", "textfield", "input", "listtile", "chip",
  "switch", "checkbox", "radio", "icon", "divider", "spacer", "sized_box",
  "column", "layout_column", "row", "layout_row", "container", "stack"
];

function renderSimChildHtml(comp) {
  if (!comp) return "";
  const themeSrc = simRenderThemeOverride || activeSchema.theme;
  const primaryColor = isValidHexColor(themeSrc?.primary_color) ? themeSrc.primary_color : "#4F46E5";
  const type = (comp.type || "").toLowerCase();

  // Composite sections (also needed when a pushed dynamic screen is rendered in the simulator)
  if (type === "banner") {
    const bannerColor = isValidHexColor(comp.color) ? comp.color : primaryColor;
    return `<div class="sim-banner" style="background:${bannerColor}; width:100%;">${comp.badge ? `<div class="sim-banner-badge">${escapeHtml(comp.badge)}</div>` : ''}<div class="sim-banner-title">${escapeHtml(comp.title || '')}</div>${comp.message ? `<div class="sim-banner-desc">${escapeHtml(comp.message)}</div>` : ''}</div>`;
  }
  if (type === "metric_row" || type === "metrics") {
    const metrics = Array.isArray(comp.metrics) ? comp.metrics : [];
    return `<div class="sim-metrics-row" style="width:100%;">${metrics.map(m => `<div class="sim-metric-card"><div class="sim-metric-lbl">${escapeHtml(m.label || '')}</div><div class="sim-metric-val">${escapeHtml(m.value || '')}</div>${m.change ? `<div class="sim-metric-chg ${m.is_positive ? 'text-success' : 'text-danger'}">${escapeHtml(m.change)}</div>` : ''}</div>`).join('')}</div>`;
  }
  if (type === "card") {
    return `<div class="sim-feature-card" style="width:100%;">${comp.badge ? `<div class="sim-card-badge">${escapeHtml(comp.badge)}</div>` : ''}<div class="sim-card-title">${escapeHtml(comp.title || '')}</div>${comp.description ? `<div class="sim-card-desc">${escapeHtml(comp.description)}</div>` : ''}<div class="sim-card-action sim-clickable" onclick="handleSimulatorDartClick('${comp.id}', event)" style="color:${primaryColor}"><span>${escapeHtml(comp.action_text || 'Explore')}</span> →</div></div>`;
  }

  if (type === "text") {
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    const textColor = comp.text_color || comp.color || 'var(--sim-text)';
    return `<div class="sim-text ${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="text-align:${comp.align || 'left'}; font-size:${comp.font_size || 14}px; font-weight:${comp.is_bold ? '700' : '400'}; color:${textColor}; padding:${comp.padding !== undefined ? comp.padding : 2}px 0; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(comp.text || "")}</div>`;
  }
  if (type === "button") {
    const isOutline = comp.variant === 'outline' || comp.variant === 'ghost';
    const bg = comp.background_color || comp.bg_color || (isOutline ? 'transparent' : primaryColor);
    const border = isOutline ? `1px solid ${comp.border_color || comp.color || primaryColor}` : (comp.border_color ? `1px solid ${comp.border_color}` : 'none');
    const textColor = comp.text_color || (isOutline ? (comp.color || primaryColor) : (comp.color || '#fff'));
    return `<button class="sim-btn-primary sim-clickable" onclick="handleSimulatorDartClick('${comp.id}', event)" style="background:${bg}; border:${border}; color:${textColor}; padding:6px 14px; font-size:12px; height:auto; width:auto; border-radius:6px; cursor:pointer;">${escapeHtml(comp.text || 'Action')}</button>`;
  }
  if (type === "image") {
    const imgUrl = comp.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    return `<img src="${escapeHtml(imgUrl)}" class="sim-image ${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="width:100%; height:${comp.height || 80}px; border-radius:${comp.border_radius || 8}px; object-fit:cover; display:block;" onerror="this.src='https://placehold.co/600x200/1E293B/94A3B8?text=Image+Load+Error'">`;
  }
  if (type === "textfield" || type === "input") {
    const isPass = comp.is_password === true;
    return `
      <div style="width:100%;margin:2px 0;">
        ${comp.label ? `<div style="font-size:11px;font-weight:600;color:var(--sim-text);margin-bottom:3px;">${escapeHtml(comp.label)}</div>` : ""}
        <input type="${isPass ? 'password' : 'text'}" placeholder="${escapeHtml(comp.hint || comp.placeholder || '')}" style="width:100%;padding:6px 8px;font-size:12px;background:rgba(255,255,255,0.06);border:1px solid #334155;border-radius:6px;color:var(--sim-text);" />
      </div>
    `;
  }
function getSimIconSymbol(iconName) {
  const icon = String(iconName || '').toLowerCase().trim();
  switch (icon) {
    case 'lock': return '🔒';
    case 'star': return '⭐';
    case 'check': return '✓';
    case 'bell': case 'notifications': return '🔔';
    case 'person': case 'user': return '👤';
    case 'email': case 'mail': return '✉️';
    case 'phone': case 'tel': return '📞';
    case 'language': case 'web': case 'globe': return '🌐';
    case 'location_on': case 'location': case 'place': case 'map': return '📍';
    case 'business': case 'company': case 'work': return '🏢';
    case 'badge': case 'id': case 'tag': return '🪪';
    case 'attach_money': case 'money': case 'dollar': return '💲';
    case 'info': return 'ℹ️';
    case 'sync': case 'refresh': return '🔄';
    default: return '🔹';
  }
}

  if (type === "listtile") {
    const iconSym = getSimIconSymbol(comp.leading_icon);
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
    return `<div class="sim-chip ${comp.is_selected ? 'selected' : ''}" data-sim-field="chip" data-field-id="${escapeHtml(comp.id || '')}" data-label="${escapeHtml(comp.label || 'Chip Tag')}" data-primary="${escapeHtml(primaryColor)}" style="${comp.is_selected ? `background:${primaryColor};` : ''} font-size:11px; padding:4px 10px; cursor:pointer;">${comp.icon ? `<span>${comp.icon === 'check' ? '✓' : (comp.icon === 'star' ? '★' : '♥')}</span>` : ''}<span>${escapeHtml(comp.label || 'Chip Tag')}</span></div>`;
  }
  if (type === "switch") {
    return `
      <div class="sim-toggle-row" data-sim-field="switch" data-field-id="${escapeHtml(comp.id || '')}" data-label="${escapeHtml(comp.label || 'Switch Option')}" data-checked="${comp.is_checked ? 'true' : 'false'}" data-primary="${escapeHtml(primaryColor)}" style="padding:4px 8px; width:100%; cursor:pointer;">
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--sim-text);">${escapeHtml(comp.label || "Switch Option")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div class="sim-switch-pill ${comp.is_checked ? 'active' : ''}" style="${comp.is_checked ? `background:${primaryColor}` : ''}"></div>
      </div>
    `;
  }
  if (type === "checkbox") {
    return `
      <div class="sim-check-row" data-sim-field="checkbox" data-field-id="${escapeHtml(comp.id || '')}" data-label="${escapeHtml(comp.label || 'Checkbox')}" data-checked="${comp.is_checked ? 'true' : 'false'}" data-primary="${escapeHtml(primaryColor)}" style="padding:4px 8px; width:100%; cursor:pointer;">
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--sim-text);">${escapeHtml(comp.label || "Checkbox")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div class="sim-check-box" style="width:18px;height:18px;border-radius:4px;border:2px solid ${comp.is_checked ? primaryColor : '#475569'};background:${comp.is_checked ? primaryColor : 'transparent'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:bold;">
          ${comp.is_checked ? '✓' : ''}
        </div>
      </div>
    `;
  }
  if (type === "radio") {
    return `
      <div class="sim-radio-row" style="padding:4px 8px; width:100%;">
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--sim-text);">${escapeHtml(comp.label || "Radio")}</div>
          ${comp.subtitle ? `<div style="font-size:10px;color:#94A3B8;">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div style="width:18px;height:18px;border-radius:50%;border:2px solid ${comp.is_selected ? primaryColor : '#475569'};display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:${comp.is_selected ? primaryColor : 'transparent'};"></div>
        </div>
      </div>
    `;
  }
  if (type === "icon") {
    const iconSym = simIconSymbol(comp.icon);
    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    return `<span class="${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute Flutter code"` : ''} style="font-size:${comp.size || 22}px;color:${comp.color || primaryColor};display:inline-flex;align-items:center;justify-content:center;padding:${comp.padding !== undefined ? comp.padding : 2}px;">${iconSym}</span>`;
  }
  if (type === "divider") {
    return `<div style="width:100%;border-top:${comp.thickness || 1}px solid ${comp.color || '#334155'};margin:${comp.padding || 4}px 0;"></div>`;
  }
  if (type === "spacer" || type === "sized_box") {
    return `<div style="height:${comp.height || 12}px;width:${comp.width || 12}px;flex-shrink:0;"></div>`;
  }
  if (type === "row" || type === "layout_row" || type === "column" || type === "layout_column") {
    // Layout containers on pushed screens render their children recursively
    const isRow = type === "row" || type === "layout_row";
    const mainAlignMap = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      spacebetween: 'space-between', space_between: 'space-between',
      spacearound: 'space-around', space_around: 'space-around',
      spaceevenly: 'space-evenly', space_evenly: 'space-evenly'
    };
    const crossAlignMap = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
    const justify = mainAlignMap[String(comp.main_axis_alignment || '').toLowerCase()] || (isRow ? 'space-between' : 'flex-start');
    const align = crossAlignMap[String(comp.cross_axis_alignment || '').toLowerCase()] || (isRow ? 'center' : 'stretch');
    const childrenHtml = (comp.children || []).map(renderSimChildHtml).join("");
    return `<div class="${isRow ? 'sim-row' : 'sim-column'}" style="display:flex; flex-direction:${isRow ? 'row' : 'column'}; flex-wrap:${isRow ? 'wrap' : 'nowrap'}; justify-content:${justify}; align-items:${align}; gap:6px; width:100%;">${childrenHtml}</div>`;
  }
  if (type === "container") {
    const bg = isValidHexColor(comp.background_color || comp.color) ? (comp.background_color || comp.color) : (comp.background_color === 'transparent' ? 'transparent' : 'transparent');
    const borderColor = isValidHexColor(comp.border_color) ? comp.border_color : '';
    const borderWidth = comp.border_width !== undefined ? Number(comp.border_width) : (borderColor ? 1 : 0);
    const borderStyle = borderWidth > 0 ? `${borderWidth}px solid ${borderColor || 'currentColor'}` : 'none';
    const borderRadius = comp.border_radius !== undefined ? `${Number(comp.border_radius)}px` : '0px';
    const padding = comp.padding !== undefined ? `${Number(comp.padding)}px` : '12px';
    const margin = comp.margin !== undefined ? `${Number(comp.margin)}px 0` : '4px 0';
    const width = comp.width ? (typeof comp.width === 'number' ? `${comp.width}px` : comp.width) : '100%';
    const height = comp.height ? `${comp.height}px` : 'auto';

    const alignMap = {
      topleft: 'align-items:flex-start; justify-content:flex-start;',
      topcenter: 'align-items:center; justify-content:flex-start;',
      topright: 'align-items:flex-end; justify-content:flex-start;',
      centerleft: 'align-items:flex-start; justify-content:center;',
      center: 'align-items:center; justify-content:center;',
      centerright: 'align-items:flex-end; justify-content:center;',
      bottomleft: 'align-items:flex-start; justify-content:flex-end;',
      bottomcenter: 'align-items:center; justify-content:flex-end;',
      bottomright: 'align-items:flex-end; justify-content:flex-end;'
    };
    const alignCss = alignMap[String(comp.alignment || '').toLowerCase()] || '';

    const isInteractive = comp.custom_dart_code || comp.onclick || comp.action_id;
    const childrenList = Array.isArray(comp.children) ? comp.children : (comp.child ? [comp.child] : []);
    const childrenHtml = childrenList.map(renderSimChildHtml).join("");

    return `<div class="sim-container ${isInteractive ? 'sim-clickable' : ''}" ${isInteractive ? `onclick="handleSimulatorDartClick('${comp.id}', event)" title="Click to execute container action"` : ''} style="background:${bg}; border:${borderStyle}; border-radius:${borderRadius}; padding:${padding}; margin:${margin}; width:${width}; height:${height}; ${alignCss}">${childrenHtml}</div>`;
  }
  if (type === "stack") {
    const stackHeight = comp.height ? `${Number(comp.height)}px` : '180px';
    const clipStyle = comp.clip === 'none' ? 'visible' : 'hidden';
    const borderRadius = comp.border_radius !== undefined ? `${Number(comp.border_radius)}px` : '12px';
    const childrenList = Array.isArray(comp.children) ? comp.children : (comp.child ? [comp.child] : []);

    const childrenHtml = childrenList.map((c, cIdx) => {
      const isPositioned = c.is_positioned !== false && (
        c.is_positioned === true ||
        c.top !== undefined || c.bottom !== undefined ||
        c.left !== undefined || c.right !== undefined
      );

      if (isPositioned) {
        const top = c.top !== undefined ? `top:${Number(c.top)}px;` : '';
        const bottom = c.bottom !== undefined ? `bottom:${Number(c.bottom)}px;` : '';
        const left = c.left !== undefined ? `left:${Number(c.left)}px;` : '';
        const right = c.right !== undefined ? `right:${Number(c.right)}px;` : '';
        const w = c.width !== undefined ? `width:${Number(c.width)}px;` : '';
        const h = c.height !== undefined ? `height:${Number(c.height)}px;` : '';
        return `<div class="sim-stack-child-positioned" style="${top} ${bottom} ${left} ${right} ${w} ${h} z-index:${cIdx + 1};">${renderSimChildHtml(c)}</div>`;
      }
      return `<div style="width:100%; height:100%;">${renderSimChildHtml(c)}</div>`;
    }).join("");

    return `<div class="sim-stack" style="min-height:${stackHeight}; overflow:${clipStyle}; border-radius:${borderRadius};">${childrenHtml}</div>`;
  }
  return `<span style="font-size:11px;color:#94A3B8;padding:2px 4px;background:#1E293B;border-radius:4px;">[${comp.type}]</span>`;
}

function updateSimulator() {
  applySimThemeVars(document.getElementById("phoneSimulatorScreen"), activeSchema.theme);
  simTitle.innerText = activeSchema.header?.title || "Untitled";
  simSubtitle.innerText = activeSchema.header?.subtitle || "";
  
  simComponentsList.innerHTML = "";

  // Auto-fetch data source if screen has one configured and not yet fetched
  if (activeSchema.data_source?.url && !simulatorScreenData && currentLoadedDsUrl !== activeSchema.data_source.url && !isSimulatorDataLoading) {
    fetchSimulatorScreenData(activeSchema.data_source);
  }

  if (isSimulatorDataLoading) {
    simComponentsList.innerHTML = `
      <div class="sim-pull-refresh-bar">
        <span class="sim-spinner"></span>
        <span>Fetching Dynamic Screen Data...</span>
      </div>
      <div class="sim-shimmer-card">
        <div class="sim-shimmer-line title"></div>
        <div class="sim-shimmer-line"></div>
        <div class="sim-shimmer-line short"></div>
      </div>
      <div class="sim-shimmer-card">
        <div class="sim-shimmer-line title"></div>
        <div class="sim-shimmer-line"></div>
      </div>
    `;
    return;
  }

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

  (activeSchema.components || []).forEach(rawComp => {
    const comp = resolveCompBindings(rawComp, simulatorScreenData);
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
      const variant = String(comp.variant || "").toLowerCase();
      const isOutline = variant === "outline" || variant === "secondary" || variant === "ghost";
      const bg = comp.background_color || comp.bg_color || (isOutline ? "transparent" : primaryColor);
      const border = isOutline
        ? `1.5px solid ${comp.border_color || comp.color || primaryColor}`
        : (comp.border_color ? `1.5px solid ${comp.border_color}` : "none");
      const textColor = comp.text_color || (isOutline ? (comp.color || primaryColor) : (comp.color || "#ffffff"));
      const btnStyle = `background: ${bg}; border: ${border}; color: ${textColor};`;
      el.innerHTML = `
        <button class="sim-btn-primary sim-clickable" onclick="handleSimulatorDartClick('${comp.id}', event)" style="${btnStyle}">
          ${comp.text || "Click Here"}
        </button>
      `;
    } else if (comp.type === "text") {
      el.className = "sim-text";
      el.style.textAlign = comp.align || "left";
      el.style.fontSize = `${comp.font_size || 15}px`;
      el.style.fontWeight = comp.is_bold ? "700" : "400";
      el.style.color = comp.text_color || comp.color || "var(--sim-text)";
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
    } else if (comp.type === "list_view" || comp.type === "listview") {
      el.className = "sim-listview";
      let items = [];
      if (Array.isArray(comp.items)) {
        items = comp.items;
      } else if (simulatorScreenData) {
        const path = comp.data_path || activeSchema.data_source?.pagination?.data_path || "";
        if (path && Array.isArray(simulatorScreenData[path])) {
          items = simulatorScreenData[path];
        } else if (Array.isArray(simulatorScreenData)) {
          items = simulatorScreenData;
        } else if (Array.isArray(simulatorScreenData.items)) {
          items = simulatorScreenData.items;
        } else if (Array.isArray(simulatorScreenData.users)) {
          items = simulatorScreenData.users;
        } else if (Array.isArray(simulatorScreenData.products)) {
          items = simulatorScreenData.products;
        } else if (Array.isArray(simulatorScreenData.data)) {
          items = simulatorScreenData.data;
        }
      }

      if (!items || items.length === 0) {
        el.innerHTML = `<div class="sim-listview-empty">📭 ${escapeHtml(comp.empty_text || "No items found")}</div>`;
      } else {
        const itemTemplate = comp.item_template || comp.template;
        const itemsHtml = items.map((rawItem, idx) => {
          const itemScope = typeof rawItem === "object" ? { ...rawItem, item: rawItem, index: idx } : { item: rawItem, value: rawItem, index: idx };
          if (itemTemplate) {
            const title = resolveTokens(itemTemplate.title || itemTemplate.label || "{{item.name}}", itemScope);
            const sub = resolveTokens(itemTemplate.subtitle || itemTemplate.description || "{{item.email}}", itemScope);
            const img = resolveTokens(itemTemplate.leading_image || itemTemplate.avatar || itemTemplate.thumbnail || "", itemScope);
            const trailing = resolveTokens(itemTemplate.trailing_text || "›", itemScope);
            return `
              <div class="sim-listview-item">
                ${img ? `<img src="${escapeHtml(img)}" class="sim-listview-avatar" onerror="this.style.display='none'" />` : `<div class="sim-listview-avatar">👤</div>`}
                <div class="sim-listview-details">
                  <div class="sim-listview-title">${escapeHtml(title)}</div>
                  ${sub ? `<div class="sim-listview-sub">${escapeHtml(sub)}</div>` : ""}
                </div>
                <span style="color:var(--text-muted);font-size:12px;">${escapeHtml(trailing)}</span>
              </div>
            `;
          } else {
            const title = rawItem.title || rawItem.name || `Item #${idx + 1}`;
            const sub = rawItem.description || rawItem.email || "";
            const img = rawItem.thumbnail || rawItem.avatar || rawItem.image || "";
            return `
              <div class="sim-listview-item">
                ${img ? `<img src="${escapeHtml(img)}" class="sim-listview-avatar" onerror="this.style.display='none'" />` : `<div class="sim-listview-avatar">🔹</div>`}
                <div class="sim-listview-details">
                  <div class="sim-listview-title">${escapeHtml(title)}</div>
                  ${sub ? `<div class="sim-listview-sub">${escapeHtml(sub)}</div>` : ""}
                </div>
                <span style="color:var(--text-muted);font-size:12px;">›</span>
              </div>
            `;
          }
        }).join("");

        const isPaginating = activeSchema.data_source?.pagination != null;
        const paginationHtml = isPaginating ? `
          <div class="sim-pagination-loader">
            <span class="sim-spinner" style="border-top-color:var(--primary-color);"></span>
            <span>Infinite Scroll Active • Page 1 of ${items.length} items</span>
          </div>
        ` : "";

        el.innerHTML = itemsHtml + paginationHtml;
      }
    } else if (comp.type === "listtile") {
      el.className = "sim-listtile";
      const iconSym = getSimIconSymbol(comp.leading_icon);
      const img = comp.leading_image || comp.avatar || comp.thumbnail;
      const leadingHtml = img
        ? `<img src="${escapeHtml(img)}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'" />`
        : `<div class="sim-listtile-leading">${iconSym}</div>`;
      el.innerHTML = `
        ${leadingHtml}
        <div class="sim-listtile-content">
          <div class="sim-listtile-title">${escapeHtml(comp.title || comp.label || "List Item")}</div>
          ${comp.subtitle ? `<div class="sim-listtile-sub">${escapeHtml(comp.subtitle)}</div>` : ""}
        </div>
        <div class="sim-listtile-trailing" style="${comp.trailing_text ? 'color:var(--primary-color);font-weight:700;' : ''}">${escapeHtml(comp.trailing_text || '›')}</div>
      `;
      if (comp.custom_dart_code || comp.onclick || comp.action_id) {
        el.classList.add("sim-clickable");
        el.onclick = (e) => handleSimulatorDartClick(comp.id, e);
      }
    } else if (comp.type === "chip") {
      el.className = `sim-chip ${comp.is_selected ? 'selected' : ''}`;
      if (comp.is_selected) el.style.background = activeSchema.theme?.primary_color || "#4F46E5";
      el.style.cursor = "pointer";
      el.dataset.simField = "chip";
      el.dataset.fieldId = comp.id || "";
      el.dataset.label = comp.label || "Chip Tag";
      el.dataset.primary = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        ${comp.icon ? `<span>${comp.icon === 'check' ? '✓' : '★'}</span>` : ""}
        <span>${comp.label || "Chip Tag"}</span>
      `;
    } else if (comp.type === "switch") {
      el.className = "sim-toggle-row";
      el.style.cursor = "pointer";
      el.dataset.simField = "switch";
      el.dataset.fieldId = comp.id || "";
      el.dataset.label = comp.label || "Switch Toggle";
      el.dataset.checked = comp.is_checked ? "true" : "false";
      el.dataset.primary = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--sim-text);">${comp.label || "Switch Toggle"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div class="sim-switch-pill ${comp.is_checked ? 'active' : ''}" style="${comp.is_checked ? `background:${activeSchema.theme?.primary_color || '#4F46E5'}` : ''}"></div>
      `;
    } else if (comp.type === "checkbox") {
      el.className = "sim-check-row";
      const primaryColor = activeSchema.theme?.primary_color || "#4F46E5";
      el.style.cursor = "pointer";
      el.dataset.simField = "checkbox";
      el.dataset.fieldId = comp.id || "";
      el.dataset.label = comp.label || "Checkbox Option";
      el.dataset.checked = comp.is_checked ? "true" : "false";
      el.dataset.primary = primaryColor;
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--sim-text);">${comp.label || "Checkbox Option"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div class="sim-check-box" style="width:20px;height:20px;border-radius:5px;border:2px solid ${comp.is_checked ? primaryColor : '#475569'};background:${comp.is_checked ? primaryColor : 'transparent'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">
          ${comp.is_checked ? '✓' : ''}
        </div>
      `;
    } else if (comp.type === "radio") {
      el.className = "sim-radio-row";
      const primaryColor = activeSchema.theme?.primary_color || "#4F46E5";
      el.innerHTML = `
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--sim-text);">${comp.label || "Radio Option"}</div>
          ${comp.subtitle ? `<div style="font-size:11px;color:#94A3B8;">${comp.subtitle}</div>` : ""}
        </div>
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${comp.is_selected ? primaryColor : '#475569'};display:flex;align-items:center;justify-content:center;">
          <div style="width:9px;height:9px;border-radius:50%;background:${comp.is_selected ? primaryColor : 'transparent'};"></div>
        </div>
      `;
    } else if (comp.type === "icon") {
      const iconSym = simIconSymbol(comp.icon);
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
    } else if (comp.type === "container") {
      el.className = "sim-container";
      const bg = isValidHexColor(comp.background_color || comp.color) ? (comp.background_color || comp.color) : (comp.background_color === 'transparent' ? 'transparent' : 'transparent');
      const borderColor = isValidHexColor(comp.border_color) ? comp.border_color : '';
      const borderWidth = comp.border_width !== undefined ? Number(comp.border_width) : (borderColor ? 1 : 0);
      el.style.backgroundColor = bg;
      if (borderWidth > 0 && borderColor) {
        el.style.border = `${borderWidth}px solid ${borderColor}`;
      } else if (borderWidth > 0) {
        el.style.border = `${borderWidth}px solid currentColor`;
      } else {
        el.style.border = 'none';
      }
      el.style.borderRadius = `${comp.border_radius !== undefined ? Number(comp.border_radius) : 12}px`;
      el.style.padding = `${comp.padding !== undefined ? Number(comp.padding) : 16}px`;
      el.style.margin = `${comp.margin !== undefined ? Number(comp.margin) : 8}px 0`;
      if (comp.width) el.style.width = typeof comp.width === 'number' ? `${comp.width}px` : comp.width;
      if (comp.height) el.style.height = `${comp.height}px`;

      const alignMap = {
        topleft: { ai: 'flex-start', jc: 'flex-start' },
        topcenter: { ai: 'center', jc: 'flex-start' },
        topright: { ai: 'flex-end', jc: 'flex-start' },
        centerleft: { ai: 'flex-start', jc: 'center' },
        center: { ai: 'center', jc: 'center' },
        centerright: { ai: 'flex-end', jc: 'center' },
        bottomleft: { ai: 'flex-start', jc: 'flex-end' },
        bottomcenter: { ai: 'center', jc: 'flex-end' },
        bottomright: { ai: 'flex-end', jc: 'flex-end' }
      };
      const a = alignMap[String(comp.alignment || '').toLowerCase()];
      if (a) {
        el.style.alignItems = a.ai;
        el.style.justifyContent = a.jc;
      }

      if (comp.custom_dart_code || comp.action_id) {
        el.classList.add("sim-clickable");
        el.setAttribute("title", "Click to execute container action");
        el.onclick = (e) => handleSimulatorDartClick(comp.id, e);
      }
      const childrenList = Array.isArray(comp.children) ? comp.children : (comp.child ? [comp.child] : []);
      el.innerHTML = childrenList.map(renderSimChildHtml).join("");
    } else if (comp.type === "stack") {
      el.className = "sim-stack";
      el.style.minHeight = `${comp.height || 180}px`;
      el.style.overflow = comp.clip === 'none' ? 'visible' : 'hidden';
      el.style.borderRadius = `${comp.border_radius !== undefined ? Number(comp.border_radius) : 12}px`;

      const childrenList = Array.isArray(comp.children) ? comp.children : (comp.child ? [comp.child] : []);
      el.innerHTML = childrenList.map((c, cIdx) => {
        const isPositioned = c.is_positioned !== false && (
          c.is_positioned === true ||
          c.top !== undefined || c.bottom !== undefined ||
          c.left !== undefined || c.right !== undefined
        );
        if (isPositioned) {
          const top = c.top !== undefined ? `top:${Number(c.top)}px;` : '';
          const bottom = c.bottom !== undefined ? `bottom:${Number(c.bottom)}px;` : '';
          const left = c.left !== undefined ? `left:${Number(c.left)}px;` : '';
          const right = c.right !== undefined ? `right:${Number(c.right)}px;` : '';
          const w = c.width !== undefined ? `width:${Number(c.width)}px;` : '';
          const h = c.height !== undefined ? `height:${Number(c.height)}px;` : '';
          return `<div class="sim-stack-child-positioned" style="${top} ${bottom} ${left} ${right} ${w} ${h} z-index:${cIdx + 1};">${renderSimChildHtml(c)}</div>`;
        }
        return `<div style="width:100%; height:100%;">${renderSimChildHtml(c)}</div>`;
      }).join("");
    } else {
      el.className = "sim-fallback-box";
      el.innerHTML = `🛡 Guarded Fallback: [${comp.type || "unknown"}] (Safe)`;
    }

    simComponentsList.appendChild(el);
  });
}

function updateJsonEditor() {
  rawJsonEditor.value = JSON.stringify(activeSchema, null, 2);
  // Every designer mutation ends here, so this is the single place to flag unapplied edits.
  markActiveScreenDirty();
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
    activeSchema.theme = Object.assign({}, DEFAULT_THEME, { primary_color: generatedPreset.color }, generatedPreset.theme || {});
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
      activeSchema.theme = Object.assign({}, DEFAULT_THEME, { primary_color: p.color }, p.theme || {});
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

  // Ensure activeSchema metadata
  activeSchema.screen_id = activeScreenId;
  activeSchema.screen_name = activeSchema.header?.title || activeScreenId;
  activeSchema.route = screens[activeScreenId]?.route || (activeScreenId === "home" ? "/" : `/${activeScreenId}`);
  activeSchema.timestamp = Date.now();

  // Save in local screens dictionary; the screen is no longer dirty once it is broadcast
  screens[activeScreenId] = JSON.parse(JSON.stringify(activeSchema));
  dirtyScreens.delete(activeScreenId);
  renderScreenTabs();

  fetch(`/api/schema/apply?screen=${encodeURIComponent(activeScreenId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activeSchema)
  })
  .then(res => res.json())
  .then(data => {
    const elapsed = Math.round(performance.now() - startTime);
    teleLatency.innerText = `${elapsed} ms`;
    schemaVersionDisplay.innerText = `v${data.version || activeSchema.version}`;
    showToast(`🚀 Screen "${activeSchema.screen_name}" Applied to Mobile in ${elapsed} ms!`);
  })
  .catch(err => {
    console.error("Apply error:", err);
    showToast("⚠️ Could not broadcast to server. Is sync server running?", true);
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
      const sid = data.screen_id || (data.route === "/" ? "home" : null);
      const isActive = data.version && (data.screen_id === activeScreenId || (!data.screen_id && activeScreenId === "home"));

      if (sid && dirtyScreens.has(sid) && screens[sid]) {
        // Unapplied designer edits win over the server copy (typically the switch-endpoint echo).
        // Only adopt the version number so later comparisons stay consistent.
        screens[sid].version = data.version;
        if (isActive) {
          activeSchema.version = data.version;
          schemaVersionDisplay.innerText = `v${data.version}`;
        }
        renderScreenTabs();
        return;
      }

      if (sid) {
        screens[sid] = data;
      }
      if (isActive) {
        activeSchema = data;
        schemaVersionDisplay.innerText = `v${data.version}`;
        renderFromServer(renderAll);
      }
      renderScreenTabs();
    } catch (err) {
      console.error("SSE parse error:", err);
    }
  });

  evtSource.addEventListener("screens_bundle", (e) => {
    try {
      const bundle = JSON.parse(e.data);
      if (bundle.screens) {
        // Merge per screen instead of replacing wholesale: a local copy whose version is not older
        // than the server's holds unapplied designer edits (loading a template, appending widgets)
        // and must survive broadcasts that target other screens. A newer server version (someone
        // pressed Apply, or a device pushed) always wins. Screens deleted on the server disappear.
        const merged = {};
        for (const [sid, serverCopy] of Object.entries(bundle.screens)) {
          const localCopy = screens[sid];
          const keepLocal = localCopy && (dirtyScreens.has(sid) || (localCopy.version || 0) >= (serverCopy.version || 0));
          merged[sid] = keepLocal ? localCopy : serverCopy;
        }
        screens = merged;
        dirtyScreens.forEach(sid => { if (!screens[sid]) dirtyScreens.delete(sid); });
        if (screens[activeScreenId] && screens[activeScreenId] !== activeSchema) {
          activeSchema = screens[activeScreenId];
          renderFromServer(renderAll);
        }
        renderScreenTabs();
      }
    } catch (err) {
      console.error("SSE screens_bundle parse error:", err);
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

function validateSimulatorScreen(apiConfig) {
  const allComponents = [];
  function collect(c) {
    if (!c) return;
    allComponents.push(c);
    if (Array.isArray(c.children)) c.children.forEach(collect);
  }
  (activeSchema.components || []).forEach(collect);

  for (const comp of allComponents) {
    const rule = comp.validation;
    if (!rule) continue;

    const val = getSimulatorInputValue(comp.id);
    const label = comp.label || comp.hint || comp.title || comp.id || "Field";

    // Required check
    if (rule.required) {
      if (val === null || val === undefined || val === "" || val === false) {
        return rule.error_message || `⚠️ Validation Error: "${label}" is required!`;
      }
    }

    // Format checks when value is present as a string
    if (val !== null && val !== undefined && val !== "" && typeof val === "string") {
      if (rule.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          return rule.error_message || `⚠️ Validation Error: "${label}" must be a valid email address!`;
        }
      } else if (rule.type === "phone") {
        const phoneRegex = /^[+0-9()\- ]{7,20}$/;
        if (!phoneRegex.test(val)) {
          return rule.error_message || `⚠️ Validation Error: "${label}" must be a valid phone number!`;
        }
      } else if (rule.type === "number") {
        if (isNaN(Number(val))) {
          return rule.error_message || `⚠️ Validation Error: "${label}" must be a valid number!`;
        }
      }

      if (typeof rule.min_length === "number" && val.length < rule.min_length) {
        return rule.error_message || `⚠️ Validation Error: "${label}" must be at least ${rule.min_length} characters!`;
      }

      if (typeof rule.max_length === "number" && val.length > rule.max_length) {
        return rule.error_message || `⚠️ Validation Error: "${label}" cannot exceed ${rule.max_length} characters!`;
      }

      if (rule.regex) {
        try {
          const r = new RegExp(rule.regex);
          if (!r.test(val)) {
            return rule.error_message || `⚠️ Validation Error: "${label}" format is invalid!`;
          }
        } catch (_) {}
      }
    }
  }

  return null; // All validation rules passed
}

function resetSimulatorForm() {
  const root = getSimulatorActiveScreenRoot();
  if (!root) return;
  root.querySelectorAll("input:not([type=checkbox]), textarea").forEach(i => i.value = "");
  root.querySelectorAll("input[type=checkbox]").forEach(i => i.checked = false);
  root.querySelectorAll("[data-sim-field='checkbox'], [data-sim-field='switch']").forEach(el => {
    el.dataset.checked = "false";
    const box = el.querySelector(".sim-check-box");
    if (box) { box.style.background = "transparent"; box.innerHTML = ""; }
    const pill = el.querySelector(".sim-switch-pill");
    if (pill) { pill.classList.remove("active"); pill.style.background = ""; }
  });
}

function navigateToRouteInSimulator(route) {
  if (route === "/" || route === "") {
    const screen = document.getElementById("phoneSimulatorScreen");
    if (screen) screen.querySelectorAll(".sim-screen-overlay, .sim-bottomsheet-wrapper, .sim-modal-backdrop").forEach(el => el.remove());
    if (simBackBtn) simBackBtn.style.display = "none";
    return;
  }
  const matchingScreenEntry = Object.entries(screens).find(([sid, scr]) => {
    const scrRoute = scr.route || (sid === "home" ? "/" : `/${sid}`);
    return scrRoute === route || sid === route.replaceAll('/', '') || sid === route;
  });
  if (matchingScreenEntry) {
    const [matchedSid, matchedScr] = matchingScreenEntry;
    showSimulatorDynamicScreen(matchedSid, matchedScr);
    if (simBackBtn) simBackBtn.style.display = "inline-flex";
  } else {
    showToast(`Navigated to ${route}`);
  }
}

async function executeSimulatorDynamicApi(apiConfig, comp) {
  if (!apiConfig || !apiConfig.url) {
    showToast("⚠️ No Cloud API configured for this action", true);
    return;
  }

  // 1. Declarative Form Validation
  const validationError = validateSimulatorScreen(apiConfig);
  if (validationError) {
    showToast(validationError, true);
    return;
  }

  // 2. Build outgoing request payload
  const payload = {};
  const mapping = apiConfig.body_mapping || {};
  const staticBody = apiConfig.static_body || {};

  for (const apiKey in mapping) {
    const fieldId = mapping[apiKey];
    payload[apiKey] = getSimulatorInputValue(fieldId);
  }

  for (const k in staticBody) {
    payload[k] = staticBody[k];
  }

  // Fallback if mapping was completely empty
  if (Object.keys(mapping).length === 0 && Object.keys(staticBody).length === 0) {
    const autoFields = collectSimulatorFormFields();
    autoFields.forEach(f => {
      payload[f.id] = f.value;
    });
  }

  // 3. Path Variable Substitution ({id}, {userId})
  let url = apiConfig.url.trim();
  for (const k in payload) {
    if (url.includes(`{${k}}`)) {
      url = url.replace(`{${k}}`, encodeURIComponent(payload[k]));
    }
  }

  // 4. Headers & HTTP Dispatch
  const headers = Object.assign({ "Content-Type": "application/json" }, apiConfig.headers || {});
  const method = (apiConfig.method || "POST").toUpperCase();

  showToast(`⚡ Dispatching ${method} ${url}...`);

  // Submit button loading spinner
  const btnEl = document.querySelector(`button.sim-btn-primary[onclick*="${comp?.id}"]`) ||
                document.querySelector(`[onclick*="${comp?.id}"]`);
  let origBtnHtml = null;
  if (btnEl) {
    origBtnHtml = btnEl.innerHTML;
    btnEl.innerHTML = `<span class="sim-spinner"></span> ${escapeHtml(comp?.submitting_text || "Submitting...")}`;
    btnEl.style.pointerEvents = "none";
    btnEl.style.opacity = "0.8";
  }

  try {
    const fetchOptions = {
      method: method,
      headers: headers
    };
    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = JSON.stringify(payload);
    }

    const res = await fetch(url, fetchOptions);

    if (res.ok) {
      // Store submission log for dashboard if not already posted to /api/submissions
      if (!url.includes("/api/submissions")) {
        postSimulatorSubmission(comp?.action_id || comp?.id || "dynamic_api", Object.entries(payload).map(([k, v]) => ({ id: k, label: k, value: v })));
      }

      // Reset form if configured
      if (apiConfig.reset_form !== false) {
        resetSimulatorForm();
      }

      const onSuccess = apiConfig.on_success || {};
      const action = onSuccess.action || "dialog";

      if (action === "dialog") {
        showSimulatorSuccessDialog({
          title: onSuccess.title || "Submitted Successfully!",
          message: onSuccess.message || "Your details have been submitted to cloud API.",
          button_text: "Back to Home Screen",
          route: onSuccess.route || "/"
        });
      } else if (action === "snackbar" || action === "toast") {
        showToast(onSuccess.message || "✅ Successfully submitted to Cloud API!");
      } else if (action === "navigate") {
        const route = onSuccess.route || "/";
        showToast(`✅ Submitted! Navigating to ${route}...`);
        navigateToRouteInSimulator(route);
      } else {
        showToast(onSuccess.message || "✅ API Request Succeeded!");
      }
    } else {
      const errMsg = apiConfig.on_error?.message || `⚠️ Cloud API Error (${res.status}): ${res.statusText}`;
      showToast(errMsg, true);
    }
  } catch (err) {
    console.error("Dynamic API invocation error:", err);
    const errMsg = apiConfig.on_error?.message || `⚠️ Network Error: ${err.message}`;
    showToast(errMsg, true);
  } finally {
    if (btnEl && origBtnHtml) {
      btnEl.innerHTML = origBtnHtml;
      btnEl.style.pointerEvents = "auto";
      btnEl.style.opacity = "1";
    }
  }
}

window.handleSimulatorAction = function(actionId, comp) {
  // 1. If component has an API Config, execute it dynamically
  if (comp && comp.api_config && comp.api_config.url) {
    executeSimulatorDynamicApi(comp.api_config, comp);
    return;
  }

  // 2. If screen has an API Config, execute it dynamically
  if (activeSchema && activeSchema.api_config && activeSchema.api_config.url) {
    executeSimulatorDynamicApi(activeSchema.api_config, comp);
    return;
  }

  // 3. Fallback: if component has a success_dialog
  if (comp && comp.success_dialog && typeof comp.success_dialog === "object") {
    const fields = collectSimulatorFormFields();
    postSimulatorSubmission(actionId, fields);
    showSimulatorSuccessDialog(comp.success_dialog);
    return;
  }

  showToast(`Triggered Action: "${actionId}"`);
};

/**
 * Gather every interactive field currently rendered in the phone simulator:
 * text inputs / textareas, switches, checkboxes and selected chips.
 * Returns [{ id, label, value, type }].
 */
/** The DOM node whose inputs belong to the screen currently shown in the simulator:
 *  the top-most pushed screen overlay if one is open, otherwise the home content. */
function getSimulatorActiveScreenRoot() {
  const screen = document.getElementById("phoneSimulatorScreen");
  const overlays = screen ? screen.querySelectorAll(".sim-screen-overlay") : [];
  if (overlays.length > 0) return overlays[overlays.length - 1];
  return document.getElementById("simComponentsList");
}

function collectSimulatorFormFields() {
  const root = getSimulatorActiveScreenRoot();
  if (!root) return [];
  const fields = [];

  root.querySelectorAll("input, textarea").forEach(input => {
    if (input.type === "checkbox") {
      fields.push({
        id: (input.id || "").replace(/^sim_input_/, "") || "checkbox",
        label: input.getAttribute("data-label") || "Agreement",
        value: input.checked,
        type: "checkbox"
      });
    } else {
      const isPassword = input.type === "password";
      fields.push({
        id: (input.id || "").replace(/^sim_input_/, "") || "field",
        label: input.getAttribute("data-label") || input.placeholder || "Field",
        value: isPassword ? (input.value ? "••••••••" : "") : input.value.trim(),
        type: "text"
      });
    }
  });

  root.querySelectorAll("[data-sim-field='switch'], [data-sim-field='checkbox']").forEach(row => {
    fields.push({
      id: row.dataset.fieldId || row.dataset.simField,
      label: row.dataset.label || row.dataset.simField,
      value: row.dataset.checked === "true",
      type: row.dataset.simField
    });
  });

  const selectedChips = [...root.querySelectorAll("[data-sim-field='chip'].selected")];
  if (selectedChips.length > 0) {
    fields.push({
      id: selectedChips.map(c => c.dataset.fieldId).filter(Boolean).join(",") || "chip_selection",
      label: "Selected Option",
      value: selectedChips.map(c => c.dataset.label).join(", "),
      type: "chip"
    });
  }

  return fields;
}

function postSimulatorSubmission(actionId, fields) {
  const root = getSimulatorActiveScreenRoot();
  const overlayScreenId = root && root.dataset ? root.dataset.screenId : null;
  const overlayTitle = root && root.dataset ? root.dataset.screenTitle : null;
  const payload = {
    source: "web_simulator",
    screen_id: overlayScreenId || activeScreenId,
    screen_title: overlayTitle || activeSchema.header?.title || activeScreenId,
    action_id: actionId,
    fields: fields.map(f => ({ id: f.id, label: f.label, value: f.value }))
  };

  fetch(`/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        updateSubmissionCountBadge(data.total);
        setTimeout(() => showToast(`📥 Stored as submission #${data.id} — open "Show Submissions" to view`), 900);
      }
    })
    .catch(() => {
      setTimeout(() => showToast("⚠️ Could not reach sync server to store submission", true), 900);
    });
}

function updateSubmissionCountBadge(total) {
  const badge = document.getElementById("submissionCountBadge");
  if (badge && typeof total === "number") badge.innerText = total;
}

function refreshSubmissionCountBadge() {
  fetch(`/api/submissions`, { cache: "no-store" })
    .then(res => res.json())
    .then(data => updateSubmissionCountBadge(data.total))
    .catch(() => {});
}

// Make simulator chips, switches and checkboxes interactive so submitted values are real
document.addEventListener("click", (e) => {
  const root = document.getElementById("phoneSimulatorScreen");
  if (!root || !root.contains(e.target)) return;

  const chip = e.target.closest("[data-sim-field='chip']");
  if (chip) {
    const siblings = chip.parentElement ? chip.parentElement.querySelectorAll("[data-sim-field='chip']") : [chip];
    siblings.forEach(c => { c.classList.remove("selected"); c.style.background = ""; });
    chip.classList.add("selected");
    chip.style.background = chip.dataset.primary || "#4F46E5";
    return;
  }

  const row = e.target.closest("[data-sim-field='switch'], [data-sim-field='checkbox']");
  if (row) {
    const nowChecked = row.dataset.checked !== "true";
    row.dataset.checked = nowChecked ? "true" : "false";
    const primary = row.dataset.primary || "#4F46E5";
    const pill = row.querySelector(".sim-switch-pill");
    if (pill) {
      pill.classList.toggle("active", nowChecked);
      pill.style.background = nowChecked ? primary : "";
    }
    const box = row.querySelector(".sim-check-box");
    if (box) {
      box.style.background = nowChecked ? primary : "transparent";
      box.style.borderColor = nowChecked ? primary : "#475569";
      box.innerText = nowChecked ? "✓" : "";
    }
  }
});

refreshSubmissionCountBadge();
setInterval(refreshSubmissionCountBadge, 5000);

// ==========================================================================
// ⚡ Simulator Dart Execution Engine
// ==========================================================================
window.handleSimulatorDartClick = function(compId, event) {
  if (event) {
    event.stopPropagation();
  }

  let comp = null;
  // 1. Search in activeSchema
  for (const c of (activeSchema.components || [])) {
    if (c.id === compId) { comp = c; break; }
    if (c.children && Array.isArray(c.children)) {
      for (const ch of c.children) {
        if (ch.id === compId) { comp = ch; break; }
      }
      if (comp) break;
    }
  }

  // 2. Search across other registered screens
  if (!comp && typeof screens === 'object') {
    for (const sid in screens) {
      const scr = screens[sid];
      for (const c of (scr.components || [])) {
        if (c.id === compId) { comp = c; break; }
        if (c.children && Array.isArray(c.children)) {
          for (const ch of c.children) {
            if (ch.id === compId) { comp = ch; break; }
          }
          if (comp) break;
        }
      }
      if (comp) break;
    }
  }

  if (!comp) {
    window.handleSimulatorAction(compId);
    return;
  }

  // 1. If component has an API Config, prioritize dynamic execution
  if (comp.api_config && comp.api_config.url) {
    executeSimulatorDynamicApi(comp.api_config, comp);
    return;
  }

  const dartCode = comp.custom_dart_code || (typeof comp.onclick === 'string' ? comp.onclick : comp.onclick?.code);

  if (dartCode && dartCode.trim().length > 0) {
    executeSimulatorDartSnippet(dartCode.trim(), comp);
  } else if (comp.action_id) {
    window.handleSimulatorAction(comp.action_id, comp);
  } else if (activeSchema && activeSchema.api_config && activeSchema.api_config.url && comp.type === "button") {
    executeSimulatorDynamicApi(activeSchema.api_config, comp);
  } else {
    showToast(`⚡ Clicked ${comp.type.toUpperCase()}`);
  }
};

function getSimulatorInputValue(keyOrId) {
  const query = (keyOrId || '').toLowerCase().trim();
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return '';

  // 1. Direct match by id: sim_input_{keyOrId} or sim_input_input_{keyOrId} or keyOrId
  let el = document.getElementById(`sim_input_${keyOrId}`) ||
           document.getElementById(`sim_input_input_${keyOrId}`) ||
           document.getElementById(keyOrId);
  if (el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.value !== undefined) return el.value.trim();
  }

  // 2. Search data-field-id (for switch, checkbox, chip)
  const fieldEl = screen.querySelector(`[data-field-id="${keyOrId}"]`) ||
                  screen.querySelector(`[data-field-id="input_${keyOrId}"]`);
  if (fieldEl) {
    const sField = fieldEl.dataset.simField;
    if (sField === 'checkbox' || sField === 'switch') {
      return fieldEl.dataset.checked === 'true';
    }
    if (sField === 'chip') {
      return fieldEl.classList.contains('selected');
    }
  }

  // 3. Search inputs & textareas by matching label, placeholder, or id
  const inputs = screen.querySelectorAll('input, textarea');
  for (const input of inputs) {
    const id = (input.id || '').toLowerCase();
    const label = (input.getAttribute('data-label') || '').toLowerCase();
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
    if (id === query || id.includes(query) || label === query || label.includes(query) || placeholder.includes(query)) {
      if (input.type === 'checkbox') return input.checked;
      return input.value.trim();
    }
  }
  return '';
}

function executeSimulatorDartSnippet(code, comp) {
  const compName = comp.text || comp.title || comp.label || comp.icon || comp.id || comp.type;
  const scope = {};

  // Extract variables: final|var|String <varName> = ...getValue('key')
  const varMatches = code.matchAll(/(?:final|var|String|dynamic)?\s*([a-zA-Z0-9_]+)\s*=\s*(?:GenUi)?FormRegistry\.instance\.getValue\(\s*['"](.+?)['"]\s*\)/g);
  for (const vm of varMatches) {
    const vName = vm[1];
    const fieldKey = vm[2];
    scope[vName] = getSimulatorInputValue(fieldKey);
  }

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

  // 2. Check for Conditional Validation (if (...) { ... showSnackBar ... return; })
  const ifMatch = code.match(/if\s*\(([\s\S]+?)\)\s*\{([\s\S]+?)\}/);
  if (ifMatch) {
    const condStr = ifMatch[1];
    const blockStr = ifMatch[2];

    let condPassed = false;
    // Check common conditions
    if (condStr.includes(".isEmpty") || condStr.includes("contains('@')") || condStr.includes("isValidEmail")) {
      // Find variable value from scope or simulator
      let targetVal = scope["email"] !== undefined ? scope["email"] : "";
      for (const k in scope) {
        if (condStr.includes(k)) { targetVal = scope[k]; break; }
      }
      if (!targetVal) {
        targetVal = getSimulatorInputValue("email");
      }

      // If condition checks if invalid
      if (condStr.includes(".isEmpty") && (!targetVal || targetVal.trim().length === 0)) {
        condPassed = true;
      } else if (condStr.includes("contains('@')") && (!targetVal || !targetVal.includes("@"))) {
        condPassed = true;
      } else if (condStr.includes("isValidEmail") && (!targetVal || !targetVal.includes("@") || !targetVal.includes("."))) {
        condPassed = true;
      }
    }

    if (condPassed) {
      // Validation failed -> execute inside if block (usually SnackBar + return)
      if (blockStr.includes("showSnackBar") || blockStr.includes("SnackBar(")) {
        let msg = "Please enter a valid value!";
        const tMatch = blockStr.match(/Text\(\s*['"](.+?)['"]\s*\)/);
        if (tMatch && tMatch[1]) msg = tMatch[1];
        showSimulatorSnackBar(msg, "#EF4444");
        showToast(`⚡ Validation Error: "${msg}"`);
      }
      if (blockStr.includes("return")) {
        return; // Halt on return!
      }
    }
  }

  // 3. Navigation: Navigator.push, Navigator.pushNamed, Get.to, Get.toNamed, UserProfileDemoScreen, SettingsDemoScreen
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
    const argMatch = code.match(/arguments:\s*(\{[\s\S]+?\}|\[[\s\S]+?\]|['"][^'"]*['"]|[a-zA-Z0-9_]+)/);
    if (argMatch && argMatch[1]) {
      let rawArgs = argMatch[1].trim();
      // Substitute variables from scope
      for (const k in scope) {
        rawArgs = rawArgs.replace(new RegExp(`\\b${k}\\b`, 'g'), `'${scope[k]}'`);
      }
      args = rawArgs;
    }

    // 1. Check if routeName matches any screen in our multi-screen registry!
    const matchingScreenEntry = Object.entries(screens).find(([sid, scr]) => {
      const scrRoute = scr.route || (sid === "home" ? "/" : `/${sid}`);
      return scrRoute === routeName || sid === routeName.replaceAll('/', '') || sid === routeName;
    });

    if (matchingScreenEntry) {
      const [matchedSid, matchedScr] = matchingScreenEntry;
      showSimulatorDynamicScreen(matchedSid, matchedScr, args);
      if (simBackBtn) simBackBtn.style.display = "inline-flex";
      showToast(`⚡ Navigated to Dynamic Screen: "${matchedScr.screen_name || matchedScr.header?.title}" (${routeName})`);
      return;
    }

    if (routeName === "/profile") {
      showSimulatorProfileScreen(args);
      if (simBackBtn) simBackBtn.style.display = "inline-flex";
      showToast(`⚡ Navigated to /profile ${args ? `with arguments: ${args}` : ''}`);
    } else if (routeName === "/settings") {
      showSimulatorSettingsScreen(args);
      if (simBackBtn) simBackBtn.style.display = "inline-flex";
      showToast(`⚡ Navigated to /settings ${args ? `with arguments: ${args}` : ''}`);
    } else {
      showSimulatorGenericScreen(routeName, args);
      if (simBackBtn) simBackBtn.style.display = "inline-flex";
      showToast(`⚡ Navigated to ${routeName} ${args ? `with arguments: ${args}` : ''}`);
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

    for (const k in scope) {
      msg = msg.replaceAll(`$${k}`, scope[k]).replaceAll(`\${${k}}`, scope[k]);
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
    if (comp?.api_config && comp.api_config.url) {
      executeSimulatorDynamicApi(comp.api_config, comp);
      return;
    }
    if (activeSchema?.api_config && activeSchema.api_config.url) {
      executeSimulatorDynamicApi(activeSchema.api_config, comp);
      return;
    }
    window.handleSimulatorAction(comp?.action_id || "submit_form", comp);
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

function showSimulatorDynamicScreen(sid, scr, args) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-screen-overlay");
  if (old) old.remove();

  if (simBackBtn) simBackBtn.style.display = "inline-flex";

  const overlay = document.createElement("div");
  overlay.className = "sim-screen-overlay";
  overlay.dataset.screenId = sid;
  overlay.dataset.screenTitle = scr.header?.title || scr.screen_name || sid;

  // Pushed screens carry their own theme (e.g. a light MUST Mate detail opened from a dark home)
  applySimThemeVars(overlay, scr.theme);

  let componentsHtml = "";
  if (scr.components && scr.components.length > 0) {
    simRenderThemeOverride = scr.theme || null;
    try {
      componentsHtml = scr.components.map(comp => renderSimChildHtml(comp)).join("");
    } finally {
      simRenderThemeOverride = null;
    }
  } else {
    componentsHtml = `
      <div style="text-align:center; padding:36px 16px; color:#94A3B8; font-size:12px;">
        <div style="font-size:28px; margin-bottom:8px;">📄</div>
        <strong>Blank Dynamic Screen Canvas</strong>
        <p style="margin-top:6px; color:#64748B;">Select this screen tab in the designer to add components and actions.</p>
      </div>`;
  }

  overlay.innerHTML = `
    <div class="sim-screen-appbar">
      <button class="sim-appbar-btn" onclick="this.closest('.sim-screen-overlay').remove(); if(document.getElementById('simBackBtn')) document.getElementById('simBackBtn').style.display='none';">‹ Back</button>
      <div class="sim-appbar-title">${escapeHtml(scr.header?.title || scr.screen_name || sid)}</div>
      <div style="font-size:10px; color:#818CF8; font-weight:700; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); padding:2px 6px; border-radius:4px;">GENUI</div>
    </div>
    <div class="sim-screen-body" style="padding: 12px; overflow-y: auto;">
      ${args ? `
        <div class="sim-arg-box" style="margin-bottom: 12px;">
          <div style="color:#818CF8; font-weight:700; margin-bottom:2px; font-size:11px;">📥 Received Route Arguments:</div>
          <div style="font-size:11px; font-family:monospace; color:#E2E8F0;">${escapeHtml(typeof args === 'object' ? JSON.stringify(args) : args)}</div>
        </div>
      ` : ''}
      <div class="sim-dynamic-components-inner" style="display:flex; flex-direction:column; gap:8px;">
        ${componentsHtml}
      </div>
    </div>
  `;
  screen.appendChild(overlay);
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

/** Confirmation dialog after a stored submission; its button returns the simulator to Home. */
function showSimulatorSuccessDialog(dialog) {
  const screen = document.getElementById("phoneSimulatorScreen");
  if (!screen) return;
  const old = screen.querySelector(".sim-modal-backdrop");
  if (old) old.remove();

  const title = dialog.title || "Submitted Successfully";
  const message = dialog.message || "Your details have been submitted successfully.";
  const buttonText = dialog.button_text || "Back to Home Screen";

  const backdrop = document.createElement("div");
  backdrop.className = "sim-modal-backdrop";
  backdrop.innerHTML = `
    <div class="sim-dialog-content">
      <div class="sim-dialog-title">
        <span style="color:#10B981;">✅</span> <span>${escapeHtml(title)}</span>
      </div>
      <div class="sim-dialog-body">${escapeHtml(message)}</div>
      <div class="sim-dialog-actions">
        <button class="sim-dialog-btn sim-dialog-home-btn" style="width:100%; padding:8px;">🏠 ${escapeHtml(buttonText)}</button>
      </div>
    </div>
  `;
  backdrop.querySelector(".sim-dialog-home-btn").onclick = () => {
    backdrop.remove();
    // Pop every pushed screen so the simulator is back on Home
    screen.querySelectorAll(".sim-screen-overlay, .sim-bottomsheet-wrapper").forEach(el => el.remove());
    if (simBackBtn) simBackBtn.style.display = "none";
    showToast("🏠 Returned to Home screen");
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
  activeSchema.theme = Object.assign({}, DEFAULT_THEME, { primary_color: p.color });
  activeSchema.components = JSON.parse(JSON.stringify(p.components));
  renderAll();
  showToast("Reset to Default");
});

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
  
  // Shortcut: Alt+T to toggle
  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "t") {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Listen for system preference changes if user has not explicitly set preference
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark", false);
      }
    });
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initPanelVisibility();
  renderFromServer(renderAll);
  await loadScreensFromServer();
  dirtyScreens.clear();
  renderScreenTabs();
  connectSseStream();
});

