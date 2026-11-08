/* Diabetic Diet Chart – UI, login and patient records (save / edit / update / delete).
   Depends on: foods.js, calc.js, config.js (and supabase-js from the CDN). */
const cfg = window.APP_CONFIG || {};
const LS_KEY = 'ssh_diet_patients_v1';
let sb = null;
let FOOD_LIST = FOODS;
let state = { cur: null, plan: null, body: null, list: [], open: new Set() };

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const frac = q => {
  const w = Math.floor(q), r = q - w;
  const f = r === 0 ? '' : r === 0.5 ? '½' : r === 0.25 ? '¼' : r === 0.75 ? '¾' : r.toFixed(2);
  return (w ? String(w) : '') + f || '0';
};
const GI_LABEL = { low: 'Low GI', med: 'Medium GI', high: 'High GI' };
const ACT_LABEL = { sedentary: 'Sedentary', light: 'Light activity', moderate: 'Moderate activity', active: 'Active', very: 'Very active' };
const GOAL_LABEL = { lose: 'Weight loss', maintain: 'Weight maintenance', gain: 'Weight gain' };
const TREAT_LABEL = { diet: 'Diet only', tablets: 'Oral tablets', insulin: 'Insulin', both: 'Tablets + insulin' };
const TYPE_LABEL = { t2: 'Type 2 diabetes', t1: 'Type 1 diabetes', pre: 'Pre-diabetes' };
const PREF_LABEL = { veg: 'Vegetarian', egg: 'Vegetarian + Egg', nonveg: 'Non-vegetarian' };

function show(view) {
  ['loginView', 'listView', 'formView', 'chartView'].forEach(v => { $(v).hidden = v !== view; });
  window.scrollTo(0, 0);
}
function toast(msg, bad) {
  const t = $('toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 3500);
}

/* ---------------- storage: Supabase (if configured) or this browser only ---------------- */
const Store = {
  async list() {
    if (sb) {
      const { data, error } = await sb.from('patients').select('*').order('updated_at', { ascending: false });
      if (error) throw error; return data;
    }
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]').sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  },
  async save(rec) {
    rec.updated_at = new Date().toISOString();
    if (sb) {
      if (rec.id) {
        const { id, created_at, ...rest } = rec;
        const { data, error } = await sb.from('patients').update(rest).eq('id', id).select().single();
        if (error) throw error; return data;
      }
      const { data, error } = await sb.from('patients').insert(rec).select().single();
      if (error) throw error; return data;
    }
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    if (rec.id) {
      const i = all.findIndex(r => r.id === rec.id);
      if (i >= 0) all[i] = { ...all[i], ...rec }; else all.push(rec);
    } else {
      rec.id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
      rec.created_at = rec.updated_at; all.push(rec);
    }
    localStorage.setItem(LS_KEY, JSON.stringify(all));
    return rec;
  },
  async remove(id) {
    if (sb) { const { error } = await sb.from('patients').delete().eq('id', id); if (error) throw error; return; }
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]').filter(r => r.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  },
};

/* ---------------- start-up and login ---------------- */
async function init() {
  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }
  $('loginForm').addEventListener('submit', onLogin);
  $('logoutBtn').addEventListener('click', onLogout);
  $('newBtn').addEventListener('click', () => openForm(null));
  $('searchBox').addEventListener('input', renderList);
  $('profileForm').addEventListener('submit', onSubmitForm);
  $('cancelFormBtn').addEventListener('click', () => (state.cur && state.cur.fromChart ? show('chartView') : goList()));

  if (sb) {
    const { data } = await sb.auth.getSession();
    if (data && data.session) await startApp(); else show('loginView');
  } else {
    $('demoBanner').hidden = false;
    await startApp();
  }
}

async function onLogin(e) {
  e.preventDefault();
  $('loginMsg').textContent = '';
  const { error } = await sb.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value });
  if (error) { $('loginMsg').textContent = 'Login failed: ' + error.message; return; }
  $('password').value = '';
  await startApp();
}
async function onLogout() { if (sb) await sb.auth.signOut(); show(sb ? 'loginView' : 'listView'); $('logoutBtn').hidden = true; }

async function startApp() {
  $('logoutBtn').hidden = !sb;
  if (sb) {
    try {
      const { data, error } = await sb.from('foods').select('*').eq('active', true);
      if (!error && data && data.length) {
        FOOD_LIST = data.map(r => ({
          ...r, grams_per_unit: +r.grams_per_unit, kcal_per_unit: +r.kcal_per_unit, protein_g: +r.protein_g,
          carbs_g: +r.carbs_g, fat_g: +r.fat_g, step: +r.step, max_qty: r.max_qty == null ? null : +r.max_qty,
        }));
        $('dbStatus').textContent = 'Food list: Supabase (' + data.length + ' items)';
      } else $('dbStatus').textContent = 'Food list: built-in';
    } catch (e) { $('dbStatus').textContent = 'Food list: built-in'; }
  } else $('dbStatus').textContent = 'Food list: built-in';
  await goList();
}

/* ---------------- patient list ---------------- */
async function goList() {
  try { state.list = await Store.list(); } catch (e) { toast('Could not load patients: ' + e.message, true); state.list = []; }
  state.cur = null; renderList(); show('listView');
}
function renderList() {
  const q = $('searchBox').value.trim().toLowerCase();
  const rows = state.list.filter(r => !q || (r.name || '').toLowerCase().includes(q) || (r.uhid || '').toLowerCase().includes(q) || (r.phone || '').includes(q));
  $('count').textContent = rows.length + ' patient' + (rows.length === 1 ? '' : 's');
  $('listBody').innerHTML = rows.length ? rows.map(r => `
    <tr>
      <td><strong>${esc(r.name)}</strong><div class="te">${esc(r.uhid || '')} ${r.phone ? '· ' + esc(r.phone) : ''}</div></td>
      <td>${r.age} / ${r.sex === 'male' ? 'M' : 'F'}</td>
      <td>${esc(TYPE_LABEL[r.diabetes_type] || '')}</td>
      <td class="num">${r.target_kcal || ''} kcal</td>
      <td class="te">${r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-IN') : ''}</td>
      <td class="act"><button class="mini" data-view="${esc(r.id)}">View chart</button>
        <button class="mini" data-edit="${esc(r.id)}">Edit</button>
        <button class="mini danger" data-del="${esc(r.id)}">Delete</button></td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty">No patients yet. Click “New patient”.</td></tr>';
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRecord(b.dataset.view, 'chart'));
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openRecord(b.dataset.edit, 'form'));
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => deleteRecord(b.dataset.del));
}
async function deleteRecord(id) {
  const r = state.list.find(x => x.id === id);
  if (!r || !confirm('Delete the diet chart of ' + r.name + '? This cannot be undone.')) return;
  try { await Store.remove(id); toast('Patient deleted'); await goList(); } catch (e) { toast('Delete failed: ' + e.message, true); }
}
function openRecord(id, where) {
  const r = state.list.find(x => x.id === id); if (!r) return;
  state.cur = {
    id: r.id, seed: r.seed || 1, custom: r.items || {}, extras: r.extras || {},
    profile: {
      name: r.name, uhid: r.uhid || '', phone: r.phone || '', age: +r.age, sex: r.sex, height: +r.height_cm, weight: +r.weight_kg,
      activity: r.activity, goal: r.goal, dietPref: r.diet_pref, dtype: r.diabetes_type || 't2', treatment: r.treatment || 'diet',
      hba1c: r.hba1c, fbs: r.fbs, ppbs: r.ppbs, notes: r.notes || '',
    },
  };
  if (where === 'form') openForm(state.cur); else openChart();
}

/* ---------------- form ---------------- */
function openForm(cur) {
  const p = cur ? cur.profile : { name: '', uhid: '', phone: '', age: '', sex: '', height: '', weight: '', activity: '', goal: 'maintain', dietPref: 'veg', dtype: 't2', treatment: 'diet', hba1c: '', fbs: '', ppbs: '', notes: '' };
  state.cur = cur ? { ...cur, fromChart: !!cur.fromChart } : { id: null, seed: 1, custom: {}, extras: {}, profile: p };
  $('formTitle').textContent = cur && cur.id ? 'Edit patient – ' + p.name : 'New patient';
  const set = (id, v) => { $(id).value = v == null ? '' : v; };
  set('name', p.name); set('uhid', p.uhid); set('phone', p.phone); set('age', p.age); set('sex', p.sex);
  set('height', p.height); set('weight', p.weight); set('activity', p.activity); set('goal', p.goal); set('dietPref', p.dietPref);
  set('dtype', p.dtype); set('treatment', p.treatment); set('hba1c', p.hba1c); set('fbs', p.fbs); set('ppbs', p.ppbs); set('notes', p.notes);
  $('formMsg').textContent = '';
  show('formView');
}
function onSubmitForm(e) {
  e.preventDefault();
  const v = id => $(id).value;
  const num = id => (v(id) === '' ? null : +v(id));
  const p = {
    name: v('name').trim(), uhid: v('uhid').trim(), phone: v('phone').trim(), age: +v('age'), sex: v('sex'),
    height: +v('height'), weight: +v('weight'), activity: v('activity'), goal: v('goal'), dietPref: v('dietPref'),
    dtype: v('dtype'), treatment: v('treatment'), hba1c: num('hba1c'), fbs: num('fbs'), ppbs: num('ppbs'), notes: v('notes').trim(),
  };
  const msg = $('formMsg');
  if (!p.name || !p.sex || !p.activity) { msg.textContent = 'Please fill name, sex and lifestyle.'; return; }
  if (p.age < 5 || p.age > 100 || p.height < 90 || p.height > 230 || p.weight < 15 || p.weight > 250) { msg.textContent = 'Please check age, height (cm) and weight (kg).'; return; }
  const prev = state.cur || { id: null, seed: 1, custom: {} };
  state.cur = { id: prev.id, seed: prev.seed || 1, custom: prev.custom || {}, extras: prev.extras || {}, profile: p };
  openChart();
}

/* ---------------- chart ---------------- */
function openChart() {
  const c = state.cur, p = c.profile;
  state.body = calcBody(p);
  state.open = new Set();
  renderChart();
  show('chartView');
}

function alertsFor(p, b) {
  const a = [];
  if (p.dtype === 't1' || p.age < 18) a.push('Type 1 diabetes / children: carbohydrate portions must be matched to the insulin dose by the treating doctor. Use this chart only as a guide.');
  if (p.treatment === 'insulin' || p.treatment === 'both' || p.treatment === 'tablets') a.push('On diabetes medicine: do not skip or delay meals and snacks (risk of low sugar). Keep glucose tablets or sugar handy. Follow the doctor\'s advice for dose and timing.');
  if (p.hba1c != null && p.hba1c >= 9) a.push('HbA1c is ' + p.hba1c + '% – very high. Please get the doctor\'s review along with this diet.');
  if (p.fbs != null && p.fbs >= 250) a.push('Fasting sugar is very high – doctor\'s review is advised.');
  if (b.category === 'Obese' && p.goal === 'maintain') a.push('BMI is in the obese range. Gradual weight loss (0.5 kg per week) improves sugar control – consider the “Weight loss” goal.');
  if (b.floorApplied) a.push('The calorie target was raised to a safe minimum level.');
  return a;
}

function renderChart() {
  const c = state.cur, p = c.profile, b = state.body;
  c.extras = c.extras || {};
  state.plan = buildPlan(FOOD_LIST, b.target, p.dietPref, c.seed, c.custom, c.extras);
  const tot = state.plan.reduce((a, m) => ({ k: a.k + m.kcal, p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fat }), { k: 0, p: 0, c: 0, f: 0 });
  const carbPct = tot.k ? Math.round(tot.c * 4 / tot.k * 100) : 0;

  $('saveBtn').textContent = c.id ? '💾 Update patient' : '💾 Save patient';
  $('deleteBtn').hidden = !c.id;
  $('patientCard').innerHTML = `
    <div><span class="k">Patient</span><strong>${esc(p.name)}</strong></div>
    <div><span class="k">UHID / Phone</span>${esc(p.uhid || '–')} ${p.phone ? '· ' + esc(p.phone) : ''}</div>
    <div><span class="k">Age / Sex</span>${p.age} yrs / ${p.sex === 'male' ? 'Male' : 'Female'}</div>
    <div><span class="k">Height / Weight</span>${p.height} cm / ${p.weight} kg</div>
    <div><span class="k">Diabetes</span>${esc(TYPE_LABEL[p.dtype])} · ${esc(TREAT_LABEL[p.treatment])}</div>
    <div><span class="k">Sugar values</span>${p.hba1c != null ? 'HbA1c ' + p.hba1c + '% ' : ''}${p.fbs != null ? 'FBS ' + p.fbs + ' ' : ''}${p.ppbs != null ? 'PPBS ' + p.ppbs : ''}${p.hba1c == null && p.fbs == null && p.ppbs == null ? '–' : ''}</div>
    <div><span class="k">Lifestyle / Goal</span>${esc(ACT_LABEL[p.activity])} · ${esc(GOAL_LABEL[p.goal])}</div>
    <div><span class="k">Food type / Date</span>${esc(PREF_LABEL[p.dietPref])} · ${new Date().toLocaleDateString('en-IN')}</div>
    ${p.notes ? `<div class="wide"><span class="k">Doctor's notes</span>${esc(p.notes)}</div>` : ''}`;

  $('summary').innerHTML = `
    <div class="card"><div class="lbl">BMI</div><div class="val">${b.bmi}</div><div class="sub">${b.category}</div></div>
    <div class="card"><div class="lbl">BMR</div><div class="val">${b.bmr}</div><div class="sub">kcal/day at rest</div></div>
    <div class="card"><div class="lbl">Daily calories needed</div><div class="val">${b.tdee}</div><div class="sub">to maintain weight</div></div>
    <div class="card hl"><div class="lbl">Diet target</div><div class="val">${b.target}</div><div class="sub">kcal/day · ${esc(GOAL_LABEL[p.goal])}</div></div>
    <div class="card"><div class="lbl">Body fat (estimate)</div><div class="val">${b.bodyFat}%</div><div class="sub">from BMI, age &amp; sex</div></div>
    <div class="card"><div class="lbl">Carbohydrate target</div><div class="val">~${b.carbTargetG} g</div><div class="sub">per day (about 45–50% of calories)</div></div>`;
  $('alerts').innerHTML = alertsFor(p, b).map(n => `<p class="warn">${esc(n)}</p>`).join('') +
    `<p class="small">Healthy weight range for this height: ${b.healthyMin}–${b.healthyMax} kg (BMI 18.5–22.9).</p>`;

  $('dayTotal').innerHTML = `<strong>Total today: ${tot.k} kcal</strong> (target ${b.target}) · Carbohydrate ${tot.c.toFixed(0)} g
    <span class="pill ${carbPct <= 55 ? 'ok' : 'hi'}">${carbPct}% of calories</span> · Protein ${tot.p.toFixed(0)} g · Fat ${tot.f.toFixed(0)} g`;
  $('meals').innerHTML = state.plan.map(mealCard).join('');
  document.querySelectorAll('details[data-meal]').forEach(d => d.addEventListener('toggle', () => { d.open ? state.open.add(d.dataset.meal) : state.open.delete(d.dataset.meal); }));
  document.querySelectorAll('input[data-meal-food]').forEach(cb => cb.addEventListener('change', onPick));
  wireMix();
  document.querySelectorAll('button[data-addx]').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.addx, box = btn.closest('.addx');
    const g = f => box.querySelector('[data-f=' + f + ']').value.trim();
    if (!g('name') || g('kcal') === '' || +g('kcal') < 0) { toast('Enter the food name and its calories', true); return; }
    const e = { name: g('name'), qty: g('qty') === '' ? 1 : +g('qty'), unit: g('unit') || 'serving', kcal: +g('kcal'), carbs: g('carbs') === '' ? 0 : +g('carbs') };
    (state.cur.extras[key] = state.cur.extras[key] || []).push(e);
    state.open.add(key); renderChart();
  }));
  document.querySelectorAll('button[data-delx]').forEach(btn => btn.addEventListener('click', () => {
    const [key, i] = btn.dataset.delx.split(':');
    state.cur.extras[key].splice(+i, 1);
    if (!state.cur.extras[key].length) delete state.cur.extras[key];
    state.open.add(key); renderChart();
  }));
  document.querySelectorAll('button[data-reset]').forEach(btn => btn.addEventListener('click', () => { delete state.cur.custom[btn.dataset.reset]; renderChart(); }));
}

const ROLE_TITLE = { main: 'Tiffin / roti / grain / snack', side: 'Dal, sambar & chutney', curry: 'Vegetable, egg & non-veg curries', extra: 'Soup, curd & drinks', salad: 'Vegetable salads (always included)' };

function mealCard(m) {
  const key = m.meal.key, chosenIds = new Set(m.rows.map(r => r.food.id));
  const carbPct = m.kcal ? Math.round(m.carbs * 4 / m.kcal * 100) : 0;
  const rows = m.rows.map(r => r.isManual ? manualRow(r, key) : `
    <tr class="${r.isSalad ? 'saladrow' : ''}">
      <td><div class="fn">${r.isSalad ? '🥗 ' : ''}${esc(r.food.name_en)} <span class="gi ${esc(r.food.gi)}">${GI_LABEL[r.food.gi] || ''}</span></div>
        <div class="te nm">${esc(r.food.name_te || '')}</div>${r.food.detail ? `<div class="det">${esc(r.food.detail)}</div>` : ''}</td>
      <td class="num">${frac(r.qty)} × ${esc(r.food.unit_label)}<div class="te">${r.grams} ${r.food.unit_measure}</div></td>
      <td class="num"><strong>${r.kcal}</strong> kcal<div class="te">C ${r.carbs} · P ${r.protein} · F ${r.fat}</div></td>
    </tr>`).join('');
  const pool = FOOD_LIST.filter(f => f.active !== false && f.meal_slots.includes(key) && allowed(f, state.cur.profile.dietPref));
  const groups = ['main', 'side', 'curry', 'extra', 'salad'].map(role => {
    const list = pool.filter(f => f.role === role); if (!list.length) return '';
    return `<div class="grp">${ROLE_TITLE[role]}</div><div class="chips">${list.map(f => `
      <label class="chip"><input type="checkbox" data-meal-food="${key}" value="${esc(f.id)}" ${chosenIds.has(f.id) ? 'checked' : ''}>${esc(f.name_en)} <span class="gi ${esc(f.gi)}">${GI_LABEL[f.gi] || ''}</span></label>`).join('')}</div>`;
  }).join('');
  const hasCustom = !!(state.cur.custom && state.cur.custom[key]);
  return `
  <section class="meal">
    <header><span class="ic">${m.meal.icon}</span>
      <div><h3>${m.meal.name} <small>${m.meal.te}</small></h3><div class="time">${m.meal.time}</div></div>
      <div class="mk"><strong>${m.kcal}</strong> / ${m.target} kcal<div class="te">Carbs ${m.carbs} g <span class="pill ${carbPct <= 55 ? 'ok' : 'hi'}">${carbPct}%</span></div></div></header>
    <table><thead><tr><th>Food</th><th class="num">Quantity</th><th class="num">Calories</th></tr></thead><tbody>${rows}</tbody></table>
    ${exchangeBlock(m)}
    <details data-meal="${key}" ${state.open.has(key) ? 'open' : ''} class="noprint">
      <summary>Change foods for this meal</summary>
      <p class="hint">Tick the foods the patient eats; untick the rest. Quantities are re-adjusted to this meal's ${m.target} kcal. A vegetable salad is always included.</p>
      ${groups}
      <div class="grp">Add any other food manually (name, quantity, calories)</div>
      <div class="addx">
        <input data-f="name" placeholder="Food name" maxlength="60">
        <input data-f="qty" type="number" min="0" step="0.25" placeholder="Quantity">
        <input data-f="unit" placeholder="Unit (cup, piece, g)" maxlength="20">
        <input data-f="kcal" type="number" min="0" placeholder="Total kcal">
        <input data-f="carbs" type="number" min="0" step="0.1" placeholder="Carbs g (optional)">
        <button type="button" class="mini" data-addx="${key}">Add</button>
      </div>
      ${hasCustom ? `<button type="button" class="link" data-reset="${key}">Reset to suggested foods</button>` : ''}
    </details>
  </section>`;
}

/* "Eat any ONE of these" list: how much of each tiffin / roti / grain fits this meal's calories.
   Chutney, curry, salad and manual foods stay fixed; the rest of the calories go to the chosen main food. */
function exchangeBlock(m) {
  const key = m.meal.key;
  const fixed = m.rows.filter(r => r.food.role !== 'main').reduce((a, r) => a + r.kcal, 0);
  const budget = Math.max(0, m.target - fixed);
  const pool = FOOD_LIST.filter(f => f.active !== false && f.role === 'main' && f.meal_slots.includes(key) && allowed(f, state.cur.profile.dietPref));
  if (!pool.length || budget < 40) return '';
  const qtyFor = (f, b) => Math.max(f.step, Math.round(b / f.kcal_per_unit / f.step) * f.step);
  const trs = pool.map(f => {
    const q = qtyFor(f, budget);
    return `<tr><td><label><input type="checkbox" data-mix="${key}" value="${esc(f.id)}"> <span class="fn">${esc(f.name_en)}</span>
        <span class="gi ${esc(f.gi)}">${GI_LABEL[f.gi] || ''}</span></label><div class="te nm">${esc(f.name_te || '')}</div></td>
      <td class="num"><strong>${frac(q)} × ${esc(f.unit_label)}</strong><div class="te">${Math.round(q * f.grams_per_unit)} ${f.unit_measure}</div></td>
      <td class="num">${Math.round(q * f.kcal_per_unit)} kcal<div class="te">C ${+(q * f.carbs_g).toFixed(1)} g</div></td></tr>`;
  }).join('');
  return `
    <div class="exch" data-exch="${key}" data-budget="${budget}">
      <div class="exh">🔁 Quantity options – eat ANY ONE of these (day by day)</div>
      <p class="hint">Quantity of each food that fits this meal's ${m.target} kcal, together with the chutney / curry / salad shown above (${fixed} kcal).
      To mix two or more foods, tick them – the calories are shared equally.</p>
      <table><thead><tr><th>Food</th><th class="num">Quantity</th><th class="num">Calories</th></tr></thead><tbody>${trs}</tbody></table>
      <div class="mixout" data-mixout="${key}"></div>
    </div>`;
}
function wireMix() {
  document.querySelectorAll('input[data-mix]').forEach(cb => cb.addEventListener('change', () => {
    const key = cb.dataset.mix, box = document.querySelector(`[data-exch="${key}"]`);
    const budget = +box.dataset.budget;
    const ids = [...box.querySelectorAll('input[data-mix]:checked')].map(x => x.value);
    const out = box.querySelector('.mixout');
    if (ids.length < 2) { out.innerHTML = ''; return; }
    const foods = ids.map(id => FOOD_LIST.find(f => f.id === id));
    const share = budget / foods.length;
    const parts = foods.map(f => {
      const q = Math.max(f.step, Math.round(share / f.kcal_per_unit / f.step) * f.step);
      return { f, q, k: Math.round(q * f.kcal_per_unit) };
    });
    const tot = parts.reduce((a, p) => a + p.k, 0);
    out.innerHTML = `<div class="mixbox"><strong>Mixed option:</strong> ${parts.map(p => `${frac(p.q)} ${esc(p.f.unit_label)} ${esc(p.f.name_en)}`).join(' + ')}
      <span class="te"> = ${tot} kcal (aim ${Math.round(budget)})</span></div>`;
  }));
}

function manualRow(r, key) {
  return `<tr class="manualrow"><td><div class="fn">✍️ ${esc(r.food.name_en)} <span class="gi med">Added manually</span></div></td>
    <td class="num">${frac(r.qty)} × ${esc(r.food.unit_label)}</td>
    <td class="num"><strong>${r.kcal}</strong> kcal<div class="te">C ${r.carbs}</div>
    <button type="button" class="mini danger noprint" data-delx="${key}:${r.xi}">Remove</button></td></tr>`;
}

function onPick(e) {
  const key = e.target.dataset.mealFood;
  const ids = [...document.querySelectorAll(`input[data-meal-food="${key}"]:checked`)].map(x => x.value);
  if (ids.length) state.cur.custom[key] = ids; else delete state.cur.custom[key];
  state.open.add(key);
  renderChart();
}

/* ---------------- save / update / delete ---------------- */
function currentItems() {
  const o = {}; state.plan.forEach(m => { o[m.meal.key] = m.rows.filter(r => !r.isManual).map(r => r.food.id); }); return o;
}
async function saveCurrent() {
  const c = state.cur, p = c.profile, b = state.body;
  const rec = {
    id: c.id || undefined, uhid: p.uhid || null, name: p.name, phone: p.phone || null, age: p.age, sex: p.sex,
    height_cm: p.height, weight_kg: p.weight, activity: p.activity, goal: p.goal, diet_pref: p.dietPref,
    diabetes_type: p.dtype, treatment: p.treatment, hba1c: p.hba1c, fbs: p.fbs, ppbs: p.ppbs, notes: p.notes || null,
    bmi: b.bmi, bmr: b.bmr, tdee: b.tdee, target_kcal: b.target, body_fat_pct: b.bodyFat,
    seed: c.seed, items: currentItems(), extras: c.extras || {},
    plan: state.plan.map(m => ({
      meal: m.meal.name, target_kcal: m.target, total_kcal: m.kcal, carbs_g: m.carbs,
      items: m.rows.map(r => ({ food: r.food.name_en, qty: r.qty, unit: r.food.unit_label, grams: r.grams, kcal: r.kcal })),
    })),
  };
  if (!rec.id) delete rec.id;
  try {
    const saved = await Store.save(rec);
    c.id = saved.id; c.custom = saved.items || c.custom;
    toast(rec.id ? 'Patient chart updated ✔' : 'Patient chart saved ✔');
    renderChart();
  } catch (e) { toast('Save failed: ' + e.message, true); }
}
async function deleteCurrent() {
  const c = state.cur; if (!c || !c.id) return;
  if (!confirm('Delete the diet chart of ' + c.profile.name + '? This cannot be undone.')) return;
  try { await Store.remove(c.id); toast('Patient deleted'); await goList(); } catch (e) { toast('Delete failed: ' + e.message, true); }
}

document.addEventListener('DOMContentLoaded', () => {
  $('saveBtn').addEventListener('click', saveCurrent);
  $('deleteBtn').addEventListener('click', deleteCurrent);
  $('editBtn').addEventListener('click', () => { state.cur.fromChart = true; openForm(state.cur); });
  $('listBtn').addEventListener('click', goList);
  $('shuffleBtn').addEventListener('click', () => { state.cur.seed++; state.cur.custom = {}; renderChart(); });
  $('printBtn').addEventListener('click', () => window.print());
  init();
});
