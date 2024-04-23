import { Field } from "formik";
import React from "react";
import { Box, Input, Label, Text } from "theme-ui";

type InputBoxProps = {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  testId?: string;
  onChange?: (input: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputBox: React.FunctionComponent<InputBoxProps> = ({
  name,
  label,
  placeholder,
  error,
  testId,
  onChange,
}) => (
  <Box mb={3}>
    <Label htmlFor={name} mb={2}>
      {label}
    </Label>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
      autoComplete="off"
      {...(onChange ? { onChange } : null)}
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      {...(testId ? { "data-testid": testId } : null)}
    />
    {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
    {error ? (
      <Text
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        data-testid={testId ? `${testId}-error` : "input-error"}
        sx={{ color: "error", mt: 1 }}
      >
        {error}
      </Text>
    ) : null}
  </Box>
);
