// Built-in food list for DIABETIC diet charts (offline fallback; same data is seeded into Supabase by supabase.sql).
// Values are approximate per ONE unit. gi = glycaemic index class (low / med / high).
// meals: b = morning tiffin, s1 = 10 AM snack, l = lunch, s2 = 4 PM snack, d = dinner
// diet: v = vegetarian, e = contains egg, n = non-vegetarian
// role: main | side (dal / chutney / sambar) | curry | extra (curd / soup / drink) | salad (added to every meal)
// o.max = largest quantity in units, o.nd = not suggested by default (still selectable), o.detail = ingredients (salads)
const F = (id, en, te, meals, diet, unit, grams, kcal, p, c, f, role, gi, o = {}) => ({
  id, name_en: en, name_te: te, meal_slots: meals.split(','), diet_type: diet,
  unit_label: unit, unit_measure: /glass|cup/.test(unit) ? 'ml' : 'g',
  grams_per_unit: grams, kcal_per_unit: kcal, protein_g: p, carbs_g: c, fat_g: f, role, gi,
  step: o.step || (unit === 'piece' && kcal < 100 ? 1 : 0.5), max_qty: o.max || null,
  detail: o.detail || null, no_default: !!o.nd, active: true,
});

const FOODS = [
  // ---------- Morning tiffin (and dinner) mains ----------
  F('pesarattu', 'Pesarattu (green gram dosa)', 'పెసరట్టు', 'b,d', 'v', 'piece', 90, 110, 6.5, 15, 2.5, 'main', 'low', { max: 4 }),
  F('ragi-dosa', 'Ragi Dosa', 'రాగి దోశ', 'b,d', 'v', 'piece', 80, 100, 3, 19, 1.5, 'main', 'low', { max: 4 }),
  F('besan-chilla', 'Senagapindi Attu (besan chilla)', 'సెనగపిండి అట్టు', 'b,d', 'v', 'piece', 80, 120, 6, 12, 5, 'main', 'low', { max: 3 }),
  F('dosa', 'Plain Dosa', 'దోశ', 'b,d', 'v', 'piece', 80, 130, 3, 22, 3, 'main', 'med', { max: 4 }),
  F('upma', 'Rava Upma', 'ఉప్మా', 'b', 'v', 'bowl', 150, 210, 5, 33, 7, 'main', 'med', { max: 1.5, nd: true }),
  F('idli', 'Idli', 'ఇడ్లీ', 'b,d', 'v', 'piece', 40, 58, 2, 12, 0.3, 'main', 'med', { max: 3 }),
  F('veg-oats-upma', 'Vegetable Oats Upma', 'వెజ్ ఓట్స్ ఉప్మా', 'b', 'v', 'bowl', 150, 150, 5.5, 24, 3.5, 'main', 'low', { max: 2 }),
  F('korra-upma', 'Korra (foxtail millet) Upma', 'కొర్రల ఉప్మా', 'b', 'v', 'bowl', 150, 170, 5, 29, 4, 'main', 'low', { max: 2 }),
  F('wheat-rava-upma', 'Wheat Rava (Godhuma Ravva) Upma', 'గోధుమ రవ్వ ఉప్మా', 'b', 'v', 'bowl', 150, 180, 5, 31, 4.5, 'main', 'med', { max: 1.5, nd: true }),
  F('millet-khichdi', 'Millet & Moong Dal Khichdi', 'చిరుధాన్యాల కిచిడీ', 'd', 'v', 'bowl', 200, 220, 8, 36, 5, 'main', 'low', { max: 1.5 }),
  // ---------- Breakfast / dinner: sides ----------
  F('sambar', 'Sambar (with vegetables, drumstick)', 'సాంబార్', 'b,l,d', 'v', 'bowl', 150, 75, 4, 10, 2, 'side', 'low', { max: 2 }),
  F('coconut-chutney', 'Coconut Chutney', 'కొబ్బరి చట్నీ', 'b,d', 'v', 'portion', 30, 55, 0.6, 2, 5, 'side', 'low', { max: 1 }),
  F('peanut-chutney', 'Peanut Chutney (Palli Chutney)', 'పల్లీ చట్నీ', 'b,d', 'v', 'portion', 30, 75, 3, 3, 6, 'side', 'low', { max: 1 }),
  F('tomato-chutney', 'Tomato Chutney', 'టమాటా చట్నీ', 'b,d', 'v', 'portion', 30, 30, 0.5, 3, 2, 'side', 'low', { max: 2 }),
  F('mint-chutney', 'Mint (Pudina) Chutney', 'పుదీనా చట్నీ', 'b,d', 'v', 'portion', 30, 25, 0.8, 3, 1.2, 'side', 'low', { max: 2 }),
  F('allam-pachadi', 'Ginger Chutney (Allam Pachadi)', 'అల్లం పచ్చడి', 'b,d', 'v', 'portion', 30, 35, 0.8, 4, 1.8, 'side', 'low', { max: 2 }),
  F('veg-omelette', 'Vegetable Omelette (1 egg)', 'కూరగాయల ఆమ్లెట్', 'b,d', 'e', 'piece', 70, 105, 7, 2, 7.5, 'curry', 'low', { step: 1, max: 2 }),
  F('boiled-egg', 'Boiled Egg', 'ఉడికించిన గుడ్డు', 'b,s1,s2,d', 'e', 'piece', 50, 75, 6.3, 0.6, 5, 'curry', 'low', { step: 1, max: 2 }),
  // ---------- Snacks (10 AM / 4 PM) ----------
  F('guava', 'Guava (Jama pandu)', 'జామపండు', 's1,s2', 'v', 'piece', 100, 68, 2.6, 14, 1, 'main', 'low', { step: 1, max: 2 }),
  F('apple', 'Apple', 'ఆపిల్', 's1,s2', 'v', 'piece', 120, 62, 0.3, 15, 0.2, 'main', 'low', { step: 1, max: 2 }),
  F('orange', 'Orange / Sweet Lime (small)', 'నారింజ / బత్తాయి', 's1,s2', 'v', 'piece', 130, 60, 1.2, 14, 0.2, 'main', 'low', { step: 1, max: 2 }),
  F('papaya', 'Papaya (Boppayi)', 'బొప్పాయి', 's1,s2', 'v', 'bowl', 100, 45, 0.6, 11, 0.2, 'main', 'med', { max: 1.5 }),
  F('jamun', 'Jamun (Neredu pandlu)', 'నేరేడు పండ్లు', 's1,s2', 'v', 'bowl', 100, 62, 0.7, 14, 0.2, 'main', 'low', { max: 1.5 }),
  F('roasted-chana', 'Roasted Chana', 'వేయించిన శనగలు', 's1,s2', 'v', 'handful', 30, 110, 6, 18, 2, 'main', 'low', { max: 1.5 }),
  F('sprouts-sundal', 'Sprouts Sundal (moong / chana)', 'మొలకల సుండల్', 's1,s2', 'v', 'bowl', 100, 120, 8, 18, 2, 'main', 'low', { max: 1.5 }),
  F('boiled-peanuts', 'Boiled Peanuts', 'ఉడికించిన పల్లీలు', 's1,s2', 'v', 'handful', 40, 105, 5, 4, 8, 'main', 'low', { max: 1 }),
  F('almonds', 'Almonds (6–7 nuts)', 'బాదం పప్పు', 's1,s2', 'v', 'handful', 15, 87, 3.2, 3.3, 7.5, 'main', 'low', { max: 1 }),
  F('walnuts', 'Walnuts (3–4 halves)', 'అక్రోట్', 's1,s2', 'v', 'handful', 15, 98, 2.3, 2, 9.8, 'main', 'low', { max: 1 }),
  F('ragi-java', 'Ragi Java / Malt (no sugar)', 'రాగి జావ', 's1,s2', 'v', 'glass', 200, 80, 3, 16, 0.6, 'main', 'low', { max: 1 }),
  F('buttermilk', 'Buttermilk (Majjiga), no sugar', 'మజ్జిగ', 's1,s2,l', 'v', 'glass', 200, 40, 2, 3, 2, 'extra', 'low', { max: 2 }),
  F('green-tea', 'Green Tea / Black Tea (no sugar)', 'గ్రీన్ టీ (చక్కెర లేకుండా)', 'b,s1,s2', 'v', 'cup', 150, 2, 0, 0.3, 0, 'extra', 'low', { max: 2 }),
  F('veg-soup', 'Clear Vegetable Soup', 'వెజిటబుల్ సూప్', 's2,l,d', 'v', 'bowl', 150, 45, 2, 7, 1, 'extra', 'low', { max: 2 }),
  // ---------- Lunch / dinner: mains (millets & wheat first) ----------
  F('chapati', 'Whole-wheat Chapati', 'గోధుమ చపాతీ', 'l,d', 'v', 'piece', 40, 100, 3.2, 17, 2.2, 'main', 'med', { max: 4 }),
  F('jowar-roti', 'Jowar Roti (Jonna Rotte)', 'జొన్న రొట్టె', 'l,d', 'v', 'piece', 40, 100, 3, 21, 0.8, 'main', 'low', { max: 4 }),
  F('bajra-roti', 'Bajra Roti (Sajja Rotte)', 'సజ్జ రొట్టె', 'l,d', 'v', 'piece', 40, 105, 3.5, 20, 1.5, 'main', 'low', { max: 4 }),
  F('ragi-sangati', 'Ragi Sangati / Mudda', 'రాగి సంగటి', 'l,d', 'v', 'ball', 150, 190, 4, 40, 1, 'main', 'low', { max: 2 }),
  F('korra-annam', 'Korra Annam (foxtail millet rice)', 'కొర్ర అన్నం', 'l,d', 'v', 'bowl', 100, 120, 3.5, 24, 1.2, 'main', 'low', { max: 2 }),
  F('brown-rice', 'Brown Rice', 'ముడి బియ్యం అన్నం', 'l,d', 'v', 'bowl', 100, 112, 2.6, 23, 0.9, 'main', 'med', { max: 1.5 }),
  F('rice', 'White Rice (Annam) – limit', 'అన్నం (తెల్ల బియ్యం)', 'l,d', 'v', 'bowl', 100, 130, 2.7, 28, 0.3, 'main', 'high', { max: 1, nd: true }),
  // ---------- Lunch / dinner: dal ----------
  F('pappu', 'Toor Dal (Pappu)', 'పప్పు', 'l,d', 'v', 'bowl', 150, 150, 8, 22, 3, 'side', 'low', { max: 1.5 }),
  F('menthi-pappu', 'Menthi Kura Pappu (fenugreek dal)', 'మెంతికూర పప్పు', 'l,d', 'v', 'bowl', 150, 140, 8, 18, 3.5, 'side', 'low', { max: 1.5 }),
  F('sorakaya-pappu', 'Sorakaya Pappu (bottle gourd dal)', 'సొరకాయ పప్పు', 'l,d', 'v', 'bowl', 150, 130, 7, 18, 3, 'side', 'low', { max: 1.5 }),
  F('gongura-pappu', 'Gongura Pappu', 'గోంగూర పప్పు', 'l,d', 'v', 'bowl', 150, 145, 8, 20, 4, 'side', 'low', { max: 1.5 }),
  F('palakura-pappu', 'Palakura Pappu (spinach dal)', 'పాలకూర పప్పు', 'l,d', 'v', 'bowl', 150, 140, 8, 19, 3.5, 'side', 'low', { max: 1.5 }),
  F('tomato-pappu', 'Tomato Pappu', 'టమాటా పప్పు', 'l,d', 'v', 'bowl', 150, 145, 7.5, 20, 4, 'side', 'low', { max: 1.5 }),
  // ---------- Lunch / dinner: curries (low-oil, no potato) ----------
  F('kakarakaya', 'Kakarakaya Fry (bitter gourd)', 'కాకరకాయ వేపుడు', 'l,d', 'v', 'bowl', 100, 85, 2.2, 7, 5.5, 'curry', 'low', { max: 2 }),
  F('sorakaya-kura', 'Sorakaya Kura (bottle gourd)', 'సొరకాయ కూర', 'l,d', 'v', 'bowl', 100, 55, 1.5, 6, 2.5, 'curry', 'low', { max: 2 }),
  F('beerakaya-kura', 'Beerakaya Kura (ridge gourd)', 'బీరకాయ కూర', 'l,d', 'v', 'bowl', 100, 60, 1.5, 6, 3, 'curry', 'low', { max: 2 }),
  F('potlakaya-kura', 'Potlakaya Kura (snake gourd)', 'పొట్లకాయ కూర', 'l,d', 'v', 'bowl', 100, 55, 1.5, 6, 2.5, 'curry', 'low', { max: 2 }),
  F('munagakaya-kura', 'Munagakaya Kura (drumstick)', 'మునగకాయ కూర', 'l,d', 'v', 'bowl', 100, 75, 2, 7, 4, 'curry', 'low', { max: 2 }),
  F('goruchikkudu', 'Goruchikkudu Fry (cluster beans)', 'గోరుచిక్కుడు వేపుడు', 'l,d', 'v', 'bowl', 100, 90, 3, 9, 4.5, 'curry', 'low', { max: 2 }),
  F('bendakaya-fry', 'Bendakaya Fry (okra)', 'బెండకాయ వేపుడు', 'l,d', 'v', 'bowl', 100, 95, 2, 8, 6, 'curry', 'low', { max: 2 }),
  F('dondakaya-fry', 'Dondakaya Fry (ivy gourd)', 'దొండకాయ వేపుడు', 'l,d', 'v', 'bowl', 100, 90, 1.5, 8, 5.5, 'curry', 'low', { max: 2 }),
  F('thotakura-fry', 'Thotakura Fry (amaranth leaves)', 'తోటకూర వేపుడు', 'l,d', 'v', 'bowl', 100, 80, 3, 6, 5, 'curry', 'low', { max: 2 }),
  F('cabbage-curry', 'Cabbage Curry', 'క్యాబేజీ కూర', 'l,d', 'v', 'bowl', 100, 70, 2, 8, 3.5, 'curry', 'low', { max: 2 }),
  F('mixed-veg', 'Mixed Vegetable Curry (no potato)', 'మిక్స్‌డ్ వెజ్ కూర', 'l,d', 'v', 'bowl', 100, 85, 2.5, 10, 4, 'curry', 'low', { max: 2 }),
  F('gutti-vankaya', 'Gutti Vankaya (stuffed brinjal)', 'గుత్తి వంకాయ కూర', 'l,d', 'v', 'bowl', 100, 110, 2.5, 9, 7, 'curry', 'low', { max: 1.5 }),
  F('chepala-pulusu', 'Chepala Pulusu (fish curry)', 'చేపల పులుసు', 'l,d', 'n', 'bowl', 100, 125, 15, 3, 6, 'curry', 'low', { max: 2 }),
  F('royyala-iguru', 'Royyala Iguru (prawn curry)', 'రొయ్యల ఇగురు', 'l,d', 'n', 'bowl', 100, 120, 16, 3, 5, 'curry', 'low', { max: 2 }),
  F('fish-grill', 'Fish – tawa / grilled (not deep fried)', 'చేప (తవా / గ్రిల్)', 'l,d', 'n', 'piece', 100, 160, 18, 2, 8, 'curry', 'low', { step: 0.5, max: 2 }),
  F('chicken-curry', 'Chicken Curry, skinless (Kodi Kura)', 'కోడి కూర (చర్మం లేకుండా)', 'l,d', 'n', 'bowl', 100, 150, 17, 3, 8, 'curry', 'low', { max: 2 }),
  F('egg-curry', 'Egg Curry (Guddu Kura)', 'గుడ్డు కూర', 'l,d', 'e', 'bowl', 120, 150, 8, 4, 11, 'curry', 'low', { max: 1.5 }),
  // ---------- Lunch / dinner: extras ----------
  F('rasam', 'Rasam (Chaaru)', 'చారు', 'l,d', 'v', 'bowl', 150, 30, 1, 5, 0.7, 'extra', 'low', { max: 2 }),
  F('curd', 'Curd (low-fat, unsweetened)', 'పెరుగు (తక్కువ కొవ్వు)', 'l', 'v', 'bowl', 100, 60, 3.5, 4.7, 3.3, 'extra', 'low', { max: 1 }),
  // ---------- Vegetable salads (added to EVERY meal; 1 bowl = 100 g) ----------
  F('salad-kheera', 'Cucumber–Tomato–Onion Salad', 'కీరా–టమాటా–ఉల్లి సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 22, 1, 4.5, 0.2, 'salad', 'low',
    { detail: 'Cucumber, tomato, onion, green chilli, coriander leaves, lemon juice, pinch of salt and pepper' }),
  F('salad-cabbage-carrot', 'Cabbage–Carrot Kosumalli', 'క్యాబేజీ–క్యారెట్ కోసంబరి', 'b,s1,l,s2,d', 'v', 'bowl', 100, 40, 2.5, 6, 0.8, 'salad', 'low',
    { detail: 'Shredded cabbage, grated carrot, soaked moong dal, coriander, green chilli, lemon juice' }),
  F('salad-sprouts', 'Sprouts Salad', 'మొలకల సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 70, 5, 10, 1, 'salad', 'low',
    { detail: 'Sprouted moong, cucumber, tomato, onion, coriander, lemon juice, pepper' }),
  F('salad-radish', 'Radish–Cucumber Salad', 'ముల్లంగి–దోసకాయ సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 18, 0.8, 3.8, 0.1, 'salad', 'low',
    { detail: 'Mullangi (radish), cucumber, mint leaves, lemon juice, black pepper, rock salt' }),
  F('salad-leafy', 'Leafy Greens Salad', 'ఆకుకూరల సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 20, 1.8, 3, 0.3, 'salad', 'low',
    { detail: 'Lettuce or tender spinach / methi leaves, cucumber, tomato, onion, roasted cumin powder, lemon juice' }),
  F('salad-boiled-veg', 'Steamed Vegetable Salad', 'ఉడికించిన కూరగాయల సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 45, 2.5, 8, 0.4, 'salad', 'low',
    { detail: 'Steamed french beans, carrot, cauliflower, capsicum, black pepper, lemon juice' }),
  F('salad-dosakaya', 'Dosakaya (yellow cucumber) Salad', 'దోసకాయ పచ్చి సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 20, 0.8, 4, 0.2, 'salad', 'low',
    { detail: 'Dosakaya (Andhra yellow cucumber), onion, green chilli, curry leaves, coriander, lemon juice' }),
  F('salad-tomato-capsicum', 'Tomato–Capsicum–Onion Salad', 'టమాటా–క్యాప్సికం సలాడ్', 'b,s1,l,s2,d', 'v', 'bowl', 100, 25, 1, 5, 0.3, 'salad', 'low',
    { detail: 'Tomato, green capsicum, onion, coriander, lemon juice, chaat masala pinch, pepper' }),
];

if (typeof module !== 'undefined') module.exports = { FOODS };
