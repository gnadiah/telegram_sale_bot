import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type EnvLoadState = {
  loaded: boolean;
};

export function parsePositiveIntegerEnv(value: string | undefined, envName: string, fallback: string) {
  const resolvedValue = value ?? fallback;
  const parsedValue = Number(resolvedValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${envName} must be a positive integer`);
  }

  return parsedValue;
}

export function resolveFileRelativePath(currentFileUrl: string, relativePath: string) {
  return resolve(dirname(fileURLToPath(currentFileUrl)), relativePath);
}

export function loadRelativeEnvFile(
  currentFileUrl: string,
  relativePath: string,
  loadEnvFile: ((path: string) => void) | undefined = process.loadEnvFile?.bind(process)
) {
  if (!loadEnvFile) {
    return;
  }

  loadEnvFile(resolveFileRelativePath(currentFileUrl, relativePath));
}

export function ensureRelativeEnvFileLoaded(options: {
  currentFileUrl: string;
  loadEnvFile?: (path: string) => void;
  relativePath: string;
  shouldSkip?: boolean;
  state: EnvLoadState;
}) {
  const {
    currentFileUrl,
    loadEnvFile = process.loadEnvFile?.bind(process),
    relativePath,
    shouldSkip = false,
    state
  } = options;

  if (state.loaded || !loadEnvFile || shouldSkip) {
    return;
  }

  loadRelativeEnvFile(currentFileUrl, relativePath, loadEnvFile);
  state.loaded = true;
}
