// Keep public-site links on the configured course host, including auth pages.
export function courseHref(
  route: "/learn" | "/login" | "/register" = "/learn",
) {
  const base = process.env.NEXT_PUBLIC_COURSE_URL;
  return base ? new URL(route, base).href : route;
}
