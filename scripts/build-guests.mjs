// Convert the seating spreadsheet into docs/guests.json.
// Usage: node scripts/build-guests.mjs path/to/guests.xlsx
// Expects columns "First Name", "Last Name", "Table Number" (header matching is case/space-insensitive).
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/build-guests.mjs <spreadsheet.xlsx|.csv>");
  process.exit(1);
}

const wb = XLSX.read(fs.readFileSync(input));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });

const key = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
const pick = (row, name) => {
  const col = Object.keys(row).find((k) => key(k) === name);
  return col === undefined ? "" : String(row[col]).trim();
};

const guests = [];
const problems = [];
rows.forEach((row, i) => {
  const first = pick(row, "firstname");
  const last = pick(row, "lastname");
  const table = pick(row, "tablenumber") || pick(row, "table");
  if (!first && !last && !table) return; // blank row
  if (!first || !last || !table) {
    problems.push(`Row ${i + 2}: missing ${[!first && "first name", !last && "last name", !table && "table"].filter(Boolean).join(", ")}`);
    return;
  }
  guests.push({ first, last, table });
});

// Flag duplicate names so they can be checked before the wedding.
const seen = new Map();
for (const g of guests) {
  const k = key(g.first) + "|" + key(g.last);
  seen.set(k, [...(seen.get(k) || []), g.table]);
}
for (const [k, tables] of seen) {
  if (tables.length > 1) problems.push(`Duplicate name "${k.replace("|", " ")}" at tables: ${tables.join(", ")}`);
}

const out = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "docs", "guests.json");
fs.writeFileSync(out, JSON.stringify(guests));
console.log(`Wrote ${guests.length} guests to docs/guests.json`);
if (problems.length) {
  console.log(`\n${problems.length} issue(s) to review:`);
  problems.forEach((p) => console.log("  - " + p));
}
