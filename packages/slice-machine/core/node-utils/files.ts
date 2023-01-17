import fs from "fs";
import path from "path";

const _format: BufferEncoding = "utf8";

function readString(pathToFile: string): string {
  return fs.readFileSync(pathToFile, { encoding: _format });
}

function readEntity<T>(
  pathToFile: string,
  validate: (payload: unknown) => Error | T
): Error | T {
  const entity = safeReadJson(pathToFile);
  if (entity) {
    return validate(entity);
  }
  return new Error(`Could not parse file "${path.basename(pathToFile)}"`);
}

function safeReadJson(pathToFile: string): unknown | null {
  try {
    return JSON.parse(readString(pathToFile)) as unknown;
  } catch (e) {
    return null;
  }
}

export function safeReadEntity<T>(
  pathToFile: string,
  validate: (payload: unknown) => null | T
): null | T {
  try {
    const result = readEntity(pathToFile, validate);
    if (result instanceof Error) return null;
    return result;
  } catch (e) {
    return null;
  }
}
