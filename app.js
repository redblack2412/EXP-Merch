const defaultProducts = [
  {
    id: "tourshirt",
    name: "Tourshirt Black",
    category: "Shirts",
    meta: "Heavy Cotton",
    image: "",
    basePrice: 29.9,
    variants: [
      { id: "s", label: "S", price: 29.9, stock: 12, sold: 0 },
      { id: "m", label: "M", price: 29.9, stock: 10, sold: 0 },
      { id: "l", label: "L", price: 29.9, stock: 8, sold: 0 },
      { id: "xl", label: "XL", price: 29.9, stock: 6, sold: 0 }
    ]
  },
  {
    id: "hoodie",
    name: "Heavy Hoodie",
    category: "Shirts",
    meta: "Premium Fit",
    image: "",
    basePrice: 59.9,
    variants: [
      { id: "m", label: "M", price: 59.9, stock: 7, sold: 0 },
      { id: "l", label: "L", price: 59.9, stock: 6, sold: 0 },
      { id: "xl", label: "XL", price: 59.9, stock: 5, sold: 0 }
    ]
  },
  {
    id: "cap",
    name: "Snapback Cap",
    category: "Accessoires",
    meta: "One Size",
    image: "",
    basePrice: 24.9,
    variants: [{ id: "onesize", label: "One Size", price: 24.9, stock: 18, sold: 0 }]
  },
  {
    id: "vinyl",
    name: "Limited Vinyl",
    category: "Music",
    meta: "Gatefold",
    image: "",
    basePrice: 34.9,
    variants: [{ id: "std", label: "Standard", price: 34.9, stock: 9, sold: 0 }]
  }
];

const defaultBranding = {
  appTitle: "EXPLIZIT Merch Terminal",
  bandName: "EXPLIZIT Merch Terminal",
  tourLabel: "Industrial Live System 2026",
  tagline: "Direkt am Terminal bestellen und an der Ausgabe bezahlen."
};

const STORAGE_PRODUCTS = "kiosk_products_v2";
const STORAGE_PRODUCTS_LEGACY = "kiosk_products_v1";
const STORAGE_BRANDING = "kiosk_branding_v1";
const STORAGE_ADMIN_PIN = "kiosk_admin_pin_v1";
const STORAGE_DISCOUNTS = "kiosk_discounts_v1";
const STORAGE_SALES = "kiosk_sales_v1";
const STORAGE_EVENTS = "kiosk_events_v1";
const STORAGE_ACTIVE_EVENT = "kiosk_active_event_v1";
const STORAGE_CAPSULE = "kiosk_capsule_v1";
const STORAGE_SCRAP = "kiosk_scrap_v1";
const STORAGE_SITE_PASSWORD = "kiosk_site_password_v1";
const STORAGE_CLOUD_CONFIG = "kiosk_cloud_config_v1";
const DEFAULT_ADMIN_PIN = "1234";
const DEFAULT_CAPSULE_PRICE = 2;
const DEFAULT_SITE_PASSWORD = "1234";
const DEFAULT_CLOUD_SYNC_ID = "explizit-live";
const CLOUD_SYNC_TABLE = "merch_sync";
const CLOUD_SYNC_PULL_INTERVAL_MS = 20000;

const memoryStorage = new Map();

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStorage.delete(key);
  }
};

let queueCloudSync = () => {};
let suppressCloudPush = false;

const categoryNav = document.querySelector("#category-nav");
const productsGrid = document.querySelector("#products-grid");
const catalogEmpty = document.querySelector("#catalog-empty");
const cartItems = document.querySelector("#cart-items");
const subtotal = document.querySelector("#subtotal");
const grandTotal = document.querySelector("#grand-total");
const discountRow = document.querySelector("#discount-row");
const discountLabel = document.querySelector("#discount-label");
const discountAmount = document.querySelector("#discount-amount");
const discountInput = document.querySelector("#discount-input");
const applyDiscountBtn = document.querySelector("#apply-discount");
const clearDiscountBtn = document.querySelector("#clear-discount");
const discountCustomWrap = document.querySelector("#discount-custom-wrap");
const discountCustomAmountInput = document.querySelector("#discount-custom-amount");
const applyDiscountCustomBtn = document.querySelector("#apply-discount-custom");
const discountFeedback = document.querySelector("#discount-feedback");
const checkoutBtn = document.querySelector("#checkout-btn");
const clearCartBtn = document.querySelector("#clear-cart");
const openOrderBtn = document.querySelector("#open-order");
const backHomeBtn = document.querySelector("#back-home");
const homeView = document.querySelector("#home-view");
const orderView = document.querySelector("#order-view");
const openAdminButtons = [...document.querySelectorAll(".open-admin-trigger")];
const productCardTemplate = document.querySelector("#product-card-template");
const cartItemTemplate = document.querySelector("#cart-item-template");
const checkoutDialog = document.querySelector("#checkout-dialog");
const closeDialogBtn = document.querySelector("#close-dialog");
const checkoutText = document.querySelector("#checkout-text");
const bandNameEl = document.querySelector("#band-name");
const tourLabelEl = document.querySelector("#tour-label");
const heroTaglineEl = document.querySelector("#hero-tagline");
const homeEventLabel = document.querySelector("#home-event-label");
const orderEventLabel = document.querySelector("#order-event-label");
const accessGate = document.querySelector("#access-gate");
const accessForm = document.querySelector("#access-form");
const accessInput = document.querySelector("#access-input");
const accessError = document.querySelector("#access-error");

const adminDialog = document.querySelector("#admin-dialog");
const closeAdminBtn = document.querySelector("#close-admin");
const openDashboardBtn = document.querySelector("#open-dashboard");
const brandingForm = document.querySelector("#branding-form");
const productForm = document.querySelector("#product-form");
const newProductBtn = document.querySelector("#new-product");
const adminProducts = document.querySelector("#admin-products");
const inventoryList = document.querySelector("#inventory-list");
const scrapList = document.querySelector("#scrap-list");
const pinForm = document.querySelector("#pin-form");
const sitePasswordForm = document.querySelector("#site-password-form");
const discountForm = document.querySelector("#discount-form");
const newDiscountBtn = document.querySelector("#new-discount");
const discountList = document.querySelector("#discount-list");
const dataExportBtn = document.querySelector("#data-export");
const dataImportBtn = document.querySelector("#data-import");
const dataImportFileInput = document.querySelector("#data-import-file");
const dataSyncFeedback = document.querySelector("#data-sync-feedback");
const cloudSyncForm = document.querySelector("#cloud-sync-form");
const cloudSyncEnabledInput = document.querySelector("#cloud-sync-enabled");
const cloudSyncUrlInput = document.querySelector("#cloud-sync-url");
const cloudSyncAnonKeyInput = document.querySelector("#cloud-sync-anon-key");
const cloudSyncIdInput = document.querySelector("#cloud-sync-id");
const cloudSyncNowBtn = document.querySelector("#cloud-sync-now");
const cloudSyncPullForceBtn = document.querySelector("#cloud-sync-pull-force");
const cloudSyncFeedback = document.querySelector("#cloud-sync-feedback");
const capsuleEnabledInput = document.querySelector("#capsule-enabled");
const capsulePriceInput = document.querySelector("#capsule-price");
const capsuleForm = document.querySelector("#capsule-form");
const newCapsuleEntryBtn = document.querySelector("#new-capsule-entry");
const capsuleList = document.querySelector("#capsule-list");
const eventForm = document.querySelector("#event-form");
const newEventBtn = document.querySelector("#new-event");
const eventList = document.querySelector("#event-list");
const eventProductPicks = document.querySelector("#event-product-picks");
const activeEventSelect = document.querySelector("#active-event-select");
const dashboardDialog = document.querySelector("#dashboard-dialog");
const closeDashboardBtn = document.querySelector("#close-dashboard");
const dashboardFilterForm = document.querySelector("#dashboard-filter-form");
const dashPeriod = document.querySelector("#dash-period");
const dashFrom = document.querySelector("#dash-from");
const dashTo = document.querySelector("#dash-to");
const dashCategory = document.querySelector("#dash-category");
const dashProduct = document.querySelector("#dash-product");
const dashEvent = document.querySelector("#dash-event");
const dashRevenue = document.querySelector("#dash-revenue");
const dashItems = document.querySelector("#dash-items");
const dashOrders = document.querySelector("#dash-orders");
const dashDiscount = document.querySelector("#dash-discount");
const dashItemList = document.querySelector("#dash-item-list");
const dashPie = document.querySelector("#dash-pie");
const dashPieLegend = document.querySelector("#dash-pie-legend");
const dashBar = document.querySelector("#dash-bar");

const variantDialog = document.querySelector("#variant-dialog");
const closeVariantBtn = document.querySelector("#close-variant");
const variantTitle = document.querySelector("#variant-title");
const variantSubtitle = document.querySelector("#variant-subtitle");
const variantOptions = document.querySelector("#variant-options");

const formatPrice = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
const parseEuroInput = (value) => Number(String(value ?? "").trim().replace(",", "."));
const chartPalette = ["#f2ef00", "#d4d300", "#6df2e8", "#5fb7ff", "#ff8a5b", "#b48cff", "#9bf25b", "#ffe08c"];
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
const resolveImageUrl = (value) => {
  const src = String(value || "").trim();
  if (!src) {
    return "";
  }
  return src.startsWith("data:") ? src : encodeURI(src);
};
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });

const canUseDialogApi = (dialog) => dialog && typeof dialog.showModal === "function" && typeof dialog.close === "function";

const openDialog = (dialog) => {
  if (!dialog) {
    return;
  }
  if (canUseDialogApi(dialog)) {
    try {
      dialog.showModal();
      return;
    } catch {
      // Fallback below.
    }
  }
  dialog.setAttribute("open", "");
};

const closeDialog = (dialog) => {
  if (!dialog) {
    return;
  }
  if (canUseDialogApi(dialog)) {
    try {
      dialog.close();
      return;
    } catch {
      // Fallback below.
    }
  }
  dialog.removeAttribute("open");
};

const normalizeVariant = (variant, fallbackPrice = 0) => {
  const price = Number(variant?.price ?? fallbackPrice);
  const stock = Math.max(0, Number(variant?.stock ?? 0));
  const sold = Math.max(0, Number(variant?.sold ?? 0));
  const label = String(variant?.label ?? "Standard").trim() || "Standard";
  const id = slugify(variant?.id || label);

  return {
    id,
    label,
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) ? stock : 0,
    sold: Number.isFinite(sold) ? sold : 0
  };
};

const normalizeLegacyProduct = (product) => {
  const basePrice = Number(product?.price ?? 0);
  const legacyStock = Number(product?.stock ?? 12);
  const variant = normalizeVariant(
    {
      id: "standard",
      label: "Standard",
      price: basePrice,
      stock: Number.isFinite(legacyStock) ? legacyStock : 12,
      sold: Number(product?.sold ?? 0)
    },
    basePrice
  );

  return {
    id: slugify(product?.id || product?.name || "product"),
    name: String(product?.name ?? "Produkt").trim() || "Produkt",
    category: String(product?.category ?? "Allgemein").trim() || "Allgemein",
    meta: String(product?.meta ?? "").trim(),
    image: String(product?.image ?? "").trim(),
    basePrice: variant.price,
    variants: [variant]
  };
};

const normalizeProduct = (product) => {
  if (!Array.isArray(product?.variants)) {
    return normalizeLegacyProduct(product);
  }

  const basePrice = Number(product?.basePrice ?? product?.variants?.[0]?.price ?? 0);
  const variants = product.variants
    .map((variant) => normalizeVariant(variant, basePrice))
    .filter((variant) => variant.label.length > 0);

  return {
    id: slugify(product?.id || product?.name || "product"),
    name: String(product?.name ?? "Produkt").trim() || "Produkt",
    category: String(product?.category ?? "Allgemein").trim() || "Allgemein",
    meta: String(product?.meta ?? "").trim(),
    image: String(product?.image ?? "").trim(),
    basePrice: Number.isFinite(basePrice) ? basePrice : 0,
    variants: variants.length > 0 ? variants : [normalizeVariant({ label: "Standard", stock: 0 }, basePrice)]
  };
};

const cloneProducts = (products) => products.map((product) => normalizeProduct(product));

const normalizeDiscount = (item) => {
  const code = String(item?.code ?? "").trim().toUpperCase();
  const typeRaw = String(item?.type ?? "percent");
  const type = typeRaw === "fixed" || typeRaw === "custom" ? typeRaw : "percent";
  const value = Math.max(0, Number(item?.value ?? 0));
  return {
    id: String(item?.id ?? slugify(code || "discount")),
    code,
    type,
    value: Number.isFinite(value) ? value : 0
  };
};

const normalizeSale = (item) => ({
  id: String(item?.id ?? `sale-${Date.now()}`),
  ts: Number(item?.ts ?? Date.now()),
  gross: Math.max(0, Number(item?.gross ?? 0)),
  discount: Math.max(0, Number(item?.discount ?? 0)),
  net: Math.max(0, Number(item?.net ?? 0)),
  discountCode: String(item?.discountCode ?? "").toUpperCase(),
  eventId: String(item?.eventId ?? "").trim(),
  eventName: String(item?.eventName ?? "").trim(),
  eventLocation: String(item?.eventLocation ?? "").trim(),
  eventDate: String(item?.eventDate ?? "").trim(),
  items: Array.isArray(item?.items)
    ? item.items.map((line) => ({
        productId: String(line?.productId ?? ""),
        productName: String(line?.productName ?? "").trim(),
        category: String(line?.category ?? "").trim(),
        variantId: String(line?.variantId ?? ""),
        variantLabel: String(line?.variantLabel ?? "").trim(),
        qty: Math.max(0, Number(line?.qty ?? 0)),
        unitPrice: Math.max(0, Number(line?.unitPrice ?? 0)),
        lineGross: Math.max(0, Number(line?.lineGross ?? 0)),
        source: String(line?.source ?? "normal")
      }))
    : []
});

const normalizeEvent = (item, fallbackName = "Veranstaltung") => {
  const name = String(item?.name ?? fallbackName).trim() || fallbackName;
  const location = String(item?.location ?? "").trim();
  const date = String(item?.date ?? "").trim();
  return {
    id: slugify(item?.id || name || fallbackName),
    name,
    location,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    productIds: Array.isArray(item?.productIds)
      ? [...new Set(item.productIds.map((id) => String(id).trim()).filter(Boolean))]
      : []
  };
};

const normalizeCapsuleEntry = (item, index = 0) => {
  const qty = Math.max(0, Number(item?.qty ?? 0));
  return {
    id: String(item?.id ?? `capsule-${index + 1}`),
    productId: String(item?.productId ?? "").trim(),
    variantId: String(item?.variantId ?? "").trim(),
    qty: Number.isFinite(qty) ? qty : 0
  };
};

const normalizeScrapEntry = (item, index = 0) => {
  const qty = Math.max(0, Math.floor(Number(item?.qty ?? 0)));
  const productId = String(item?.productId ?? "").trim();
  const variantId = String(item?.variantId ?? "").trim();
  const updatedTs = Number(item?.updatedTs ?? item?.ts ?? Date.now());
  return {
    id: String(item?.id ?? `scrap-${slugify(productId || "item")}-${slugify(variantId || "variant")}-${index + 1}`),
    productId,
    variantId,
    qty: Number.isFinite(qty) ? qty : 0,
    updatedTs: Number.isFinite(updatedTs) ? updatedTs : Date.now()
  };
};

const normalizeBrandingData = (parsed) => ({
  appTitle: String(parsed?.appTitle ?? defaultBranding.appTitle).trim() || defaultBranding.appTitle,
  bandName: String(parsed?.bandName ?? defaultBranding.bandName).trim() || defaultBranding.bandName,
  tourLabel: String(parsed?.tourLabel ?? defaultBranding.tourLabel).trim() || defaultBranding.tourLabel,
  tagline: String(parsed?.tagline ?? defaultBranding.tagline).trim() || defaultBranding.tagline
});

const normalizeCapsuleConfigData = (parsed) => {
  const enabled = Boolean(parsed?.enabled);
  const rawPrice = Number(parsed?.price ?? DEFAULT_CAPSULE_PRICE);
  const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : DEFAULT_CAPSULE_PRICE;
  const entries = Array.isArray(parsed?.entries) ? parsed.entries.map((item, index) => normalizeCapsuleEntry(item, index)) : [];
  return { enabled, price, entries };
};

const normalizeCloudConfig = (parsed) => {
  const enabled = Boolean(parsed?.enabled);
  const url = String(parsed?.url ?? "").trim();
  const anonKey = String(parsed?.anonKey ?? "").trim();
  const rawSyncId = String(parsed?.syncId ?? DEFAULT_CLOUD_SYNC_ID).trim();
  const syncId = slugify(rawSyncId) || DEFAULT_CLOUD_SYNC_ID;
  return { enabled, url, anonKey, syncId };
};

const makeDefaultEventForCatalog = (catalog) => ({
  id: "default-event",
  name: "Standard-Verkauf",
  location: "",
  date: "",
  productIds: catalog.map((product) => product.id)
});

const loadProducts = () => {
  try {
    const raw = safeGetItem(STORAGE_PRODUCTS) || safeGetItem(STORAGE_PRODUCTS_LEGACY);
    if (!raw) {
      return cloneProducts(defaultProducts);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return cloneProducts(defaultProducts);
    }

    const normalized = parsed.map((item) => normalizeProduct(item));
    return normalized.length > 0 ? normalized : cloneProducts(defaultProducts);
  } catch {
    return cloneProducts(defaultProducts);
  }
};

const loadBranding = () => {
  try {
    const raw = safeGetItem(STORAGE_BRANDING);
    if (!raw) {
      return { ...defaultBranding };
    }

    const parsed = JSON.parse(raw);
    return {
      appTitle: String(parsed.appTitle ?? defaultBranding.appTitle).trim() || defaultBranding.appTitle,
      bandName: String(parsed.bandName ?? defaultBranding.bandName).trim() || defaultBranding.bandName,
      tourLabel: String(parsed.tourLabel ?? defaultBranding.tourLabel).trim() || defaultBranding.tourLabel,
      tagline: String(parsed.tagline ?? defaultBranding.tagline).trim() || defaultBranding.tagline
    };
  } catch {
    return { ...defaultBranding };
  }
};

const loadDiscounts = () => {
  try {
    const raw = safeGetItem(STORAGE_DISCOUNTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeDiscount(item))
      .filter((item) => item.code && (item.type === "custom" ? item.value >= 0 : item.value > 0));
  } catch {
    return [];
  }
};

const loadSales = () => {
  try {
    const raw = safeGetItem(STORAGE_SALES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => normalizeSale(item)).filter((sale) => sale.items.length > 0);
  } catch {
    return [];
  }
};

const loadEvents = (catalog) => {
  const defaultEvent = {
    id: "default-event",
    name: "Standard-Verkauf",
    location: "",
    date: "",
    productIds: catalog.map((product) => product.id)
  };

  try {
    const raw = safeGetItem(STORAGE_EVENTS);
    if (!raw) {
      return [defaultEvent];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [defaultEvent];
    }

    const normalized = parsed.map((item, index) => normalizeEvent(item, `Veranstaltung ${index + 1}`));
    return normalized.length > 0 ? normalized : [defaultEvent];
  } catch {
    return [defaultEvent];
  }
};

const loadCapsuleConfig = () => {
  const fallback = { enabled: false, price: DEFAULT_CAPSULE_PRICE, entries: [] };
  try {
    const raw = safeGetItem(STORAGE_CAPSULE);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const enabled = Boolean(parsed?.enabled);
    const rawPrice = Number(parsed?.price ?? DEFAULT_CAPSULE_PRICE);
    const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : DEFAULT_CAPSULE_PRICE;
    const entries = Array.isArray(parsed?.entries) ? parsed.entries.map((item, index) => normalizeCapsuleEntry(item, index)) : [];
    return { enabled, price, entries };
  } catch {
    return fallback;
  }
};

const loadScrapEntries = () => {
  try {
    const raw = safeGetItem(STORAGE_SCRAP);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item, index) => normalizeScrapEntry(item, index)).filter((item) => item.qty > 0);
  } catch {
    return [];
  }
};

const loadCloudConfig = () => {
  try {
    const raw = safeGetItem(STORAGE_CLOUD_CONFIG);
    if (!raw) {
      return normalizeCloudConfig({});
    }
    const parsed = JSON.parse(raw);
    return normalizeCloudConfig(parsed);
  } catch {
    return normalizeCloudConfig({});
  }
};

const saveCloudConfig = () => safeSetItem(STORAGE_CLOUD_CONFIG, JSON.stringify(cloudConfig));

const saveProducts = () => {
  safeSetItem(STORAGE_PRODUCTS, JSON.stringify(products));
  safeRemoveItem(STORAGE_PRODUCTS_LEGACY);
  if (!suppressCloudPush) {
    queueCloudSync("products");
  }
};

const saveBranding = () => {
  safeSetItem(STORAGE_BRANDING, JSON.stringify(branding));
  if (!suppressCloudPush) {
    queueCloudSync("branding");
  }
};
const loadAdminPin = () => safeGetItem(STORAGE_ADMIN_PIN) || DEFAULT_ADMIN_PIN;
const saveAdminPin = (pin) => {
  safeSetItem(STORAGE_ADMIN_PIN, pin);
  if (!suppressCloudPush) {
    queueCloudSync("admin-pin");
  }
};
const loadSitePassword = () => String(safeGetItem(STORAGE_SITE_PASSWORD) || DEFAULT_SITE_PASSWORD).trim();
const saveSitePassword = (password) => {
  safeSetItem(STORAGE_SITE_PASSWORD, String(password).trim());
  if (!suppressCloudPush) {
    queueCloudSync("site-password");
  }
};
const saveDiscounts = () => {
  safeSetItem(STORAGE_DISCOUNTS, JSON.stringify(discountCodes));
  if (!suppressCloudPush) {
    queueCloudSync("discounts");
  }
};
const saveSales = () => {
  safeSetItem(STORAGE_SALES, JSON.stringify(salesLog));
  if (!suppressCloudPush) {
    queueCloudSync("sales");
  }
};
const saveEvents = () => {
  safeSetItem(STORAGE_EVENTS, JSON.stringify(events));
  if (!suppressCloudPush) {
    queueCloudSync("events");
  }
};
const saveActiveEventId = () => {
  safeSetItem(STORAGE_ACTIVE_EVENT, activeEventId);
  if (!suppressCloudPush) {
    queueCloudSync("active-event");
  }
};
const saveCapsuleConfig = () => {
  safeSetItem(STORAGE_CAPSULE, JSON.stringify(capsuleConfig));
  if (!suppressCloudPush) {
    queueCloudSync("capsule");
  }
};
const saveScrapEntries = () => {
  safeSetItem(STORAGE_SCRAP, JSON.stringify(scrapEntries));
  if (!suppressCloudPush) {
    queueCloudSync("scrap");
  }
};

let products = loadProducts();
let branding = loadBranding();
let adminPin = loadAdminPin();
let sitePassword = loadSitePassword();
let discountCodes = loadDiscounts();
let salesLog = loadSales();
let events = loadEvents(products);
let activeEventId = String(safeGetItem(STORAGE_ACTIVE_EVENT) || "");
let capsuleConfig = loadCapsuleConfig();
let scrapEntries = loadScrapEntries();
let cloudConfig = loadCloudConfig();
let appliedDiscountCode = "";
let appliedDiscountCustomAmount = 0;
let categories = [];
let activeCategory = "Alle";
let selectedProductId = "";

if (String(sitePassword).trim().length < 4) {
  sitePassword = DEFAULT_SITE_PASSWORD;
  saveSitePassword(sitePassword);
}

const cart = new Map();
const cloudClientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let cloudClient = null;
let cloudClientIdentity = "";
let cloudPullInterval = 0;
let cloudPushTimeout = 0;
let cloudPullRunning = false;
let cloudPushRunning = false;
let cloudLastRemoteTs = 0;
let cloudBootstrapDone = false;

const cartKey = (productId, variantId, source = "normal", refId = "") =>
  `${productId}::${variantId}::${source}${refId ? `::${refId}` : ""}`;

const getProductById = (productId) => products.find((product) => product.id === productId);
const getVariantById = (product, variantId) => product?.variants.find((variant) => variant.id === variantId);
const getEventById = (eventId) => events.find((eventItem) => eventItem.id === eventId);
const getDisplayDate = (isoDate) => {
  if (!isoDate) {
    return "";
  }
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) {
    return "";
  }
  return `${day}.${month}.${year}`;
};
const eventLabel = (eventItem) => {
  if (!eventItem) {
    return "Keine Veranstaltung";
  }
  const parts = [eventItem.name];
  if (eventItem.location) {
    parts.push(eventItem.location);
  }
  if (eventItem.date) {
    parts.push(getDisplayDate(eventItem.date));
  }
  return parts.join(" • ");
};
const ensureEventsIntegrity = () => {
  const validProductIds = new Set(products.map((product) => product.id));
  if (!Array.isArray(events) || events.length === 0) {
    events = [
      {
        id: "default-event",
        name: "Standard-Verkauf",
        location: "",
        date: "",
        productIds: [...validProductIds]
      }
    ];
  }

  const seenIds = new Set();
  events = events.map((eventItem, index) => {
    const normalized = normalizeEvent(eventItem, `Veranstaltung ${index + 1}`);
    let nextId = normalized.id || `event-${index + 1}`;
    let bump = 2;
    while (seenIds.has(nextId)) {
      nextId = `${normalized.id || "event"}-${bump}`;
      bump += 1;
    }
    seenIds.add(nextId);
    return {
      ...normalized,
      id: nextId,
      productIds: normalized.productIds.filter((id) => validProductIds.has(id))
    };
  });

  if (!events.some((eventItem) => eventItem.id === activeEventId)) {
    activeEventId = events[0]?.id || "";
  }
  saveEvents();
  saveActiveEventId();
};
const getActiveEvent = () => getEventById(activeEventId) || events[0] || null;
const isProductAllowedForActiveEvent = (productId) => {
  const activeEvent = getActiveEvent();
  if (!activeEvent) {
    return false;
  }
  return activeEvent.productIds.includes(productId);
};
const updateActiveEventLabels = () => {
  const activeEvent = getActiveEvent();
  const text = activeEvent ? `Aktive Veranstaltung: ${eventLabel(activeEvent)}` : "Keine aktive Veranstaltung";
  if (homeEventLabel) {
    homeEventLabel.textContent = text;
  }
  if (orderEventLabel) {
    orderEventLabel.textContent = text;
  }
};
const setActiveEvent = (eventId) => {
  const found = getEventById(eventId);
  if (!found) {
    return;
  }
  activeEventId = found.id;
  saveActiveEventId();
  renderActiveEventSelect();
  updateActiveEventLabels();
  syncCartWithCatalog();
  rebuildCategories();
  renderCategories();
  renderProducts();
  renderCart();
  renderVariantDialog();
};
const getCapsuleEntryById = (entryId) => capsuleConfig.entries.find((entry) => entry.id === entryId);
const getCapsuleInCartQty = (entryId) => {
  if (!entryId) {
    return 0;
  }
  let qty = 0;
  cart.forEach((line) => {
    if (line.source === "capsule" && line.capsuleEntryId === entryId) {
      qty += line.qty;
    }
  });
  return qty;
};
const getCapsuleRemainingQty = (entry) => Math.max(0, entry.qty - getCapsuleInCartQty(entry.id));
const ensureCapsuleIntegrity = () => {
  const before = JSON.stringify(capsuleConfig);
  const rawPrice = Number(capsuleConfig.price ?? DEFAULT_CAPSULE_PRICE);
  const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? Math.round(rawPrice * 100) / 100 : DEFAULT_CAPSULE_PRICE;
  const validEntries = [];
  const seenIds = new Set();
  (capsuleConfig.entries || []).forEach((rawEntry, index) => {
    const entry = normalizeCapsuleEntry(rawEntry, index);
    const product = getProductById(entry.productId);
    const variant = getVariantById(product, entry.variantId);
    if (!product || !variant) {
      return;
    }
    let nextId = entry.id || `capsule-${index + 1}`;
    let bump = 2;
    while (seenIds.has(nextId)) {
      nextId = `${entry.id || "capsule"}-${bump}`;
      bump += 1;
    }
    seenIds.add(nextId);
    validEntries.push({ ...entry, id: nextId });
  });
  capsuleConfig = {
    enabled: Boolean(capsuleConfig.enabled),
    price,
    entries: validEntries
  };
  if (JSON.stringify(capsuleConfig) !== before) {
    saveCapsuleConfig();
  }
};
const makeScrapEntryId = (productId, variantId) => `scrap-${slugify(productId)}-${slugify(variantId)}`;
const ensureScrapIntegrity = () => {
  const before = JSON.stringify(scrapEntries);
  const merged = new Map();
  (scrapEntries || []).forEach((rawEntry, index) => {
    const entry = normalizeScrapEntry(rawEntry, index);
    if (!entry.productId || !entry.variantId || entry.qty <= 0) {
      return;
    }
    const product = getProductById(entry.productId);
    const variant = getVariantById(product, entry.variantId);
    if (!product || !variant) {
      return;
    }
    const id = makeScrapEntryId(entry.productId, entry.variantId);
    const existing = merged.get(id);
    if (existing) {
      existing.qty += entry.qty;
      existing.updatedTs = Math.max(existing.updatedTs, entry.updatedTs);
    } else {
      merged.set(id, { ...entry, id });
    }
  });
  scrapEntries = [...merged.values()];
  if (JSON.stringify(scrapEntries) !== before) {
    saveScrapEntries();
  }
};
const getCapsuleEntriesForVariant = (productId, variantId) =>
  capsuleConfig.entries
    .filter((entry) => entry.productId === productId && entry.variantId === variantId)
    .map((entry) => ({ entry, left: getCapsuleRemainingQty(entry) }))
    .filter((row) => row.left > 0);
const getCapsuleRemainingForVariant = (productId, variantId) =>
  getCapsuleEntriesForVariant(productId, variantId).reduce((sum, row) => sum + row.left, 0);
const pickCapsuleEntryForVariant = (productId, variantId) => getCapsuleEntriesForVariant(productId, variantId)[0]?.entry || null;
const getCartSubtotal = () => [...cart.values()].reduce((sum, item) => sum + item.qty * item.price, 0);
const getActiveDiscount = () =>
  discountCodes.find((discount) => discount.code.toUpperCase() === String(appliedDiscountCode || "").toUpperCase()) || null;
const getDiscountValue = (subtotalValue) => {
  const active = getActiveDiscount();
  if (!active || subtotalValue <= 0) {
    return 0;
  }

  let raw = 0;
  if (active.type === "percent") {
    raw = subtotalValue * (active.value / 100);
  } else if (active.type === "fixed") {
    raw = active.value;
  } else {
    const customValue = Math.max(0, Number(appliedDiscountCustomAmount || 0));
    raw = active.value > 0 ? Math.min(customValue, active.value) : customValue;
  }
  return Math.max(0, Math.min(subtotalValue, raw));
};
const getGrandTotalValue = (subtotalValue) => Math.max(0, subtotalValue - getDiscountValue(subtotalValue));

const getInCartQty = (productId, variantId) => {
  let qty = 0;
  cart.forEach((line) => {
    if (line.productId === productId && line.variantId === variantId) {
      qty += line.qty;
    }
  });
  return qty;
};

const remainingStock = (productId, variantId) => {
  const product = getProductById(productId);
  const variant = getVariantById(product, variantId);
  if (!variant) {
    return 0;
  }
  return Math.max(0, variant.stock - getInCartQty(productId, variantId));
};

const isSellableProduct = (product) => product.variants.some((variant) => variant.stock > 0);
const sellableProducts = () =>
  products.filter((product) => isProductAllowedForActiveEvent(product.id) && isSellableProduct(product));

const rebuildCategories = () => {
  categories = ["Alle", ...new Set(sellableProducts().map((product) => product.category))];
  if (!categories.includes(activeCategory)) {
    activeCategory = "Alle";
  }
};

const applyBranding = () => {
  document.title = branding.appTitle;
  if (bandNameEl) {
    bandNameEl.textContent = branding.bandName;
  }
  if (tourLabelEl) {
    tourLabelEl.textContent = branding.tourLabel;
  }
  if (heroTaglineEl) {
    heroTaglineEl.textContent = branding.tagline;
  }

  if (brandingForm) {
    brandingForm.elements.appTitle.value = branding.appTitle;
    brandingForm.elements.bandName.value = branding.bandName;
    brandingForm.elements.tourLabel.value = branding.tourLabel;
    brandingForm.elements.tagline.value = branding.tagline;
  }
};

const visibleProducts = () => {
  const available = sellableProducts();
  return activeCategory === "Alle"
    ? available
    : available.filter((product) => product.category === activeCategory);
};

const getProductAvailableStock = (product) =>
  product.variants.reduce((sum, variant) => sum + remainingStock(product.id, variant.id), 0);

const clearAccessError = () => {
  if (accessError) {
    accessError.hidden = true;
  }
};

const showAccessError = (message) => {
  if (!accessError) {
    return;
  }
  accessError.textContent = message || "Passwort ist falsch.";
  accessError.hidden = false;
};

const lockSiteAccess = () => {
  document.body.classList.add("access-locked");
  if (accessGate) {
    accessGate.hidden = false;
  }
  clearAccessError();
  if (accessInput) {
    accessInput.value = "";
    window.requestAnimationFrame(() => accessInput.focus());
  }
};

const unlockSiteAccess = () => {
  document.body.classList.remove("access-locked");
  if (accessGate) {
    accessGate.hidden = true;
  }
  clearAccessError();
};

const showHomeView = () => {
  updateActiveEventLabels();
  if (homeView) {
    homeView.classList.remove("hidden");
  }
  if (orderView) {
    orderView.classList.add("hidden");
  }
  closeDialog(variantDialog);
};

const showOrderView = () => {
  ensureEventsIntegrity();
  ensureCapsuleIntegrity();
  updateActiveEventLabels();
  if (homeView) {
    homeView.classList.add("hidden");
  }
  if (orderView) {
    orderView.classList.remove("hidden");
  }
  rebuildCategories();
  renderCategories();
  renderProducts();
  renderCart();
};

const renderCategories = () => {
  if (!categoryNav) {
    return;
  }

  categoryNav.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.classList.toggle("active", category === activeCategory);
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderProducts();
    });
    categoryNav.appendChild(button);
  });
};

const renderProducts = () => {
  if (!productsGrid || !productCardTemplate) {
    return;
  }

  productsGrid.replaceChildren();
  const toShow = visibleProducts();

  if (catalogEmpty) {
    catalogEmpty.hidden = toShow.length > 0;
  }

  toShow.forEach((product) => {
    const card = productCardTemplate.content.firstElementChild.cloneNode(true);
    const thumb = card.querySelector(".thumb");
    const title = card.querySelector("h3");

    if (title) {
      title.textContent = product.name;
    }

    const available = getProductAvailableStock(product);

    if (thumb) {
      const imageUrl = resolveImageUrl(product.image);
      if (imageUrl) {
        thumb.style.backgroundImage =
          `linear-gradient(to top, rgba(8, 10, 16, 0.9), rgba(8, 10, 16, 0.2)), url("${imageUrl}")`;
      } else {
        thumb.style.removeProperty("background-image");
      }
      thumb.dataset.category = product.category;
    }

    card.setAttribute("role", "button");
    card.tabIndex = available > 0 ? 0 : -1;
    card.classList.toggle("is-disabled", available <= 0);
    if (available > 0) {
      card.addEventListener("click", () => {
        selectedProductId = product.id;
        renderVariantDialog();
        openDialog(variantDialog);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        selectedProductId = product.id;
        renderVariantDialog();
        openDialog(variantDialog);
      });
    }

    productsGrid.appendChild(card);
  });
};

const addToCart = (productId, variantId, options = {}) => {
  const product = getProductById(productId);
  const variant = getVariantById(product, variantId);
  const source = options.source === "capsule" ? "capsule" : options.source === "free" ? "free" : "normal";

  if (!product || !variant) {
    return false;
  }

  if ((source === "normal" || source === "free") && !isProductAllowedForActiveEvent(productId)) {
    return false;
  }

  if (remainingStock(productId, variantId) <= 0) {
    return false;
  }

  let capsuleEntryId = "";
  let price = variant.price;
  let displayName = product.name;
  if (source === "capsule") {
    if (!capsuleConfig.enabled) {
      return false;
    }
    const entry = getCapsuleEntryById(String(options.capsuleEntryId || "")) || pickCapsuleEntryForVariant(productId, variantId);
    if (!entry || entry.productId !== productId || entry.variantId !== variantId) {
      return false;
    }
    if (getCapsuleRemainingQty(entry) <= 0) {
      return false;
    }
    capsuleEntryId = entry.id;
    price = capsuleConfig.price;
    displayName = `${product.name} [Automat]`;
  } else if (source === "free") {
    price = 0;
    displayName = `${product.name} [Gratis]`;
  }

  const key = cartKey(productId, variantId, source, source === "capsule" ? capsuleEntryId : "");
  const existing = cart.get(key);

  if (existing) {
    existing.qty += 1;
    cart.set(key, existing);
  } else {
    cart.set(key, {
      key,
      productId,
      variantId,
      name: displayName,
      variantLabel: variant.label,
      price,
      qty: 1,
      source,
      capsuleEntryId
    });
  }

  return true;
};

const declareScrap = (productId, variantId, qty = 1) => {
  const product = getProductById(productId);
  const variant = getVariantById(product, variantId);
  const amount = Math.max(1, Math.floor(Number(qty) || 1));

  if (!product || !variant) {
    return false;
  }
  if (!isProductAllowedForActiveEvent(productId)) {
    return false;
  }
  if (variant.stock < amount) {
    return false;
  }

  variant.stock -= amount;

  const entryId = makeScrapEntryId(productId, variantId);
  const existing = scrapEntries.find((entry) => entry.id === entryId);
  if (existing) {
    existing.qty += amount;
    existing.updatedTs = Date.now();
  } else {
    scrapEntries.push({
      id: entryId,
      productId,
      variantId,
      qty: amount,
      updatedTs: Date.now()
    });
  }

  saveProducts();
  saveScrapEntries();
  syncCartWithCatalog();
  rebuildCategories();
  renderCategories();
  renderProducts();
  renderCart();
  renderVariantDialog();
  renderAdminProducts();
  renderInventory();
  renderCapsuleList();
  renderScrapList();
  return true;
};

const changeQty = (key, delta) => {
  const line = cart.get(key);
  if (!line) {
    return;
  }

  if (delta > 0) {
    if (line.source === "capsule") {
      return;
    }
    if (remainingStock(line.productId, line.variantId) <= 0) {
      return;
    }
    line.qty += 1;
    cart.set(key, line);
  } else {
    line.qty -= 1;
    if (line.qty <= 0) {
      cart.delete(key);
    } else {
      cart.set(key, line);
    }
  }

  renderCart();
  renderProducts();
  renderVariantDialog();
};

const renderCart = () => {
  if (!cartItems || !cartItemTemplate) {
    return;
  }

  cartItems.replaceChildren();

  if (cart.size === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Noch keine Artikel ausgewählt.";
    empty.className = "cart-item";
    cartItems.appendChild(empty);
  } else {
    cart.forEach((item) => {
      const line = cartItemTemplate.content.firstElementChild.cloneNode(true);
      line.querySelector(".cart-name").textContent = `${item.name} (${item.variantLabel})`;
      const cartPriceEl = line.querySelector(".cart-price");
      if (cartPriceEl) {
        cartPriceEl.textContent = item.source === "free" ? "Gratis" : `${formatPrice(item.price)} pro Stück`;
        cartPriceEl.classList.toggle("capsule", item.source === "capsule");
        cartPriceEl.classList.toggle("free", item.source === "free");
      }
      line.querySelector(".qty").textContent = item.qty;
      line.querySelector(".minus").addEventListener("click", () => changeQty(item.key, -1));
      const plusBtn = line.querySelector(".plus");
      if (item.source === "capsule") {
        plusBtn.disabled = true;
        plusBtn.title = "Weitere Kugeln nur über den Automaten ziehen.";
      } else {
        plusBtn.addEventListener("click", () => changeQty(item.key, 1));
      }
      cartItems.appendChild(line);
    });
  }

  if (appliedDiscountCode && !getActiveDiscount()) {
    appliedDiscountCode = "";
    appliedDiscountCustomAmount = 0;
    if (discountInput) {
      discountInput.value = "";
    }
    if (discountCustomAmountInput) {
      discountCustomAmountInput.value = "";
    }
    if (discountFeedback) {
      discountFeedback.textContent = "Rabattcode nicht mehr gültig.";
    }
  }

  const subtotalValue = getCartSubtotal();
  const discountValue = getDiscountValue(subtotalValue);
  const grandTotalValue = getGrandTotalValue(subtotalValue);

  subtotal.textContent = formatPrice(subtotalValue);
  if (grandTotal) {
    grandTotal.textContent = formatPrice(grandTotalValue);
  }

  if (discountRow && discountLabel && discountAmount) {
    if (discountValue > 0 && getActiveDiscount()) {
      const active = getActiveDiscount();
      discountRow.hidden = false;
      if (active.type === "percent") {
        discountLabel.textContent = `Rabatt (${active.code} - ${active.value}%)`;
      } else if (active.type === "custom") {
        discountLabel.textContent = `Rabatt (${active.code} manuell)`;
      } else {
        discountLabel.textContent = `Rabatt (${active.code})`;
      }
      discountAmount.textContent = `- ${formatPrice(discountValue)}`;
    } else {
      discountRow.hidden = true;
      discountAmount.textContent = "- 0,00 €";
    }
  }

  if (discountCustomWrap && discountCustomAmountInput) {
    const active = getActiveDiscount();
    const isCustom = Boolean(active && active.type === "custom");
    discountCustomWrap.hidden = !isCustom;
    if (!isCustom) {
      discountCustomAmountInput.value = "";
      discountCustomAmountInput.removeAttribute("max");
    } else {
      if (active.value > 0) {
        discountCustomAmountInput.max = String(active.value);
        discountCustomAmountInput.placeholder = `max. ${active.value.toFixed(2).replace(".", ",")} EUR`;
      } else {
        discountCustomAmountInput.removeAttribute("max");
        discountCustomAmountInput.placeholder = "z. B. 5,00";
      }
      if (document.activeElement !== discountCustomAmountInput) {
        discountCustomAmountInput.value = appliedDiscountCustomAmount > 0 ? appliedDiscountCustomAmount.toFixed(2) : "";
      }
    }
  }

  checkoutBtn.disabled = cart.size === 0;
};

const renderVariantDialog = () => {
  if (!variantDialog || !variantTitle || !variantSubtitle || !variantOptions) {
    return;
  }

  const product = getProductById(selectedProductId);
  if (!product || !isProductAllowedForActiveEvent(product.id)) {
    variantTitle.textContent = "Variante wählen";
    variantSubtitle.textContent = "";
    variantOptions.replaceChildren();
    return;
  }

  variantTitle.textContent = product.name;
  variantSubtitle.textContent = `${product.category} • ${product.meta || ""}`;
  variantOptions.replaceChildren();

  product.variants.forEach((variant) => {
    const left = remainingStock(product.id, variant.id);
    const normalBtn = document.createElement("button");
    normalBtn.type = "button";
    normalBtn.className = "variant-btn";
    normalBtn.disabled = left <= 0;
    normalBtn.innerHTML = `<strong>${variant.label} • ${formatPrice(variant.price)}</strong><span>Verfügbar: ${left}</span>`;

    normalBtn.addEventListener("click", () => {
      const added = addToCart(product.id, variant.id);
      if (added) {
        closeDialog(variantDialog);
        renderCart();
        renderProducts();
      }
    });
    variantOptions.appendChild(normalBtn);

    const freeBtn = document.createElement("button");
    freeBtn.type = "button";
    freeBtn.className = "variant-btn free-mode";
    freeBtn.disabled = left <= 0;
    freeBtn.innerHTML = `<strong>${variant.label} • Gratis</strong><span>Verfügbar: ${left}</span>`;
    freeBtn.addEventListener("click", () => {
      const added = addToCart(product.id, variant.id, { source: "free" });
      if (added) {
        closeDialog(variantDialog);
        renderCart();
        renderProducts();
      }
    });
    variantOptions.appendChild(freeBtn);

    const scrapBtn = document.createElement("button");
    scrapBtn.type = "button";
    scrapBtn.className = "variant-btn scrap-mode";
    scrapBtn.disabled = left <= 0;
    scrapBtn.innerHTML = `<strong>${variant.label} • Ausschuss</strong><span>Bestand -1 • Verfügbar: ${left}</span>`;
    scrapBtn.addEventListener("click", () => {
      const marked = declareScrap(product.id, variant.id, 1);
      if (!marked) {
        renderVariantDialog();
      }
    });
    variantOptions.appendChild(scrapBtn);

    const hasCapsuleConfig = capsuleConfig.entries.some(
      (entry) => entry.productId === product.id && entry.variantId === variant.id
    );
    if (!capsuleConfig.enabled || !hasCapsuleConfig) {
      return;
    }

    const capsuleLeft = getCapsuleRemainingForVariant(product.id, variant.id);
    const capsuleBtn = document.createElement("button");
    capsuleBtn.type = "button";
    capsuleBtn.className = "variant-btn capsule-mode";
    capsuleBtn.disabled = capsuleLeft <= 0 || left <= 0;
    capsuleBtn.innerHTML = `<strong>${variant.label} • Kugelautomat ${formatPrice(capsuleConfig.price)}</strong><span>Im Automaten: ${capsuleLeft}</span>`;
    capsuleBtn.addEventListener("click", () => {
      const entry = pickCapsuleEntryForVariant(product.id, variant.id);
      if (!entry) {
        renderVariantDialog();
        return;
      }
      const added = addToCart(product.id, variant.id, { source: "capsule", capsuleEntryId: entry.id });
      if (added) {
        closeDialog(variantDialog);
        renderCart();
        renderProducts();
      }
    });
    variantOptions.appendChild(capsuleBtn);
  });
};

const syncCartWithCatalog = () => {
  const cleaned = new Map();

  cart.forEach((line) => {
    const product = getProductById(line.productId);
    const variant = getVariantById(product, line.variantId);
    if (!product || !variant) {
      return;
    }
    if ((line.source === "normal" || line.source === "free") && !isProductAllowedForActiveEvent(line.productId)) {
      return;
    }
    if (line.source === "capsule") {
      const entry = getCapsuleEntryById(line.capsuleEntryId);
      if (!entry || entry.productId !== line.productId || entry.variantId !== line.variantId) {
        return;
      }
    }

    let maxQty = variant.stock;
    if (line.source === "capsule") {
      const entry = getCapsuleEntryById(line.capsuleEntryId);
      if (entry) {
        maxQty = Math.min(maxQty, entry.qty);
      }
    }
    const qty = Math.max(0, Math.min(line.qty, maxQty));
    if (qty <= 0) {
      return;
    }

    const source = line.source === "capsule" ? "capsule" : line.source === "free" ? "free" : "normal";
    const key = cartKey(line.productId, line.variantId, source, source === "capsule" ? line.capsuleEntryId : "");
    cleaned.set(key, {
      key,
      productId: line.productId,
      variantId: line.variantId,
      name: source === "capsule" ? `${product.name} [Automat]` : source === "free" ? `${product.name} [Gratis]` : product.name,
      variantLabel: variant.label,
      price: source === "capsule" ? capsuleConfig.price : source === "free" ? 0 : variant.price,
      qty,
      source,
      capsuleEntryId: source === "capsule" ? line.capsuleEntryId : ""
    });
  });

  cart.clear();
  cleaned.forEach((value, key) => cart.set(key, value));
};

const checkout = () => {
  if (cart.size === 0) {
    return;
  }

  const missing = [];

  cart.forEach((line) => {
    const product = getProductById(line.productId);
    const variant = getVariantById(product, line.variantId);
    if (!product || !variant) {
      missing.push(`${line.name} (${line.variantLabel}) nicht mehr vorhanden`);
      return;
    }
    if ((line.source === "normal" || line.source === "free") && !isProductAllowedForActiveEvent(line.productId)) {
      missing.push(`${line.name} ist nicht für diese Veranstaltung freigegeben`);
      return;
    }
    if (line.source === "capsule") {
      const entry = getCapsuleEntryById(line.capsuleEntryId);
      if (!entry) {
        missing.push(`${line.name} nicht mehr im Automaten verfügbar`);
        return;
      }
      if (entry.qty < line.qty) {
        missing.push(`${line.name} nur noch ${entry.qty}x im Automaten`);
        return;
      }
    }

    if (variant.stock < line.qty) {
      missing.push(`${line.name} (${line.variantLabel}) nur noch ${variant.stock} verfügbar`);
    }
  });

  if (missing.length > 0) {
    checkoutText.textContent = `Verkauf nicht möglich: ${missing.join("; ")}.`;
    openDialog(checkoutDialog);
    syncCartWithCatalog();
    renderCart();
    renderProducts();
    return;
  }

  let soldCount = 0;
  let soldValue = 0;
  const saleItems = [];

  cart.forEach((line) => {
    const product = getProductById(line.productId);
    const variant = getVariantById(product, line.variantId);
    if (!product || !variant) {
      return;
    }

    variant.stock -= line.qty;
    variant.sold += line.qty;
    if (line.source === "capsule") {
      const entry = getCapsuleEntryById(line.capsuleEntryId);
      if (entry) {
        entry.qty = Math.max(0, entry.qty - line.qty);
      }
    }
    soldCount += line.qty;
    soldValue += line.qty * line.price;
    saleItems.push({
      productId: line.productId,
      productName: line.name,
      category: product.category,
      variantId: line.variantId,
      variantLabel: line.variantLabel,
      qty: line.qty,
      unitPrice: line.price,
      lineGross: line.qty * line.price,
      source: line.source || "normal"
    });
  });

  saveProducts();
  saveCapsuleConfig();
  cart.clear();

  const discountValue = getDiscountValue(soldValue);
  const finalValue = Math.max(0, soldValue - discountValue);
  const activeEvent = getActiveEvent();
  const saleEntry = normalizeSale({
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    gross: soldValue,
    discount: discountValue,
    net: finalValue,
    discountCode: getActiveDiscount()?.code || "",
    eventId: activeEvent?.id || "",
    eventName: activeEvent?.name || "",
    eventLocation: activeEvent?.location || "",
    eventDate: activeEvent?.date || "",
    items: saleItems
  });
  salesLog.push(saleEntry);
  saveSales();

  rebuildCategories();
  renderCategories();
  renderProducts();
  renderCart();
  renderAdminProducts();
  renderInventory();

  if (discountValue > 0 && getActiveDiscount()) {
    checkoutText.textContent = `Verkauf abgeschlossen: ${soldCount} Artikel. Zwischensumme ${formatPrice(
      soldValue
    )}, Rabatt ${formatPrice(discountValue)}, Gesamt ${formatPrice(finalValue)}. Bestand wurde aktualisiert.`;
  } else {
    checkoutText.textContent = `Verkauf abgeschlossen: ${soldCount} Artikel für ${formatPrice(
      finalValue
    )}. Bestand wurde aktualisiert.`;
  }
  openDialog(checkoutDialog);
};

const makeUniqueProductId = (name) => {
  const base = slugify(name);
  let candidate = base;
  let idx = 2;
  while (products.some((product) => product.id === candidate)) {
    candidate = `${base}-${idx}`;
    idx += 1;
  }
  return candidate;
};

const variantsToSpec = (variants) => variants.map((variant) => `${variant.label}:${variant.stock}`).join(", ");

const parseVariantSpec = (specText, basePrice, existingVariants = []) => {
  const rawParts = specText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const variants = [];
  const usedIds = new Set();

  rawParts.forEach((part) => {
    const [labelRaw, stockRaw] = part.split(":").map((item) => item.trim());
    const label = labelRaw || "Standard";
    const stock = Math.max(0, Number(stockRaw || 0));

    if (!label || !Number.isFinite(stock)) {
      return;
    }

    let id = slugify(label);
    let idx = 2;
    while (usedIds.has(id)) {
      id = `${slugify(label)}-${idx}`;
      idx += 1;
    }

    usedIds.add(id);

    const existingByLabel = existingVariants.find((variant) => variant.label.toLowerCase() === label.toLowerCase());
    variants.push({
      id,
      label,
      price: basePrice,
      stock,
      sold: existingByLabel ? existingByLabel.sold : 0
    });
  });

  if (variants.length === 0) {
    variants.push({ id: "standard", label: "Standard", price: basePrice, stock: 0, sold: 0 });
  }

  return variants;
};

const clearProductForm = () => {
  if (!productForm) {
    return;
  }
  productForm.reset();
  productForm.elements.productId.value = "";
  productForm.elements.variants.value = "Standard:0";
  productForm.elements.imageFile.value = "";
  productForm.elements.removeImage.checked = false;
};

const fillProductForm = (product) => {
  if (!productForm) {
    return;
  }
  productForm.elements.productId.value = product.id;
  productForm.elements.name.value = product.name;
  productForm.elements.category.value = product.category;
  productForm.elements.price.value = String(product.basePrice);
  productForm.elements.imageFile.value = "";
  productForm.elements.removeImage.checked = false;
  productForm.elements.meta.value = product.meta;
  productForm.elements.variants.value = variantsToSpec(product.variants);
};

const renderAdminProducts = () => {
  if (!adminProducts) {
    return;
  }

  adminProducts.replaceChildren();

  [...products]
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .forEach((product) => {
      const li = document.createElement("li");
      li.className = "admin-product";

      const infoWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = `${product.name} (${formatPrice(product.basePrice)})`;
      const meta = document.createElement("p");
      meta.textContent = `${product.category} • ${product.meta || "-"} • Varianten: ${product.variants
        .map((variant) => `${variant.label}:${variant.stock}`)
        .join(" | ")}`;
      infoWrap.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Bearbeiten";
      editBtn.addEventListener("click", () => fillProductForm(product));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Löschen";
      deleteBtn.addEventListener("click", () => {
        products = products.filter((item) => item.id !== product.id);
        events = events.map((eventItem) => ({
          ...eventItem,
          productIds: eventItem.productIds.filter((id) => id !== product.id)
        }));
        [...cart.keys()].forEach((key) => {
          if (key.startsWith(`${product.id}::`)) {
            cart.delete(key);
          }
        });

        saveProducts();
        ensureEventsIntegrity();
        ensureCapsuleIntegrity();
        ensureScrapIntegrity();
        syncCartWithCatalog();
        rebuildCategories();
        renderCategories();
        renderProducts();
        renderCart();
        renderAdminProducts();
        renderInventory();
        renderScrapList();
        renderCapsuleList();
        renderActiveEventSelect();
        renderEventList();
        clearCapsuleForm();
        clearEventForm();
        clearProductForm();
      });

      actions.append(editBtn, deleteBtn);
      li.append(infoWrap, actions);
      adminProducts.appendChild(li);
    });
};

const renderInventory = () => {
  if (!inventoryList) {
    return;
  }

  inventoryList.replaceChildren();

  products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .forEach((product) => {
      product.variants.forEach((variant) => {
        const row = document.createElement("li");
        row.className = "inventory-row";
        if (variant.stock <= 3) {
          row.classList.add("low");
        }

        const left = document.createElement("div");
        const name = document.createElement("div");
        name.className = "name";
        name.textContent = `${product.name} (${variant.label})`;
        const info = document.createElement("p");
        info.textContent = `Verkauft: ${variant.sold} • Bestand: ${variant.stock}`;
        left.append(name, info);

        const controls = document.createElement("div");
        controls.className = "inventory-controls";

        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.value = String(variant.stock);

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Setzen";
        button.addEventListener("click", () => {
          const nextStock = Math.max(0, Number(input.value));
          if (!Number.isFinite(nextStock)) {
            return;
          }
          variant.stock = nextStock;
          saveProducts();
          syncCartWithCatalog();
          renderProducts();
          renderCart();
          renderInventory();
          renderAdminProducts();
          renderVariantDialog();
        });

        controls.append(input, button);
        row.append(left, controls);
        inventoryList.appendChild(row);
      });
    });
};

const renderScrapList = () => {
  if (!scrapList) {
    return;
  }

  scrapList.replaceChildren();
  ensureScrapIntegrity();

  if (scrapEntries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "admin-product";
    empty.textContent = "Keine Ausschuss-Artikel erfasst.";
    scrapList.appendChild(empty);
    return;
  }

  scrapEntries
    .slice()
    .sort((a, b) => {
      const aName = getProductById(a.productId)?.name || a.productId;
      const bName = getProductById(b.productId)?.name || b.productId;
      const byName = aName.localeCompare(bName, "de");
      if (byName !== 0) {
        return byName;
      }
      return b.updatedTs - a.updatedTs;
    })
    .forEach((entry) => {
      const product = getProductById(entry.productId);
      const variant = getVariantById(product, entry.variantId);
      if (!product || !variant) {
        return;
      }

      const li = document.createElement("li");
      li.className = "admin-product";

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = `${product.name} (${variant.label})`;
      const meta = document.createElement("p");
      meta.textContent = `Ausschuss: ${entry.qty} • Erfasst: ${new Date(entry.updatedTs).toLocaleString("de-DE")}`;
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.type = "button";
      restoreBtn.textContent = "In Bestand";
      restoreBtn.addEventListener("click", () => {
        variant.stock += entry.qty;
        scrapEntries = scrapEntries.filter((item) => item.id !== entry.id);
        saveProducts();
        saveScrapEntries();
        syncCartWithCatalog();
        rebuildCategories();
        renderCategories();
        renderProducts();
        renderCart();
        renderVariantDialog();
        renderAdminProducts();
        renderInventory();
        renderCapsuleList();
        renderScrapList();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Löschen";
      deleteBtn.addEventListener("click", () => {
        scrapEntries = scrapEntries.filter((item) => item.id !== entry.id);
        saveScrapEntries();
        renderScrapList();
      });

      actions.append(restoreBtn, deleteBtn);
      li.append(info, actions);
      scrapList.appendChild(li);
    });
};

const makeUniqueCapsuleEntryId = () => {
  let idx = capsuleConfig.entries.length + 1;
  let candidate = `capsule-${idx}`;
  while (capsuleConfig.entries.some((entry) => entry.id === candidate)) {
    idx += 1;
    candidate = `capsule-${idx}`;
  }
  return candidate;
};

const fillCapsuleProductSelect = (keepProductId = "") => {
  if (!capsuleForm) {
    return;
  }
  const productSelect = capsuleForm.elements.productId;
  productSelect.replaceChildren();
  const sorted = products.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
  sorted.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.name;
    productSelect.appendChild(option);
  });

  if (sorted.length === 0) {
    return;
  }
  const next = sorted.some((product) => product.id === keepProductId) ? keepProductId : sorted[0].id;
  productSelect.value = next;
};

const fillCapsuleVariantSelect = (productId, keepVariantId = "") => {
  if (!capsuleForm) {
    return;
  }
  const variantSelect = capsuleForm.elements.variantId;
  variantSelect.replaceChildren();
  const product = getProductById(productId);
  if (!product) {
    return;
  }
  product.variants.forEach((variant) => {
    const option = document.createElement("option");
    option.value = variant.id;
    option.textContent = `${variant.label} • Bestand ${variant.stock}`;
    variantSelect.appendChild(option);
  });
  const next = product.variants.some((variant) => variant.id === keepVariantId) ? keepVariantId : product.variants[0]?.id || "";
  variantSelect.value = next;
};

const clearCapsuleForm = () => {
  if (!capsuleForm) {
    return;
  }
  capsuleForm.reset();
  capsuleForm.elements.entryId.value = "";
  fillCapsuleProductSelect();
  fillCapsuleVariantSelect(String(capsuleForm.elements.productId.value || ""));
  capsuleForm.elements.qty.value = "1";
};

const fillCapsuleForm = (entry) => {
  if (!capsuleForm) {
    return;
  }
  capsuleForm.elements.entryId.value = entry.id;
  fillCapsuleProductSelect(entry.productId);
  fillCapsuleVariantSelect(entry.productId, entry.variantId);
  capsuleForm.elements.qty.value = String(entry.qty);
};

const renderCapsuleList = () => {
  if (!capsuleList) {
    return;
  }
  capsuleList.replaceChildren();

  capsuleConfig.entries
    .slice()
    .sort((a, b) => {
      const pa = getProductById(a.productId)?.name || a.productId;
      const pb = getProductById(b.productId)?.name || b.productId;
      return pa.localeCompare(pb, "de");
    })
    .forEach((entry) => {
      const product = getProductById(entry.productId);
      const variant = getVariantById(product, entry.variantId);
      const li = document.createElement("li");
      li.className = "admin-product";

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = product && variant ? `${product.name} (${variant.label})` : "Ungültiger Eintrag";
      const meta = document.createElement("p");
      meta.textContent = `Im Automaten: ${entry.qty} • Im Warenkorb: ${getCapsuleInCartQty(entry.id)}`;
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Bearbeiten";
      editBtn.addEventListener("click", () => fillCapsuleForm(entry));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Löschen";
      deleteBtn.addEventListener("click", () => {
        capsuleConfig.entries = capsuleConfig.entries.filter((item) => item.id !== entry.id);
        saveCapsuleConfig();
        syncCartWithCatalog();
        renderCapsuleList();
        renderCart();
        renderVariantDialog();
        clearCapsuleForm();
      });

      actions.append(editBtn, deleteBtn);
      li.append(info, actions);
      capsuleList.appendChild(li);
    });
};

const makeUniqueEventId = (name, currentId = "") => {
  const base = slugify(name || "event");
  let candidate = base;
  let idx = 2;
  while (events.some((eventItem) => eventItem.id === candidate && eventItem.id !== currentId)) {
    candidate = `${base}-${idx}`;
    idx += 1;
  }
  return candidate;
};

const renderEventProductPicks = (selectedProductIds = []) => {
  if (!eventProductPicks) {
    return;
  }
  eventProductPicks.replaceChildren();
  const selected = new Set(selectedProductIds);
  const sortedProducts = products.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
  if (sortedProducts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-hint";
    empty.textContent = "Lege zuerst Produkte an.";
    eventProductPicks.appendChild(empty);
    return;
  }

  sortedProducts.forEach((product) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = product.id;
    input.checked = selected.has(product.id);
    const text = document.createElement("span");
    text.textContent = product.name;
    label.append(input, text);
    eventProductPicks.appendChild(label);
  });
};

const getEventFormSelection = () => {
  if (!eventProductPicks) {
    return [];
  }
  return [...eventProductPicks.querySelectorAll("input[type='checkbox']:checked")]
    .map((input) => String(input.value || "").trim())
    .filter(Boolean);
};

const clearEventForm = () => {
  if (!eventForm) {
    return;
  }
  eventForm.reset();
  eventForm.elements.eventId.value = "";
  eventForm.elements.setActive.checked = true;
  renderEventProductPicks(products.map((product) => product.id));
};

const fillEventForm = (eventItem) => {
  if (!eventForm) {
    return;
  }
  eventForm.elements.eventId.value = eventItem.id;
  eventForm.elements.name.value = eventItem.name;
  eventForm.elements.location.value = eventItem.location || "";
  eventForm.elements.date.value = eventItem.date || "";
  eventForm.elements.setActive.checked = eventItem.id === activeEventId;
  renderEventProductPicks(eventItem.productIds);
};

const renderActiveEventSelect = () => {
  if (!activeEventSelect) {
    return;
  }
  activeEventSelect.replaceChildren();
  events.forEach((eventItem) => {
    const option = document.createElement("option");
    option.value = eventItem.id;
    option.textContent = eventLabel(eventItem);
    activeEventSelect.appendChild(option);
  });
  if (events.some((eventItem) => eventItem.id === activeEventId)) {
    activeEventSelect.value = activeEventId;
  } else if (events[0]) {
    activeEventSelect.value = events[0].id;
  }
};

const renderEventList = () => {
  if (!eventList) {
    return;
  }
  eventList.replaceChildren();

  events
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .forEach((eventItem) => {
      const li = document.createElement("li");
      li.className = "admin-product";

      const infoWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = eventItem.id === activeEventId ? `${eventItem.name} (Aktiv)` : eventItem.name;
      const meta = document.createElement("p");
      const metaParts = [];
      if (eventItem.location) {
        metaParts.push(eventItem.location);
      }
      if (eventItem.date) {
        metaParts.push(getDisplayDate(eventItem.date));
      }
      metaParts.push(`${eventItem.productIds.length} Artikel freigegeben`);
      meta.textContent = metaParts.join(" • ");
      infoWrap.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Bearbeiten";
      editBtn.addEventListener("click", () => fillEventForm(eventItem));

      const activeBtn = document.createElement("button");
      activeBtn.type = "button";
      activeBtn.textContent = "Aktiv";
      activeBtn.disabled = eventItem.id === activeEventId;
      activeBtn.addEventListener("click", () => {
        setActiveEvent(eventItem.id);
        renderEventList();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Löschen";
      deleteBtn.disabled = events.length <= 1;
      deleteBtn.addEventListener("click", () => {
        if (events.length <= 1) {
          window.alert("Mindestens eine Veranstaltung muss bestehen bleiben.");
          return;
        }
        events = events.filter((item) => item.id !== eventItem.id);
        if (!events.some((item) => item.id === activeEventId)) {
          activeEventId = events[0]?.id || "";
          saveActiveEventId();
        }
        saveEvents();
        renderActiveEventSelect();
        renderEventList();
        clearEventForm();
        setActiveEvent(activeEventId);
      });

      actions.append(editBtn, activeBtn, deleteBtn);
      li.append(infoWrap, actions);
      eventList.appendChild(li);
    });
};

const clearDiscountForm = () => {
  if (!discountForm) {
    return;
  }
  discountForm.reset();
  discountForm.elements.discountId.value = "";
  discountForm.elements.type.value = "percent";
  discountForm.elements.value.value = "";
};

const fillDiscountForm = (discount) => {
  if (!discountForm) {
    return;
  }
  discountForm.elements.discountId.value = discount.id;
  discountForm.elements.code.value = discount.code;
  discountForm.elements.type.value = discount.type;
  discountForm.elements.value.value = String(discount.value);
};

const renderDiscountList = () => {
  if (!discountList) {
    return;
  }

  discountList.replaceChildren();

  discountCodes
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code, "de"))
    .forEach((discount) => {
      const li = document.createElement("li");
      li.className = "admin-product";

      const info = document.createElement("div");
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = discount.code;
      const meta = document.createElement("p");
      if (discount.type === "percent") {
        meta.textContent = `${discount.value}% Rabatt`;
      } else if (discount.type === "custom") {
        meta.textContent =
          discount.value > 0
            ? `Flexibler Rabatt bis ${formatPrice(discount.value)}`
            : "Flexibler Rabatt ohne Maximalwert";
      } else {
        meta.textContent = `${formatPrice(discount.value)} Rabatt`;
      }
      info.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Bearbeiten";
      editBtn.addEventListener("click", () => fillDiscountForm(discount));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "Löschen";
      deleteBtn.addEventListener("click", () => {
        discountCodes = discountCodes.filter((item) => item.id !== discount.id);
        saveDiscounts();
        if (String(appliedDiscountCode).toUpperCase() === discount.code.toUpperCase()) {
          appliedDiscountCode = "";
          appliedDiscountCustomAmount = 0;
          if (discountInput) {
            discountInput.value = "";
          }
          if (discountCustomAmountInput) {
            discountCustomAmountInput.value = "";
          }
          if (discountFeedback) {
            discountFeedback.textContent = "Rabattcode wurde entfernt.";
          }
          renderCart();
        }
        renderDiscountList();
        clearDiscountForm();
      });

      actions.append(editBtn, deleteBtn);
      li.append(info, actions);
      discountList.appendChild(li);
    });
};

const dateStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const dateEnd = (date) => dateStart(date) + 24 * 60 * 60 * 1000 - 1;
const getSaleEventKey = (sale) => {
  if (sale.eventId) {
    return `id:${sale.eventId}`;
  }
  if (sale.eventName) {
    return `name:${sale.eventName.toLowerCase()}`;
  }
  return "none";
};
const getSaleEventLabel = (sale) => {
  if (sale.eventName) {
    return sale.eventName;
  }
  return "Ohne Veranstaltung";
};

const getDashboardRange = () => {
  const now = new Date();
  const period = dashPeriod ? dashPeriod.value : "all";

  if (period === "today") {
    return { from: dateStart(now), to: dateEnd(now) };
  }
  if (period === "7d") {
    return { from: Date.now() - 7 * 24 * 60 * 60 * 1000, to: Date.now() };
  }
  if (period === "30d") {
    return { from: Date.now() - 30 * 24 * 60 * 60 * 1000, to: Date.now() };
  }
  if (period === "custom") {
    const fromDate = dashFrom?.value ? new Date(dashFrom.value) : null;
    const toDate = dashTo?.value ? new Date(dashTo.value) : null;
    return {
      from: fromDate ? dateStart(fromDate) : Number.NEGATIVE_INFINITY,
      to: toDate ? dateEnd(toDate) : Number.POSITIVE_INFINITY
    };
  }
  return { from: Number.NEGATIVE_INFINITY, to: Number.POSITIVE_INFINITY };
};

const fillDashboardSelects = () => {
  if (!dashCategory || !dashProduct || !dashEvent) {
    return;
  }

  const keepCategory = dashCategory.value || "all";
  const keepProduct = dashProduct.value || "all";
  const keepEvent = dashEvent.value || "all";

  dashCategory.replaceChildren();
  dashProduct.replaceChildren();
  dashEvent.replaceChildren();

  const allCategory = document.createElement("option");
  allCategory.value = "all";
  allCategory.textContent = "Alle";
  dashCategory.appendChild(allCategory);

  const allProduct = document.createElement("option");
  allProduct.value = "all";
  allProduct.textContent = "Alle";
  dashProduct.appendChild(allProduct);

  const allEvents = document.createElement("option");
  allEvents.value = "all";
  allEvents.textContent = "Alle";
  dashEvent.appendChild(allEvents);

  [...new Set(salesLog.flatMap((sale) => sale.items.map((item) => item.category)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de"))
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      dashCategory.appendChild(option);
    });

  [...new Set(salesLog.flatMap((sale) => sale.items.map((item) => item.productId)).filter(Boolean))]
    .map((id) => {
      const sample = salesLog.flatMap((sale) => sale.items).find((item) => item.productId === id);
      return { id, name: sample?.productName || id };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = product.name;
      dashProduct.appendChild(option);
    });

  const eventMap = new Map();
  salesLog.forEach((sale) => {
    const key = getSaleEventKey(sale);
    if (!eventMap.has(key)) {
      eventMap.set(key, getSaleEventLabel(sale));
    }
  });
  [...eventMap.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "de"))
    .forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;
      dashEvent.appendChild(option);
    });

  dashCategory.value = [...dashCategory.options].some((option) => option.value === keepCategory) ? keepCategory : "all";
  dashProduct.value = [...dashProduct.options].some((option) => option.value === keepProduct) ? keepProduct : "all";
  dashEvent.value = [...dashEvent.options].some((option) => option.value === keepEvent) ? keepEvent : "all";
};

const makeChartSurface = (canvas) => {
  if (!canvas) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(240, rect.width || Number(canvas.getAttribute("width")) || 480);
  const height = Math.max(220, rect.height || Number(canvas.getAttribute("height")) || 300);
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
};

const drawChartEmptyState = (canvas, message) => {
  const surface = makeChartSurface(canvas);
  if (!surface) {
    return;
  }
  const { ctx, width, height } = surface;
  ctx.fillStyle = "rgba(15, 21, 31, 0.95)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(242, 239, 0, 0.18)";
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  ctx.fillStyle = "#a7adb8";
  ctx.font = "600 14px Rajdhani, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, width / 2, height / 2);
};

const renderPieLegend = (rows) => {
  if (!dashPieLegend) {
    return;
  }
  dashPieLegend.replaceChildren();
  if (rows.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Keine Daten.";
    dashPieLegend.appendChild(li);
    return;
  }

  rows.forEach((row, index) => {
    const li = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = "legend-dot";
    marker.style.backgroundColor = chartPalette[index % chartPalette.length];
    const label = document.createElement("span");
    label.textContent = `${row.label}: ${formatPrice(row.value)} (${row.share.toFixed(1)}%)`;
    li.append(marker, label);
    dashPieLegend.appendChild(li);
  });
};

const renderRevenuePieChart = (categoryRows) => {
  const rows = categoryRows.filter((row) => row.value > 0);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  renderPieLegend(rows.map((row) => ({ ...row, share: total > 0 ? (row.value / total) * 100 : 0 })));

  if (!dashPie) {
    return;
  }
  if (rows.length === 0 || total <= 0) {
    drawChartEmptyState(dashPie, "Keine Umsaetze im Zeitraum");
    return;
  }

  const surface = makeChartSurface(dashPie);
  if (!surface) {
    return;
  }
  const { ctx, width, height } = surface;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.36;
  const innerRadius = radius * 0.52;
  let start = -Math.PI / 2;

  rows.forEach((row, index) => {
    const sweep = (row.value / total) * Math.PI * 2;
    const end = start + sweep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = chartPalette[index % chartPalette.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(5, 6, 8, 0.95)";
    ctx.lineWidth = 2;
    ctx.stroke();
    start = end;
  });

  ctx.beginPath();
  ctx.fillStyle = "#0b111a";
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(242, 239, 0, 0.24)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#a7adb8";
  ctx.font = "600 12px Rajdhani, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Umsatz", cx, cy - 10);

  ctx.fillStyle = "#f5f8ff";
  ctx.font = "700 15px Orbitron, sans-serif";
  ctx.fillText(formatPrice(total), cx, cy + 10);
};

const renderTopProductsBarChart = (productRows) => {
  if (!dashBar) {
    return;
  }
  const rows = productRows.filter((row) => row.qty > 0).slice(0, 6);
  if (rows.length === 0) {
    drawChartEmptyState(dashBar, "Keine Artikelverkaeufe im Zeitraum");
    return;
  }

  const surface = makeChartSurface(dashBar);
  if (!surface) {
    return;
  }
  const { ctx, width, height } = surface;
  const margin = { top: 18, right: 14, bottom: 56, left: 38 };
  const chartWidth = Math.max(10, width - margin.left - margin.right);
  const chartHeight = Math.max(10, height - margin.top - margin.bottom);
  const maxValue = Math.max(...rows.map((row) => row.qty), 1);
  const barGap = 12;
  const barWidth = Math.max(18, (chartWidth - barGap * (rows.length - 1)) / rows.length);

  ctx.strokeStyle = "rgba(167, 173, 184, 0.26)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + chartHeight);
  ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
  ctx.stroke();

  const tickCount = 4;
  for (let tick = 1; tick <= tickCount; tick += 1) {
    const y = margin.top + chartHeight - (chartHeight * tick) / tickCount;
    ctx.strokeStyle = "rgba(167, 173, 184, 0.12)";
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + chartWidth, y);
    ctx.stroke();
  }

  rows.forEach((row, index) => {
    const x = margin.left + index * (barWidth + barGap);
    const barHeight = (row.qty / maxValue) * chartHeight;
    const y = margin.top + chartHeight - barHeight;
    const barColor = chartPalette[index % chartPalette.length];
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#f5f8ff";
    ctx.font = "700 12px Rajdhani, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(String(row.qty), x + barWidth / 2, y - 4);

    const shortLabel = row.label.length > 16 ? `${row.label.slice(0, 13)}...` : row.label;
    ctx.fillStyle = "#a7adb8";
    ctx.font = "600 11px Rajdhani, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(shortLabel, x + barWidth / 2, margin.top + chartHeight + 7);
  });
};

const renderDashboard = () => {
  if (!dashRevenue || !dashItems || !dashOrders || !dashDiscount || !dashItemList) {
    return;
  }

  const categoryFilter = dashCategory?.value || "all";
  const productFilter = dashProduct?.value || "all";
  const eventFilter = dashEvent?.value || "all";
  const { from, to } = getDashboardRange();

  let revenue = 0;
  let totalDiscount = 0;
  let soldItems = 0;
  let orders = 0;
  const itemAgg = new Map();
  const categoryAgg = new Map();
  const productAgg = new Map();

  salesLog
    .filter((sale) => sale.ts >= from && sale.ts <= to)
    .filter((sale) => eventFilter === "all" || getSaleEventKey(sale) === eventFilter)
    .forEach((sale) => {
      const fullGross = sale.items.reduce((sum, line) => sum + line.lineGross, 0);
      let orderHasMatch = false;

      sale.items.forEach((line) => {
        if (categoryFilter !== "all" && line.category !== categoryFilter) {
          return;
        }
        if (productFilter !== "all" && line.productId !== productFilter) {
          return;
        }

        orderHasMatch = true;
        soldItems += line.qty;

        const share = fullGross > 0 ? line.lineGross / fullGross : 0;
        const allocatedDiscount = sale.discount * share;
        const lineNet = Math.max(0, line.lineGross - allocatedDiscount);
        revenue += lineNet;
        totalDiscount += allocatedDiscount;

        const key = `${line.productName}::${line.variantLabel}`;
        const current = itemAgg.get(key) || {
          name: line.productName,
          variant: line.variantLabel,
          qty: 0,
          net: 0
        };
        current.qty += line.qty;
        current.net += lineNet;
        itemAgg.set(key, current);

        const categoryKey = line.category || "Unkategorisiert";
        categoryAgg.set(categoryKey, (categoryAgg.get(categoryKey) || 0) + lineNet);

        const productKey = line.productName || line.productId || "Artikel";
        productAgg.set(productKey, (productAgg.get(productKey) || 0) + line.qty);
      });

      if (orderHasMatch) {
        orders += 1;
      }
    });

  dashRevenue.textContent = formatPrice(revenue);
  dashItems.textContent = String(soldItems);
  dashOrders.textContent = String(orders);
  dashDiscount.textContent = formatPrice(totalDiscount);

  const pieRows = [...categoryAgg.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const barRows = [...productAgg.entries()]
    .map(([label, qty]) => ({ label, qty }))
    .sort((a, b) => b.qty - a.qty);
  renderRevenuePieChart(pieRows);
  renderTopProductsBarChart(barRows);

  dashItemList.replaceChildren();
  const rows = [...itemAgg.values()].sort((a, b) => b.qty - a.qty);
  if (rows.length === 0) {
    const empty = document.createElement("li");
    empty.className = "admin-product";
    empty.textContent = "Keine Verkäufe für den aktuellen Filter.";
    dashItemList.appendChild(empty);
    return;
  }

  rows.forEach((row) => {
    const li = document.createElement("li");
    li.className = "admin-product";
    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = `${row.name} (${row.variant})`;
    const meta = document.createElement("p");
    meta.textContent = `${row.qty} Stück • Umsatz ${formatPrice(row.net)}`;
    info.append(name, meta);
    li.appendChild(info);
    dashItemList.appendChild(li);
  });
};

const openAdmin = () => {
  applyBranding();
  ensureEventsIntegrity();
  ensureCapsuleIntegrity();
  ensureScrapIntegrity();
  updateActiveEventLabels();
  renderAdminProducts();
  renderInventory();
  renderScrapList();
  if (capsuleEnabledInput) {
    capsuleEnabledInput.checked = Boolean(capsuleConfig.enabled);
  }
  if (capsulePriceInput) {
    capsulePriceInput.value = capsuleConfig.price.toFixed(2);
  }
  renderCapsuleList();
  renderActiveEventSelect();
  renderEventList();
  renderDiscountList();
  clearProductForm();
  clearCapsuleForm();
  clearEventForm();
  clearDiscountForm();
  renderCloudSyncForm();
  if (sitePasswordForm) {
    sitePasswordForm.reset();
  }
  if (dataSyncFeedback) {
    dataSyncFeedback.textContent = "";
    dataSyncFeedback.classList.remove("error");
  }
  openDialog(adminDialog);
};

const setDataSyncFeedback = (message, isError = false) => {
  if (!dataSyncFeedback) {
    return;
  }
  dataSyncFeedback.textContent = String(message || "");
  dataSyncFeedback.classList.toggle("error", isError);
};

const setCloudSyncFeedback = (message, isError = false) => {
  if (!cloudSyncFeedback) {
    return;
  }
  cloudSyncFeedback.textContent = String(message || "");
  cloudSyncFeedback.classList.toggle("error", isError);
};

const renderCloudSyncForm = () => {
  if (!cloudSyncForm) {
    return;
  }
  if (cloudSyncEnabledInput) {
    cloudSyncEnabledInput.checked = Boolean(cloudConfig.enabled);
  }
  if (cloudSyncUrlInput) {
    cloudSyncUrlInput.value = cloudConfig.url;
  }
  if (cloudSyncAnonKeyInput) {
    cloudSyncAnonKeyInput.value = cloudConfig.anonKey;
  }
  if (cloudSyncIdInput) {
    cloudSyncIdInput.value = cloudConfig.syncId;
  }
};

const parseCloudConfigFromForm = () =>
  normalizeCloudConfig({
    enabled: Boolean(cloudSyncEnabledInput?.checked),
    url: cloudSyncUrlInput?.value,
    anonKey: cloudSyncAnonKeyInput?.value,
    syncId: cloudSyncIdInput?.value
  });

const canUseCloudSync = () =>
  Boolean(cloudConfig.enabled && cloudConfig.url && cloudConfig.anonKey && cloudConfig.syncId);

const formatCloudSyncTime = (tsValue) => {
  const ts = Number(tsValue);
  if (!Number.isFinite(ts) || ts <= 0) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "medium" }).format(new Date(ts));
  } catch {
    return "";
  }
};

const stopCloudPullInterval = () => {
  if (cloudPullInterval) {
    window.clearInterval(cloudPullInterval);
    cloudPullInterval = 0;
  }
};

const stopCloudPushTimeout = () => {
  if (cloudPushTimeout) {
    window.clearTimeout(cloudPushTimeout);
    cloudPushTimeout = 0;
  }
};

const getCloudClient = () => {
  if (!canUseCloudSync()) {
    return null;
  }
  const createClient = window.supabase?.createClient;
  if (typeof createClient !== "function") {
    throw new Error("Supabase-Bibliothek nicht geladen.");
  }
  const identity = `${cloudConfig.url}::${cloudConfig.anonKey}`;
  if (!cloudClient || cloudClientIdentity !== identity) {
    cloudClient = createClient(cloudConfig.url, cloudConfig.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    cloudClientIdentity = identity;
  }
  return cloudClient;
};

const buildAppStatePayload = () => {
  ensureEventsIntegrity();
  ensureCapsuleIntegrity();
  ensureScrapIntegrity();
  return {
    products,
    branding,
    discounts: discountCodes,
    discountCodes,
    salesLog,
    sales: salesLog,
    events,
    activeEventId,
    capsuleConfig,
    scrapEntries,
    adminPin,
    sitePassword
  };
};

const applyAppStatePayload = (appData, { queueCloud = true } = {}) => {
  const importedProducts = Array.isArray(appData?.products) ? appData.products.map((item) => normalizeProduct(item)) : [];
  if (importedProducts.length === 0) {
    throw new Error("Import abgebrochen: Keine gültigen Produkte gefunden.");
  }

  const previousSuppress = suppressCloudPush;
  suppressCloudPush = !queueCloud;
  try {
    products = importedProducts;
    branding = normalizeBrandingData(appData.branding);
    const importedDiscounts = Array.isArray(appData.discounts)
      ? appData.discounts
      : Array.isArray(appData.discountCodes)
        ? appData.discountCodes
        : [];
    discountCodes = importedDiscounts
      .map((item) => normalizeDiscount(item))
      .filter((item) => item.code && (item.type === "custom" ? item.value >= 0 : item.value > 0));
    const importedSales = Array.isArray(appData.salesLog)
      ? appData.salesLog
      : Array.isArray(appData.sales)
        ? appData.sales
        : [];
    salesLog = importedSales.map((item) => normalizeSale(item)).filter((sale) => sale.items.length > 0);
    events = Array.isArray(appData.events) && appData.events.length > 0
      ? appData.events.map((item, index) => normalizeEvent(item, `Veranstaltung ${index + 1}`))
      : [makeDefaultEventForCatalog(products)];
    activeEventId = String(appData.activeEventId || "").trim();
    capsuleConfig = normalizeCapsuleConfigData(appData.capsuleConfig);
    scrapEntries = Array.isArray(appData.scrapEntries)
      ? appData.scrapEntries.map((item, index) => normalizeScrapEntry(item, index)).filter((item) => item.qty > 0)
      : [];

    const importedPin = String(appData.adminPin || "").trim();
    if (/^[0-9]{4,}$/.test(importedPin)) {
      adminPin = importedPin;
    }
    const importedSitePassword = String(appData.sitePassword || "").trim();
    if (importedSitePassword.length >= 4) {
      sitePassword = importedSitePassword;
    } else {
      sitePassword = DEFAULT_SITE_PASSWORD;
    }

    appliedDiscountCode = "";
    appliedDiscountCustomAmount = 0;
    if (discountInput) {
      discountInput.value = "";
    }
    if (discountCustomAmountInput) {
      discountCustomAmountInput.value = "";
    }
    if (discountFeedback) {
      discountFeedback.textContent = "";
    }

    ensureEventsIntegrity();
    ensureCapsuleIntegrity();
    ensureScrapIntegrity();
    syncCartWithCatalog();
    rebuildCategories();
    updateActiveEventLabels();

    saveProducts();
    saveBranding();
    saveDiscounts();
    saveSales();
    saveEvents();
    saveActiveEventId();
    saveCapsuleConfig();
    saveScrapEntries();
    saveAdminPin(adminPin);
    saveSitePassword(sitePassword);
  } finally {
    suppressCloudPush = previousSuppress;
  }

  renderCategories();
  renderProducts();
  renderCart();
  renderVariantDialog();
  renderAdminProducts();
  renderInventory();
  renderScrapList();
  renderCapsuleList();
  renderActiveEventSelect();
  renderEventList();
  renderDiscountList();
  clearProductForm();
  clearCapsuleForm();
  clearEventForm();
  clearDiscountForm();
};

const scheduleCloudPush = () => {
  if (!canUseCloudSync() || !cloudBootstrapDone || suppressCloudPush) {
    return;
  }
  stopCloudPushTimeout();
  cloudPushTimeout = window.setTimeout(() => {
    cloudPushTimeout = 0;
    void pushCloudState({ silent: true });
  }, 900);
};

queueCloudSync = scheduleCloudPush;

const pushCloudState = async ({ silent = false, force = false } = {}) => {
  if (!canUseCloudSync()) {
    return false;
  }
  if (!force && !cloudBootstrapDone) {
    return false;
  }
  if (cloudPushRunning) {
    return false;
  }

  cloudPushRunning = true;
  try {
    const client = getCloudClient();
    if (!client) {
      return false;
    }
    const nowIso = new Date().toISOString();
    const payload = {
      schemaVersion: 1,
      updatedAt: nowIso,
      updatedBy: cloudClientId,
      app: buildAppStatePayload()
    };
    const { data, error } = await client
      .from(CLOUD_SYNC_TABLE)
      .upsert(
        {
          id: cloudConfig.syncId,
          payload,
          updated_at: nowIso
        },
        { onConflict: "id" }
      )
      .select("updated_at")
      .single();
    if (error) {
      throw new Error(error.message || "Cloud-Upload fehlgeschlagen.");
    }
    const ts = Date.parse(String(data?.updated_at || nowIso));
    cloudLastRemoteTs = Number.isFinite(ts) ? ts : Date.now();
    cloudBootstrapDone = true;
    if (!silent) {
      const label = formatCloudSyncTime(cloudLastRemoteTs);
      setCloudSyncFeedback(label ? `Cloud synchronisiert (${label}).` : "Cloud synchronisiert.");
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloud-Upload fehlgeschlagen.";
    if (!silent) {
      setCloudSyncFeedback(message, true);
    }
    return false;
  } finally {
    cloudPushRunning = false;
  }
};

const pullCloudState = async ({ silent = false, bootstrapIfMissing = true, forceApply = false } = {}) => {
  if (!canUseCloudSync()) {
    return false;
  }
  if (cloudPullRunning) {
    return false;
  }

  cloudPullRunning = true;
  try {
    const client = getCloudClient();
    if (!client) {
      return false;
    }
    const { data, error } = await client
      .from(CLOUD_SYNC_TABLE)
      .select("payload,updated_at")
      .eq("id", cloudConfig.syncId)
      .maybeSingle();
    if (error) {
      throw new Error(error.message || "Cloud-Download fehlgeschlagen.");
    }

    if (!data?.payload) {
      if (bootstrapIfMissing) {
        const pushed = await pushCloudState({ silent: true, force: true });
        cloudBootstrapDone = pushed;
        if (!silent) {
          setCloudSyncFeedback(
            pushed ? "Cloud war leer. Lokaler Stand wurde als Startwert hochgeladen." : "Cloud ist leer und konnte nicht initialisiert werden.",
            !pushed
          );
        }
        return pushed;
      }
      return true;
    }

    const remoteTs = Date.parse(String(data.updated_at || data.payload?.updatedAt || ""));
    if (!forceApply && Number.isFinite(remoteTs) && remoteTs > 0 && cloudLastRemoteTs > 0 && remoteTs <= cloudLastRemoteTs) {
      cloudBootstrapDone = true;
      if (!silent) {
        const label = formatCloudSyncTime(cloudLastRemoteTs);
        setCloudSyncFeedback(label ? `Cloud ist aktuell (${label}).` : "Cloud ist aktuell.");
      }
      return true;
    }

    const appData =
      data.payload?.app && typeof data.payload.app === "object" && !Array.isArray(data.payload.app)
        ? data.payload.app
        : data.payload;
    applyAppStatePayload(appData, { queueCloud: false });
    cloudLastRemoteTs = Number.isFinite(remoteTs) && remoteTs > 0 ? remoteTs : Date.now();
    cloudBootstrapDone = true;
    if (!silent) {
      const label = formatCloudSyncTime(cloudLastRemoteTs);
      setCloudSyncFeedback(label ? `Cloud-Daten geladen (${label}).` : "Cloud-Daten geladen.");
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloud-Download fehlgeschlagen.";
    if (!silent) {
      setCloudSyncFeedback(message, true);
    }
    return false;
  } finally {
    cloudPullRunning = false;
  }
};

const startCloudPullInterval = () => {
  stopCloudPullInterval();
  if (!canUseCloudSync()) {
    return;
  }
  cloudPullInterval = window.setInterval(() => {
    void pullCloudState({ silent: true, bootstrapIfMissing: false });
  }, CLOUD_SYNC_PULL_INTERVAL_MS);
};

const initializeCloudSync = async ({ withStatus = false } = {}) => {
  stopCloudPullInterval();
  stopCloudPushTimeout();
  cloudClient = null;
  cloudClientIdentity = "";
  cloudBootstrapDone = false;
  cloudLastRemoteTs = 0;
  renderCloudSyncForm();

  if (!cloudConfig.enabled) {
    if (withStatus) {
      setCloudSyncFeedback("Cloud-Sync ist deaktiviert.");
    }
    return;
  }
  if (!cloudConfig.url || !cloudConfig.anonKey) {
    if (withStatus) {
      setCloudSyncFeedback("Für Cloud-Sync bitte Supabase URL und ANON Key eintragen.", true);
    }
    return;
  }

  if (withStatus) {
    setCloudSyncFeedback("Cloud-Sync verbindet...");
  }
  const pulled = await pullCloudState({ silent: !withStatus, bootstrapIfMissing: true });
  if (pulled) {
    startCloudPullInterval();
  }
};

const makeExportFileName = () => {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join("");
  return `merch-terminal-backup-${stamp}.json`;
};

const downloadJsonFile = (filename, payload) => {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

const exportDataBundle = () => {
  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: buildAppStatePayload()
  };
  downloadJsonFile(makeExportFileName(), payload);
  setDataSyncFeedback("Export abgeschlossen.");
};

const importDataBundle = (rawPayload) => {
  const payload = rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload) ? rawPayload : null;
  if (!payload) {
    throw new Error("Ungültiges JSON-Format.");
  }

  const appData =
    payload?.app && typeof payload.app === "object" && !Array.isArray(payload.app) ? payload.app : payload;
  applyAppStatePayload(appData, { queueCloud: true });
};

const applyAccessPassword = () => {
  const entered = String(accessInput?.value || "").trim();
  if (entered === sitePassword) {
    unlockSiteAccess();
    return true;
  }
  showAccessError("Passwort ist falsch.");
  if (accessInput) {
    accessInput.select();
  }
  return false;
};

const openPinPrompt = () => {
  if (document.body.classList.contains("access-locked")) {
    lockSiteAccess();
    return;
  }
  const enteredPin = window.prompt("Admin PIN eingeben:");
  if (enteredPin === null) {
    return;
  }
  if (enteredPin.trim() === adminPin) {
    openAdmin();
    return;
  }
  window.alert("PIN ist falsch.");
};

const applyCustomDiscountAmount = () => {
  const active = getActiveDiscount();
  if (!active || active.type !== "custom" || !discountCustomAmountInput) {
    return;
  }

  const raw = parseEuroInput(discountCustomAmountInput.value);
  if (!Number.isFinite(raw) || raw < 0) {
    if (discountFeedback) {
      discountFeedback.textContent = "Bitte einen gültigen Rabattbetrag eingeben.";
    }
    return;
  }

  let nextAmount = Math.round(raw * 100) / 100;
  if (active.value > 0 && nextAmount > active.value) {
    nextAmount = active.value;
    if (discountFeedback) {
      discountFeedback.textContent = `Betrag auf Maximum ${formatPrice(active.value)} begrenzt.`;
    }
  } else if (discountFeedback) {
    discountFeedback.textContent = `Rabattbetrag ${formatPrice(nextAmount)} übernommen.`;
  }

  appliedDiscountCustomAmount = nextAmount;
  discountCustomAmountInput.value = nextAmount > 0 ? nextAmount.toFixed(2) : "";
  renderCart();
};

const applyDiscountCode = () => {
  if (!discountInput) {
    return;
  }

  const code = discountInput.value.trim().toUpperCase();
  if (!code) {
    appliedDiscountCode = "";
    appliedDiscountCustomAmount = 0;
    if (discountCustomAmountInput) {
      discountCustomAmountInput.value = "";
    }
    if (discountFeedback) {
      discountFeedback.textContent = "";
    }
    renderCart();
    return;
  }

  const found = discountCodes.find((item) => item.code.toUpperCase() === code);
  if (!found) {
    if (discountFeedback) {
      discountFeedback.textContent = "Code ungültig.";
    }
    return;
  }

  appliedDiscountCode = found.code;
  if (found.type !== "custom") {
    appliedDiscountCustomAmount = 0;
    if (discountCustomAmountInput) {
      discountCustomAmountInput.value = "";
    }
  } else if (found.value > 0 && appliedDiscountCustomAmount > found.value) {
    appliedDiscountCustomAmount = found.value;
  }
  if (discountFeedback) {
    if (found.type === "custom") {
      discountFeedback.textContent =
        found.value > 0
          ? `Code ${found.code} aktiv. Rabattbetrag bis ${formatPrice(found.value)} eingeben.`
          : `Code ${found.code} aktiv. Rabattbetrag eingeben.`;
    } else {
      discountFeedback.textContent = `Code ${found.code} angewendet.`;
    }
  }
  renderCart();
  if (found.type === "custom" && discountCustomAmountInput) {
    discountCustomAmountInput.focus();
  }
};

if (accessForm) {
  accessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyAccessPassword();
  });
}

if (accessInput) {
  accessInput.addEventListener("input", () => {
    clearAccessError();
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", checkout);
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    cart.clear();
    renderCart();
    renderProducts();
    renderVariantDialog();
  });
}

if (applyDiscountBtn) {
  applyDiscountBtn.addEventListener("click", applyDiscountCode);
}

if (clearDiscountBtn) {
  clearDiscountBtn.addEventListener("click", () => {
    appliedDiscountCode = "";
    appliedDiscountCustomAmount = 0;
    if (discountInput) {
      discountInput.value = "";
    }
    if (discountCustomAmountInput) {
      discountCustomAmountInput.value = "";
    }
    if (discountFeedback) {
      discountFeedback.textContent = "Rabattcode entfernt.";
    }
    renderCart();
  });
}

if (applyDiscountCustomBtn) {
  applyDiscountCustomBtn.addEventListener("click", applyCustomDiscountAmount);
}

if (discountCustomAmountInput) {
  discountCustomAmountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCustomDiscountAmount();
    }
  });
}

if (discountInput) {
  discountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyDiscountCode();
    }
  });
}

if (closeDialogBtn) {
  closeDialogBtn.addEventListener("click", () => closeDialog(checkoutDialog));
}

if (closeVariantBtn) {
  closeVariantBtn.addEventListener("click", () => closeDialog(variantDialog));
}

if (openOrderBtn) {
  openOrderBtn.addEventListener("click", showOrderView);
}

if (backHomeBtn) {
  backHomeBtn.addEventListener("click", showHomeView);
}

if (openAdminButtons.length > 0) {
  window.__adminBoundByApp = true;
  openAdminButtons.forEach((button) => {
    button.onclick = openPinPrompt;
  });
}

if (closeAdminBtn) {
  closeAdminBtn.addEventListener("click", () => closeDialog(adminDialog));
}

if (openDashboardBtn) {
  openDashboardBtn.addEventListener("click", () => {
    closeDialog(adminDialog);
    fillDashboardSelects();
    openDialog(dashboardDialog);
    window.requestAnimationFrame(() => {
      renderDashboard();
    });
  });
}

if (closeDashboardBtn) {
  closeDashboardBtn.addEventListener("click", () => {
    closeDialog(dashboardDialog);
    openDialog(adminDialog);
  });
}

if (dashboardFilterForm) {
  dashboardFilterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderDashboard();
  });
}

window.addEventListener("resize", () => {
  if (!dashboardDialog?.open) {
    return;
  }
  window.requestAnimationFrame(() => {
    renderDashboard();
  });
});

if (newProductBtn) {
  newProductBtn.addEventListener("click", clearProductForm);
}

if (newDiscountBtn) {
  newDiscountBtn.addEventListener("click", clearDiscountForm);
}

if (dataExportBtn) {
  dataExportBtn.addEventListener("click", () => {
    try {
      exportDataBundle();
    } catch {
      setDataSyncFeedback("Export fehlgeschlagen.", true);
    }
  });
}

if (dataImportBtn && dataImportFileInput) {
  dataImportBtn.addEventListener("click", () => {
    dataImportFileInput.click();
  });
}

if (dataImportFileInput) {
  dataImportFileInput.addEventListener("change", async () => {
    const file = dataImportFileInput.files?.[0];
    dataImportFileInput.value = "";
    if (!file) {
      return;
    }
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      importDataBundle(parsed);
      setDataSyncFeedback("Import abgeschlossen.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import fehlgeschlagen.";
      setDataSyncFeedback(message, true);
    }
  });
}

if (cloudSyncForm) {
  cloudSyncForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nextConfig = parseCloudConfigFromForm();
    cloudConfig = nextConfig;
    saveCloudConfig();
    renderCloudSyncForm();

    if (!cloudConfig.enabled) {
      stopCloudPullInterval();
      stopCloudPushTimeout();
      cloudBootstrapDone = false;
      setCloudSyncFeedback("Cloud-Sync deaktiviert.");
      return;
    }

    if (!cloudConfig.url || !cloudConfig.anonKey) {
      setCloudSyncFeedback("Bitte Supabase URL und ANON Key eingeben.", true);
      return;
    }

    await initializeCloudSync({ withStatus: true });
  });
}

if (cloudSyncNowBtn) {
  cloudSyncNowBtn.addEventListener("click", async () => {
    if (!canUseCloudSync()) {
      setCloudSyncFeedback("Cloud-Sync ist nicht vollständig konfiguriert.", true);
      return;
    }
    setCloudSyncFeedback("Synchronisierung läuft...");
    const pulled = await pullCloudState({ silent: true, bootstrapIfMissing: true });
    if (!pulled) {
      setCloudSyncFeedback("Cloud-Download fehlgeschlagen.", true);
      return;
    }
    const pushed = await pushCloudState({ silent: true, force: true });
    if (!pushed) {
      setCloudSyncFeedback("Cloud-Upload fehlgeschlagen.", true);
      return;
    }
    const label = formatCloudSyncTime(cloudLastRemoteTs);
    setCloudSyncFeedback(label ? `Synchronisiert (${label}).` : "Synchronisiert.");
  });
}

if (cloudSyncPullForceBtn) {
  cloudSyncPullForceBtn.addEventListener("click", async () => {
    if (!canUseCloudSync()) {
      setCloudSyncFeedback("Cloud-Sync ist nicht vollständig konfiguriert.", true);
      return;
    }
    setCloudSyncFeedback("Cloud-Daten werden geladen...");
    const pulled = await pullCloudState({ silent: true, bootstrapIfMissing: false, forceApply: true });
    if (!pulled) {
      setCloudSyncFeedback("Cloud-Download fehlgeschlagen.", true);
      return;
    }
    const label = formatCloudSyncTime(cloudLastRemoteTs);
    setCloudSyncFeedback(label ? `Cloud-Stand übernommen (${label}).` : "Cloud-Stand übernommen.");
  });
}

if (capsuleEnabledInput) {
  capsuleEnabledInput.addEventListener("change", () => {
    capsuleConfig.enabled = Boolean(capsuleEnabledInput.checked);
    saveCapsuleConfig();
    renderVariantDialog();
  });
}

if (capsulePriceInput) {
  capsulePriceInput.addEventListener("change", () => {
    const normalizedValue = String(capsulePriceInput.value || "")
      .trim()
      .replace(",", ".");
    const raw = Number(normalizedValue);
    if (!Number.isFinite(raw) || raw < 0) {
      capsulePriceInput.value = capsuleConfig.price.toFixed(2);
      return;
    }
    capsuleConfig.price = Math.round(raw * 100) / 100;
    saveCapsuleConfig();
    syncCartWithCatalog();
    renderCart();
    renderVariantDialog();
    capsulePriceInput.value = capsuleConfig.price.toFixed(2);
  });
}

if (capsuleForm) {
  capsuleForm.elements.productId.addEventListener("change", () => {
    fillCapsuleVariantSelect(String(capsuleForm.elements.productId.value || ""));
  });
}

if (newCapsuleEntryBtn) {
  newCapsuleEntryBtn.addEventListener("click", clearCapsuleForm);
}

if (capsuleForm) {
  capsuleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idInForm = String(capsuleForm.elements.entryId.value || "").trim();
    const productId = String(capsuleForm.elements.productId.value || "").trim();
    const variantId = String(capsuleForm.elements.variantId.value || "").trim();
    const qty = Math.max(0, Number(capsuleForm.elements.qty.value));
    if (!productId || !variantId || !Number.isFinite(qty) || qty <= 0) {
      return;
    }

    const product = getProductById(productId);
    const variant = getVariantById(product, variantId);
    if (!product || !variant) {
      window.alert("Bitte gültigen Artikel und Variante auswählen.");
      return;
    }

    if (idInForm) {
      const existing = capsuleConfig.entries.find((entry) => entry.id === idInForm);
      if (!existing) {
        return;
      }
      existing.productId = productId;
      existing.variantId = variantId;
      existing.qty = Math.floor(qty);
    } else {
      capsuleConfig.entries.push({
        id: makeUniqueCapsuleEntryId(),
        productId,
        variantId,
        qty: Math.floor(qty)
      });
    }

    ensureCapsuleIntegrity();
    syncCartWithCatalog();
    renderCart();
    renderCapsuleList();
    renderVariantDialog();
    clearCapsuleForm();
  });
}

if (newEventBtn) {
  newEventBtn.addEventListener("click", clearEventForm);
}

if (activeEventSelect) {
  activeEventSelect.addEventListener("change", () => {
    const nextId = String(activeEventSelect.value || "");
    if (!nextId) {
      return;
    }
    setActiveEvent(nextId);
    renderEventList();
  });
}

if (eventForm) {
  eventForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const idInForm = String(eventForm.elements.eventId.value || "").trim();
    const name = String(eventForm.elements.name.value || "").trim();
    const location = String(eventForm.elements.location.value || "").trim();
    const date = String(eventForm.elements.date.value || "").trim();
    const setActive = Boolean(eventForm.elements.setActive.checked);
    const selectedProductIds = getEventFormSelection().filter((id) => products.some((product) => product.id === id));

    if (!name) {
      return;
    }
    if (selectedProductIds.length === 0) {
      window.alert("Bitte mindestens einen Artikel für die Veranstaltung auswählen.");
      return;
    }

    let targetId = idInForm;
    if (idInForm) {
      const existing = events.find((eventItem) => eventItem.id === idInForm);
      if (!existing) {
        return;
      }
      existing.name = name;
      existing.location = location;
      existing.date = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
      existing.productIds = [...new Set(selectedProductIds)];
      targetId = existing.id;
    } else {
      targetId = makeUniqueEventId(name);
      events.push({
        id: targetId,
        name,
        location,
        date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
        productIds: [...new Set(selectedProductIds)]
      });
    }

    saveEvents();
    ensureEventsIntegrity();
    if (setActive || targetId === activeEventId || !activeEventId) {
      setActiveEvent(targetId);
    } else {
      updateActiveEventLabels();
      rebuildCategories();
      renderCategories();
      renderProducts();
      renderCart();
      renderVariantDialog();
    }
    renderActiveEventSelect();
    renderEventList();
    clearEventForm();
  });
}

if (brandingForm) {
  brandingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    branding = {
      appTitle: brandingForm.elements.appTitle.value.trim(),
      bandName: brandingForm.elements.bandName.value.trim(),
      tourLabel: brandingForm.elements.tourLabel.value.trim(),
      tagline: brandingForm.elements.tagline.value.trim()
    };

    saveBranding();
    applyBranding();
  });
}

if (productForm) {
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const idInForm = productForm.elements.productId.value.trim();
    const name = productForm.elements.name.value.trim();
    const category = productForm.elements.category.value.trim();
    const basePrice = Number(productForm.elements.price.value);
    const imageFile = productForm.elements.imageFile.files?.[0] ?? null;
    const removeImage = Boolean(productForm.elements.removeImage.checked);
    const meta = productForm.elements.meta.value.trim();
    const variantSpec = productForm.elements.variants.value.trim();
    const submitButton = productForm.querySelector("button[type='submit']");

    if (!name || !category || !Number.isFinite(basePrice) || basePrice < 0 || !variantSpec) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (idInForm) {
      const existing = products.find((product) => product.id === idInForm);
      if (!existing) {
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }

      let nextImage = existing.image || "";
      if (removeImage) {
        nextImage = "";
      }
      if (imageFile) {
        try {
          nextImage = await readFileAsDataUrl(imageFile);
        } catch {
          window.alert("Bild konnte nicht geladen werden.");
          if (submitButton) {
            submitButton.disabled = false;
          }
          return;
        }
      }

      const variants = parseVariantSpec(variantSpec, basePrice, existing.variants);
      products = products.map((product) =>
        product.id === idInForm
          ? {
              ...product,
              name,
              category,
              basePrice,
              image: nextImage,
              meta,
              variants
            }
          : product
      );
    } else {
      let nextImage = "";
      if (imageFile) {
        try {
          nextImage = await readFileAsDataUrl(imageFile);
        } catch {
          window.alert("Bild konnte nicht geladen werden.");
          if (submitButton) {
            submitButton.disabled = false;
          }
          return;
        }
      }

      const newProduct = {
        id: makeUniqueProductId(name),
        name,
        category,
        basePrice,
        image: nextImage,
        meta,
        variants: parseVariantSpec(variantSpec, basePrice, [])
      };
      products.push(newProduct);
      const activeEvent = getActiveEvent();
      if (activeEvent && !activeEvent.productIds.includes(newProduct.id)) {
        activeEvent.productIds.push(newProduct.id);
        saveEvents();
      }
    }

    saveProducts();
    ensureEventsIntegrity();
    ensureCapsuleIntegrity();
    ensureScrapIntegrity();
    rebuildCategories();
    syncCartWithCatalog();
    renderCategories();
    renderProducts();
    renderCart();
    renderAdminProducts();
    renderInventory();
    renderScrapList();
    renderCapsuleList();
    renderActiveEventSelect();
    renderEventList();
    renderEventProductPicks(getEventFormSelection());
    clearCapsuleForm();
    clearProductForm();
    if (submitButton) {
      submitButton.disabled = false;
    }
  });
}

if (discountForm) {
  discountForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const idInForm = String(discountForm.elements.discountId.value || "").trim();
    const code = String(discountForm.elements.code.value || "").trim().toUpperCase();
    const typeRaw = String(discountForm.elements.type.value || "percent");
    const type = typeRaw === "fixed" || typeRaw === "custom" ? typeRaw : "percent";
    const value = Math.max(0, parseEuroInput(discountForm.elements.value.value));

    if (!code || !Number.isFinite(value)) {
      return;
    }

    if ((type === "fixed" || type === "percent") && value <= 0) {
      window.alert("Für diesen Rabatt-Typ muss der Wert größer als 0 sein.");
      return;
    }

    if (type === "percent" && value > 100) {
      window.alert("Prozent-Rabatt darf maximal 100 sein.");
      return;
    }

    const duplicate = discountCodes.find(
      (item) => item.code.toUpperCase() === code && item.id !== idInForm
    );
    if (duplicate) {
      window.alert("Dieser Rabattcode existiert bereits.");
      return;
    }

    if (idInForm) {
      discountCodes = discountCodes.map((item) =>
        item.id === idInForm
          ? {
              ...item,
              code,
              type,
              value
            }
          : item
      );
    } else {
      const newIdBase = slugify(code);
      let newId = newIdBase;
      let idx = 2;
      while (discountCodes.some((item) => item.id === newId)) {
        newId = `${newIdBase}-${idx}`;
        idx += 1;
      }
      discountCodes.push({ id: newId, code, type, value });
    }

    saveDiscounts();

    if (appliedDiscountCode) {
      const activeStillExists = discountCodes.find(
        (item) => item.code.toUpperCase() === String(appliedDiscountCode).toUpperCase()
      );
      if (!activeStillExists) {
        appliedDiscountCode = "";
        appliedDiscountCustomAmount = 0;
      } else if (activeStillExists.type !== "custom") {
        appliedDiscountCustomAmount = 0;
      } else if (activeStillExists.value > 0 && appliedDiscountCustomAmount > activeStillExists.value) {
        appliedDiscountCustomAmount = activeStillExists.value;
      }
    }

    renderDiscountList();
    renderCart();
    clearDiscountForm();
  });
}

if (pinForm) {
  pinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentPin = pinForm.elements.currentPin.value.trim();
    const newPin = pinForm.elements.newPin.value.trim();

    if (currentPin !== adminPin) {
      window.alert("Aktuelle PIN ist falsch.");
      pinForm.reset();
      return;
    }

    if (!/^[0-9]{4,}$/.test(newPin)) {
      window.alert("Neue PIN muss mindestens 4 Ziffern haben.");
      return;
    }

    adminPin = newPin;
    saveAdminPin(adminPin);
    pinForm.reset();
    window.alert("PIN wurde geändert.");
  });
}

if (sitePasswordForm) {
  sitePasswordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const currentPassword = String(sitePasswordForm.elements.currentPassword.value || "").trim();
    const newPassword = String(sitePasswordForm.elements.newPassword.value || "").trim();

    if (currentPassword !== sitePassword) {
      window.alert("Aktuelles Seitenpasswort ist falsch.");
      sitePasswordForm.reset();
      return;
    }

    if (newPassword.trim().length < 4) {
      window.alert("Neues Seitenpasswort muss mindestens 4 Zeichen haben.");
      return;
    }

    sitePassword = newPassword;
    saveSitePassword(sitePassword);
    sitePasswordForm.reset();
    window.alert("Seitenpasswort wurde geändert.");
  });
}

ensureEventsIntegrity();
ensureCapsuleIntegrity();
ensureScrapIntegrity();
updateActiveEventLabels();
rebuildCategories();
applyBranding();
renderCategories();
renderProducts();
renderCart();
renderVariantDialog();
showHomeView();
lockSiteAccess();
void initializeCloudSync({ withStatus: false });
