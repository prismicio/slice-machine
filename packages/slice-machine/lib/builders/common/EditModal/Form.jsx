import { memo } from "react";
import { Formik, Form } from "formik";
import { Box } from "theme-ui";

const WidgetForm = ({
  formId,
  initialValues,
  validationSchema,
  onSave,
  FormFields,
  children,
}) => {
  return (
    <Box>
      <Formik
        validateOnChange
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        initialValues={initialValues}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
        validationSchema={validationSchema}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
        onSubmit={(values, _) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
          const { id: apiId, ...rest } = values;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const withDefaultValues = Object.entries(rest).reduce(
            (acc, [key, value]) => {
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (typeof value !== Boolean && !value) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const maybeDefaultValue = FormFields[key]?.defaultValue;
                if (maybeDefaultValue !== undefined) {
                  return {
                    ...acc,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [key]: maybeDefaultValue,
                  };
                }
              }
              return {
                ...acc,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [key]: value,
              };
            },
            {}
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
          onSave({ newKey: apiId, value: withDefaultValues });
        }}
      >
        {(props) => (
          <Form // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            id={formId}
          >
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
              children({
                ...props,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                initialValues,
              })
            }
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default memo(WidgetForm);
