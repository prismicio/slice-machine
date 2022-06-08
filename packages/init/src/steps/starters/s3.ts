import fs from "fs";
import axios from "axios";
import mime from "mime";
import snakeCase from "lodash.snakecase";
import path from "path";
import FormData from "form-data";
import uniqid from "uniqid";
import { logs } from "../../utils";
import {
  Component,
  ComponentInfo,
  VariationSM,
} from "@slicemachine/core/build/models";

export type ALC = {
  values: {
    url: string;
    fields: Record<string, string>;
  };
  imgixEndpoint: string;
  err: null | string;
};

export async function createAcl(
  address: string,
  repository: string,
  authorization: string
): Promise<ALC> {
  return axios
    .get<ALC>(address + "create", {
      headers: {
        repository,
        Authorization: authorization,
        "User-Agent": "slice-machine",
      },
    })
    .then((res) => res.data);
}

function createFormForS3(
  key: string,
  filename: string,
  filePath: string,
  acl: ALC
): FormData {
  const form = new FormData();
  Object.entries(acl.values.fields).forEach(([k, value]) => {
    form.append(k, value);
  });
  form.append("key", key);
  const contentType = mime.getType(filePath);
  contentType && form.append("Content-Type", contentType);

  form.append("file", fs.createReadStream(filePath), {
    filename,
  });

  return form;
}

function createS3Key(
  repository: string,
  sliceName: string,
  variationId: string,
  filename: string
) {
  return `${repository}/shared-slices/${snakeCase(sliceName)}/${snakeCase(
    variationId
  )}-${uniqid()}/${filename}`;
}

async function sendVariationPreviewToS3(
  acl: ALC,
  repository: string,
  sliceName: string,
  variationId: string,
  filePath: string
): Promise<string | null> {
  const filename = path.basename(filePath);
  const key = createS3Key(repository, sliceName, variationId, filename);
  const form = createFormForS3(key, filename, filePath, acl);

  const errorMessage = `[slice/push] An error occurred while uploading preview images for ${sliceName}-${variationId} - please contact support`;

  return axios
    .post(acl.values.url, form, {
      headers: form.getHeaders(),
    })
    .then((res) => {
      if (res.status !== 204) {
        logs.writeError(errorMessage);
        logs.writeError(`${res.status}: ${res.statusText}`);
        return null;
      } else {
        return `${acl.imgixEndpoint}/${key}`;
      }
    })
    .catch((err) => {
      logs.writeError(errorMessage);
      if (axios.isAxiosError(err) && err.response) {
        logs.writeError(`${err.response.status}: ${err.response.statusText}`);
      } else if (err instanceof Error) {
        logs.writeError(err.message);
      } else {
        logs.writeError(String(err));
      }
      return null;
    });
}

async function maybeAddImageUrlToVariation(
  acl: ALC,
  repository: string,
  modelId: string,
  pathToScreenShot: string,
  variation: VariationSM
) {
  const imageUrl = await sendVariationPreviewToS3(
    acl,
    repository,
    modelId,
    variation.id,
    pathToScreenShot
  );
  if (!imageUrl) return variation;

  return {
    ...variation,
    imageUrl,
  };
}

async function addImageUrlsToVariations(
  acl: ALC,
  repository: string,
  modelId: string,
  screenshotPaths: ComponentInfo["screenshotPaths"],
  variations: Array<VariationSM>
) {
  return Promise.all(
    variations.map(async (variation) => {
      const screenshot = screenshotPaths[variation.id];
      if (!screenshot || !screenshot.path) return variation;

      return maybeAddImageUrlToVariation(
        acl,
        repository,
        modelId,
        screenshot.path,
        variation
      );
    })
  );
}

async function maybeUpdateModelVariationsWithImageUrl(
  acl: ALC,
  repository: string,
  component: Component
) {
  const { screenshotPaths, model } = component;
  const variations = await addImageUrlsToVariations(
    acl,
    repository,
    model.id,
    screenshotPaths,
    model.variations
  );

  return {
    ...model,
    variations,
  };
}

export async function addImageUrlsToModelVariations(
  acl: ALC,
  repository: string,
  components: Array<Component>
) {
  return Promise.all(
    components.map(async (component) =>
      maybeUpdateModelVariationsWithImageUrl(acl, repository, component)
    )
  );
}
