import Chromium, { inflate } from "@sparticuz/chromium";
import { chromium } from "playwright-core";

const output = "deliverables/portfolio-ad/screens";
const baseUrl = "http://localhost:8080";
const captureCss = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  .blur-3xl { filter: blur(18px) !important; }
  .glass, .glass-strong { backdrop-filter: none !important; }
  svg g { filter: none !important; }
`;

await inflate("node_modules/@sparticuz/chromium/bin/al2023.tar.br");
const browser = await chromium.launch({
  executablePath: await Chromium.executablePath(),
  args: Chromium.args,
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  reducedMotion: "reduce",
  colorScheme: "light",
});
const page = await context.newPage();
await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
page.on("pageerror", (error) => console.error("Page error:", error.message));

async function open(path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1_400);
  await page.addStyleTag({ content: captureCss });
  await page.waitForTimeout(500);
}

async function scrollToHeading(text, offset = 118) {
  const heading = page.getByRole("heading", { name: text, exact: true }).first();
  await heading.evaluate((element, yOffset) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - Number(yOffset) });
  }, offset);
  await page.waitForTimeout(650);
}

async function shot(name) {
  console.log(`Capturing ${name}`);
  await page.screenshot({ path: `${output}/${name}.jpg`, type: "jpeg", quality: 91 });
}

await open("/");
await shot("01-home-light");

await open("/about");
await shot("02-about");

await open("/services");
await shot("03-services");
await page.evaluate(() => window.scrollTo(0, 610));
await page.waitForTimeout(650);
await shot("04-services-grid");

await open("/projects");
await shot("05-projects");
await scrollToHeading("Makeke", 112);
await shot("06-makeke-overview");
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(650);
await shot("07-makeke-screens");
await scrollToHeading("Hit Campus Guide", 112);
await shot("08-hit-campus-guide");

await open("/leadership");
await shot("09-leadership");

await open("/contact");
await shot("10-contact");
await page.getByPlaceholder("Ada Lovelace").fill("Tariro");
await page.getByPlaceholder("Tell me about the project…").fill(
  "I need a modern business platform with payments, dashboards, and workflow automation.",
);
await page.getByRole("button", { name: /Theme: Light/i }).click();
await page.waitForTimeout(500);
await shot("11-contact-filled-dark");

await open("/");
await page.getByRole("button", { name: /Theme: Dark/i }).click();
await page.waitForTimeout(500);
await shot("12-home-neutral");

await browser.close();
console.log("Capture complete.");
