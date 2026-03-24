import type { Request } from "express";
import { Unauthorized } from "@tsed/exceptions";
import { getEnv } from "../../config/env";

export function requireBotRequest(request: Request) {
  const env = getEnv();
  const token = request.header("x-bot-token");

  if (token !== env.botApiToken) {
    throw new Unauthorized("Invalid bot token");
  }
}
