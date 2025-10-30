type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions<T = unknown> {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: T;
  timeout?: number;
}

interface QueryParams {
  [key: string]: string | number | boolean;
}

type HTTPResponse<T = unknown> = T;

export class HTTPTransport {
  private baseURL: string;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  public get<T = unknown>(
    url: string,
    data?: QueryParams,
    options: Omit<RequestOptions, "method" | "data"> = {}
  ): Promise<HTTPResponse<T>> {
    const queryString = data ? this.buildQueryString(data) : "";
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request<T>(fullUrl, {
      ...options,
      method: "GET",
    });
  }

  public post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: Omit<RequestOptions<D>, "method" | "data"> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      data,
    });
  }

  public put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: Omit<RequestOptions<D>, "method" | "data"> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      data,
    });
  }

  public delete<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: Omit<RequestOptions<D>, "method" | "data"> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
      data,
    });
  }

  private request<T = unknown>(
    url: string,
    options: RequestOptions = {}
  ): Promise<HTTPResponse<T>> {
    const { method = "GET", headers = {}, data, timeout = 5000 } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = this.baseURL + url;

      xhr.open(method, fullUrl);

      xhr.timeout = timeout;
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      if (!headers["Content-Type"] && data && method !== "GET") {
        xhr.setRequestHeader("Content-Type", "application/json");
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText
              ? (JSON.parse(xhr.responseText) as T)
              : (null as T);
            resolve(response);
          } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ _error) {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new Error(`HTTP Error ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error"));
      };

      xhr.ontimeout = () => {
        reject(new Error("Request timeout"));
      };

      xhr.onabort = () => {
        reject(new Error("Request aborted"));
      };

      if (data && method !== "GET") {
        if (headers["Content-Type"] === "application/json") {
          xhr.send(JSON.stringify(data));
        } else if (data instanceof FormData) {
          xhr.send(data);
        } else {
          xhr.send(data as XMLHttpRequestBodyInit);
        }
      } else {
        xhr.send();
      }
    });
  }

  private buildQueryString(data: QueryParams): string {
    return Object.keys(data)
      .map((key) => {
        const value = data[key];
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          value.toString()
        )}`;
      })
      .join("&");
  }
}
