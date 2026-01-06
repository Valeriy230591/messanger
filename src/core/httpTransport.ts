type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  formData?: boolean; // Добавляем флаг для FormData
  responseType?: XMLHttpRequestResponseType; // <-- ДОБАВИЛИ
}
export interface QueryParams {
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

  public post<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      data,
    });
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      data,
    });
  }

  public delete<T = unknown>(
    url: string,
    data?: unknown,
    options: Omit<RequestOptions, "method"> = {}
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
    const {
      method = "GET",
      headers = {},
      data,
      timeout = 5000,
      formData = false,
    } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = this.baseURL + url;

      xhr.open(method, fullUrl);
      if (options.responseType) {
        xhr.responseType = options.responseType;
      }

      xhr.withCredentials = true;
      xhr.timeout = timeout;

      const isFormData = formData || data instanceof FormData;

      if (!isFormData && data && method !== "GET") {
        xhr.setRequestHeader("Content-Type", "application/json");
      }

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText
              ? (JSON.parse(xhr.responseText) as T)
              : (null as T);
            resolve(response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(xhr);
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
        if (isFormData) {
          xhr.send(data as FormData);
        } else {
          const requestData =
            typeof data === "string" ? data : JSON.stringify(data);
          xhr.send(requestData);
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
