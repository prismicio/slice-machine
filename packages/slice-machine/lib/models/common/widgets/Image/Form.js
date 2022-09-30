import * as yup from "yup";
import { useEffect, useState, Fragment } from "react";

import { DefaultFields } from "@lib/forms/defaults";
import { createFieldNameFromKey } from "@lib/forms";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import { FieldArray } from "formik";

import { Label, Card, Flex } from "theme-ui";
import { Col, Flex as FlexGrid } from "components/Flex";
import {
  ThumbnailButton,
  AddThumbnailButton,
  ConstraintForm,
} from "./components";

const FormFields = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  label: DefaultFields.label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  id: DefaultFields.id,
};

const EMPTY_THUMBNAIL = {
  name: "",
  width: "",
  height: "",
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
const thumbText = ({ width, height } = {}, allowAuto) => {
  if (allowAuto && !width && !height) {
    return "auto";
  }
  if (width || height) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions
    return `${width ? width : "auto"}x${height ? height : "auto"}`;
  }
  return "...";
};

const Form = (props) => {
  const [thumbI, setThumbI] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { initialValues, values: formValues, errors, fields, touched } = props;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { thumbnails, constraint },
  } = formValues;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    setThumbI(thumbnails.length);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  }, [thumbnails.length]);

  return (
    <FlexGrid>
      {Object.entries(FormFields).map(([key, field]) => (
        <Col key={key}>
          <WidgetFormField
            fieldName={createFieldNameFromKey(key)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            formField={field}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fields={fields}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    text={thumbText(constraint, true)}
                    sx={{ mr: 2 }}
                    onClick={() => setThumbI(0)}
                  />
                  {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    thumbnails.map((e, i) => (
                      <ThumbnailButton
                        key={`thumbnail-button-${+i + 1}`}
                        sx={{ mr: 3 }}
                        active={thumbI === +i + 1}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        text={thumbText(e)}
                        error={
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                          errors.thumbnails &&
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          touched.thumbnails &&
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
                          touched.thumbnails[i] &&
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          errors.thumbnails &&
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
                          errors.thumbnails[i]
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
                        onDelete={() => remove(i)}
                        onClick={() => setThumbI(+i + 1)}
                      />
                    ))
                  }
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
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  thumbnails.map((_, i) => (
                    <ConstraintForm
                      {...props}
                      required
                      key={`thumbnail-${+i + 1}`}
                      display={thumbI === +i + 1}
                      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      prefix={`config.thumbnails[${i}]`}
                    />
                  ))
                }
              </Fragment>
            )}
          />
        </Card>
      </Col>
    </FlexGrid>
  );
};

FormFields.constraint = {
  validate: () =>
    yup.object().defined().shape({
      width: yup.number().nullable(),
      height: yup.number().nullable(),
    }),
};

FormFields.thumbnails = {
  validate: () =>
    yup
      .array()
      .defined()
      .of(
        yup.object().test({
          name: "Thumbnails",
          message: "Must set name and width or height at minimum",
          test: function (value) {
            return (
              value.name &&
              (typeof value.width === "number" ||
                typeof value.height === "number")
            );
          },
        })
      ),
};

export { FormFields };

export default Form;
