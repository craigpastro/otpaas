import { Hono, HTTPException } from "https://deno.land/x/hono/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { passwordGenerator } from "https://deno.land/x/password_generator/mod.ts";

interface Data {
  password: string;
  expiresAt: number;
}

const kv = await Deno.openKv();

const app = new Hono();

app.post("/v1/get", async (c) => {
  const body = await c.req.json();
  if (!body || !body.id) {
    throw new HTTPException(400, { message: "error in request body" });
  }

  let duration = body.duration || 10 * 60; // duration is in seconds and its default is 10 minutes
  duration = duration * 1000; // convert to milliseconds

  const data: Data = {
    password: passwordGenerator("0", 6),
    expiresAt: Date.now() + duration,
  };

  await kv.set([body.id], data);

  return c.json(data);
});

app.post("/v1/check", async (c) => {
  const body = await c.req.json();
  if (!body || !body.id || !body.password) {
    throw new HTTPException(400, { message: "error in request body" });
  }

  const res = await kv.get<Data>([body.id]);
  const data = res.value;

  if (!data) {
    return c.json({ verified: false });
  }

  if (data.expiresAt < Date.now()) {
    await kv.delete([body.id]); // lazily clean up
    return c.json({ verified: false });
  }

  if (data.password !== body.password) {
    return c.json({ verified: false });
  }

  return c.json({ verified: true });
});

serve(app.fetch, { port: 8080 });
