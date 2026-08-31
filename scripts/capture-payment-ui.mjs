import { mkdir, writeFile } from "node:fs/promises";

const debuggerUrl = "http://127.0.0.1:9222";
const outputDir = new URL("../.impeccable/review/", import.meta.url);
const loginResponse = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL ?? "admin@gmail.com", password: process.env.ADMIN_PASSWORD ?? "password" }),
});
if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.status}`);
const { token } = await loginResponse.json();
const payments = await fetch("http://localhost:8000/api/internal/payments?per_page=1", { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }).then((response) => response.json());
const paymentId = payments.data[0]?.id;
const target = await fetch(`${debuggerUrl}/json/new?http://localhost:3000/internal/payments`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id || !pending.has(message.id)) return; const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
await send("Page.enable"); await send("Network.enable"); await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Network.setCookie", { name: "prama_internal_token", value: token, url: "http://localhost:3000", path: "/", httpOnly: true, sameSite: "Lax" });
await mkdir(outputDir, { recursive: true });
async function capture(name, url, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Page.navigate", { url: `${url}${url.includes("?") ? "&" : "?"}capture=${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 2200));
  const { contentSize } = await send("Page.getLayoutMetrics");
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: contentSize.width, height: contentSize.height, scale: 1 } });
  await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(screenshot.data, "base64"));
}
await capture("payment-desktop", "http://localhost:3000/internal/payments", 1600, 1000);
await capture("payment-mobile", "http://localhost:3000/internal/payments", 390, 844);
await capture("payment-create-desktop", "http://localhost:3000/internal/payments/new", 1600, 1000);
await capture("payment-create-mobile", "http://localhost:3000/internal/payments/new", 390, 844);
if (paymentId) { await capture("payment-detail-desktop", `http://localhost:3000/internal/payments/${paymentId}`, 1600, 1000); await capture("payment-detail-mobile", `http://localhost:3000/internal/payments/${paymentId}`, 390, 844); }
socket.close();
