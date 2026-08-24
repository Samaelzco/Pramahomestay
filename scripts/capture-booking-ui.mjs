import { mkdir, writeFile } from "node:fs/promises";

const dates = { check_in: "2026-09-10", check_out: "2026-09-12", guests: "1" };
const availability = await fetch(`http://localhost:8000/api/public/landing?${new URLSearchParams(dates)}`).then((response) => response.json());
const roomId = availability.data.rooms[0]?.id;
if (!roomId) throw new Error("No room available for booking capture");
const url = `http://localhost:3000/booking?${new URLSearchParams({ ...dates, room_id: String(roomId) })}`;
const target = await fetch(`http://127.0.0.1:9222/json/new?${url}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let sequence = 0;
socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id || !pending.has(message.id)) return; const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
await send("Page.enable");
await send("Network.setCookie", { name: "prama-locale", value: "id", url: "http://localhost:3000", path: "/", sameSite: "Lax" });
const outputDir = new URL("../.impeccable/review/", import.meta.url);
await mkdir(outputDir, { recursive: true });

for (const [name, width, height, mobile] of [["booking-desktop", 1920, 1080, false], ["booking-mobile", 390, 844, true]]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: `${url}&capture=${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 2400));
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(screenshot.data, "base64"));
}
socket.close();
