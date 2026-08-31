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
await send("Runtime.enable");

for (const viewport of [{ name: "mobile", width: 390, height: 844 }, { name: "tablet", width: 820, height: 1180 }]) {
  await send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: `http://localhost:3000/?reload-check=${viewport.name}-${Date.now()}` });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await send("Runtime.evaluate", { expression: "document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 480);" });
  await new Promise((resolve) => setTimeout(resolve, 150));
  await send("Page.reload", { ignoreCache: true });
  await new Promise((resolve) => setTimeout(resolve, 2200));
  const result = await send("Runtime.evaluate", { expression: "window.scrollY", returnByValue: true });
  const scrollY = Number(result.result.value);
  if (scrollY > 1) throw new Error(`${viewport.name} reload restored scrollY=${scrollY}`);
}

socket.close();
