import "reflect-metadata";

process.env.NODE_ENV = "test";
process.env.DATABASE_DRIVER = "pglite";
process.env.ADMIN_ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES = "15";
process.env.ADMIN_REFRESH_COOKIE_NAME = "tsb_refresh";
process.env.ADMIN_REFRESH_TOKEN_DAYS = "30";
process.env.ADMIN_USERNAME = "admin";
process.env.ADMIN_PASSWORD = "secret123";
process.env.BOT_API_TOKEN = "test-bot-token";
