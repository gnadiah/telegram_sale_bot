export function getSingleParam(value: string | string[] | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing route parameter: ${name}`);
  }

  return Array.isArray(value) ? value[0] : value;
}
