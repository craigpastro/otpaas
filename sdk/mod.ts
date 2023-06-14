interface GetRequest {
  key: string;
  duration?: number;
}

interface GetResponse {
  password: string;
  expiresAt: number;
}

interface VerifyResponse {
  verified: boolean;
}

export class OtpClient {
  private baseUrl = "https://otpaas.deno.dev";

  constructor(url?: string) {
    if (url) {
      this.baseUrl = url;
    }
  }

  async get(key: string, duration?: number): Promise<GetResponse> {
    const b = { key } as GetRequest;
    if (duration) {
      b.duration = duration;
    }

    const body = JSON.stringify(b);
    const resp = await fetch(`${this.baseUrl}/v1/otp/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (resp.status != 200) {
      throw Error("unable to get response from server");
    }

    const respBody = await resp.json();

    return { password: respBody.password, expiresAt: respBody.expiresAt };
  }

  async verify(key: string, password: string): Promise<VerifyResponse> {
    const body = JSON.stringify({ key, password });
    const resp = await fetch(`${this.baseUrl}/v1/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (resp.status != 200) {
      throw Error("unable to get response from server");
    }

    const respBody = await resp.json();

    return { verified: respBody.verified };
  }
}
