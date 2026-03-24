import "reflect-metadata";
import { PlatformExpress } from "@tsed/platform-express";
import { getEnv } from "./config/env";
import { Server } from "./server";

async function bootstrap() {
  const env = getEnv();
  const platform = await PlatformExpress.bootstrap(Server, {
    logger: {
      level: env.nodeEnv === "production" ? "info" : "off"
    }
  });

  await platform.listen();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
