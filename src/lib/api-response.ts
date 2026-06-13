import { NextResponse } from "next/server";

interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
}

interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  error: null;
  meta?: ApiMeta;
}

interface ApiErrorPayload {
  success: false;
  data: null;
  error: string;
  meta?: ApiMeta;
}

interface ResponseOptions {
  status?: number;
  headers?: HeadersInit;
}

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload;

export function createSuccessPayload<T>(
  data: T,
  meta?: ApiMeta
): ApiSuccessPayload<T> {
  return {
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
}

export function createErrorPayload(
  error: string,
  meta?: ApiMeta
): ApiErrorPayload {
  return {
    success: false,
    data: null,
    error,
    ...(meta ? { meta } : {}),
  };
}

export function successResponse<T>(
  data: T,
  options: ResponseOptions = {}
): Response {
  return NextResponse.json(createSuccessPayload(data), {
    status: options.status ?? 200,
    headers: options.headers,
  });
}

/**
 * Build a user-facing error response. Pass only sanitized messages here;
 * do not forward raw database, stack trace, or provider errors to clients.
 */
export function errorResponse(
  error: string,
  options: ResponseOptions = {}
): Response {
  return NextResponse.json(createErrorPayload(error), {
    status: options.status ?? 500,
    headers: options.headers,
  });
}

export function paginatedResponse<T>(
  data: T,
  meta: Required<ApiMeta>,
  options: ResponseOptions = {}
): Response {
  return NextResponse.json(createSuccessPayload(data, meta), {
    status: options.status ?? 200,
    headers: options.headers,
  });
}
