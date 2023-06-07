import {
  assert,
  assertEquals,
  assertExists,
  assertFalse,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";
import { app } from "./main.ts";

const baseUrl = "http://localhost:8080/v1/";

Deno.test("create otp", async () => {
  const req = new Request(baseUrl + "get", {
    method: "POST",
    body: JSON.stringify({ id: "foo" }),
  });
  const res = await app.request(req);

  assertEquals(res.status, 200);

  const body = await res.json();
  assertExists(body.password);
  assertExists(body.expiresAt);
});

Deno.test("create and get otp", async () => {
  const getReq = new Request(baseUrl + "get", {
    method: "POST",
    body: JSON.stringify({ id: "foo" }),
  });
  const getRes = await app.request(getReq);

  assertEquals(getRes.status, 200);

  const getBody = await getRes.json();

  const verifyReq = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ id: "foo", password: getBody.password }),
  });
  const verifyRes = await app.request(verifyReq);

  const verifyBody = await verifyRes.json();
  assert(verifyBody.verified);
});

Deno.test("create, wait until expire, and try to get otp", async () => {
  const getReq = new Request(baseUrl + "get", {
    method: "POST",
    body: JSON.stringify({
      id: "foo",
      duration: 1,
    }),
  });
  const getRes = await app.request(getReq);

  assertEquals(getRes.status, 200);

  const getBody = await getRes.json();

  await sleep(1); // wait for the otp to expire

  const verifyReq = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ id: "foo", password: getBody.password }),
  });
  const verifyRes = await app.request(verifyReq);

  const verifyBody = await verifyRes.json();
  assertFalse(verifyBody.verified);
});
