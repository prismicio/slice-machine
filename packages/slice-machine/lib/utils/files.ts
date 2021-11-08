import fs from "fs";
import path from "path";

const ERROR_CODES = {
  ENOENT: "ENOENT",
};

const Files = {
  _format: "utf8" as BufferEncoding,

  write(
    pathToFile: string,
    value: string | object,
    options: { recursive: boolean } = { recursive: true }
  ) {
    // make sure that the directory exists before writing the file
    if (options.recursive) {
      const directoryPath = path.dirname(pathToFile);
      Files.mkdir(directoryPath, { recursive: true });
    }

    if (typeof value === "string")
      fs.writeFileSync(pathToFile, value, Files._format);
    else
      fs.writeFileSync(
        pathToFile,
        JSON.stringify(value, null, 2),
        Files._format
      );
  },

  readString(pathToFile: string) {
    return fs.readFileSync(pathToFile, { encoding: Files._format });
  },
  readEntity<T extends any>(
    pathToFile: string,
    validate: (payload: any) => Error | T
  ) {
    return validate(JSON.parse(this.readString(pathToFile)));
  },
  safeReadEntity<T>(
    pathToFile: string,
    validate: (payload: any) => null | T
  ) {
    try {
      const result = this.readEntity(pathToFile, validate);
      if(result instanceof Error) return null
      return result
    } catch (e) {
      return null;
    }
  },

  readJson(pathToFile: string) {
    return JSON.parse(this.readString(pathToFile));
  },
  safeReadJson(pathToFile: string) {
    try {
      return JSON.parse(this.readString(pathToFile));
    } catch (e) {
      return null;
    }
  },
  readFirstOf<V, O extends { [key: string]: unknown }>(
    filePaths: ReadonlyArray<{ path: string; options?: O } | string>
  ) {
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

            if (this.exists(pathWithOpts.path)) {
              const optsOrDefault = pathWithOpts.options || ({} as O);

              const test: { path: string; value: V } & O = {
                path: pathWithOpts.path,
                ...optsOrDefault,
                value: converter(this.readString(pathWithOpts.path)),
              };
              return test;
            } else return acc;
          }
        },
        undefined
      );
    };
  },

  isDirectory: (source: string) => fs.lstatSync(source).isDirectory(),
  isFile: (source: string) => fs.lstatSync(source).isFile(),
  readDirectory: (source: string) =>
    fs.readdirSync(source, { encoding: Files._format }),
  mkdir: (target: string, options: { recursive: boolean }) =>
    fs.mkdirSync(target, options),
  exists(pathToFile: string) {
    try {
      return Boolean(fs.lstatSync(pathToFile));
    } catch (e) {
      if (e.code === ERROR_CODES.ENOENT) return false;
      throw e;
    }
  },
  append(filePath: string, data: string) {
    fs.appendFileSync(filePath, data, { encoding: Files._format });
  },

  copy(
    src: string,
    dest: string,
    options: { recursive: boolean } = { recursive: false }
  ) {
    if (options.recursive) {
      const directoryPath = path.dirname(dest);
      Files.mkdir(directoryPath, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  },
  remove(src: string) {
    fs.unlinkSync(src);
  },
  removeAll(srcs: ReadonlyArray<string>) {
    srcs.forEach((src) => Files.remove(src));
  },
  flushDirectories(directory: string, recursive = true) {
    try {
      const paths = fs.readdirSync(directory);
      paths.forEach((p) => {
        const maybedir = path.join(directory, p);
        if (this.isDirectory(maybedir)) {
          fs.rmdirSync(maybedir, { recursive });
        }
      });
    } catch (e) {}
  },
};

export default Files;
