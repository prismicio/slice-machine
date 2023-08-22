import { Field } from "formik";
import { Box, Label, Input, Text } from "theme-ui";

export const InputBox = ({
  name,
  label,
  placeholder,
  error,
  ...rest
}: {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
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
      {...rest}
    />
    {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
    {error ? <Text sx={{ color: "error", mt: 1 }}>{error}</Text> : null}
  </Box>
);
