/* English <-> Telugu switch. Translates the page text in place (also content the app creates later). */
(function () {
  const EXACT = {
    'Sura Reddy Multi Speciality Hospital': 'సురా రెడ్డి మల్టీ స్పెషాలిటీ హాస్పిటల్',
    'Pandalapaka, Biccavolu Mandal, East Godavari District, Andhra Pradesh': 'పండలపాక, బిక్కవోలు మండలం, తూర్పు గోదావరి జిల్లా, ఆంధ్రప్రదేశ్',
    'Staff login': 'సిబ్బంది లాగిన్', 'Email': 'ఈమెయిల్', 'Password': 'పాస్‌వర్డ్', 'Login': 'లాగిన్', 'Log out': 'లాగ్ అవుట్',
    'Only hospital staff accounts created in Supabase can log in.': 'Supabase లో సృష్టించిన ఆసుపత్రి సిబ్బంది ఖాతాలు మాత్రమే లాగిన్ అవ్వగలవు.',
    'Patients': 'రోగులు', '＋ New patient': '＋ కొత్త రోగి', 'Patient': 'రోగి', 'Age/Sex': 'వయసు/లింగం', 'Diabetes': 'మధుమేహం',
    'Target': 'లక్ష్యం', 'Updated': 'తేదీ', 'View chart': 'చార్ట్ చూడండి', 'Edit': 'మార్చు', 'Delete': 'తొలగించు',
    'No patients yet. Click “New patient”.': 'ఇంకా రోగులు లేరు. “కొత్త రోగి” నొక్కండి.',
    'New patient': 'కొత్త రోగి', 'Patient details': 'రోగి వివరాలు', 'Diabetes details': 'మధుమేహ వివరాలు',
    'Name': 'పేరు', 'UHID / OP number (optional)': 'UHID / OP నంబర్ (ఐచ్ఛికం)', 'Phone (optional)': 'ఫోన్ (ఐచ్ఛికం)',
    'Age (years)': 'వయసు (సంవత్సరాలు)', 'Sex': 'లింగం', 'Height (cm)': 'ఎత్తు (సెం.మీ)', 'Weight (kg)': 'బరువు (కిలోలు)',
    'Lifestyle (daily activity)': 'జీవనశైలి (రోజువారీ శ్రమ)', 'Type': 'రకం', 'Treatment': 'చికిత్స',
    'HbA1c % (optional)': 'HbA1c % (ఐచ్ఛికం)', 'Fasting sugar mg/dL (optional)': 'పరగడుపు షుగర్ mg/dL (ఐచ్ఛికం)',
    'Post-meal sugar mg/dL (optional)': 'భోజనం తర్వాత షుగర్ mg/dL (ఐచ్ఛికం)', 'Goal': 'లక్ష్యం', 'Food type': 'ఆహార రకం',
    "Doctor's notes (kidney / BP / other conditions, allergies)": 'డాక్టర్ గమనికలు (కిడ్నీ / BP / ఇతర సమస్యలు, అలర్జీలు)',
    'Select': 'ఎంచుకోండి', 'Male': 'పురుషుడు', 'Female': 'స్త్రీ',
    'Sedentary – desk job, little walking': 'కూర్చుని చేసే పని – తక్కువ నడక',
    'Light – walking / light work, exercise 1–3 days a week': 'తేలికపాటి – నడక / తేలికపాటి పని, వారానికి 1–3 రోజులు వ్యాయామం',
    'Moderate – on feet most of the day, exercise 3–5 days a week': 'మధ్యస్థం – రోజంతా నిలబడి పని, వారానికి 3–5 రోజులు వ్యాయామం',
    'Active – farming / heavy work, hard exercise 6–7 days': 'చురుకైన – వ్యవసాయం / కష్టమైన పని, వారానికి 6–7 రోజులు వ్యాయామం',
    'Very active – very heavy physical work': 'అత్యంత చురుకైన – చాలా శారీరక శ్రమ',
    'Type 2 diabetes': 'టైప్ 2 మధుమేహం', 'Type 1 diabetes': 'టైప్ 1 మధుమేహం', 'Pre-diabetes': 'ప్రీ-డయాబెటిస్',
    'Diet only': 'ఆహార నియంత్రణ మాత్రమే', 'Oral tablets': 'మాత్రలు', 'Insulin': 'ఇన్సులిన్', 'Tablets + insulin': 'మాత్రలు + ఇన్సులిన్',
    'Maintain weight': 'బరువు నిలుపుకోవడం', 'Lose weight': 'బరువు తగ్గడం', 'Gain weight': 'బరువు పెరగడం',
    'Vegetarian': 'శాకాహారం', 'Vegetarian + Egg': 'శాకాహారం + గుడ్డు',
    'Non-vegetarian (fish, prawns, chicken, egg)': 'మాంసాహారం (చేప, రొయ్యలు, కోడి, గుడ్డు)',
    'Make diet chart': 'డైట్ చార్ట్ తయారు చేయండి', 'Cancel': 'రద్దు',
    '← Patients': '← రోగులు', '💾 Save patient': '💾 రోగిని సేవ్ చేయండి', '💾 Update patient': '💾 అప్‌డేట్ చేయండి',
    '✏️ Edit details': '✏️ వివరాలు మార్చండి', '🔄 Different foods': '🔄 వేరే ఆహారాలు', '🖨 Print': '🖨 ప్రింట్', '🗑 Delete': '🗑 తొలగించు',
    'UHID / Phone': 'UHID / ఫోన్', 'Age / Sex': 'వయసు / లింగం', 'Height / Weight': 'ఎత్తు / బరువు', 'Sugar values': 'షుగర్ విలువలు',
    'Lifestyle / Goal': 'జీవనశైలి / లక్ష్యం', 'Food type / Date': 'ఆహార రకం / తేదీ', "Doctor's notes": 'డాక్టర్ గమనికలు',
    'Daily calories needed': 'రోజువారీ అవసరమైన కేలరీలు', 'Diet target': 'డైట్ లక్ష్యం', 'Body fat (estimate)': 'శరీర కొవ్వు (అంచనా)',
    'Carbohydrate target': 'పిండిపదార్థాల లక్ష్యం',
    'Obese': 'స్థూలకాయం', 'Overweight': 'అధిక బరువు', 'Normal weight': 'సాధారణ బరువు', 'Underweight': 'తక్కువ బరువు',
    'Food': 'ఆహారం', 'Quantity': 'పరిమాణం', 'Calories': 'కేలరీలు',
    'Morning Tiffin': 'ఉదయం టిఫిన్', '10 AM Snack': 'ఉదయం 10 గంటల స్నాక్స్', 'Lunch': 'మధ్యాహ్న భోజనం',
    '4 PM Evening Snack': 'సాయంత్రం 4 గంటల స్నాక్స్', 'Dinner': 'రాత్రి భోజనం',
    'Low GI': 'తక్కువ GI', 'Medium GI': 'మధ్యస్థ GI', 'High GI': 'ఎక్కువ GI',
    'Change foods for this meal': 'ఈ భోజనంలో ఆహారాలను మార్చండి', 'Reset to suggested foods': 'సూచించిన ఆహారాలకు రీసెట్',
    'Add any other food manually (name, quantity, calories)': 'ఇతర ఆహారాన్ని చేతితో చేర్చండి (పేరు, పరిమాణం, కేలరీలు)',
    'Add': 'చేర్చు', 'Remove': 'తొలగించు', 'Added manually': 'చేతితో చేర్చినది',
    'Food name': 'ఆహారం పేరు', 'Unit (cup, piece, g)': 'యూనిట్ (కప్పు, ముక్క, గ్రా)', 'Total kcal': 'మొత్తం కేలరీలు', 'Carbs g (optional)': 'పిండిపదార్థాలు గ్రా (ఐచ్ఛికం)',
    'Search by name, UHID or phone': 'పేరు, UHID లేదా ఫోన్ తో వెతకండి',
    'Tiffin / roti / grain / snack': 'టిఫిన్ / రొట్టె / ధాన్యం / స్నాక్', 'Dal, sambar & chutney': 'పప్పు, సాంబార్ & చట్నీ',
    'Vegetable, egg & non-veg curries': 'కూరగాయలు, గుడ్డు & మాంసాహార కూరలు', 'Soup, curd & drinks': 'సూప్, పెరుగు & పానీయాలు',
    'Vegetable salads (always included)': 'కూరగాయల సలాడ్లు (ఎల్లప్పుడూ ఉంటాయి)',
    '🔁 Quantity options – eat ANY ONE of these (day by day)': '🔁 పరిమాణ ఎంపికలు – వీటిలో ఏదో ఒకటి తినండి (రోజుకొకటి)',
    'Calories are split: Morning tiffin 25% · 10 AM snack 10% · Lunch 30% · 4 PM snack 10% · Dinner 25%. A vegetable salad is included in every meal.':
      'కేలరీల విభజన: ఉదయం టిఫిన్ 25% · 10 గంటల స్నాక్ 10% · మధ్యాహ్న భోజనం 30% · 4 గంటల స్నాక్ 10% · రాత్రి భోజనం 25%. ప్రతి భోజనంలో కూరగాయల సలాడ్ ఉంటుంది.',
    '✅ Advice': '✅ సలహాలు', '⛔ Avoid': '⛔ మానుకోవాలి',
    'Do not skip meals; eat at fixed times.': 'భోజనం మానవద్దు; నిర్ణీత సమయాల్లో తినండి.',
    'Fill half the plate with vegetables / salad, a quarter with protein, a quarter with millet / roti.': 'ప్లేట్‌లో సగం కూరగాయలు / సలాడ్, పావు వంతు ప్రోటీన్, పావు వంతు చిరుధాన్యం / రొట్టె ఉండాలి.',
    'Prefer jowar, ragi, bajra, korra (millets) and whole wheat; limit white rice.': 'జొన్న, రాగి, సజ్జ, కొర్ర (చిరుధాన్యాలు), గోధుమ తినండి; తెల్ల అన్నం తగ్గించండి.',
    'Use little oil (about 3 teaspoons per person per day); steam, boil, grill or tawa-cook.': 'నూనె తక్కువగా వాడండి (రోజుకు ఒక్కరికి సుమారు 3 టీస్పూన్లు); ఆవిరిపై ఉడికించడం, ఉడకబెట్టడం, గ్రిల్ లేదా పెనంపై వండండి.',
    'Drink 8–10 glasses of water. Walk 10–15 minutes after meals; exercise 30 minutes daily.': '8–10 గ్లాసుల నీళ్లు తాగండి. భోజనం తర్వాత 10–15 నిమిషాలు నడవండి; రోజూ 30 నిమిషాలు వ్యాయామం చేయండి.',
    'Check blood sugar as advised by the doctor.': 'డాక్టర్ సూచించినట్లు రక్తంలో షుగర్ పరీక్షించుకోండి.',
    'Sugar, jaggery, honey, sweets (kaja, pootharekulu, laddu, jilebi), cakes, biscuits.': 'చక్కెర, బెల్లం, తేనె, స్వీట్లు (ఖాజా, పూతరేకులు, లడ్డు, జిలేబి), కేకులు, బిస్కెట్లు.',
    'Fruit juices, cold drinks, sweetened tea / coffee, tender coconut water in excess.': 'పండ్ల రసాలు, కూల్ డ్రింక్స్, చక్కెర వేసిన టీ / కాఫీ, ఎక్కువగా కొబ్బరి నీళ్లు.',
    'Banana, mango, sapota, grapes, jackfruit, dates.': 'అరటి, మామిడి, సపోటా, ద్రాక్ష, పనస, ఖర్జూరం.',
    'Fried items (punugulu, bajji, vada, puri), bakery items, maida.': 'వేయించినవి (పునుగులు, బజ్జీ, వడ, పూరీ), బేకరీ పదార్థాలు, మైదా.',
    'Potato, yam, sweet potato, arati (raw banana) in large amounts.': 'బంగాళాదుంప, కంద, చిలకడదుంప, అరటికాయ ఎక్కువ మొత్తంలో.',
    'Large servings of white rice; skipping meals; alcohol.': 'ఎక్కువ తెల్ల అన్నం; భోజనం మానేయడం; మద్యం.',
    'Dietitian signature: ____________________': 'డైటీషియన్ సంతకం: ____________________',
    'Doctor signature: ____________________': 'డాక్టర్ సంతకం: ____________________',
    'This chart is a general guide prepared with standard formulas and approximate food values; it does not replace a doctor\'s advice. Doses of tablets / insulin and any change in treatment must be decided by the treating doctor.':
      'ఈ చార్ట్ ప్రామాణిక సూత్రాలు, అంచనా ఆహార విలువలతో తయారైన సాధారణ మార్గదర్శి మాత్రమే; డాక్టర్ సలహాకు ప్రత్యామ్నాయం కాదు. మాత్రలు / ఇన్సులిన్ మోతాదులు, చికిత్సలో మార్పులను చికిత్స చేసే డాక్టరే నిర్ణయించాలి.',
    'Type 1 diabetes / children: carbohydrate portions must be matched to the insulin dose by the treating doctor. Use this chart only as a guide.':
      'టైప్ 1 మధుమేహం / పిల్లలు: పిండిపదార్థాల పరిమాణాన్ని ఇన్సులిన్ మోతాదుకు తగ్గట్టు చికిత్స చేసే డాక్టర్ నిర్ణయించాలి. ఈ చార్ట్‌ను మార్గదర్శిగా మాత్రమే వాడండి.',
    "On diabetes medicine: do not skip or delay meals and snacks (risk of low sugar). Keep glucose tablets or sugar handy. Follow the doctor's advice for dose and timing.":
      'మధుమేహ మందులు వాడుతున్నారు: భోజనం, స్నాక్స్ మానవద్దు, ఆలస్యం చేయవద్దు (షుగర్ తగ్గే ప్రమాదం). గ్లూకోజ్ మాత్రలు లేదా చక్కెర దగ్గర ఉంచుకోండి. మోతాదు, సమయం విషయంలో డాక్టర్ సలహా పాటించండి.',
    "Fasting sugar is very high – doctor's review is advised.": 'పరగడుపు షుగర్ చాలా ఎక్కువగా ఉంది – డాక్టర్‌ను కలవండి.',
    'BMI is in the obese range. Gradual weight loss (0.5 kg per week) improves sugar control – consider the “Weight loss” goal.':
      'BMI స్థూలకాయ పరిధిలో ఉంది. క్రమంగా బరువు తగ్గడం (వారానికి 0.5 కిలో) షుగర్ నియంత్రణకు మేలు – “బరువు తగ్గడం” లక్ష్యాన్ని పరిగణించండి.',
    'The calorie target was raised to a safe minimum level.': 'కేలరీల లక్ష్యాన్ని సురక్షితమైన కనిష్ఠ స్థాయికి పెంచారు.',
    'Patient deleted': 'రోగిని తొలగించారు', 'Patient chart saved ✔': 'రోగి చార్ట్ సేవ్ అయింది ✔', 'Patient chart updated ✔': 'రోగి చార్ట్ అప్‌డేట్ అయింది ✔',
    'Demo mode: patient records are saved only in this browser. Add the Supabase keys in': 'డెమో మోడ్: రోగుల రికార్డులు ఈ బ్రౌజర్‌లో మాత్రమే సేవ్ అవుతాయి. Supabase కీలను ఇక్కడ చేర్చండి:',
    'to save them online for all staff.': 'తద్వారా సిబ్బంది అందరికీ ఆన్‌లైన్‌లో సేవ్ అవుతాయి.',
    'Cucumber, tomato, onion, green chilli, coriander leaves, lemon juice, pinch of salt and pepper': 'కీరా, టమాటా, ఉల్లిపాయ, పచ్చిమిర్చి, కొత్తిమీర, నిమ్మరసం, చిటికెడు ఉప్పు, మిరియాలు',
    'Shredded cabbage, grated carrot, soaked moong dal, coriander, green chilli, lemon juice': 'తురిమిన క్యాబేజీ, క్యారెట్ తురుము, నానబెట్టిన పెసరపప్పు, కొత్తిమీర, పచ్చిమిర్చి, నిమ్మరసం',
    'Sprouted moong, cucumber, tomato, onion, coriander, lemon juice, pepper': 'మొలకెత్తిన పెసలు, కీరా, టమాటా, ఉల్లిపాయ, కొత్తిమీర, నిమ్మరసం, మిరియాలు',
    'Mullangi (radish), cucumber, mint leaves, lemon juice, black pepper, rock salt': 'ముల్లంగి, కీరా, పుదీనా ఆకులు, నిమ్మరసం, మిరియాల పొడి, రాళ్ల ఉప్పు',
    'Lettuce or tender spinach / methi leaves, cucumber, tomato, onion, roasted cumin powder, lemon juice': 'లెట్యూస్ లేదా లేత పాలకూర / మెంతి ఆకులు, కీరా, టమాటా, ఉల్లిపాయ, వేయించిన జీలకర్ర పొడి, నిమ్మరసం',
    'Steamed french beans, carrot, cauliflower, capsicum, black pepper, lemon juice': 'ఆవిరిపై ఉడికించిన బీన్స్, క్యారెట్, కాలీఫ్లవర్, క్యాప్సికం, మిరియాల పొడి, నిమ్మరసం',
    'Dosakaya (Andhra yellow cucumber), onion, green chilli, curry leaves, coriander, lemon juice': 'దోసకాయ (ఆంధ్ర పసుపు దోస), ఉల్లిపాయ, పచ్చిమిర్చి, కరివేపాకు, కొత్తిమీర, నిమ్మరసం',
    'Tomato, green capsicum, onion, coriander, lemon juice, chaat masala pinch, pepper': 'టమాటా, పచ్చ క్యాప్సికం, ఉల్లిపాయ, కొత్తిమీర, నిమ్మరసం, చిటికెడు చాట్ మసాలా, మిరియాలు',
    'Enter the food name and its calories': 'ఆహారం పేరు, కేలరీలు నమోదు చేయండి',
  };
  const REGEX = [
    [/Tick the foods the patient eats; untick the rest\. Quantities are re-adjusted to this meal's (\d+) kcal\. A vegetable salad is always included\./,
      'రోగి తినే ఆహారాలను టిక్ చేయండి, మిగతావి తీసివేయండి. పరిమాణాలు ఈ భోజనపు $1 కేలరీలకు తగ్గట్టు మారతాయి. కూరగాయల సలాడ్ ఎల్లప్పుడూ ఉంటుంది.'],
    [/Quantity of each food that fits this meal's (\d+) kcal, together with the chutney \/ curry \/ salad shown above \((\d+) kcal\)\.\s*To mix two or more foods, tick them – the calories are shared equally\./,
      'పైన చూపిన చట్నీ / కూర / సలాడ్ ($2 కేలరీలు)తో కలిపి, ఈ భోజనపు $1 కేలరీలకు సరిపోయే ప్రతి ఆహార పరిమాణం ఇది. రెండు లేదా అంతకంటే ఎక్కువ ఆహారాలు కలపాలంటే వాటిని టిక్ చేయండి – కేలరీలు సమానంగా పంచబడతాయి.'],
    [/HbA1c is ([\d.]+)% – very high\. Please get the doctor's review along with this diet\./, 'HbA1c $1% – చాలా ఎక్కువ. ఈ డైట్‌తో పాటు డాక్టర్‌ను తప్పక కలవండి.'],
    [/Healthy weight range for this height: ([\d.]+)–([\d.]+) kg \(BMI 18\.5–22\.9\)\./, 'ఈ ఎత్తుకు ఆరోగ్యకరమైన బరువు: $1–$2 కిలోలు (BMI 18.5–22.9).'],
    [/Edit patient – /, 'రోగి వివరాల మార్పు – '],
    [/Diabetic Diet Chart · /, ''],
    [/(\d+) patients?\b/, '$1 రోగులు'],
    [/\(aim (\d+)\)/, '(లక్ష్యం $1)'],
    [/\(target (\d+)\)/, '(లక్ష్యం $1)'],
    [/\bFemale\b/g, 'స్త్రీ'], [/\bMale\b/g, 'పురుషుడు'],
    [/\byrs\b/g, 'సం.'], [/\bcm\b/g, 'సెం.మీ'], [/\bkg\b/g, 'కిలోలు'],
    [/\bpiece\b/g, 'ముక్క'], [/\bbowl\b/g, 'గిన్నె'], [/\bglass\b/g, 'గ్లాసు'], [/\bhandful\b/g, 'గుప్పెడు'],
    [/\bportion\b/g, 'భాగం'], [/\bball\b/g, 'ముద్ద'], [/\bcup\b/g, 'కప్పు'], [/\bserving\b/g, 'భాగం'],
  ];
  const PARTS = [
    ['kcal/day at rest', 'విశ్రాంతిలో రోజుకు కేలరీలు'], ['to maintain weight', 'బరువు నిలుపుకోవడానికి'],
    ['from BMI, age & sex', 'BMI, వయసు, లింగం ఆధారంగా'], ['per day (about 45–50% of calories)', 'రోజుకు (కేలరీలలో సుమారు 45–50%)'],
    ['kcal/day', 'కేలరీలు/రోజు'], ['Total today:', 'ఈ రోజు మొత్తం:'], ['Carbohydrate', 'పిండిపదార్థాలు'], ['Carbs', 'పిండిపదార్థాలు'],
    ['of calories', 'కేలరీలలో'], ['Protein', 'ప్రోటీన్'], ['Fat ', 'కొవ్వు '], ['kcal', 'కేలరీలు'], ['Mixed option:', 'కలిపిన ఎంపిక:'],
    ['Type 2 diabetes', 'టైప్ 2 మధుమేహం'], ['Type 1 diabetes', 'టైప్ 1 మధుమేహం'], ['Pre-diabetes', 'ప్రీ-డయాబెటిస్'],
    ['Diet only', 'ఆహార నియంత్రణ మాత్రమే'], ['Oral tablets', 'మాత్రలు'], ['Tablets + insulin', 'మాత్రలు + ఇన్సులిన్'], ['Insulin', 'ఇన్సులిన్'],
    ['Light activity', 'తేలికపాటి శ్రమ'], ['Moderate activity', 'మధ్యస్థ శ్రమ'], ['Very active', 'అత్యంత చురుకైన'], ['Sedentary', 'కూర్చుని చేసే పని'], ['Active', 'చురుకైన'],
    ['Weight maintenance', 'బరువు నిలుపుకోవడం'], ['Weight loss', 'బరువు తగ్గడం'], ['Weight gain', 'బరువు పెరగడం'],
    ['Vegetarian + Egg', 'శాకాహారం + గుడ్డు'], ['Non-vegetarian', 'మాంసాహారం'], ['Vegetarian', 'శాకాహారం'],
    ['Low GI', 'తక్కువ GI'], ['Medium GI', 'మధ్యస్థ GI'], ['High GI', 'ఎక్కువ GI'],
    ['Food list: Supabase', 'ఆహార జాబితా: Supabase'], ['Food list: built-in', 'ఆహార జాబితా: అంతర్నిర్మిత'],
    ['Save failed:', 'సేవ్ విఫలమైంది:'], ['Delete failed:', 'తొలగింపు విఫలమైంది:'], ['Login failed:', 'లాగిన్ విఫలమైంది:'],
    ['Please fill name, sex and lifestyle.', 'దయచేసి పేరు, లింగం, జీవనశైలి నింపండి.'],
    ['Please check age, height (cm) and weight (kg).', 'దయచేసి వయసు, ఎత్తు (సెం.మీ), బరువు (కిలోలు) సరిచూడండి.'],
  ].sort((a, b) => b[0].length - a[0].length);

  let FRULES = null, FLEN = -1;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function foodRules() {
    const list = (typeof FOOD_LIST !== 'undefined' && FOOD_LIST) || (typeof FOODS !== 'undefined' ? FOODS : []);
    if (FRULES && FLEN === list.length) return FRULES;
    FLEN = list.length;
    FRULES = list.filter(f => f.name_te).map(f => [f.name_en, f.name_te]).sort((a, b) => b[0].length - a[0].length)
      .map(([en, te]) => [new RegExp('(?<![A-Za-z])' + esc(en) + '(?![A-Za-z])', 'g'), te]);
    return FRULES;
  }

  function tr(s) {
    const t = s.trim(); if (!t) return s;
    if (Object.prototype.hasOwnProperty.call(EXACT, t)) return s.replace(t, EXACT[t]);
    let o = s;
    for (const [re, rep] of REGEX) o = o.replace(re, rep);
    for (const [re, rep] of foodRules()) o = o.replace(re, rep);
    for (const [en, te] of PARTS) if (o.includes(en)) o = o.split(en).join(te);
    return o;
  }

  let lang = 'en', touched = false;
  try { lang = localStorage.getItem('ssh_lang') || 'en'; } catch (e) { }
  const orig = new WeakMap();

  function walk() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: n => {
        const p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
        const nm = p.nodeName;
        return (nm === 'SCRIPT' || nm === 'STYLE' || nm === 'TEXTAREA' || p.id === 'langBtn') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) {
      if (lang === 'te') {
        if (!orig.has(n)) { const t = tr(n.data); if (t !== n.data) { orig.set(n, n.data); n.data = t; touched = true; } }
      } else if (orig.has(n)) { n.data = orig.get(n); orig.delete(n); }
    }
    document.querySelectorAll('input[placeholder]').forEach(el => {
      if (lang === 'te') {
        if (!el.dataset.ph) el.dataset.ph = el.getAttribute('placeholder');
        el.setAttribute('placeholder', tr(el.dataset.ph));
      } else if (el.dataset.ph) el.setAttribute('placeholder', el.dataset.ph);
    });
  }

  let pending = false;
  const mo = new MutationObserver(() => {
    if (pending) return; pending = true;
    requestAnimationFrame(() => { pending = false; apply(); });
  });
  function apply() {
    mo.disconnect();
    if (lang === 'te' || touched) walk();
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function setLang(l) {
    lang = l; try { localStorage.setItem('ssh_lang', l); } catch (e) { }
    document.body.classList.toggle('lang-te', l === 'te');
    document.documentElement.lang = l;
    $btn.textContent = l === 'te' ? 'English' : 'తెలుగు';
    apply();
  }
  let $btn;
  document.addEventListener('DOMContentLoaded', () => {
    $btn = document.getElementById('langBtn');
    $btn.addEventListener('click', () => setLang(lang === 'te' ? 'en' : 'te'));
    setLang(lang);
  });
})();
