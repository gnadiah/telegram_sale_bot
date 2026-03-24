import { createApiClient } from "./api/client";
import { createBot, registerBotCommands } from "./bot";
import { getEnv } from "./config/env";

async function bootstrap() {
  const env = getEnv();
  const bot = createBot(createApiClient(env), env.telegramBotToken);

  void registerBotCommands(bot);
  await bot.start();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
