const fs = require("fs");

const path = "src/routes/advisor/solar-comparison-tool.tsx";
const s = fs.readFileSync(path, "utf8");

// Allow for slight wording variations while still guarding the core sections
const checks = [
  [/Sungage\s+Financing\s+Options/i, "Sungage Financing Options"],
  [/Available\s+Incentives/i, "Available Incentives"],
  [/Cumulative\s+Cost\s+Analysis/i, "Cumulative Cost Analysis"],
  [/(Duke\s+Energy(\s+\(Increasing\))?|Duke\s+Energy\s+Bill)/i, "Duke Energy"],
  [/Deal\s+Optimization/i, "Deal Optimization"],
  [/Breakeven|Break\-?even/i, "Breakeven"],
];

const missing = checks
  .filter(([re]) => !re.test(s))
  .map(([,label]) => label);

if (missing.length) {
  console.error("\u274c Advisor smoke test failed. Missing:", missing.join(", "));
  process.exit(1);
}
console.log("\u2705 Advisor smoke test passed.");
