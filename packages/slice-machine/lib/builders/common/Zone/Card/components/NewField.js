import { useEffect, useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import { Box, Input, Flex, Text, Button, useThemeUI } from "theme-ui";

import { validateId } from "@lib/forms/defaults";
import { createInitialValues, createValidationSchema } from "@lib/forms";

import * as Widgets from "@lib/models/common/widgets/withGroup";

import ErrorTooltip from "./ErrorTooltip";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";
import { slugify } from "@lib/utils/str";

const RefInput = (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  return <Input {...args} ref={args.innerRef} />;
};

const NewField = ({ widgetTypeName, fields, onSave, onCancelNewField }) => {
  const fieldRef = useRef(null);
  const { theme } = useThemeUI();
  const [isIdFieldPristine, setIsIdFieldPristine] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const widget = Widgets[widgetTypeName];
  if (!widget) {
    console.error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Widget of type "${widgetTypeName}" not found. This is a problem on our side!`
    );
    return <div>Unexpected error. Contact us for more info.</div>;
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-assignment
  const {
    Meta: { icon: WidgetIcon },
    FormFields: widgetFormFields,
  } = widget;

  const FormFields = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    id: widgetFormFields.id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    label: widgetFormFields.label,
  };

  const initialValues = {
    ...createInitialValues(FormFields),
    ...(widgetTypeName === WidgetTypes.UID ? { id: "uid" } : {}),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    widgetTypeName,
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const validationSchema = createValidationSchema(FormFields);

  useEffect(() => {
    if (fieldRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      fieldRef.current.focus();
    }
  }, [fieldRef]);

  const handleLabelChange = (e, values, setValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (isIdFieldPristine) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setValues({
        ...values,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        label: e.target.value,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        id: slugify(e.target.value),
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      setValues({ ...values, label: e.target.value });
    }
  };

  const handleIdChange = (e, setFieldValue) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    setFieldValue("id", e.target.value);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setIsIdFieldPristine(false);
  };

  return (
    <Formik
      validateOnChange
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      onSubmit={onSave}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      {({ errors, values, setValues, setFieldValue }) => (
        <Form>
          <Flex
            as="li"
            sx={{
              p: 3,
              px: 3,
              mx: 0,
              ml: "34px",
              alignItems: "center",
              variant: "styles.listItem",
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              border: (t) => `1px solid ${t.colors?.borders}`,
            }}
          >
            <Flex
              sx={{
                alignItems: "center",
              }}
            >
              <WidgetIcon
                style={{
                  color: theme.colors.primary,
                  marginRight: "8px",
                  borderRadius: "4px",
                  padding: "4px",
                  border: "2px solid",
                  borderColor: theme.colors.primary,
                }}
                size={28}
              />
              <Flex
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text as="p" sx={{ mr: 3, minWidth: "86px", fontWeight: 500 }}>
                  Field Name
                </Text>
                <Field
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                  onChange={(e) => handleLabelChange(e, values, setValues)}
                  name="label"
                  placeholder="Field Name"
                  type="text"
                  validate={(value) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (!value.length) {
                      return "This field is required";
                    }
                  }}
                  as={RefInput}
                  innerRef={fieldRef}
                  sx={{
                    border: ({ colors }) =>
                      errors.label
                        ? `1px solid tomato`
                        : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                          `1px solid ${colors.primary}`,
                    "&:focus": {
                      border: errors.label
                        ? `1px solid tomato`
                        : "1px solid yellow",
                    },
                  }}
                />
                <ErrorTooltip
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  error={errors.label}
                />
                <Text
                  as="p"
                  sx={{ ml: 3, mr: 3, minWidth: "56px", fontWeight: 500 }}
                >
                  field ID
                </Text>
                <Field
                  onChange={(e) => handleIdChange(e, setFieldValue)}
                  name="id"
                  placeholder="myField"
                  type="text"
                  validate={(value) =>
                    validateId({
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      value,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      fields,
                      initialId: null,
                    })
                  }
                  as={RefInput}
                  sx={{
                    border: ({ colors }) =>
                      errors.id
                        ? `1px solid tomato`
                        : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                          `1px solid ${colors.primary}`,
                    "&:focus": {
                      border: errors.id
                        ? `1px solid tomato`
                        : "1px solid yellow",
                    },
                  }}
                />
                <ErrorTooltip error={errors.id} />
              </Flex>
            </Flex>
            <Box sx={{ minWidth: 150, ml: 3 }}>
              <Button
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                onClick={onCancelNewField}
                variant="secondary"
                type="button"
              >
                Cancel
              </Button>
              <Button sx={{ ml: 2 }} type="submit">
                Add
              </Button>
            </Box>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default NewField;
