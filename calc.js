// Pure calculation logic (works in the browser and in Node for testing).
const ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };

const MEALS = [
  { key: 'b',  name: 'Morning Tiffin',     te: 'ఉదయం టిఫిన్',        time: '7:30 – 8:30 AM', share: 0.25, icon: '🌅', salad: 1 },
  { key: 's1', name: '10 AM Snack',        te: 'ఉదయం స్నాక్స్',      time: '10:00 AM',       share: 0.10, icon: '🍎', salad: 1 },
  { key: 'l',  name: 'Lunch',              te: 'మధ్యాహ్న భోజనం',     time: '1:00 PM',        share: 0.30, icon: '🍛', salad: 1.5 },
  { key: 's2', name: '4 PM Evening Snack', te: 'సాయంత్రం స్నాక్స్',  time: '4:00 PM',        share: 0.10, icon: '🥜', salad: 1 },
  { key: 'd',  name: 'Dinner',             te: 'రాత్రి భోజనం',       time: '7:00 PM',        share: 0.25, icon: '🌙', salad: 1.5 },
];

const TEMPLATE = {
  b: ['main', 'side'], s1: ['main', 'main'], l: ['main', 'side', 'curry', 'extra'],
  s2: ['main', 'extra'], d: ['main', 'curry', 'extra'],
};
const ROLE_WEIGHT = { main: 5, side: 3, curry: 3, extra: 1.5 };
const CARB_PCT_TARGET = 0.5; // carbohydrate should stay at about 45-50% of calories

function calcBody({ sex, age, height, weight, activity, goal }) {
  const bmi = weight / Math.pow(height / 100, 2);
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161); // Mifflin-St Jeor
  const tdee = bmr * (ACTIVITY[activity] || 1.2);
  const adj = { lose: -500, maintain: 0, gain: 400 }[goal] || 0;
  const floor = sex === 'male' ? 1500 : 1200;
  const target = Math.round(Math.max(tdee + adj, floor) / 10) * 10;
  const bodyFat = Math.max(3, 1.2 * bmi + 0.23 * age - 10.8 * (sex === 'male' ? 1 : 0) - 5.4); // Deurenberg estimate
  let category = 'Normal weight'; // Asian-Indian cut-offs
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25) category = 'Obese';
  else if (bmi >= 23) category = 'Overweight';
  const h2 = Math.pow(height / 100, 2);
  return {
    bmi: +bmi.toFixed(1), category, bmr: Math.round(bmr), tdee: Math.round(tdee), target,
    bodyFat: +bodyFat.toFixed(1), healthyMin: +(18.5 * h2).toFixed(1), healthyMax: +(22.9 * h2).toFixed(1),
    floorApplied: tdee + adj < floor,
    carbTargetG: Math.round(target * CARB_PCT_TARGET / 4 / 5) * 5,
  };
}

function allowed(food, dietPref) {
  if (dietPref === 'veg') return food.diet_type === 'v';
  if (dietPref === 'egg') return food.diet_type !== 'n';
  return true;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const maxOf = f => f.max_qty ? +f.max_qty
  : (f.role !== 'main' ? 2 : (f.unit_label === 'piece' ? (f.kcal_per_unit < 100 ? 8 : 4) : 4));

function mkRow(food, qty, isSalad) {
  return {
    food, qty, isSalad: !!isSalad,
    grams: Math.round(qty * food.grams_per_unit),
    kcal: Math.round(qty * food.kcal_per_unit),
    protein: +(qty * food.protein_g).toFixed(1),
    carbs: +(qty * food.carbs_g).toFixed(1),
    fat: +(qty * food.fat_g).toFixed(1),
  };
}

// Scale quantities (non-salad foods) so the total is as close as possible to the target kcal.
function scaleMeal(target, items) {
  if (!items.length) return [];
  const tw = items.reduce((a, f) => a + ROLE_WEIGHT[f.role], 0);
  const rows = items.map(f => {
    const t = target * ROLE_WEIGHT[f.role] / tw;
    let q = Math.round(t / f.kcal_per_unit / f.step) * f.step;
    q = Math.max(f.step, Math.min(q, maxOf(f)));
    return { food: f, qty: q };
  });
  const total = () => rows.reduce((a, r) => a + r.qty * r.food.kcal_per_unit, 0);
  for (let i = 0; i < 40; i++) {
    const diff = target - total();
    let best = null, bestErr = Math.abs(diff);
    for (const r of rows) {
      const stepKcal = r.food.step * r.food.kcal_per_unit;
      if (diff > 0 && r.qty + r.food.step <= maxOf(r.food) + 1e-9) {
        const err = Math.abs(diff - stepKcal);
        if (err < bestErr - 1e-9) { best = [r, r.food.step]; bestErr = err; }
      } else if (diff < 0 && r.qty - r.food.step >= r.food.step - 1e-9) {
        const err = Math.abs(diff + stepKcal);
        if (err < bestErr - 1e-9) { best = [r, -r.food.step]; bestErr = err; }
      }
    }
    if (!best) break;
    best[0].qty += best[1];
  }
  return rows.map(r => mkRow(r.food, r.qty, false));
}

function saladRows(salads, mealSalad) {
  if (!salads.length) return [];
  const each = Math.max(0.5, Math.round((mealSalad / salads.length) * 2) / 2);
  return salads.map(f => mkRow(f, each, true));
}

function mkManual(e, i) {
  return {
    food: { id: 'manual', name_en: e.name, name_te: '', unit_label: e.unit || 'serving', unit_measure: '', grams_per_unit: 0, gi: '', detail: null },
    qty: +e.qty || 1, isSalad: false, isManual: true, xi: i, grams: 0, kcal: Math.round(+e.kcal || 0),
    protein: +(+e.protein || 0).toFixed(1), carbs: +(+e.carbs || 0).toFixed(1), fat: +(+e.fat || 0).toFixed(1),
  };
}

// Salads and manually added foods keep their fixed amounts; the other foods are scaled around them.
function evaluate(items, salads, target, meal, extras) {
  const sRows = saladRows(salads, meal.salad);
  const xRows = (extras || []).map(mkManual);
  const fixedKcal = [...sRows, ...xRows].reduce((a, r) => a + r.kcal, 0);
  const rows = scaleMeal(Math.max(target - fixedKcal, target * 0.3), items);
  return [...rows, ...sRows, ...xRows];
}

function totals(rows) {
  const sum = k => +rows.reduce((a, r) => a + r[k], 0).toFixed(1);
  return { kcal: Math.round(sum('kcal')), protein: sum('protein'), carbs: sum('carbs'), fat: sum('fat') };
}

function buildMeal(foods, meal, target, dietPref, rnd, customIds, ctx, extras) {
  const pool = foods.filter(f => f.active !== false && f.meal_slots.includes(meal.key) && allowed(f, dietPref));
  const salads = pool.filter(f => f.role === 'salad');
  const pickSalad = () => {
    const fresh = salads.filter(s => !ctx.usedSalads.has(s.id));
    const from = fresh.length ? fresh : salads;
    const s = from[Math.floor(rnd() * from.length)];
    if (s) ctx.usedSalads.add(s.id);
    return s ? [s] : [];
  };
  let rows;
  const custom = (customIds || []).map(id => foods.find(f => f.id === id)).filter(Boolean);
  if (custom.length) {
    const cs = custom.filter(f => f.role === 'salad').slice(0, 2);
    const ci = custom.filter(f => f.role !== 'salad');
    const chosenSalads = cs.length ? cs : pickSalad();
    const items = ci.length ? ci : pickItems(pool, meal.key, dietPref, rnd);
    rows = evaluate(items, chosenSalads, target, meal, extras);
  } else {
    const sal = pickSalad();
    let best = null, bestScore = Infinity;
    for (let n = 0; n < 40; n++) {
      const items = pickItems(pool, meal.key, dietPref, rnd);
      if (!items.length) continue;
      const r = evaluate(items, sal, target, meal, extras);
      const t = totals(r);
      const carbPct = t.kcal ? t.carbs * 4 / t.kcal : 0;
      const score = Math.abs(t.kcal - target) / target + Math.max(0, carbPct - CARB_PCT_TARGET) * 1.5;
      if (score < bestScore) { bestScore = score; best = r; }
    }
    rows = best || evaluate([], sal, target, meal, extras);
  }
  const t = totals(rows);
  return { meal, target, rows, ...t };
}

function pickItems(pool, mealKey, dietPref, rnd) {
  const used = new Set(), out = [];
  for (const role of TEMPLATE[mealKey]) {
    let cands = pool.filter(f => f.role === role && !used.has(f.id) && !f.no_default);
    if (role === 'curry' && dietPref !== 'veg' && (mealKey === 'l' || mealKey === 'd')) {
      const nv = cands.filter(f => f.diet_type !== 'v');
      if (nv.length && rnd() < 0.5) cands = nv;
    }
    if (!cands.length) continue;
    const f = cands[Math.floor(rnd() * cands.length)];
    used.add(f.id); out.push(f);
  }
  return out;
}

function buildPlan(foods, targetDaily, dietPref, seed, custom, extras) {
  const rnd = mulberry32(seed);
  const ctx = { usedSalads: new Set() };
  return MEALS.map(m => buildMeal(foods, m, Math.round(targetDaily * m.share), dietPref, rnd, (custom || {})[m.key], ctx, (extras || {})[m.key]));
}

if (typeof module !== 'undefined') module.exports = { calcBody, buildPlan, scaleMeal, allowed, MEALS, ACTIVITY, totals };
