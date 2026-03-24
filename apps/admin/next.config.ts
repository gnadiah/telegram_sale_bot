import { loadRelativeEnvFile } from "@telegram-sale-bot/shared/env";
import type { NextConfig } from "next";

loadRelativeEnvFile(import.meta.url, "../../.env");

const nextConfig: NextConfig = {};

export default nextConfig;
