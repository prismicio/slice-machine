import fs from 'fs';

const ERROR_CODES = {
  ENOENT: 'ENOENT',
};

const Files = {
  _format: 'utf8' as BufferEncoding,
  writeJson(pathToFile: string, jsValue: object) {
    Files.write(pathToFile, JSON.stringify(jsValue, null, 2));
  },
  write(pathToFile: string, text: string) {
    fs.writeFileSync(pathToFile, text, this._format);
  },
  read(pathToFile: string) {
    return fs.readFileSync(pathToFile, { encoding: this._format });
  },
  readJson(pathToFile: string) {
    return JSON.parse(this.read(pathToFile));
  },
  isDirectory: (source: string) => fs.lstatSync(source).isDirectory(),
  exists(pathToFile: string) {
    try {
      return Boolean(fs.lstatSync(pathToFile));
    } catch (e) {
      if (e.code === ERROR_CODES.ENOENT) return false;
      throw e;
    }
  },
  append(filePath: string, data: string) {
    fs.appendFileSync(filePath, data);
  },

  copy(src: string, dest: string) {
    fs.copyFileSync(src, dest);
  },
  remove(src: string) {
    fs.rmSync(src)
  }
};

export default Files;
