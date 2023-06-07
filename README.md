# One Time Password as a Service

Generate and verify OTPs. See the [OpenAPI spec](./openapi.yaml) for a
description of the endpoints.

> This is part of my playing with [Deno Deploy](https://deno.com/deploy) series.

## Usage

Create an OTP:

```
$ curl -XPOST 'https://otpaas.deno.dev/v1/get' \
-H 'Content-Type: application/json' \
-d '{
    "id": "foo"
}'
{"password":"203211","expiresAt":1686116478274}
```

Verify the OTP:

```
$ curl -XPOST 'https://otpaas.deno.dev/v1/verify' \
-H 'Content-Type: application/json' \
-d '{
    "id": "foo",
    "password": "203211"
}'
{"verified":true}
```

Replace `https://otpaas.deno.dev` with `http://localhost:8080` if running
locally.
