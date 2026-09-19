import { test, expect } from "@playwright/test";

test("browser-origin auth requests pass origin validation without creating accounts", async ({
  page,
}) => {
  await page.goto("/register");
  // Deliberately invalid input stops before Supabase or any email operation.
  const result = await page.evaluate(async () => {
    const response = await fetch("/api/auth/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return { status: response.status, body: await response.json() };
  });
  expect(result.status).toBe(400);
  expect(result.body.error).not.toBe("Invalid request origin.");
});

test("auth callback redirects preserve the requested loopback host", async ({
  request,
  baseURL,
}) => {
  const response = await request.get("/auth/callback", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe(
    `${baseURL}/login?error=link-invalid`,
  );
});
