const LOCAL_IMAGE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function shouldBypassImageOptimization(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;

  try {
    const url = new URL(src);
    return LOCAL_IMAGE_HOSTS.has(url.hostname) && url.pathname.startsWith("/storage/");
  } catch {
    return false;
  }
}
