import fs from "fs";
import FormData from "form-data";
import mime from "mime";
import path from "path";
import { UploadParameters } from "../models/UploadParameters";
import { snakelize } from "./str";
import { Files } from "@prismic-beta/slicemachine-core/build/node-utils";

function buildScreenshotKey(
  fileName: string,
  repository: string,
  sliceId: UploadParameters["sliceId"],
  variationId: UploadParameters["variationId"],
  fileHash: string
): string {
  return `${repository}/shared-slices/${sliceId}/${snakelize(
    variationId
  )}-${fileHash}/${fileName}`;
}

export async function uploadScreenshot({
  acl,
  repository,
  sliceId,
  variationId,
  filePath,
}: UploadParameters & { repository: string }): Promise<string> {
  const form = new FormData();
  const fileName = path.basename(filePath);

  // adding fields
  Object.entries(acl.fields).forEach(([key, value]) => {
    form.append(key, value);
  });

  // building then adding the key
  const fileHash = await Files.readFileAndCreateHash(filePath);
  const screenshotKey = buildScreenshotKey(
    fileName,
    repository,
    sliceId,
    variationId,
    fileHash
  );

  form.append("key", screenshotKey);

  // adding content type
  const fileExtension = fileName.split(".").pop();
  form.append("Content-Type", fileExtension && mime.getType(fileExtension));

  // adding the file
  form.append("file", fs.createReadStream(filePath), {
    filename: fileName,
    contentType: undefined,
    knownLength: fs.statSync(filePath).size,
  });

  return new Promise((resolve, reject) => {
    form.submit(acl.url, function (error, res) {
      if (error) return reject(error);
      if (res.statusCode && res.statusCode >= 300)
        return reject(
          new Error(
            `Unable to upload screenshot with status code: ${res.statusCode}`
          )
        );
      resolve(`${acl.imgixEndpoint}/${screenshotKey}`);
    });
  });
}
