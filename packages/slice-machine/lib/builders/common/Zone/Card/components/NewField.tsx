import { Ref, SetStateAction, useEffect, useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Input, Flex, Text, Button, useThemeUI } from "theme-ui";
import * as CSS from "csstype";
import { AnyObjectSchema } from "yup";

import { validateId } from "@lib/forms/defaults";
import { createInitialValues, createValidationSchema } from "@lib/forms";
import * as Widgets from "@lib/models/common/widgets/withGroup";
import { slugify } from "@lib/utils/str";
import { AnyWidget } from "@lib/models/common/widgets/Widget";

import { ErrorTooltip } from "./ErrorTooltip";
import { InputType } from "@lib/forms/fields";
import {
  getInputFieldStyles,
  InputFieldStyles,
} from "@components/FormFields/Input";

interface NewField {
  widgetTypeName: string;
  fields: Array<{ key: string }>;
  onSave: (values: FormFieldValues) => void;
  onCancelNewField: () => void;
}

interface FormFieldValues {
  widgetTypeName: string;
  id?: string;
  label?: string;
}

const RefInput = ({
  innerRef,
  ...otherArgs
}: Record<string, unknown> & {
  innerRef?: Ref<HTMLInputElement>;
}) => <Input {...otherArgs} ref={innerRef} />;

const NewField: React.FC<NewField> = ({
  widgetTypeName,
  fields,
  onSave,
  onCancelNewField,
}) => {
  const fieldRef = useRef<HTMLInputElement>(null);
  const { theme } = useThemeUI();
  const [isIdFieldPristine, setIsIdFieldPristine] = useState(true);
  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [fieldRef]);

  // @ts-expect-error We have to create a widget map or a service instead of using export name
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const widget: AnyWidget = Widgets[widgetTypeName];
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!widget) {
    console.error(
      `Widget of type "${widgetTypeName}" not found. This is a problem on our side!`,
    );
    return <div>Unexpected error. Contact us for more info.</div>;
  }

  const widgetFormFields = widget.FormFields as Record<string, InputType>;
  const WidgetIcon = widget.Meta.icon;

  const FormFields = {
    id: widgetFormFields.id,
    label: widgetFormFields.label,
  };

  const initialValues: FormFieldValues = {
    ...createInitialValues(FormFields),
    ...(widgetTypeName === "UID" ? { id: "uid" } : {}),
    widgetTypeName,
  };

  const validationSchema: AnyObjectSchema = createValidationSchema(FormFields);

  const handleLabelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    values: FormFieldValues,
    setValues: (
      values: SetStateAction<FormFieldValues>,
      shouldValidate?: boolean,
    ) => void,
  ) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (isIdFieldPristine && !FormFields.id.disabled) {
      setValues({
        ...values,
        label: e.target.value,
        id: slugify(e.target.value),
      });
    } else {
      setValues({ ...values, label: e.target.value });
    }
  };

  const handleIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (
      field: keyof typeof FormFields,
      value: string,
      shouldValidate?: boolean,
    ) => Promise<unknown>,
  ) => {
    void setFieldValue("id", e.target.value);
    setIsIdFieldPristine(false);
  };

  return (
    <Formik
      validateOnChange
      onSubmit={onSave}
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      {({ errors, values, setValues, setFieldValue }) => (
        <Form data-cy="new-field-form">
          <Flex
            as="li"
            sx={{
              bg: "white",
              p: 3,
              px: 3,
              mx: 0,
              ml: "34px",
              alignItems: "center",
              variant: "styles.listItem",
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
              border: (t) => `1px solid ${t.colors?.borders?.toString() || ""}`,
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "flex-start",
            }}
          >
            <WidgetIcon
              style={{
                color: theme.colors?.primary as CSS.Property.Color,
                borderRadius: "4px",
                padding: "4px",
                border: "2px solid",
                borderColor: theme.colors?.primary as CSS.Property.Color,
              }}
              size={28}
            />
            <Flex
              sx={{
                alignItems: "center",
                flexGrow: 1,
                gap: 2,
                position: "relative",
              }}
            >
              <Text as="p" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                Field Name
              </Text>
              <Field
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleLabelChange(e, values, setValues)
                }
                name="label"
                placeholder="Field Name"
                type="text"
                validate={(value: string) => {
                  if (!value.length) {
                    return "This field is required";
                  }
                }}
                as={RefInput}
                innerRef={fieldRef}
                sx={{
                  ...getInputFieldStyles(
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    FormFields.label.disabled
                      ? InputFieldStyles.DISABLED
                      : // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                      errors.label
                      ? InputFieldStyles.ERROR
                      : undefined,
                  ),
                  flexGrow: 1,
                  minWidth: "128px",
                  width: "initial",
                }}
                aria-label="label-input"
                data-cy="new-field-name-input"
              />
              <ErrorTooltip error={errors.label} />
            </Flex>
            <Flex
              sx={{
                alignItems: "center",
                flexGrow: 1,
                gap: 2,
                position: "relative",
              }}
            >
              <Text as="p" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                Field ID
              </Text>
              <Field
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleIdChange(e, setFieldValue)
                }
                name="id"
                placeholder="e.g. buttonLink"
                type="text"
                disabled={FormFields.id.disabled}
                validate={(value: string) =>
                  validateId({
                    value,
                    fields,
                    initialId: null,
                  })
                }
                as={RefInput}
                sx={{
                  ...getInputFieldStyles(
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    FormFields.id.disabled
                      ? InputFieldStyles.DISABLED
                      : // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                      errors.id
                      ? InputFieldStyles.ERROR
                      : undefined,
                  ),
                  flexGrow: 1,
                  minWidth: "128px",
                  width: "initial",
                }}
                data-cy="new-field-id-input"
              />
              <ErrorTooltip error={errors.id} />
            </Flex>
            <Flex sx={{ gap: 2 }}>
              <Button
                onClick={onCancelNewField}
                variant="secondary"
                type="button"
              >
                Cancel
              </Button>
              <Button
                sx={{
                  fontWeight: "400",
                  paddingBlock: "8px",
                  paddingInline: "16px",
                  fontSize: "14px",
                  borderRadius: "4px",
                  lineHeight: "21px",
                }}
                type="submit"
              >
                Add
              </Button>
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default NewField;
