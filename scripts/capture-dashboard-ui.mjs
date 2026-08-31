import { mkdir, writeFile } from "node:fs/promises";

const debuggerUrl = "http://127.0.0.1:9223";
const outputDir = new URL("../.impeccable/review/", import.meta.url);
const loginResponse = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL ?? "admin@gmail.com", password: process.env.ADMIN_PASSWORD ?? "password" }),
});
if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.status}`);
const { token } = await loginResponse.json();
const apiResponse = await fetch("http://localhost:8000/api/internal/dashboard?days=30", { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
if (!apiResponse.ok) throw new Error(`Dashboard API failed: ${apiResponse.status}`);
const target = await fetch(`${debuggerUrl}/json/new?http://localhost:3000/internal/dashboard`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id || !pending.has(message.id)) return; const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
await send("Page.enable"); await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Network.setCookie", { name: "prama_internal_token", value: token, url: "http://localhost:3000", path: "/", httpOnly: true, sameSite: "Lax" });
await mkdir(outputDir, { recursive: true });
async function capture(name, width, height, openDailyData = false) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Page.navigate", { url: `http://localhost:3000/internal/dashboard?days=30&capture=${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 2200));
  if (openDailyData) {
    await send("Runtime.evaluate", { expression: `Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Lihat data harian'))?.click()` });
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const { contentSize } = await send("Page.getLayoutMetrics");
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: contentSize.width, height: contentSize.height, scale: 1 } });
  await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(screenshot.data, "base64"));
}
await capture("dashboard-desktop", 1600, 1000);
await capture("dashboard-mobile", 390, 844);
await capture("dashboard-daily-data-mobile", 390, 844, true);
socket.close();
