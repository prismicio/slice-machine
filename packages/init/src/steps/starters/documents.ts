import path from "path";
import fs from "fs";
import axios from "axios";

import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";

const SignatureFileReader = t.type({
  signature: t.string,
});

type SignatureFile = t.TypeOf<typeof SignatureFileReader>;

export async function readSignatureFile(cwd: string): Promise<SignatureFile> {
  const pathToFile = path.join(cwd, "documents", "index.json");
  return fs.promises.readFile(pathToFile, "utf-8").then((res) => {   
    const data = JSON.parse(res) as unknown
    return getOrElseW(() => {
      throw new Error("Undable to read document signature file");
    })(SignatureFileReader.decode(data));
  });
}

async function lsdir(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir)
  .then(dirs => {
    return dirs.filter(async name => {
      return fs.promises.stat(path.join(dir, name)).then(stat => stat.isDirectory()).catch(() => false)
    })
  })
}

async function lsfiles(dir: string): Promise<Array<string>> {
  return fs.promises.readdir(dir)
  .then(dirs => {
    return dirs.filter(async name => {
      return fs.promises.stat(path.join(dir, name)).then(stat => stat.isFile()).catch(() => false)
    })
  })
}


export async function readDocuments(cwd: string) {
  const documentDir = path.join(cwd, "documents")
  const dirs = await lsdir(documentDir)
  return dirs
}


export const sendDocumentsFromStarter = (
  repository: string,
  authorization: string,
  base: string,
  cwd: string
) => {
  const pathToDocuments = path.join(cwd, "documents");
  const pathToSignatureFile = path.join(pathToDocuments, "index.json");

  if (!fs.existsSync(pathToSignatureFile)) {
    return;
  }

  const signatureObj = JSON.parse(
    fs.readFileSync(pathToSignatureFile, "utf-8")
  );

  const directories = fs
    .readdirSync(path.join(pathToDocuments))
    .filter((file) =>
      fs.statSync(path.join(pathToDocuments, file)).isDirectory()
    );

  const documentPayload = directories.reduce((acc, directory) => {
    const directoryPath = path.join(pathToDocuments, directory);
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
      const documentObj = fs.readFileSync(
        path.join(directoryPath, file),
        "utf-8"
      );
      acc[path.parse(file).name] = documentObj;
    });
    return acc;
  }, {} as Record<string, string>);

  const payload = {
    signature: signatureObj.signature,
    documents: JSON.stringify(documentPayload),
  };

  const prismicUrl = new URL(base)
  prismicUrl.hostname = `${repository}.${prismicUrl.hostname}`
  prismicUrl.pathname = "starters/documents"
  const addr = prismicUrl.toString()

  axios
    .post(addr, payload, {
      headers: {
        Cookie: `prismic-auth=${authorization}`,
      },
    })
    .then(() => {
      return;
    })
    .catch(() => {
      return;
    });

  // Load files from the documents directory (signature: documents/index.json)

  // documents
  // en-us
  // edefefef.json
  // end-gb
  // en-gb
  //index.json => signature

  // {
  // signature: "34fbecc5b263e17dba2cd597119489a17b7343d6"
  // documents: JSON.stringify({"Xs5vWREAACYAIvvr=#=Xs5vWREAACYAIvvs=#=top_menu=#=Xs5vWREAACYAIvvt=#=en-us=#=y": "...."})
  //}
  return;
};
