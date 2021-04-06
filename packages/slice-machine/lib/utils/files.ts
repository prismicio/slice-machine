import fs from 'fs'
import path from 'path'

const ERROR_CODES = {
  ENOENT: 'ENOENT',
};

const Files = {
  _format: 'utf8' as BufferEncoding,
  writeJson(pathToFile: string, jsValue: object) {
    Files.write(pathToFile, JSON.stringify(jsValue, null, 2));
  },
  writeString(pathToFile: string, text: string) {
    fs.writeFileSync(pathToFile, text, Files._format);
  },
  write(pathToFile: string, value: string | object, options: { recursive: boolean } = { recursive: false }) {
    // make sure that the directory exists before writing the file
    if(options.recursive) {
      const directoryPath = path.dirname(pathToFile)
      Files.mkdir(directoryPath, { recursive: true })
    }

    if(typeof value === 'string') this.writeString(pathToFile, value)
    else this.writeJson(pathToFile, value)
  },
  
  readString(pathToFile: string) {
    return fs.readFileSync(pathToFile, { encoding: Files._format });
  },
  readJson(pathToFile: string) {
    return JSON.parse(this.readString(pathToFile));
  },
  readFirstOf<O extends object>(filePaths: ReadonlyArray<{ path: string, options: O }>): { path: string, value: string } & O | undefined {
    return filePaths.reduce((acc: { path: string, value: string } & O | undefined, filePath: { path: string, options: O }) => {
      if(acc) return acc
      else {
        if(this.exists(filePath.path)) {
          return {
            path: filePath.path,
            value: this.readString(filePath.path),
            ...filePath.options
          }
        } else return acc
      }
    }, undefined)
  },
  
  isDirectory: (source: string) => fs.lstatSync(source).isDirectory(),
  readDirectory: (source: string) => fs.readdirSync(source, { encoding: Files._format }),
  mkdir: (target: string, options: { recursive: boolean }) => fs.mkdirSync(target, options),
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

  copy(src: string, dest: string,  options: { recursive: boolean } = { recursive: false }) {
    if(options.recursive) {
      const directoryPath = path.dirname(dest)
      Files.mkdir(directoryPath, { recursive: true })
    }
    fs.copyFileSync(src, dest);
  },
  remove(src: string) {
    fs.rmSync(src)
  }
};

export default Files;
