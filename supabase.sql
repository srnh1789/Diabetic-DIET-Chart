-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run
-- (safe to run again; it updates the food list)

create table if not exists public.foods (
  id text primary key,
  name_en text not null,
  name_te text,
  meal_slots text[] not null,          -- b = morning tiffin, s1 = 10 AM snack, l = lunch, s2 = 4 PM snack, d = dinner
  diet_type text not null check (diet_type in ('v','e','n')),  -- v veg, e egg, n non-veg
  unit_label text not null,            -- piece, bowl, glass ...
  unit_measure text not null default 'g',
  grams_per_unit numeric not null,     -- grams (or ml) in ONE unit
  kcal_per_unit numeric not null,      -- calories in ONE unit
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  role text not null,                  -- main, side, curry, extra, salad
  step numeric not null default 0.5,   -- smallest quantity change
  active boolean not null default true
);
alter table public.foods add column if not exists gi text not null default 'low';        -- low / med / high glycaemic index
alter table public.foods add column if not exists max_qty numeric;                       -- largest quantity allowed
alter table public.foods add column if not exists detail text;                           -- salad ingredients
alter table public.foods add column if not exists no_default boolean not null default false; -- selectable but not suggested
alter table public.foods drop constraint if exists foods_role_check;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  uhid text, name text not null, phone text,
  age int, sex text, height_cm numeric, weight_kg numeric,
  activity text, goal text, diet_pref text,
  diabetes_type text, treatment text, hba1c numeric, fbs numeric, ppbs numeric, notes text,
  bmi numeric, bmr numeric, tdee numeric, target_kcal numeric, body_fat_pct numeric,
  seed int default 1,
  items jsonb,   -- chosen food ids for each meal
  extras jsonb,  -- foods added manually (name, quantity, calories) for each meal
  plan jsonb     -- saved copy of the chart (foods, quantities, calories)
);

alter table public.patients add column if not exists extras jsonb;

alter table public.foods enable row level security;
alter table public.patients enable row level security;

-- Food list: everyone can read; only logged-in staff can add / edit / delete foods
drop policy if exists "foods readable" on public.foods;
create policy "foods readable" on public.foods for select to anon, authenticated using (true);
drop policy if exists "foods staff write" on public.foods;
create policy "foods staff write" on public.foods for all to authenticated using (true) with check (true);

-- Patient records: ONLY logged-in staff can see, add, update or delete
drop policy if exists "patients staff all" on public.patients;
create policy "patients staff all" on public.patients for all to authenticated using (true) with check (true);

-- Food data (edit or add rows any time in Table Editor -> foods)
insert into public.foods (id,name_en,name_te,meal_slots,diet_type,unit_label,unit_measure,grams_per_unit,kcal_per_unit,protein_g,carbs_g,fat_g,role,step,gi,max_qty,detail,no_default,active) values
('pesarattu','Pesarattu (green gram dosa)','పెసరట్టు','{b,d}','v','piece','g',90,110,6.5,15,2.5,'main',0.5,'low',4,null,false,true),
('ragi-dosa','Ragi Dosa','రాగి దోశ','{b,d}','v','piece','g',80,100,3,19,1.5,'main',0.5,'low',4,null,false,true),
('besan-chilla','Senagapindi Attu (besan chilla)','సెనగపిండి అట్టు','{b,d}','v','piece','g',80,120,6,12,5,'main',0.5,'low',3,null,false,true),
('idli','Idli','ఇడ్లీ','{b,d}','v','piece','g',40,58,2,12,0.3,'main',1,'med',3,null,false,true),
('veg-oats-upma','Vegetable Oats Upma','వెజ్ ఓట్స్ ఉప్మా','{b}','v','bowl','g',150,150,5.5,24,3.5,'main',0.5,'low',2,null,false,true),
('korra-upma','Korra (foxtail millet) Upma','కొర్రల ఉప్మా','{b}','v','bowl','g',150,170,5,29,4,'main',0.5,'low',2,null,false,true),
('wheat-rava-upma','Wheat Rava (Godhuma Ravva) Upma','గోధుమ రవ్వ ఉప్మా','{b}','v','bowl','g',150,180,5,31,4.5,'main',0.5,'med',1.5,null,true,true),
('millet-khichdi','Millet & Moong Dal Khichdi','చిరుధాన్యాల కిచిడీ','{d}','v','bowl','g',200,220,8,36,5,'main',0.5,'low',1.5,null,false,true),
('sambar','Sambar (with vegetables, drumstick)','సాంబార్','{b,l,d}','v','bowl','g',150,75,4,10,2,'side',0.5,'low',2,null,false,true),
('coconut-chutney','Coconut Chutney','కొబ్బరి చట్నీ','{b,d}','v','portion','g',30,55,0.6,2,5,'side',0.5,'low',1,null,false,true),
('peanut-chutney','Peanut Chutney (Palli Chutney)','పల్లీ చట్నీ','{b,d}','v','portion','g',30,75,3,3,6,'side',0.5,'low',1,null,false,true),
('tomato-chutney','Tomato Chutney','టమాటా చట్నీ','{b,d}','v','portion','g',30,30,0.5,3,2,'side',0.5,'low',2,null,false,true),
('mint-chutney','Mint (Pudina) Chutney','పుదీనా చట్నీ','{b,d}','v','portion','g',30,25,0.8,3,1.2,'side',0.5,'low',2,null,false,true),
('allam-pachadi','Ginger Chutney (Allam Pachadi)','అల్లం పచ్చడి','{b,d}','v','portion','g',30,35,0.8,4,1.8,'side',0.5,'low',2,null,false,true),
('veg-omelette','Vegetable Omelette (1 egg)','కూరగాయల ఆమ్లెట్','{b,d}','e','piece','g',70,105,7,2,7.5,'curry',1,'low',2,null,false,true),
('boiled-egg','Boiled Egg','ఉడికించిన గుడ్డు','{b,s1,s2,d}','e','piece','g',50,75,6.3,0.6,5,'curry',1,'low',2,null,false,true),
('guava','Guava (Jama pandu)','జామపండు','{s1,s2}','v','piece','g',100,68,2.6,14,1,'main',1,'low',2,null,false,true),
('apple','Apple','ఆపిల్','{s1,s2}','v','piece','g',120,62,0.3,15,0.2,'main',1,'low',2,null,false,true),
('orange','Orange / Sweet Lime (small)','నారింజ / బత్తాయి','{s1,s2}','v','piece','g',130,60,1.2,14,0.2,'main',1,'low',2,null,false,true),
('papaya','Papaya (Boppayi)','బొప్పాయి','{s1,s2}','v','bowl','g',100,45,0.6,11,0.2,'main',0.5,'med',1.5,null,false,true),
('jamun','Jamun (Neredu pandlu)','నేరేడు పండ్లు','{s1,s2}','v','bowl','g',100,62,0.7,14,0.2,'main',0.5,'low',1.5,null,false,true),
('roasted-chana','Roasted Chana','వేయించిన శనగలు','{s1,s2}','v','handful','g',30,110,6,18,2,'main',0.5,'low',1.5,null,false,true),
('sprouts-sundal','Sprouts Sundal (moong / chana)','మొలకల సుండల్','{s1,s2}','v','bowl','g',100,120,8,18,2,'main',0.5,'low',1.5,null,false,true),
('boiled-peanuts','Boiled Peanuts','ఉడికించిన పల్లీలు','{s1,s2}','v','handful','g',40,105,5,4,8,'main',0.5,'low',1,null,false,true),
('almonds','Almonds (6–7 nuts)','బాదం పప్పు','{s1,s2}','v','handful','g',15,87,3.2,3.3,7.5,'main',0.5,'low',1,null,false,true),
('walnuts','Walnuts (3–4 halves)','అక్రోట్','{s1,s2}','v','handful','g',15,98,2.3,2,9.8,'main',0.5,'low',1,null,false,true),
('ragi-java','Ragi Java / Malt (no sugar)','రాగి జావ','{s1,s2}','v','glass','ml',200,80,3,16,0.6,'main',0.5,'low',1,null,false,true),
('buttermilk','Buttermilk (Majjiga), no sugar','మజ్జిగ','{s1,s2,l}','v','glass','ml',200,40,2,3,2,'extra',0.5,'low',2,null,false,true),
('green-tea','Green Tea / Black Tea (no sugar)','గ్రీన్ టీ (చక్కెర లేకుండా)','{b,s1,s2}','v','cup','ml',150,2,0,0.3,0,'extra',0.5,'low',2,null,false,true),
('veg-soup','Clear Vegetable Soup','వెజిటబుల్ సూప్','{s2,l,d}','v','bowl','g',150,45,2,7,1,'extra',0.5,'low',2,null,false,true),
('chapati','Whole-wheat Chapati','గోధుమ చపాతీ','{l,d}','v','piece','g',40,100,3.2,17,2.2,'main',0.5,'med',4,null,false,true),
('jowar-roti','Jowar Roti (Jonna Rotte)','జొన్న రొట్టె','{l,d}','v','piece','g',40,100,3,21,0.8,'main',0.5,'low',4,null,false,true),
('bajra-roti','Bajra Roti (Sajja Rotte)','సజ్జ రొట్టె','{l,d}','v','piece','g',40,105,3.5,20,1.5,'main',0.5,'low',4,null,false,true),
('ragi-sangati','Ragi Sangati / Mudda','రాగి సంగటి','{l,d}','v','ball','g',150,190,4,40,1,'main',0.5,'low',2,null,false,true),
('korra-annam','Korra Annam (foxtail millet rice)','కొర్ర అన్నం','{l,d}','v','bowl','g',100,120,3.5,24,1.2,'main',0.5,'low',2,null,false,true),
('brown-rice','Brown Rice','ముడి బియ్యం అన్నం','{l,d}','v','bowl','g',100,112,2.6,23,0.9,'main',0.5,'med',1.5,null,false,true),
('rice','White Rice (Annam) – limit','అన్నం (తెల్ల బియ్యం)','{l,d}','v','bowl','g',100,130,2.7,28,0.3,'main',0.5,'high',1,null,true,true),
('pappu','Toor Dal (Pappu)','పప్పు','{l,d}','v','bowl','g',150,150,8,22,3,'side',0.5,'low',1.5,null,false,true),
('menthi-pappu','Menthi Kura Pappu (fenugreek dal)','మెంతికూర పప్పు','{l,d}','v','bowl','g',150,140,8,18,3.5,'side',0.5,'low',1.5,null,false,true),
('sorakaya-pappu','Sorakaya Pappu (bottle gourd dal)','సొరకాయ పప్పు','{l,d}','v','bowl','g',150,130,7,18,3,'side',0.5,'low',1.5,null,false,true),
('gongura-pappu','Gongura Pappu','గోంగూర పప్పు','{l,d}','v','bowl','g',150,145,8,20,4,'side',0.5,'low',1.5,null,false,true),
('palakura-pappu','Palakura Pappu (spinach dal)','పాలకూర పప్పు','{l,d}','v','bowl','g',150,140,8,19,3.5,'side',0.5,'low',1.5,null,false,true),
('tomato-pappu','Tomato Pappu','టమాటా పప్పు','{l,d}','v','bowl','g',150,145,7.5,20,4,'side',0.5,'low',1.5,null,false,true),
('kakarakaya','Kakarakaya Fry (bitter gourd)','కాకరకాయ వేపుడు','{l,d}','v','bowl','g',100,85,2.2,7,5.5,'curry',0.5,'low',2,null,false,true),
('sorakaya-kura','Sorakaya Kura (bottle gourd)','సొరకాయ కూర','{l,d}','v','bowl','g',100,55,1.5,6,2.5,'curry',0.5,'low',2,null,false,true),
('beerakaya-kura','Beerakaya Kura (ridge gourd)','బీరకాయ కూర','{l,d}','v','bowl','g',100,60,1.5,6,3,'curry',0.5,'low',2,null,false,true),
('potlakaya-kura','Potlakaya Kura (snake gourd)','పొట్లకాయ కూర','{l,d}','v','bowl','g',100,55,1.5,6,2.5,'curry',0.5,'low',2,null,false,true),
('munagakaya-kura','Munagakaya Kura (drumstick)','మునగకాయ కూర','{l,d}','v','bowl','g',100,75,2,7,4,'curry',0.5,'low',2,null,false,true),
('goruchikkudu','Goruchikkudu Fry (cluster beans)','గోరుచిక్కుడు వేపుడు','{l,d}','v','bowl','g',100,90,3,9,4.5,'curry',0.5,'low',2,null,false,true),
('bendakaya-fry','Bendakaya Fry (okra)','బెండకాయ వేపుడు','{l,d}','v','bowl','g',100,95,2,8,6,'curry',0.5,'low',2,null,false,true),
('dondakaya-fry','Dondakaya Fry (ivy gourd)','దొండకాయ వేపుడు','{l,d}','v','bowl','g',100,90,1.5,8,5.5,'curry',0.5,'low',2,null,false,true),
('thotakura-fry','Thotakura Fry (amaranth leaves)','తోటకూర వేపుడు','{l,d}','v','bowl','g',100,80,3,6,5,'curry',0.5,'low',2,null,false,true),
('cabbage-curry','Cabbage Curry','క్యాబేజీ కూర','{l,d}','v','bowl','g',100,70,2,8,3.5,'curry',0.5,'low',2,null,false,true),
('mixed-veg','Mixed Vegetable Curry (no potato)','మిక్స్‌డ్ వెజ్ కూర','{l,d}','v','bowl','g',100,85,2.5,10,4,'curry',0.5,'low',2,null,false,true),
('gutti-vankaya','Gutti Vankaya (stuffed brinjal)','గుత్తి వంకాయ కూర','{l,d}','v','bowl','g',100,110,2.5,9,7,'curry',0.5,'low',1.5,null,false,true),
('chepala-pulusu','Chepala Pulusu (fish curry)','చేపల పులుసు','{l,d}','n','bowl','g',100,125,15,3,6,'curry',0.5,'low',2,null,false,true),
('royyala-iguru','Royyala Iguru (prawn curry)','రొయ్యల ఇగురు','{l,d}','n','bowl','g',100,120,16,3,5,'curry',0.5,'low',2,null,false,true),
('fish-grill','Fish – tawa / grilled (not deep fried)','చేప (తవా / గ్రిల్)','{l,d}','n','piece','g',100,160,18,2,8,'curry',0.5,'low',2,null,false,true),
('chicken-curry','Chicken Curry, skinless (Kodi Kura)','కోడి కూర (చర్మం లేకుండా)','{l,d}','n','bowl','g',100,150,17,3,8,'curry',0.5,'low',2,null,false,true),
('egg-curry','Egg Curry (Guddu Kura)','గుడ్డు కూర','{l,d}','e','bowl','g',120,150,8,4,11,'curry',0.5,'low',1.5,null,false,true),
('rasam','Rasam (Chaaru)','చారు','{l,d}','v','bowl','g',150,30,1,5,0.7,'extra',0.5,'low',2,null,false,true),
('curd','Curd (low-fat, unsweetened)','పెరుగు (తక్కువ కొవ్వు)','{l}','v','bowl','g',100,60,3.5,4.7,3.3,'extra',0.5,'low',1,null,false,true),
('salad-kheera','Cucumber–Tomato–Onion Salad','కీరా–టమాటా–ఉల్లి సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,22,1,4.5,0.2,'salad',0.5,'low',null,'Cucumber, tomato, onion, green chilli, coriander leaves, lemon juice, pinch of salt and pepper',false,true),
('salad-cabbage-carrot','Cabbage–Carrot Kosumalli','క్యాబేజీ–క్యారెట్ కోసంబరి','{b,s1,l,s2,d}','v','bowl','g',100,40,2.5,6,0.8,'salad',0.5,'low',null,'Shredded cabbage, grated carrot, soaked moong dal, coriander, green chilli, lemon juice',false,true),
('salad-sprouts','Sprouts Salad','మొలకల సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,70,5,10,1,'salad',0.5,'low',null,'Sprouted moong, cucumber, tomato, onion, coriander, lemon juice, pepper',false,true),
('salad-radish','Radish–Cucumber Salad','ముల్లంగి–దోసకాయ సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,18,0.8,3.8,0.1,'salad',0.5,'low',null,'Mullangi (radish), cucumber, mint leaves, lemon juice, black pepper, rock salt',false,true),
('salad-leafy','Leafy Greens Salad','ఆకుకూరల సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,20,1.8,3,0.3,'salad',0.5,'low',null,'Lettuce or tender spinach / methi leaves, cucumber, tomato, onion, roasted cumin powder, lemon juice',false,true),
('salad-boiled-veg','Steamed Vegetable Salad','ఉడికించిన కూరగాయల సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,45,2.5,8,0.4,'salad',0.5,'low',null,'Steamed french beans, carrot, cauliflower, capsicum, black pepper, lemon juice',false,true),
('salad-dosakaya','Dosakaya (yellow cucumber) Salad','దోసకాయ పచ్చి సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,20,0.8,4,0.2,'salad',0.5,'low',null,'Dosakaya (Andhra yellow cucumber), onion, green chilli, curry leaves, coriander, lemon juice',false,true),
('salad-tomato-capsicum','Tomato–Capsicum–Onion Salad','టమాటా–క్యాప్సికం సలాడ్','{b,s1,l,s2,d}','v','bowl','g',100,25,1,5,0.3,'salad',0.5,'low',null,'Tomato, green capsicum, onion, coriander, lemon juice, chaat masala pinch, pepper',false,true)
on conflict (id) do update set name_en=excluded.name_en, name_te=excluded.name_te, meal_slots=excluded.meal_slots, diet_type=excluded.diet_type, unit_label=excluded.unit_label, unit_measure=excluded.unit_measure, grams_per_unit=excluded.grams_per_unit, kcal_per_unit=excluded.kcal_per_unit, protein_g=excluded.protein_g, carbs_g=excluded.carbs_g, fat_g=excluded.fat_g, role=excluded.role, step=excluded.step, gi=excluded.gi, max_qty=excluded.max_qty, detail=excluded.detail, no_default=excluded.no_default, active=excluded.active;

-- Foods from the earlier (non-diabetic) list that are no longer suggested
update public.foods set active=false where id in ('upma','pongal','dosa','uttapam','atukula','khichdi','punugulu','banana','sapota','murmura','mirchi-bajji','pootharekulu','kakinada-kaja','chikki','tea','coconut-water','boiled-corn','salad','aratikaya-fry','fish-fry','sambar-old');
