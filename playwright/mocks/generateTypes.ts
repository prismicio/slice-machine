import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { Library } from "./generateLibraries";
import { generateRandomId } from "../utils";

type GenerateTypesArgs = {
  typesCount: number;
  format?: "custom" | "page";
  libraries?: Library[];
};

export function generateTypes(args: GenerateTypesArgs): CustomType[] {
  const { typesCount, format = "page", libraries } = args;

  return Array.from(
    { length: typesCount },
    (_, n): CustomType => ({
      id: `MyType${n}ID${generateRandomId()}`,
      label: `MyType${n}Label${generateRandomId()}`,
      repeatable: false,
      status: true,
      json: {
        Main: {
          title: {
            type: "Text",
            config: { label: "Title", placeholder: "" },
          },
          ...(libraries
            ? {
                slices: {
                  type: "Slices",
                  fieldset: "Slice Zone",
                  config: {
                    choices: {
                      [libraries[0]?.components[0]?.model.id as string]: {
                        type: "SharedSlice",
                      },
                    },
                  },
                },
              }
            : {}),
        },
      },
      format,
    }),
  );
}

type GenerateTypeArgs = {
  id?: string;
  format?: "custom" | "page";
  libraries?: Library[];
  fields?: CustomType["json"][string];
};

export function generateType(args?: GenerateTypeArgs): CustomType {
  const { format = "page", libraries, fields, id } = args ?? {};

  return {
    id: id || `MyType0ID${generateRandomId()}`,
    label: id || `MyType0Label${generateRandomId()}`,
    repeatable: false,
    status: true,
    json: {
      Main: {
        ...(fields
          ? fields
          : {
              title: {
                type: "Text",
                config: { label: "Title", placeholder: "" },
              },
            }),
        ...(libraries
          ? {
              slices: {
                type: "Slices",
                fieldset: "Slice Zone",
                config: {
                  choices: {
                    [libraries[0]?.components[0]?.model.id as string]: {
                      type: "SharedSlice",
                    },
                  },
                },
              },
            }
          : {}),
      },
    },
    format,
  };
}
