import { Controller, Get } from "@tsed/common";

@Controller("/health")
export class HealthController {
  @Get("/")
  getStatus() {
    return { ok: true };
  }
}
