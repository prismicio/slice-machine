import React from "react";
import { Field } from "formik";
import { Box, Label, Input, Text } from "theme-ui";

type InputBoxProps = {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  dataCy?: string;
  onChange?: (input: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputBox: React.FunctionComponent<InputBoxProps> = ({
  name,
  label,
  placeholder,
  error,
  dataCy,
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
      {...(dataCy ? { "data-cy": dataCy } : null)}
    />
    {error ? (
      <Text
        data-cy={dataCy ? `${dataCy}-error` : "input-error"}
        sx={{ color: "error", mt: 1 }}
      >
        {error}
      </Text>
    ) : null}
  </Box>
);
