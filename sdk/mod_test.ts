import {
  assert,
  assertExists,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { OtpClient } from "./mod.ts";

const client = new OtpClient();

Deno.test("test the sdk", async () => {
  const key = crypto.randomUUID();

  const getResp = await client.get(key);
  assertExists(getResp.password);
  assertExists(getResp.expiresAt);

  const verifyResp = await client.verify(key, getResp.password);
  assert(verifyResp.verified);
});
