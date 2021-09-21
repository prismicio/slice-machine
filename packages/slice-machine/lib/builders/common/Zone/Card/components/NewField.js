import { useEffect, useRef } from "react";
import { Formik, Form, Field } from "formik";
import { Box, Input, Flex, Text, Button, Label, useThemeUI } from "theme-ui";

import { DefaultFields, validateId } from "@lib/forms/defaults";
import { createInitialValues, createValidationSchema } from "@lib/forms";

import * as Widgets from "@lib/models/common/widgets/withGroup";

import ErrorTooltip from "./ErrorTooltip";

const RefInput = (args) => {
  return <Input {...args} ref={args.innerRef} />;
};

const NewField = ({ widgetTypeName, fields, onSave, onCancelNewField }) => {
  const fieldRef = useRef(null);
  const { theme } = useThemeUI();
  const widget = Widgets[widgetTypeName];
  if (!widget) {
    console.error(
      `Widget of type "${widgetTypeName}" not found. This is a problem on our side!`
    );
    return <div>Unexpected error. Contact us for more info.</div>;
  }
  const FormFields = {
    id: DefaultFields.id,
  };

  const {
    Meta: { icon: WidgetIcon },
  } = widget;

  const initialValues = {
    ...createInitialValues(FormFields),
    widgetTypeName,
  };
  const validationSchema = createValidationSchema(FormFields);

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.focus();
    }
  }, [fieldRef]);

  return (
    <Formik
      validateOnChange
      onSubmit={onSave}
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      {({ errors }) => (
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
                <Text as="p" sx={{ mr: 3, minWidth: "56px" }}>
                  field id
                </Text>
                <Field
                  name="id"
                  placeholder="myField"
                  type="text"
                  validate={(value) =>
                    validateId({
                      value,
                      fields,
                      initialId: null,
                    })
                  }
                  as={RefInput}
                  innerRef={fieldRef}
                  sx={{
                    border: ({ colors }) =>
                      errors.id
                        ? `1px solid tomato`
                        : `1px solid ${colors.primary}`,
                    "&:focus": {
                      border: errors.id
                        ? `1px solid tomato`
                        : "1px solid yellow",
                    },
                  }}
                />
                <ErrorTooltip errors={errors} />
              </Flex>
            </Flex>
            <Box>
              <Button
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
