import path from "path";
import fs from "fs";
import type { AxiosError } from "axios";
import { Models } from "@prismic-beta/slicemachine-core";

import * as t from "io-ts";
import { getOrElseW } from "fp-ts/Either";
import { InitClient, logs, lsdir, lsfiles } from "../../utils";
import { PrismicSharedConfigManager } from "@prismic-beta/slicemachine-core/build/prismic/SharedConfig";
import Tracker from "../../utils/tracker";

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

export async function readDocuments(
  cwd: string
): Promise<Record<string, unknown>> {
  const documentDir = path.join(cwd, "documents");
  const dirs = await lsdir(documentDir);

  const files = (await Promise.all(dirs.map((dir) => lsfiles(dir)))).flat();

  const documentObj = files.reduce<Record<string, unknown>>((acc, file) => {
    const filename: string = path.parse(file).name;
    const fileContent: string = fs.readFileSync(file, "utf-8");
    const json = JSON.parse(fileContent) as Record<string, unknown>;

    return { ...acc, [filename]: json };
  }, {});

  return documentObj;
}

export async function sendDocuments(
  client: InitClient,
  cwd: string
): Promise<boolean> {
  const pathToDocuments = path.join(cwd, "documents");
  const pathToSignatureFile = path.join(pathToDocuments, "index.json");

  // Without the signature, we can't push documents to Prismic.
  if (!fs.existsSync(pathToSignatureFile)) return Promise.resolve(false);

  const signatureObj = await readSignatureFile(cwd);
  const documents: Record<string, unknown> = await readDocuments(cwd);

  // No documents to push
  if (Object.keys(documents).length === 0) return Promise.resolve(false);

  const spinner = logs.spinner("Pushing existing documents to your repository");
  spinner.start();

  return client
    .pushDocuments(
      signatureObj.signature,
      documents,
      PrismicSharedConfigManager.get().cookies
    )
    .then(() => {
      spinner.succeed();
      fs.rmSync(pathToDocuments, { recursive: true, force: true });
      return true;
    })
    .catch(async (e: AxiosError) => {
      spinner.fail();
      if (e.response?.data === "Repository should not contain documents") {
        logs.writeError(
          "The selected repository is not empty, documents cannot be uploaded. Please choose an empty repository or delete the documents contained in your repository."
        );
      } else {
        logs.writeError(
          "Sending documents failed, please try again. If the problem persists, contact us."
        );
        logs.writeError(`Full error: ${e.code || 500} - ${e.message}`);
      }
      await Tracker.get().trackInitEndFail(
        Models.Frameworks.none,
        "Failed to push documents"
      );
      process.exit(1);
    });
}
