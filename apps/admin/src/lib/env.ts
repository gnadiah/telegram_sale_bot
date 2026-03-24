export type AdminWebEnv = {
  apiBaseUrl: string;
};

let cachedEnv: AdminWebEnv | undefined;

export function getEnv(): AdminWebEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
  };

  return cachedEnv;
}

export function resetEnv() {
  cachedEnv = undefined;
}
