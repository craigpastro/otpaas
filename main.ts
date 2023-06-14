import { Hono } from "https://deno.land/x/hono@v3.2.5/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as h from "./handlers.ts";

export const app = new Hono();

app.post("/v1/otp/get", h.createOtp);
app.post("/v1/otp/verify", h.verifyOtp);

serve(app.fetch, { port: 8080 });
