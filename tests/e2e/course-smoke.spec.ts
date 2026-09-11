import { test, expect } from "@playwright/test";

test("account screens stay usable and fail closed before backend setup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login?next=https://attacker.invalid");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Create an account" }),
  ).toHaveAttribute("href", "/register?next=%2Flearn");
  await page.getByRole("link", { name: "Create an account" }).click();
  // The first development-server navigation may compile this route on demand.
  await expect(page).toHaveURL(/\/register\?next=%2Flearn$/, { timeout: 30000 });
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("register.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("learner and admin pages expose no course data before setup", async ({
  page,
}) => {
  for (const route of ["/learn", "/admin"]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "Your course room is on its way." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Manage", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("old payment flags cannot claim a verified purchase", async ({ page }) => {
  await page.goto("/success?redirect_status=succeeded");
  await expect(page.getByText("Your next chapter is ready.")).toHaveCount(0);
  await expect(
    page.getByText("Your course access is active.", { exact: false }),
  ).toHaveCount(0);
});

test("write APIs reject foreign origins and disabled guest checkout", async ({
  request,
}) => {
  for (const route of [
    "/api/admin/content",
    "/api/admin/assets",
    "/api/admin/members",
    "/api/courses/checkout",
    "/api/auth/action",
  ]) {
    const response = await request.post(route, {
      headers: { origin: "https://attacker.invalid" },
      data: {},
    });
    expect(response.status()).toBe(403);
  }
  for (const route of [
    "/api/checkout",
    "/api/create-payment-intent",
    "/api/create-subscription",
  ]) {
    expect((await request.post(route, { data: {} })).status()).toBe(410);
  }
  expect(
    (
      await request.get(
        "/api/courses/assets/40000000-0000-4000-8000-000000000001",
      )
    ).status(),
  ).toBe(503);
  expect(
    (await request.post("/api/stripe/webhook", { data: "{}" })).status(),
  ).toBe(503);
});

test("install manifest is scoped to the learner application", async ({
  request,
}) => {
  const response = await request.get("/learn/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.scope).toBe("/learn");
  expect(manifest.start_url).toBe("/learn");
  const worker = await request.get("/learn/sw.js");
  expect(worker.headers()["cache-control"]).toContain("no-store");
  expect(worker.headers()["service-worker-allowed"]).toBe("/learn");
});

test("learner service worker handles offline navigation and caches only icons", async ({
  page,
  context,
}) => {
  await page.goto("/learn");
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/learn/sw.js", { scope: "/learn" });
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (r) => new URL(r.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(cached.sort()).toEqual([
    "/course-icon-192.png",
    "/course-icon-512.png",
  ]);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Your course will be here when you reconnect.",
    }),
  ).toBeVisible();
  await context.setOffline(false);
});
