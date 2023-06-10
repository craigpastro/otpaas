import {
  assert,
  assertEquals,
  assertExists,
  assertFalse,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { app } from "./main.ts";

const baseUrl = "http://localhost:8080/v1/otp/";

Deno.test("create otp", async () => {
  const req = new Request(baseUrl + "get", {
    method: "POST",
    body: JSON.stringify({ key: "foo" }),
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
    body: JSON.stringify({ key: "foo" }),
  });
  const getRes = await app.request(getReq);
  assertEquals(getRes.status, 200);

  const getBody = await getRes.json();

  const verifyReq = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ key: "foo", password: getBody.password }),
  });
  const verifyRes = await app.request(verifyReq);

  const verifyBody = await verifyRes.json();
  assert(verifyBody.verified);
});

Deno.test("create, wait until expire, and try to get otp", async () => {
  const getReq = new Request(baseUrl + "get", {
    method: "POST",
    body: JSON.stringify({
      key: "foo",
      duration: 1,
    }),
  });
  const getRes = await app.request(getReq);
  assertEquals(getRes.status, 200);

  const getBody = await getRes.json();

  await sleep(1); // wait for the otp to expire

  const verifyReq = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ key: "foo", password: getBody.password }),
  });
  const verifyRes = await app.request(verifyReq);

  const verifyBody = await verifyRes.json();
  assertFalse(verifyBody.verified);
});

Deno.test("create and create and the old one doesn't verify", async () => {
  const key = "foo";

  const g1Res = await app.request(
    new Request(baseUrl + "get", {
      method: "POST",
      body: JSON.stringify({ key }),
    }),
  );
  assertEquals(g1Res.status, 200);

  const g1ResBody = await g1Res.json();
  const g1password = g1ResBody.password;

  // get a new code
  const g2Res = await app.request(
    new Request(baseUrl + "get", {
      method: "POST",
      body: JSON.stringify({ key }),
    }),
  );
  assertEquals(g2Res.status, 200);

  const g2ResBody = await g2Res.json();
  const g2password = g2ResBody.password;

  // The old password should not verify
  const v1Req = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ key: "foo", password: g1password }),
  });
  const v1Res = await app.request(v1Req);
  const v1Body = await v1Res.json();
  assertFalse(v1Body.verified);

  // But the new one should
  const v2Req = new Request(baseUrl + "verify", {
    method: "POST",
    body: JSON.stringify({ key: "foo", password: g2password }),
  });
  const v2Res = await app.request(v2Req);
  const v2Body = await v2Res.json();
  assert(v2Body.verified);
});
