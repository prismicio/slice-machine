import * as yup from "yup";
import Form, { FormFields } from "./Form";
import { BsImage } from "react-icons/bs";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";

import { handleMockConfig, handleMockContent } from "./Mock";
import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { Image } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

/**
 * {
    "type": "Image",
    "config": {
      "constraint": {
        "width": 100,
        "height": 100
      },
      "thumbnails": [
        {
          "name": "square",
          "width": 500,
          "height": 500
        }
      ],
      "label": "Icon Image"
    }
  } */

const schema = yup.object().shape({
  type: yup
    .string()
    .matches(/^Image$/, {
      excludeEmptyString: true,
    })
    .required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  config: createValidationSchema(removeProp(FormFields, "id")),
});

const Meta = {
  icon: BsImage,
  title: "Image",
  description: "A responsive image field with constraints",
};

export const ImageWidget: Widget<Image, typeof schema> = {
  Meta,
  Form,
  schema,
  create: (label: string) => ({
    type: WidgetTypes.Image,
    config: {
      label,
      constraint: {},
      thumbnails: [],
    },
  }),
  handleMockConfig,
  handleMockContent,
  MockConfigForm,
  FormFields,
  TYPE_NAME: WidgetTypes.Image,
};
