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
      (acc: ErrorsToDisplay, model) => [
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

  if (modelErrors.length > 1) {
    console.log(
      boxen(
        `
      🔴 ${chalk.bold("Field value errors detected")}\n
      Please follow the instructions below👇, in order to start Slice Machine.\n`,
        { padding: 1, borderColor: "red" }
      )
    );
    console.log("\n--- ℹ️  Model Errors: ---\n");
    modelErrors.forEach((error) => console.log(error));

    return { areModelsValid: false };
  }

  return { areModelsValid: true };
}

const emptyApiIdMessage = (path: string) =>
  `${path}\n${chalk.red("Empty field API ID")}: Please add an API ID.\n`;

const invalidCharacterMessage = (path: string, key: string) =>
  `${path}\n${chalk.red(
    "Invalid characters"
  )}: You can't use special characters except _ for the API ID ${chalk.green(
    key
  )}.\n`;

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
  const fields: FieldsSM = model.variations.reduce(
    (acc: FieldsSM, variation) => {
      const { primary, items } = variation;

      return [...acc, ...(primary ? primary : []), ...(items ? items : [])];
    },
    []
  );

  return fields.reduce((acc: ErrorsToDisplay, field) => {
    if (field.key.length === 0) {
      const message = emptyApiIdMessage(
        formatPath(cwd, { library, sliceName: model.name })
      );
      return [...acc, message];
    }

    if (!API_ID_RETRO_COMPATIBLE_REGEX.exec(field.key)) {
      const message = invalidCharacterMessage(
        formatPath(cwd, { library, sliceName: model.name }),
        field.key
      );
      return [...acc, message];
    }

    return acc;
  }, []);
}

export function validateCustomTypeModel(
  cwd: string,
  model: CustomTypeSM
): ErrorsToDisplay {
  return model.tabs.reduce((acc: ErrorsToDisplay, tab) => {
    const fields: TabFields = tab.value;
    const fieldsError = fields.reduce((acc: ErrorsToDisplay, field) => {
      if (field.key.length === 0) {
        const message = emptyApiIdMessage(
          formatPath(cwd, { customTypeId: model.id })
        );
        return [...acc, message];
      }

      if (!API_ID_RETRO_COMPATIBLE_REGEX.exec(field.key)) {
        const message = invalidCharacterMessage(
          formatPath(cwd, { customTypeId: model.id }),
          field.key
        );
        return [...acc, message];
      }

      return acc;
    }, []);

    return [...acc, ...fieldsError];
  }, []);
}
