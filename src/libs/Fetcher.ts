import type * as z from 'zod';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type HttpJsonOptions<T> = {
  schema: z.ZodType<T>;
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

/**
 * Error thrown when the server responds with a non-2xx status.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(response: Response, body: unknown) {
    super(`Request failed with status ${response.status}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = body;
  }
}

/**
 * Reads a response body as JSON when possible, otherwise as text.
 * @param response The fetch response.
 * @returns The parsed body, or null when the body is empty.
 */
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as unknown;
  }

  return text;
}

/**
 * Sends a JSON request and validates the response with a Zod schema.
 * @param url The request URL, relative or absolute.
 * @param options Request options including the response schema.
 * @returns The parsed and validated response body.
 * @throws {HttpError} When the response status is not in the 2xx range.
 */
export async function httpJson<T>(url: string, options: HttpJsonOptions<T>): Promise<T> {
  const method = options.method ?? 'GET';
  const hasBody = options.body !== undefined;

  const headers = new Headers(options.headers);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const body = await readBody(response);

  if (!response.ok) {
    throw new HttpError(response, body);
  }

  return options.schema.parse(body);
}
