import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin, requestOrigin } from "../lib/courses/request-origin";

test("origin checks and return URLs preserve the browser's loopback host", () => {
  for (const host of ["127.0.0.1:3000", "localhost:3000", "[::1]:3000"]) {
    const origin = `http://${host}`;
    const request = new Request("http://localhost:3000/api/auth/action", {
      headers: { host, origin },
    });
    assert.equal(requestOrigin(request), origin);
    assert.equal(isSameOrigin(request), true);
  }
});

test("foreign, missing, null and different-port origins remain rejected", () => {
  for (const origin of [
    "https://attacker.invalid",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3000",
    "null",
    "",
  ]) {
    const request = new Request("http://localhost:3000/api/auth/action", {
      headers: { host: "127.0.0.1:3000", ...(origin ? { origin } : {}) },
    });
    assert.equal(isSameOrigin(request), false);
  }
});

test("forwarded host cannot override Host and malformed hosts fail closed", () => {
  const request = new Request("https://courses.example/api/auth/action", {
    headers: {
      host: "courses.example:443",
      origin: "https://courses.example",
      "x-forwarded-host": "attacker.invalid",
    },
  });
  assert.equal(requestOrigin(request), "https://courses.example");
  assert.equal(isSameOrigin(request), true);
  for (const host of [
    "user@courses.example",
    "courses.example/path",
    "courses.example,attacker.invalid",
    "courses.example#fragment",
  ]) {
    assert.equal(
      isSameOrigin(
        new Request(request, {
          headers: {
            host,
            origin: "https://courses.example",
          },
        }),
      ),
      false,
    );
  }
});
