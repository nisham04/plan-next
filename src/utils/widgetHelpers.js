const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EATING_OUT_PREFIX = '🍽️ Eating Out: ';

export function getWeekKeyForDate(date) {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDaySnapshot(plan, offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const weekKey = getWeekKeyForDate(d);
  const dayName = DAYS[(d.getDay() + 6) % 7];
  const dateLabel = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const dayMeals = plan?.[weekKey]?.[dayName] || {};
  return {
    weekKey,
    dayName,
    dateLabel,
    meals: {
      Breakfast: dayMeals.Breakfast || '',
      Lunch: dayMeals.Lunch || '',
      Dinner: dayMeals.Dinner || '',
    },
  };
}

export function parseMealDisplay(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { isEmpty: true, isEatingOut: false, items: [] };
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith(EATING_OUT_PREFIX)) {
    return {
      isEmpty: false,
      isEatingOut: true,
      items: [trimmed.slice(EATING_OUT_PREFIX.length).trim() || 'Eating Out'],
    };
  }
  const items = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    isEmpty: items.length === 0,
    isEatingOut: false,
    items,
  };
}

export function buildWidgetApiUrl({ origin, uid, refreshToken, timeZone }) {
  const params = new URLSearchParams({
    uid: uid || '',
    rt: refreshToken || '',
    tz: timeZone || 'Asia/Kolkata',
  });
  return `${origin}/api/widget?${params.toString()}`;
}

export function buildWidgetPageUrl({ origin, theme, showTomorrow }) {
  const params = new URLSearchParams({
    widget: 'today',
    theme: theme || 'dark',
  });
  if (showTomorrow) params.set('tomorrow', '1');
  return `${origin}/?${params.toString()}`;
}

export function buildScriptableCode({
  uid,
  refreshToken,
  firebaseApiKey,
  projectId,
  appUrl,
  theme = 'dark',
  showTomorrow = false,
}) {
  const isLight = theme === 'light';
  return `// PlanNext - Today's Meals Widget for iOS Scriptable
// Paste into Scriptable app, then add a Scriptable widget to your Home Screen.
const UID = ${JSON.stringify(uid || '')};
const REFRESH_TOKEN = ${JSON.stringify(refreshToken || '')};
const API_KEY = ${JSON.stringify(firebaseApiKey || '')};
const PROJECT_ID = ${JSON.stringify(projectId || 'planbite-c7a2d')};
const APP_URL = ${JSON.stringify(appUrl || '')};
const SHOW_TOMORROW = ${showTomorrow ? 'true' : 'false'};
const IS_LIGHT = ${isLight ? 'true' : 'false'};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function weekKey(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dd;
}

function decodeVal(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("mapValue" in v) {
    const o = {};
    const f = v.mapValue.fields || {};
    for (const k of Object.keys(f)) o[k] = decodeVal(f[k]);
    return o;
  }
  return null;
}

function cleanMeal(v) {
  if (!v || !v.trim()) return "Not planned";
  return v.replace("🍽️ Eating Out: ", "Eating out: ").trim();
}

async function fetchPlan() {
  const tokenReq = new Request("https://securetoken.googleapis.com/v1/token?key=" + encodeURIComponent(API_KEY));
  tokenReq.method = "POST";
  tokenReq.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  tokenReq.body = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(REFRESH_TOKEN);
  const tokenRes = await tokenReq.loadJSON();
  if (!tokenRes.id_token) throw new Error("Auth refresh failed");

  const docReq = new Request(
    "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID +
    "/databases/(default)/documents/users/" + encodeURIComponent(UID) + "?mask.fieldPaths=plan"
  );
  docReq.headers = { Authorization: "Bearer " + tokenRes.id_token };
  const docJson = await docReq.loadJSON();
  return decodeVal(docJson.fields && docJson.fields.plan) || {};
}

const w = new ListWidget();
w.url = APP_URL;
w.backgroundColor = new Color(IS_LIGHT ? "#fdfcf8" : "#0a0c10");
w.setPadding(14, 16, 14, 16);

const titleColor = new Color(IS_LIGHT ? "#1a1a1e" : "#f0f0f5");
const dimColor = new Color(IS_LIGHT ? "#5a5a60" : "#a0a0b0");
const accentColor = new Color(IS_LIGHT ? "#a68b36" : "#d4b45d");

const now = new Date();
const todayName = DAYS[(now.getDay() + 6) % 7];
const dateStr = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

const hdr = w.addStack();
hdr.centerAlignContent();
const brand = hdr.addText("PLANBITE");
brand.font = Font.boldSystemFont(10);
brand.textColor = accentColor;
hdr.addSpacer();
const dt = hdr.addText(dateStr);
dt.font = Font.semiboldSystemFont(11);
dt.textColor = dimColor;
w.addSpacer(8);

try {
  const plan = await fetchPlan();
  const todayMeals = (plan[weekKey(now)] && plan[weekKey(now)][todayName]) || {};
  const rows = [
    ["Breakfast", cleanMeal(todayMeals.Breakfast), "#d4b45d"],
    ["Lunch", cleanMeal(todayMeals.Lunch), "#6e786e"],
    ["Dinner", cleanMeal(todayMeals.Dinner), "#9c7b6b"]
  ];
  for (const [label, text, dotHex] of rows) {
    const row = w.addStack();
    row.centerAlignContent();
    const dot = row.addText("● ");
    dot.font = Font.systemFont(9);
    dot.textColor = new Color(dotHex);
    const lbl = row.addText(label + ": ");
    lbl.font = Font.semiboldSystemFont(12);
    lbl.textColor = dimColor;
    const val = row.addText(text);
    val.font = Font.mediumSystemFont(12);
    val.textColor = titleColor;
    val.lineLimit = 1;
    w.addSpacer(5);
  }
  if (SHOW_TOMORROW) {
    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);
    const tmrName = DAYS[(tmr.getDay() + 6) % 7];
    const tmrMeals = (plan[weekKey(tmr)] && plan[weekKey(tmr)][tmrName]) || {};
    w.addSpacer(4);
    const nextTxt = w.addText("Tomorrow (" + tmrName.slice(0, 3) + "): " + cleanMeal(tmrMeals.Breakfast));
    nextTxt.font = Font.systemFont(10);
    nextTxt.textColor = dimColor;
    nextTxt.lineLimit = 1;
  }
} catch (err) {
  const msg = w.addText("Open PlanNext to refresh meals");
  msg.font = Font.mediumSystemFont(12);
  msg.textColor = dimColor;
}

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.presentMedium();
}
Script.complete();
`;
}
