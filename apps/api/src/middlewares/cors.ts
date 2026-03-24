import type { RequestHandler } from "express";
import { getEnv } from "../config/env";

const DEFAULT_ALLOWED_HEADERS = "Authorization, Content-Type";
const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS";

export function createCorsMiddleware(): RequestHandler {
  return (request, response, next) => {
    const origin = request.headers.origin;

    if (origin && getEnv().cors.allowedOrigins.includes(origin)) {
      const requestedHeaders = request.headers["access-control-request-headers"];

      response.header("Access-Control-Allow-Credentials", "true");
      response.header("Access-Control-Allow-Methods", DEFAULT_ALLOWED_METHODS);
      response.header(
        "Access-Control-Allow-Headers",
        typeof requestedHeaders === "string" && requestedHeaders.length > 0
          ? requestedHeaders
          : DEFAULT_ALLOWED_HEADERS
      );
      response.header("Access-Control-Allow-Origin", origin);

      const varyHeader = response.getHeader("Vary");
      const varyValue = Array.isArray(varyHeader) ? varyHeader.join(", ") : String(varyHeader ?? "");
      response.header("Vary", varyValue ? `${varyValue}, Origin` : "Origin");
    }

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  };
}
