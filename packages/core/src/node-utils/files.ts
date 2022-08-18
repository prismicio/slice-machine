import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const ERROR_CODES = { ENOENT: "ENOENT" };
const _format: BufferEncoding = "utf8";

function write(
  pathToFile: string,
  value: string | Record<string, unknown>,
  options: { recursive: boolean } = { recursive: true }
): void {
  // make sure that the directory exists before writing the file
  if (options.recursive) {
    const directoryPath = path.dirname(pathToFile);
    mkdir(directoryPath, { recursive: true });
  }

  if (typeof value === "string") fs.writeFileSync(pathToFile, value, _format);
  else fs.writeFileSync(pathToFile, JSON.stringify(value, null, 2), _format);
}

function readBuffer(pathToFile: string): Buffer {
  return fs.readFileSync(pathToFile);
}

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

function safeReadEntity<T>(
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

function readJson(pathToFile: string): unknown {
  return JSON.parse(readString(pathToFile)) as unknown;
}

function safeReadJson(pathToFile: string): unknown | null {
  try {
    return JSON.parse(readString(pathToFile)) as unknown;
  } catch (e) {
    return null;
  }
}

function readFirstOf<
  V,
  O extends Record<string, unknown> = Record<string, never>
>(filePaths: ReadonlyArray<{ path: string; options?: O } | string>) {
  return (
    converter: (value: string) => V
  ): ({ path: string; value: V } & O) | undefined => {
    return filePaths.reduce(
      (
        acc: ({ path: string; value: V } & O) | undefined,
        filePath: { path: string; options?: O } | string
      ) => {
        if (acc) return acc;
        else {
          const pathWithOpts =
            typeof filePath === "string" ? { path: filePath } : filePath;

          if (exists(pathWithOpts.path)) {
            const optsOrDefault = pathWithOpts.options || ({} as O);

            const test: { path: string; value: V } & O = {
              path: pathWithOpts.path,
              ...optsOrDefault,
              value: converter(readString(pathWithOpts.path)),
            };
            return test;
          } else return acc;
        }
      },
      undefined
    );
  };
}

function isDirectory(source: string): boolean {
  try {
    return fs.lstatSync(source).isDirectory();
  } catch (e) {
    return false;
  }
}

function isFile(source: string): boolean {
  return fs.lstatSync(source).isFile();
}

function readDirectory(source: string): string[] {
  return fs.readdirSync(source, { encoding: _format });
}

function mkdir(
  target: string,
  options: { recursive: boolean }
): string | undefined {
  return fs.mkdirSync(target, options);
}

function exists(pathToFile: string): boolean {
  try {
    return Boolean(fs.lstatSync(pathToFile));
  } catch (e) {
    if ((e as { code: string }).code === ERROR_CODES.ENOENT) return false;
    throw e;
  }
}

function append(filePath: string, data: string): void {
  fs.appendFileSync(filePath, data, { encoding: _format });
}

function copy(
  src: string,
  dest: string,
  options: { recursive: boolean } = { recursive: false }
): void {
  if (options.recursive) {
    const directoryPath = path.dirname(dest);
    mkdir(directoryPath, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function remove(src: string): void {
  fs.unlinkSync(src);
}

function removeAll(srcs: ReadonlyArray<string>): void {
  srcs.forEach((src) => remove(src));
}

function flushDirectories(directory: string, recursive = true): void {
  try {
    const paths = fs.readdirSync(directory);
    paths.forEach((p) => {
      const maybedir = path.join(directory, p);
      if (isDirectory(maybedir)) {
        fs.rmdirSync(maybedir, { recursive });
      }
    });
  } catch (e) {}
}

async function readFileAndCreateHash(filePath: string): Promise<string> {
  return fs.promises
    .readFile(filePath, "utf-8")
    .then((file) => createHash("md5").update(file).digest("hex"));
}

function readFileAndCreateHashSync(filePath: string): string {
  const data = readString(filePath);
  return createHash("md5").update(data).digest("hex");
}

export default {
  write,
  readBuffer,
  readString,
  readEntity,
  safeReadEntity,
  readJson,
  safeReadJson,
  readFirstOf,
  isDirectory,
  isFile,
  readDirectory,
  mkdir,
  exists,
  append,
  copy,
  remove,
  removeAll,
  flushDirectories,
  readFileAndCreateHash,
  readFileAndCreateHashSync,
};
