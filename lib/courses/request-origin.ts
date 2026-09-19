// NextURL normalizes loopback addresses to localhost. Preserve the HTTP Host
// so origin checks and auth redirects use the browser's actual cookie origin.
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (!host) return url.origin;
  const normalizedHost = host
    .toLowerCase()
    .replace(url.protocol === "https:" ? /:443$/ : /:80$/, "");
  const external = new URL(`${url.protocol}//${host}`);
  if (
    external.host !== normalizedHost ||
    external.username ||
    external.password ||
    external.pathname !== "/" ||
    external.search ||
    external.hash
  ) {
    throw new Error("Invalid request host.");
  }
  return external.origin;
}

export function isSameOrigin(request: Request): boolean {
  try {
    return request.headers.get("origin") === requestOrigin(request);
  } catch {
    return false;
  }
}
