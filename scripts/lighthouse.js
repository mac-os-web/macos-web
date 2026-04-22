import { execSync, spawn } from "child_process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer-core";
import config from "../lighthouse.config.js";

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// Auth state injected before each page load so Lighthouse measures the
// intended screen (not whatever the route guard would redirect to).
const AUTH_STORAGE_KEY = "macos-web-auth";
const AUTH_AUTHENTICATED = {
  status: "authenticated",
  user: { name: "Lighthouse", email: "lighthouse@test", picture: null },
};

// 테스트할 페이지 목록 — 페이지마다 인증 상태를 다르게 주입한다.
// auth가 null이면 미인증 상태(또는 주입 생략).
const PAGES = [
  { name: "Login", path: "/login", auth: null },
  { name: "Home", path: "/", auth: AUTH_AUTHENTICATED },
];

// 1. Build
console.log("Building...\n");
execSync("npx vite build", { stdio: "inherit" });

// 2. Start preview server
const server = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
  shell: true,
  stdio: "pipe",
});

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error("Server timeout")), 30000);
  const onData = (data) => {
    if (data.toString().includes(String(PORT))) { clearTimeout(timeout); resolve(); }
  };
  server.stdout.on("data", onData);
  server.stderr.on("data", onData);
  server.on("error", reject);
});

console.log(`\nServer ready | CPU: 4x slowdown | Network: none\n`);

// 3. Run Lighthouse per page
const chrome = await launch({
  chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu", "--window-size=1920,1080"],
});

// Connect puppeteer to the same Chrome so we can inject auth into localStorage
// before each Lighthouse run. Lighthouse accepts a puppeteer Page as 4th arg.
const browser = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });

const fs = await import("fs");
const results = [];

for (const pageInfo of PAGES) {
  const url = `${BASE}${pageInfo.path}`;
  console.log(`Testing: ${pageInfo.name} (${url})`);

  const page = await browser.newPage();
  if (pageInfo.auth) {
    await page.evaluateOnNewDocument(
      (key, state) => {
        localStorage.setItem(key, JSON.stringify(state));
      },
      AUTH_STORAGE_KEY,
      pageInfo.auth,
    );
  } else {
    // 미인증 측정: 이전 상태가 남아있을 수 있으니 명시적으로 비움
    await page.evaluateOnNewDocument(
      (key) => {
        localStorage.removeItem(key);
      },
      AUTH_STORAGE_KEY,
    );
  }

  const result = await lighthouse(url, { output: ["html", "json"], logLevel: "error" }, config, page);
  await page.close();
  if (!result) { console.error(`  FAILED\n`); continue; }

  const { lhr } = result;
  const get = (key) => lhr.audits[key]?.displayValue || "-";

  results.push({
    name: pageInfo.name,
    score: lhr.categories.performance.score !== null ? Math.round(lhr.categories.performance.score * 100) : "N/A",
    fcp: get("first-contentful-paint"),
    si: get("speed-index"),
    lcp: get("largest-contentful-paint"),
    tbt: get("total-blocking-time"),
    cls: get("cumulative-layout-shift"),
  });

  // Save individual reports
  const slug = pageInfo.name.toLowerCase().replace(/\s+/g, "-");
  fs.writeFileSync(`lighthouse-${slug}.html`, result.report[0]);
  fs.writeFileSync(`lighthouse-${slug}.json`, result.report[1]);
}

try { await browser.disconnect(); } catch {}
try { await chrome.kill(); } catch {}
server.kill();

// 4. Print table
console.log(`\n${"=".repeat(75)}`);
console.log(`  ${"Page".padEnd(12)} ${"Score".padStart(5)}  ${"FCP".padStart(8)}  ${"SI".padStart(8)}  ${"LCP".padStart(8)}  ${"TBT".padStart(8)}  ${"CLS".padStart(8)}`);
console.log(`${"-".repeat(75)}`);
for (const r of results) {
  console.log(`  ${r.name.padEnd(12)} ${String(r.score).padStart(5)}  ${r.fcp.padStart(8)}  ${r.si.padStart(8)}  ${r.lcp.padStart(8)}  ${r.tbt.padStart(8)}  ${r.cls.padStart(8)}`);
}
console.log(`${"=".repeat(75)}\n`);