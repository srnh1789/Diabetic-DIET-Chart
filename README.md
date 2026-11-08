# Diabetic Diet Chart – Sura Reddy Multi Speciality Hospital

Static website (no build step). Files: index.html, app.js, calc.js, foods.js, config.js, supabase.sql

## Logos
Put your two logo files in this folder named **logo1.png** (left) and **logo2.png** (right), then deploy.
If a file is missing, that logo is simply not shown.

## 1. Supabase (free)
1. Create a project at supabase.com.
2. SQL Editor -> New query -> paste all of `supabase.sql` -> Run. It creates the `foods` table (with GI, quantity and calories) and the `patients` table.
3. Authentication -> Users -> Add user: create an email + password for each staff member.
   Authentication -> Sign In / Providers -> Email: turn **off** "Allow new users to sign up" so only your staff can log in.
4. Project Settings -> API: copy the Project URL and the **anon public** key into `config.js` (never the service_role key).
5. Foods can be added or edited in Table Editor -> foods.

## 2. Netlify (free)
Netlify -> Add new site -> Deploy manually -> drag and drop this folder.

Without Supabase keys the site runs in demo mode: no login, records saved only in that browser.

## What each part does
- Patient list: search, View chart, Edit, Delete.
- New / Edit patient: name, UHID, age, sex, height, weight, lifestyle, diabetes type, treatment, HbA1c, sugar values, goal, food type, notes.
- Chart: BMI, BMR, daily calories, body fat %, carbohydrate target, 5 meals with calories and carbs per meal, a vegetable salad in every meal, change foods per meal, Save / Update, Print, Delete.
- Diabetic rules: millets, wheat, pesarattu, dals and low-GI vegetables first; white rice, banana, sapota, sweets, juices, fried items and potato are not suggested; the generator keeps carbohydrate near 45-50% of calories.
