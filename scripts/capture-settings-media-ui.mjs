import { mkdir, writeFile } from "node:fs/promises";

const login = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  body: JSON.stringify({ email: process.env.ADMIN_EMAIL ?? "admin@gmail.com", password: process.env.ADMIN_PASSWORD ?? "password" }),
});
if (!login.ok) throw new Error(`Login failed: ${login.status}`);
const { token } = await login.json();
const target = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000/internal/settings", { method: "PUT" }).then((response) => response.json());
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
await send("Network.setCookie", { name: "prama_internal_token", value: token, url: "http://localhost:3000", path: "/", httpOnly: true, sameSite: "Lax" });
await send("Network.setCookie", { name: "prama-locale", value: "id", url: "http://localhost:3000", path: "/", sameSite: "Lax" });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://localhost:3000/internal/settings?capture=${Date.now()}` });
await new Promise((resolve) => setTimeout(resolve, 2200));
const { contentSize } = await send("Page.getLayoutMetrics");
const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: contentSize.width, height: contentSize.height, scale: 1 } });
const outputDir = new URL("../.impeccable/review/", import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(new URL("settings-hero-media.png", outputDir), Buffer.from(screenshot.data, "base64"));
socket.close();
