const fs = require('fs');

// Fix 1: AdminAnalytics.tsx ChartData index signature
let adminAnalytics = fs.readFileSync('src/features/admin/components/AdminAnalytics.tsx', 'utf8');
adminAnalytics = adminAnalytics.replace(
  "interface ChartData {",
  "interface ChartData {\n  [key: string]: string | number;"
);
fs.writeFileSync('src/features/admin/components/AdminAnalytics.tsx', adminAnalytics);

// Fix 2: DetailEmiCalculator.tsx
let emiCalc = fs.readFileSync('src/features/properties/detail/DetailEmiCalculator.tsx', 'utf8');
emiCalc = emiCalc.replace(
  "formatter={(value: number | string) => `₹${Number(value).toLocaleString('en-IN')}`}",
  "formatter={(value: string | number | undefined | null | any) => `₹${Number(value || 0).toLocaleString('en-IN')}`}"
);
fs.writeFileSync('src/features/properties/detail/DetailEmiCalculator.tsx', emiCalc);

// Fix 3: firebase.ts DocumentData cast
let firebase = fs.readFileSync('src/firebase.ts', 'utf8');
firebase = firebase.replace(
  "callback(doc.data())",
  "callback(doc.data() as AdminSettings)"
);
fs.writeFileSync('src/firebase.ts', firebase);

// Fix 4: types.ts AdminSettings index signature
let types = fs.readFileSync('src/shared/types/types.ts', 'utf8');
types = types.replace(
  "export interface AdminSettings {",
  "export interface AdminSettings {\n  [key: string]: string | number | boolean | undefined | object;"
);
fs.writeFileSync('src/shared/types/types.ts', types);

