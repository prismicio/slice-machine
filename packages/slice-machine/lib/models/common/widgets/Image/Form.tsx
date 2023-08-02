import * as yup from "yup";
import { useEffect, useState, Fragment } from "react";

import { DefaultFields } from "@lib/forms/defaults";
import { createFieldNameFromKey } from "@lib/forms";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import { FieldArray } from "formik";

import { Label, Card, Flex } from "theme-ui";
import { Col, Flex as FlexGrid } from "@components/Flex";
import {
  ThumbnailButton,
  AddThumbnailButton,
  ConstraintForm,
} from "./components";
import { TabFields } from "@lib/models/common/CustomType";

const nullableNumberSchema = () => {
  return yup
    .number()
    .nullable()
    .transform((value: string | number, originalValue: string | number) =>
      // When the user empties the field, it should convert it to null so that "auto" dimensions are set
      originalValue === "" ? null : value
    );
};

const FormFields = {
  label: DefaultFields.label,
  id: DefaultFields.id,
  constraint: {
    validate: () =>
      yup.object().defined().shape({
        width: nullableNumberSchema(),
        height: nullableNumberSchema(),
      }),
  },
  thumbnails: {
    validate: () =>
      yup
        .array()
        .defined()
        .of(
          yup.object().test({
            name: "Thumbnails",
            message: "Must set name and width or height at minimum",
            test: function (value) {
              if (!value.name) {
                return false;
              }
              const hasWidth = typeof value.width === "number" && value.width;
              const hasHeight =
                typeof value.height === "number" && value.height;
              const hasWidthOrHeight = hasWidth || hasHeight;
              return value.name && hasWidthOrHeight;
            },
          })
        ),
  },
};

type Thumbnail = {
  name: string;
  width: string;
  height: string;
};
const EMPTY_THUMBNAIL: Thumbnail = {
  name: "",
  width: "",
  height: "",
};

const thumbText = (
  {
    width,
    height,
  }: {
    width?: number | string;
    height?: number | string;
  } = {},
  allowAuto = false
) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (allowAuto && !width && !height) {
    return "auto";
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (width || height) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return `${width ? width : "auto"}x${height ? height : "auto"}`;
  }
  return "...";
};

type FieldValues = {
  id: string;
  config: {
    label: string;
    constraint: {
      width?: number;
      height?: number;
    };
    thumbnails: Array<Thumbnail>;
  };
};

type FormProps = {
  // actually some of formik props are passed down to
  values: FieldValues;
  initialValues: FieldValues;
  errors: Partial<FieldValues["config"]>;
  touched: Partial<FieldValues["config"]>;
  fields: TabFields;
};

const Form: React.FC<FormProps> = (props) => {
  const { initialValues, values: formValues, errors, fields, touched } = props;
  const [thumbI, setThumbI] = useState(0);

  const {
    config: { thumbnails, constraint },
  } = formValues;

  useEffect(() => {
    setThumbI(thumbnails.length);
  }, [thumbnails.length]);

  return (
    <FlexGrid>
      {Object.entries(FormFields).map(([key, field]) => (
        <Col key={key}>
          <WidgetFormField
            fieldName={createFieldNameFromKey(key)}
            formField={field}
            fields={fields}
            initialValues={initialValues}
          />
        </Col>
      ))}
      <Col>
        <Label
          htmlFor="thumbnails"
          variant="label.primary"
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Responsive views*
        </Label>
        <Card p={3}>
          <FieldArray
            name="config.thumbnails"
            render={({ push, remove }) => (
              <Fragment>
                <Flex mb={3}>
                  <ThumbnailButton
                    active={thumbI === 0}
                    text={thumbText(constraint, true)}
                    sx={{ mr: 2 }}
                    onClick={() => setThumbI(0)}
                  />
                  {thumbnails.map((e, i) => (
                    <ThumbnailButton
                      key={`thumbnail-button-${+i + 1}`}
                      sx={{ mr: 3 }}
                      active={thumbI === +i + 1}
                      text={thumbText(e)}
                      error={
                        errors.thumbnails &&
                        touched.thumbnails &&
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        touched.thumbnails[i] &&
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        errors.thumbnails &&
                        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                        errors.thumbnails[i]
                          ? true
                          : false
                      }
                      onDelete={() => remove(i)}
                      onClick={() => setThumbI(+i + 1)}
                    />
                  ))}
                  <AddThumbnailButton
                    onClick={() => {
                      push(EMPTY_THUMBNAIL);
                    }}
                  />
                </Flex>
                <ConstraintForm
                  {...props}
                  display={thumbI === 0}
                  prefix="config.constraint"
                />
                {thumbnails.map((_, i) => (
                  <ConstraintForm
                    {...props}
                    required
                    key={`thumbnail-${+i + 1}`}
                    display={thumbI === +i + 1}
                    prefix={`config.thumbnails[${i}]`}
                  />
                ))}
              </Fragment>
            )}
          />
        </Card>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };

export default Form;
