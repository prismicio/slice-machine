import { InitClient } from "../../utils";
import {
  Component,
  ComponentInfo,
  VariationSM,
  SliceSM,
} from "@slicemachine/core/build/models";
import { Acl, ClientError } from "@slicemachine/client";
import { writeError } from "../../utils/logs";

async function updateVariationWithScreenshot(
  client: InitClient,
  acl: Acl,
  screenshotPaths: ComponentInfo["screenshotPaths"],
  sliceName: SliceSM["id"],
  variation: VariationSM
): Promise<VariationSM> {
  const screenshot = screenshotPaths[variation.id];
  if (!screenshot || !screenshot.path) return Promise.resolve(variation);

  return client
    .uploadScreenshot({
      acl,
      sliceName,
      variationId: variation.id,
      filePath: screenshot.path,
    })
    .then((screenshotUrl) => {
      return {
        ...variation,
        imageUrl: screenshotUrl,
      };
    })
    .catch((error: ClientError) => {
      writeError(
        `Couldn't upload screenshot slice: ${sliceName} - variation: ${variation.id}`
      );
      writeError(error.message, "Full error:");
      return variation;
    });
}

export async function updateSlicesWithScreenshots(
  client: InitClient,
  acl: Acl,
  components: Array<Component>
): Promise<Array<SliceSM>> {
  return Promise.all(
    components.map(async (component) => {
      const { screenshotPaths, model } = component;

      const variationsUpdated: VariationSM[] = await Promise.all(
        model.variations.map(async (variation) =>
          updateVariationWithScreenshot(
            client,
            acl,
            screenshotPaths,
            model.id,
            variation
          )
        )
      );

      return {
        ...model,
        variations: variationsUpdated,
      };
    })
  );
}
