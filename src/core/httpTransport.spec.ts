import { expect } from "chai";
import { HTTPTransport, type QueryParams } from "./httpTransport.ts";

class MockXMLHttpRequest {
  method: string = "";
  url: string = "";
  withCredentials: boolean = false;
  timeout: number = 0;
  responseType: XMLHttpRequestResponseType = "";
  requestHeaders: Record<string, string> = {};
  requestBody: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status: number = 0;
  responseText: string = "";
  response: unknown = null;

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string): void {
    this.requestHeaders[key] = value;
  }

  send(body?: string | FormData | null): void {
    if (body instanceof FormData) {
      this.requestBody = "[FormData]";
    } else {
      this.requestBody = body || null;
    }
  }

  respond(status: number, body?: unknown): void {
    this.status = status;
    this.responseText = body
      ? typeof body === "string"
        ? body
        : JSON.stringify(body)
      : "";
    this.response = body;

    if (this.onload) {
      this.onload();
    }
  }

  triggerError(): void {
    if (this.onerror) {
      this.onerror();
    }
  }

  triggerTimeout(): void {
    if (this.ontimeout) {
      this.ontimeout();
    }
  }

  triggerAbort(): void {
    if (this.onabort) {
      this.onabort();
    }
  }
}

describe("HTTPTransport", () => {
  let http: HTTPTransport;
  let originalXMLHttpRequest: typeof global.XMLHttpRequest;
  let mockRequests: MockXMLHttpRequest[];

  beforeEach(() => {
    mockRequests = [];
    originalXMLHttpRequest = global.XMLHttpRequest;

    global.XMLHttpRequest = class extends MockXMLHttpRequest {
      constructor() {
        super();
        mockRequests.push(this);
      }
    } as unknown as typeof global.XMLHttpRequest;

    http = new HTTPTransport("https://api.example.com");
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXMLHttpRequest;
  });

  it("должен выполнять GET запрос", async () => {
    const promise = http.get("/users");

    expect(mockRequests).to.have.length(1);
    const request = mockRequests[0];

    expect(request.method).to.equal("GET");
    expect(request.url).to.equal("https://api.example.com/users");
    expect(request.withCredentials).to.be.true;

    request.respond(200, { success: true });

    const response = await promise;
    expect(response).to.deep.equal({ success: true });
  });

  it("должен добавлять query параметры", async () => {
    const params: QueryParams = { page: 1, limit: 10, active: true };
    const promise = http.get("/users", params);

    expect(mockRequests).to.have.length(1);
    const request = mockRequests[0];

    expect(request.url).to.equal(
      "https://api.example.com/users?page=1&limit=10&active=true"
    );

    request.respond(200, { data: [] });

    const response = await promise;
    expect(response).to.deep.equal({ data: [] });
  });

  it("должен выполнять POST запрос", async () => {
    const data = { name: "John", age: 30 };
    const promise = http.post("/users", data);

    expect(mockRequests).to.have.length(1);
    const request = mockRequests[0];

    expect(request.method).to.equal("POST");
    expect(request.requestBody).to.equal(JSON.stringify(data));

    request.respond(201, { id: 1 });

    const response = await promise;
    expect(response).to.deep.equal({ id: 1 });
  });

  it("должен выполнять DELETE запрос", async () => {
    const promise = http.delete("/users/1");

    expect(mockRequests).to.have.length(1);
    const request = mockRequests[0];

    expect(request.method).to.equal("DELETE");

    request.respond(204);

    const response = await promise;
    expect(response).to.be.null;
  });

  it("должен обрабатывать ошибки сервера", async () => {
    const promise = http.get("/error");

    mockRequests[0].respond(404, { error: "Not Found" });

    try {
      await promise;
      expect.fail("Должна была быть ошибка");
    } catch (error) {
      expect(error).to.be.instanceOf(XMLHttpRequest);
    }
  });

  it("должен обрабатывать сетевые ошибки", async () => {
    const promise = http.get("/network-error");

    setTimeout(() => {
      mockRequests[0].triggerError();
    }, 0);

    try {
      await promise;
      expect.fail("Должна была быть ошибка");
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.equal("Network error");
    }
  });
});
