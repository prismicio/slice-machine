import { Manifest, SliceSM } from "@slicemachine/core/build/models";
import { FieldsSM } from "@slicemachine/core/build/models/Fields";
import { TabFields } from "@slicemachine/core/build/models/CustomType";
import * as Libraries from "@slicemachine/core/build/libraries";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { getLocalCustomTypes } from "@lib/utils/customTypes";
import { API_ID_RETRO_COMPATIBLE_REGEX } from "@lib/consts";
import boxen from "boxen";
import {
  CustomPaths,
  CustomTypesPaths,
} from "@slicemachine/core/build/node-utils";
import chalk from "chalk";
import path from "path";

type ErrorsToDisplay = string[];

export function validateModels({
  cwd,
  manifest,
}: {
  cwd: string;
  manifest: Manifest;
}): { areModelsValid: boolean } {
  // missing libraries to find models, already handled in the frontend
  if (!manifest.libraries || manifest.libraries.length < 1)
    return { areModelsValid: true };

  const slicesModelErrors: ErrorsToDisplay = Libraries.libraries(
    cwd,
    manifest.libraries
  ).reduce((acc: ErrorsToDisplay, librarie) => {
    const sliceModels = librarie.components.map((component) => component.model);
    const librarieErrors = sliceModels.reduce(
      (acc: ErrorsToDisplay, model: SliceSM) => [
        ...acc,
        ...validateSliceModel(cwd, librarie.name, model),
      ],
      []
    );

    return [...acc, ...librarieErrors];
  }, []);

  const customTypesModelsErrors: ErrorsToDisplay = getLocalCustomTypes(
    cwd
  ).reduce(
    (acc: ErrorsToDisplay, customType) => [
      ...acc,
      ...validateCustomTypeModel(cwd, customType),
    ],
    []
  );

  const modelErrors = [...slicesModelErrors, ...customTypesModelsErrors];

  if (modelErrors.length > 0) {
    console.log(
      boxen(
        `
      🔴 ${chalk.bold("Field value errors detected")}\n
      Please follow the instructions below 👇, in order to start Slice Machine.\n`,
        { padding: 1, borderColor: "red" }
      )
    );
    console.log("\n--- ℹ️  Model Errors: ---\n");
    modelErrors.forEach((error) => console.log(error));

    return { areModelsValid: false };
  }

  return { areModelsValid: true };
}

function validateApiID(apiId: string, path: string): string | undefined {
  if (apiId.length === 0)
    return `${path}\n${chalk.red("Empty API ID")}: Please add an API ID.\n`;
  else if (!API_ID_RETRO_COMPATIBLE_REGEX.exec(apiId))
    return `${path}\n${chalk.red(
      "Invalid characters"
    )}: You can't use special characters except _ for the API ID ${chalk.green(
      apiId
    )}.\n`;
}

export function formatPath(
  cwd: string,
  info: { library: string; sliceName: string } | { customTypeId: string }
): string {
  const absolutePath =
    "library" in info
      ? CustomPaths(cwd).library(info.library).slice(info.sliceName).model() // slice
      : CustomTypesPaths(cwd).customType(info.customTypeId).model(); // custom type

  const relativePath = path.relative(cwd, absolutePath);

  return "./" + relativePath;
}

export function validateSliceModel(
  cwd: string,
  library: string,
  model: SliceSM
): ErrorsToDisplay {
  const slicePath = formatPath(cwd, { library, sliceName: model.name });
  const sliceIdError = validateApiID(model.id, slicePath);

  const fields: FieldsSM = model.variations.reduce(
    (acc: FieldsSM, variation) => {
      const { primary, items } = variation;

      return [...acc, ...(primary ? primary : []), ...(items ? items : [])];
    },
    []
  );

  const fieldsError = fields.reduce((acc: ErrorsToDisplay, field) => {
    const apiIdError = validateApiID(field.key, slicePath);
    return apiIdError ? [...acc, apiIdError] : acc;
  }, []);

  return sliceIdError ? [sliceIdError, ...fieldsError] : fieldsError;
}

export function validateCustomTypeModel(
  cwd: string,
  model: CustomTypeSM
): ErrorsToDisplay {
  const customTypePath = formatPath(cwd, { customTypeId: model.id });
  return model.tabs.reduce((acc: ErrorsToDisplay, tab) => {
    const fields: TabFields = tab.value;
    const fieldsError = fields.reduce((acc: ErrorsToDisplay, field) => {
      const apiIdError = validateApiID(field.key, customTypePath);
      return apiIdError ? [...acc, apiIdError] : acc;
    }, []);

    return [...acc, ...fieldsError];
  }, []);
}
