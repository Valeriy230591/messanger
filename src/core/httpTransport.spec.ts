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

  respond(
    status: number,
    headers: Record<string, string>,
    body?: unknown
  ): void {
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

    (global.XMLHttpRequest as unknown) = class extends MockXMLHttpRequest {
      constructor() {
        super();
        mockRequests.push(this);
      }
    };

    http = new HTTPTransport("https://api.example.com");
  });

  afterEach(() => {
    (global.XMLHttpRequest as unknown) = originalXMLHttpRequest;
  });

  describe("Конструктор", () => {
    it("должен создавать инстанс с базовым URL", () => {
      const httpWithBaseUrl = new HTTPTransport("https://api.example.com");
      expect(httpWithBaseUrl).to.be.instanceOf(HTTPTransport);
    });

    it("должен создавать инстанс без базового URL", () => {
      const httpWithoutBaseUrl = new HTTPTransport();
      expect(httpWithoutBaseUrl).to.be.instanceOf(HTTPTransport);
    });
  });

  describe("Метод get", () => {
    it("должен выполнять GET запрос", async () => {
      const promise = http.get("/users");

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.method).to.equal("GET");
      expect(request.url).to.equal("https://api.example.com/users");
      expect(request.withCredentials).to.be.true;

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { success: true }
      );

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

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { data: [] }
      );

      const response = await promise;
      expect(response).to.deep.equal({ data: [] });
    });

    it("должен передавать дополнительные опции", async () => {
      const options = {
        headers: { "X-Custom-Header": "value" },
        timeout: 10000,
      };

      const promise = http.get("/users", undefined, options);

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.timeout).to.equal(10000);
      expect(request.requestHeaders["X-Custom-Header"]).to.equal("value");

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { ok: true }
      );

      const response = await promise;
      expect(response).to.deep.equal({ ok: true });
    });
  });

  describe("Метод post", () => {
    it("должен выполнять POST запрос с данными", async () => {
      const data = { name: "John", age: 30 };
      const promise = http.post("/users", data);

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.method).to.equal("POST");
      expect(request.url).to.equal("https://api.example.com/users");
      expect(request.requestHeaders["Content-Type"]).to.equal(
        "application/json"
      );
      expect(request.requestBody).to.equal(JSON.stringify(data));

      request.respond(201, { "Content-Type": "application/json" }, { id: 1 });

      const response = await promise;
      expect(response).to.deep.equal({ id: 1 });
    });

    it("должен обрабатывать строковые данные", async () => {
      const promise = http.post("/echo", "plain text");

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.requestBody).to.equal("plain text");

      request.respond(
        200,
        { "Content-Type": "application/json" },
        "echo: plain text"
      );

      const response = await promise;
      expect(response).to.equal("echo: plain text");
    });
  });

  describe("Метод put", () => {
    it("должен выполнять PUT запрос", async () => {
      const data = { name: "John Updated" };
      const promise = http.put("/users/1", data);

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.method).to.equal("PUT");
      expect(request.url).to.equal("https://api.example.com/users/1");
      expect(request.requestBody).to.equal(JSON.stringify(data));

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { updated: true }
      );

      const response = await promise;
      expect(response).to.deep.equal({ updated: true });
    });
  });

  describe("Метод delete", () => {
    it("должен выполнять DELETE запрос", async () => {
      const promise = http.delete("/users/1");

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.method).to.equal("DELETE");
      expect(request.url).to.equal("https://api.example.com/users/1");

      request.respond(204, {});

      const response = await promise;
      expect(response).to.be.null;
    });

    it("должен отправлять данные в DELETE запросе", async () => {
      const data = { reason: "spam" };
      const promise = http.delete("/users/1", data);

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.method).to.equal("DELETE");
      expect(request.requestBody).to.equal(JSON.stringify(data));

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { deleted: true }
      );

      const response = await promise;
      expect(response).to.deep.equal({ deleted: true });
    });
  });

  describe("Обработка ответов", () => {
    it("должен разрешать промис при успешном ответе", async () => {
      const promise = http.get("/success");

      mockRequests[0].respond(
        200,
        { "Content-Type": "application/json" },
        { data: "success" }
      );

      const response = await promise;
      expect(response).to.deep.equal({ data: "success" });
    });

    it("должен отклонять промис при ошибке сервера", async () => {
      const promise = http.get("/error");

      mockRequests[0].respond(
        404,
        { "Content-Type": "application/json" },
        { error: "Not Found" }
      );

      try {
        await promise;
        expect.fail("Должна была быть ошибка");
      } catch (error) {
        expect(error).to.be.instanceOf(XMLHttpRequest);
      }
    });

    it("должен обрабатывать пустой ответ", async () => {
      const promise = http.get("/empty");

      mockRequests[0].respond(204, {});

      const response = await promise;
      expect(response).to.be.null;
    });

    it("должен обрабатывать не-JSON ответ", async () => {
      const promise = http.get("/text");

      mockRequests[0].respond(
        200,
        { "Content-Type": "text/plain" },
        "plain text response"
      );

      const response = await promise;
      expect(response).to.equal("plain text response");
    });
  });

  describe("Обработка ошибок", () => {
    it("должен отклонять промис при сетевой ошибке", async () => {
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

    it("должен отклонять промис при таймауте", async () => {
      const promise = http.get("/slow", undefined, { timeout: 100 });

      setTimeout(() => {
        mockRequests[0].triggerTimeout();
      }, 0);

      try {
        await promise;
        expect.fail("Должна была быть ошибка");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal("Request timeout");
      }
    });

    it("должен отклонять промис при отмене запроса", async () => {
      const promise = http.get("/cancelled");

      setTimeout(() => {
        mockRequests[0].triggerAbort();
      }, 0);

      try {
        await promise;
        expect.fail("Должна была быть ошибка");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal("Request aborted");
      }
    });
  });

  describe("Настройки по умолчанию", () => {
    it("должен использовать таймаут по умолчанию", async () => {
      const promise = http.get("/test");

      expect(mockRequests).to.have.length(1);
      expect(mockRequests[0].timeout).to.equal(5000);

      mockRequests[0].respond(200, { "Content-Type": "application/json" }, {});
      await promise;
    });

    it("должен устанавливать withCredentials = true", async () => {
      const promise = http.get("/test");

      expect(mockRequests).to.have.length(1);
      expect(mockRequests[0].withCredentials).to.be.true;

      mockRequests[0].respond(200, { "Content-Type": "application/json" }, {});
      await promise;
    });

    it("должен использовать базовый URL", async () => {
      const customHttp = new HTTPTransport("https://custom.api");
      const promise = customHttp.get("/endpoint");

      expect(mockRequests).to.have.length(1);
      expect(mockRequests[0].url).to.equal("https://custom.api/endpoint");

      mockRequests[0].respond(200, { "Content-Type": "application/json" }, {});
      await promise;
    });
  });

  describe("Краевые случаи", () => {
    it("должен обрабатывать запросы без baseURL", async () => {
      const localHttp = new HTTPTransport();
      const promise = localHttp.get("/api/test");

      expect(mockRequests).to.have.length(1);
      expect(mockRequests[0].url).to.equal("/api/test");

      mockRequests[0].respond(
        200,
        { "Content-Type": "application/json" },
        { ok: true }
      );

      const response = await promise;
      expect(response).to.deep.equal({ ok: true });
    });

    it("должен обрабатывать undefined данные", async () => {
      const promise = http.post("/test", undefined);

      expect(mockRequests).to.have.length(1);
      const request = mockRequests[0];

      expect(request.requestBody).to.be.null;

      request.respond(
        200,
        { "Content-Type": "application/json" },
        { ok: true }
      );

      await promise;
    });
  });

  describe("Вспомогательные методы", () => {
    it("должен корректно строить query строку", () => {
      const httpInstance = new HTTPTransport();
      const params: QueryParams = {
        name: "John Doe",
        age: 30,
        active: true,
        score: 95.5,
      };

      httpInstance.get("/test", params);

      const request = mockRequests[0];
      expect(request.url).to.equal(
        "/test?name=John%20Doe&age=30&active=true&score=95.5"
      );
    });

    it("должен обрабатывать специальные символы в query параметрах", () => {
      const httpInstance = new HTTPTransport();
      const params: QueryParams = {
        search: "test & value",
        encoded: "a+b=c@d",
      };

      httpInstance.get("/search", params);

      const request = mockRequests[0];
      expect(request.url).to.include("search=test%20%26%20value");
      expect(request.url).to.include("encoded=a%2Bb%3Dc%40d");
    });
  });
});
