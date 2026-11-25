const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAOzc2-bdVB1rFqatE8QTY_iraM2xuyaN8";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "planbite-c7a2d";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EATING_OUT_PREFIX = '🍽️ Eating Out: ';

function decodeFirestoreValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(decodeFirestoreValue);
  }
  if ('mapValue' in val) {
    const out = {};
    const fields = val.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return null;
}

function getLocalDateParts(timeZone) {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
    });
    const parts = formatter.formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const year = Number(get('year'));
    const month = Number(get('month'));
    const day = Number(get('day'));
    const weekday = get('weekday');
    return { year, month, day, weekday };
  } catch {
    return {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
      weekday: DAYS[(now.getUTCDay() + 6) % 7],
    };
  }
}

function getWeekAndDay(year, month, day, offsetDays = 0) {
  const d = new Date(Date.UTC(year, month - 1, day + offsetDays));
  const jsDay = d.getUTCDay(); // 0=Sun..6=Sat
  const mondayDiff = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + mondayDiff));
  const yyyy = monday.getUTCFullYear();
  const mm = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(monday.getUTCDate()).padStart(2, '0');
  const weekKey = `${yyyy}-${mm}-${dd}`;
  const dayName = DAYS[(jsDay + 6) % 7];
  const dateLabel = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  return { weekKey, dayName, dateLabel };
}

function cleanMealText(raw) {
  if (!raw || typeof raw !== 'string') return 'Not planned';
  const trimmed = raw.trim();
  if (!trimmed) return 'Not planned';
  if (trimmed.startsWith(EATING_OUT_PREFIX)) {
    return `Eating out: ${trimmed.slice(EATING_OUT_PREFIX.length).trim()}`;
  }
  return trimmed;
}

function extractMeals(plan, weekKey, dayName) {
  const dayMeals = plan?.[weekKey]?.[dayName] || {};
  return {
    Breakfast: cleanMealText(dayMeals.Breakfast),
    Lunch: cleanMealText(dayMeals.Lunch),
    Dinner: cleanMealText(dayMeals.Dinner),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-refresh-token');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const uid = req.query.uid;
  const refreshToken = req.headers['x-refresh-token'] || req.query.rt;
  const timeZone = req.query.tz || 'Asia/Kolkata';

  if (!uid || !refreshToken) {
    return res.status(400).json({ error: 'Missing required parameters: uid and rt' });
  }

  try {
    // 1. Exchange Firebase refresh token for a short-lived ID token
    const tokenRes = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );

    if (!tokenRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired widget token. Re-copy from PlanNext.' });
    }

    const tokenData = await tokenRes.json();
    const idToken = tokenData.id_token;

    // 2. Fetch only the user's meal plan from Firestore REST API
    const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/(default)/documents/users/${encodeURIComponent(uid)}?mask.fieldPaths=plan`;

    const docRes = await fetch(docUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!docRes.ok) {
      return res.status(docRes.status).json({ error: 'Failed to load PlanBite data' });
    }

    const docJson = await docRes.json();
    const plan = decodeFirestoreValue(docJson.fields?.plan) || {};

    const { year, month, day } = getLocalDateParts(timeZone);
    const todayInfo = getWeekAndDay(year, month, day, 0);
    const tomorrowInfo = getWeekAndDay(year, month, day, 1);

    const meals = extractMeals(plan, todayInfo.weekKey, todayInfo.dayName);
    const tomorrowMeals = extractMeals(plan, tomorrowInfo.weekKey, tomorrowInfo.dayName);

    return res.status(200).json({
      app: 'PlanNext',
      section: 'PlanBite',
      dateLabel: todayInfo.dateLabel,
      day: todayInfo.dayName,
      weekKey: todayInfo.weekKey,
      meals,
      tomorrow: {
        dateLabel: tomorrowInfo.dateLabel,
        day: tomorrowInfo.dayName,
        meals: tomorrowMeals,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Widget sync failed' });
  }
}
