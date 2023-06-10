import { Context, HTTPException } from "https://deno.land/x/hono@v3.2.5/mod.ts";
import { passwordGenerator } from "https://deno.land/x/password_generator@latest/mod.ts";

interface Data {
  password: string;
  expiresAt: number;
}

const kv = await Deno.openKv();

export async function createOtp(c: Context) {
  const body = await c.req.json();
  if (!body || !body.key) {
    throw new HTTPException(400, { message: "error in request body" });
  }

  let duration = body.duration || 10 * 60; // duration is in seconds and its default is 10 minutes
  duration = duration * 1000; // convert to milliseconds

  const data: Data = {
    password: passwordGenerator("0", 6),
    expiresAt: Date.now() + duration,
  };

  await kv.set(["keys", body.key], data);

  return c.json(data);
}

export async function verifyOtp(c: Context) {
  const body = await c.req.json();
  if (!body || !body.key || !body.password) {
    throw new HTTPException(400, { message: "error in request body" });
  }

  const res = await kv.get<Data>(["keys", body.key]);
  const data = res.value;

  if (!data) {
    return c.json({ verified: false });
  }

  if (data.expiresAt < Date.now()) {
    await kv.delete(["keys", body.key]); // lazily clean up
    return c.json({ verified: false });
  }

  if (data.password !== body.password) {
    return c.json({ verified: false });
  }

  return c.json({ verified: true });
}
