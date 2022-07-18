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
      🔴 Errors were detected in your models!\n
      Your current models will soon be blocked by our APIs.\n
      Please follow the instructions 👇 and update your models to be able to Start Slice Machine.\n`,
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
  `${path}\n${chalk.red(
    "Empty field API ID"
  )}: an empty API ID has been detected.\n`;

const invalidCharacterMessage = (path: string, key: string) =>
  `${path}\n${chalk.red(
    "Invalid characters"
  )}: the following API ID contains invalid characters ${chalk.green(key)}.\n`;

function validateSliceModel(
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
        CustomPaths(cwd).library(library).slice(model.name).model()
      );
      return [...acc, message];
    }

    if (!API_ID_RETRO_COMPATIBLE_REGEX.exec(field.key)) {
      const message = invalidCharacterMessage(
        CustomPaths(cwd).library(library).slice(model.name).model(),
        field.key
      );
      return [...acc, message];
    }

    return acc;
  }, []);
}

function validateCustomTypeModel(
  cwd: string,
  model: CustomTypeSM
): ErrorsToDisplay {
  return model.tabs.reduce((acc: ErrorsToDisplay, tab) => {
    const fields: TabFields = tab.value;
    const fieldsError = fields.reduce((acc: ErrorsToDisplay, field) => {
      if (field.key.length === 0) {
        const message = emptyApiIdMessage(
          CustomTypesPaths(cwd).customType(model.id).model()
        );
        return [...acc, message];
      }

      if (!API_ID_RETRO_COMPATIBLE_REGEX.exec(field.key)) {
        const message = invalidCharacterMessage(
          CustomTypesPaths(cwd).customType(model.id).model(),
          field.key
        );
        return [...acc, message];
      }

      return acc;
    }, []);

    return [...acc, ...fieldsError];
  }, []);
}
