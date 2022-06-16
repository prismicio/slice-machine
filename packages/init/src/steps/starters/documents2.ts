import fs from "fs";
import path from "path";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";

const SignatureFileReader = t.type({
  signature: t.string,
});

type SignatureFile = t.TypeOf<typeof SignatureFileReader>;

async function readSignatureFile(cwd: string): Promise<SignatureFile> {
  const pathToFile = path.join(cwd, "documents", "index.json");
  return fs.promises.readFile(pathToFile, "utf-8").then((res) => {
    return getOrElseW(() => {
      throw new Error("Undable to read document signature file");
    })(SignatureFileReader.decode(res));
  });
}

async function readDocuments(cwd: string) {
  const signature = await readSignatureFile(cwd);
  const dirs = await fs.promises.readdir(path.join(cwd, "documents"));
}
