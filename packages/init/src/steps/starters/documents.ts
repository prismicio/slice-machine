import path from "path";
import fs from "fs";
import axios from "axios";

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

  axios
    .post(`https://${repository}.prismic.io/starters/documents`, payload, {
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
