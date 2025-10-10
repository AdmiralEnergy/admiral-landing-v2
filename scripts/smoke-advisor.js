const fs = require("fs");

const path = "src/routes/advisor/solar-comparison-tool.tsx";
const s = fs.readFileSync(path, "utf8");
const mustHave = [
  "Sungage Financing Options",
  "Available Incentives",
  "Cumulative Cost Analysis",
  "Duke Energy",
  "Deal Optimization",
  "Breakeven"
];
const missing = mustHave.filter((x) => !s.includes(x));
if (missing.length) {
  console.error("\u274c Advisor smoke test failed. Missing:", missing.join(", "));
  process.exit(1);
}
console.log("\u2705 Advisor smoke test passed.");
