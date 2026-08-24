import { mkdir, writeFile } from "node:fs/promises";

const outputDir = new URL("../.impeccable/review/", import.meta.url);
const target = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000/", { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(message.error.message)) : resolve(message.result);
});
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await mkdir(outputDir, { recursive: true });

async function capture(name, width, height, theme = "light", locale = "id") {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Network.setCookie", { name: "prama-locale", value: locale, url: "http://localhost:3000", path: "/", sameSite: "Lax" });
  await send("Page.navigate", { url: `http://localhost:3000/?capture=${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await send("Runtime.evaluate", { expression: `localStorage.setItem("prama-theme", "${theme}"); localStorage.setItem("prama-locale", "${locale}"); document.documentElement.dataset.theme = "${theme}";` });
  await send("Page.reload", { ignoreCache: true });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const { contentSize } = await send("Page.getLayoutMetrics");
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: contentSize.width, height: contentSize.height, scale: 1 } });
  await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(screenshot.data, "base64"));
}

await capture("landing-desktop-light-id", 1920, 1080);
await capture("landing-tablet-dark-id", 820, 1180, "dark");
await capture("landing-mobile-light-en", 390, 844, "light", "en");

await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send("Network.setCookie", { name: "prama-locale", value: "id", url: "http://localhost:3000", path: "/", sameSite: "Lax" });
await send("Page.navigate", { url: `http://localhost:3000/?footer=${Date.now()}` });
await new Promise((resolve) => setTimeout(resolve, 1500));
await send("Runtime.evaluate", { expression: "localStorage.setItem('prama-theme', 'light'); localStorage.setItem('prama-locale', 'id'); scrollTo(0, document.documentElement.scrollHeight);" });
await new Promise((resolve) => setTimeout(resolve, 1200));
const footerScreenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(new URL("landing-footer-desktop.png", outputDir), Buffer.from(footerScreenshot.data, "base64"));

await send("Page.navigate", { url: `http://localhost:3000/?location=${Date.now()}` });
await new Promise((resolve) => setTimeout(resolve, 2200));
await send("Runtime.evaluate", { expression: "document.querySelector('#location')?.scrollIntoView({ block: 'center' });" });
await new Promise((resolve) => setTimeout(resolve, 2500));
const locationScreenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(new URL("landing-location-desktop.png", outputDir), Buffer.from(locationScreenshot.data, "base64"));

await send("Page.navigate", { url: `http://localhost:3000/?facilities=${Date.now()}` });
await new Promise((resolve) => setTimeout(resolve, 2200));
await send("Runtime.evaluate", { expression: "document.querySelector('#facilities')?.scrollIntoView({ block: 'start' }); scrollBy(0, -80);" });
await new Promise((resolve) => setTimeout(resolve, 1400));
const facilitiesScreenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(new URL("landing-facilities-desktop.png", outputDir), Buffer.from(facilitiesScreenshot.data, "base64"));
socket.close();
