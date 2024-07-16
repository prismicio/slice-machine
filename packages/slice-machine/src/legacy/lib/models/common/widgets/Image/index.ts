import { Image } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { MdOutlineImage } from "react-icons/md";
import * as yup from "yup";

import { createValidationSchema } from "../../../../forms";
import { removeProp } from "../../../../utils";
import { Widget } from "../Widget";
import Form, { FormFields } from "./Form";

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
  icon: MdOutlineImage,
};

export const ImageWidget: Widget<Image, typeof schema> = {
  Meta,
  Form,
  schema,
  create: (label: string) => ({
    type: "Image",
    config: {
      label,
      constraint: {},
      thumbnails: [],
    },
  }),
  FormFields,
  TYPE_NAME: "Image",
};
