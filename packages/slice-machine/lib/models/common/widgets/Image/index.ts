import * as yup from "yup";
import Form, { FormFields } from "./Form";
import { BsImage } from "react-icons/bs";

import { createValidationSchema } from "../../../../forms";

import { removeProp } from "../../../../utils";

import { MockConfigForm } from "./Mock/Form";

import { Widget } from "../Widget";
import { ImageField } from "./type";
import { FieldType } from "../../CustomType/fields";

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

export const ImageWidget: Widget<ImageField, typeof schema> = {
  Meta,
  Form,
  schema,
  create: (label: string) => new ImageField({ label }),
  MockConfigForm,
  FormFields,
  TYPE_NAME: FieldType.Image,
};
