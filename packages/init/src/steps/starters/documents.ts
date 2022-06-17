import path from "path";
import fs from "fs";
import axios, { AxiosError } from "axios";

import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";
import { handleErrors } from "./communication";
import { logs } from "../../utils";

const SignatureFileReader = t.type({
  signature: t.string,
});

type SignatureFile = t.TypeOf<typeof SignatureFileReader>;

export async function readSignatureFile(cwd: string): Promise<SignatureFile> {
  const pathToFile = path.join(cwd, "documents", "index.json");
  return fs.promises.readFile(pathToFile, "utf-8").then((res) => {
    const data = JSON.parse(res) as unknown;
    return getOrElseW(() => {
      throw new Error("Unable to read document signature file");
    })(SignatureFileReader.decode(data));
  });
}

async function lsdir(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir).then((dirs) => {
    return dirs
      .filter((name) => fs.statSync(path.join(dir, name)).isDirectory())
      .map((subdirectory) => path.join(dir, subdirectory));
  });
}

async function lsfiles(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir).then((dirs) => {
    return dirs
      .filter((name) => fs.statSync(path.join(dir, name)).isFile())
      .map((file) => path.join(dir, file));
  });
}

export async function readDocuments(cwd: string) {
  const documentDir = path.join(cwd, "documents");
  const dirs = await lsdir(documentDir);

  const files = (await Promise.all(dirs.map((dir) => lsfiles(dir)))).flat();

  const documentObj = files.reduce<Record<string, unknown>>((acc, file) => {
    const fileContent = fs.readFileSync(file, "utf-8");
    const filename = path.parse(file).name;
    acc[filename] = JSON.parse(fileContent);
    return acc;
  }, {});

  return JSON.stringify(documentObj);
}

export const sendDocumentsFromStarter = async (
  repository: string,
  cookies: string,
  base: string,
  cwd: string
): Promise<boolean> => {
  const pathToDocuments = path.join(cwd, "documents");
  const pathToSignatureFile = path.join(pathToDocuments, "index.json");

  if (!fs.existsSync(pathToSignatureFile)) {
    return Promise.resolve(false);
  }

  const signatureObj = await readSignatureFile(cwd);
  const documentsStr = await readDocuments(cwd);

  const payload = {
    signature: signatureObj.signature,
    documents: documentsStr,
  };

  const prismicUrl = new URL(base);
  prismicUrl.hostname = `${repository}.${prismicUrl.hostname}`;
  prismicUrl.pathname = "starter/documents";
  const endpointURL = prismicUrl.toString();

  const spinner = logs.spinner("Pushing existing documents to your repository");
  spinner.start();

  return axios
    .post(endpointURL, payload, {
      headers: {
        "User-Agent": "prismic-cli/0",
        Cookie: cookies,
      },
    })
    .then(() => {
      spinner.succeed();
      fs.rmSync(pathToDocuments, { recursive: true, force: true });
      return true;
    })
    .catch((e: AxiosError) => {
      spinner.fail();
      if (e.response?.data === "Repository should not contain documents") {
        logs.writeError(
          "The selected repository is not empty, documents cannot be uploaded. Please choose an empty repository or delete the documents contained in your repository."
        );
      } else {
        handleErrors(
          "sending documents, please try again. If the problem persists, contact us.",
          e
        );
      }

      process.exit(1);
    });
};
