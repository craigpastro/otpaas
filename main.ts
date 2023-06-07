import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import * as h from "./handlers.ts";

export const app = new Hono();

app.post("/v1/get", h.createOtp);
app.post("/v1/verify", h.verifyOtp);

serve(app.fetch, { port: 8080 });
