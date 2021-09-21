import { memo } from "react";
import { Formik, Form } from "formik";
import { Box } from "theme-ui";

import { MockConfigKey } from "../../../consts";

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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, _) => {
          const {
            id: apiId,
            [MockConfigKey]: mockConfigObject,
            ...rest
          } = values;
          const withDefaultValues = Object.entries(rest).reduce(
            (acc, [key, value]) => {
              if (typeof value !== Boolean && !value) {
                const maybeDefaultValue = FormFields[key]?.defaultValue;
                if (maybeDefaultValue !== undefined) {
                  return {
                    ...acc,
                    [key]: maybeDefaultValue,
                  };
                }
              }
              return {
                ...acc,
                [key]: value,
              };
            },
            {}
          );
          onSave({ newKey: apiId, value: withDefaultValues }, mockConfigObject);
        }}
      >
        {(props) => (
          <Form id={formId}>
            {children({
              ...props,
              initialValues,
            })}
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default memo(WidgetForm);
