import { Box, Text, Label, Input } from "theme-ui";
import { useFormikContext } from "formik";
import InputDeleteIcon from "components/InputDeleteIcon";

import { initialValues } from ".";

import { MockConfigKey } from "../../../../../consts";

const Form = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, setFieldValue } = useFormikContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const contentValue = values[MockConfigKey]?.content;

  const onUpdate = (value) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!value || !value.length) {
      return setFieldValue(MockConfigKey, {});
    }
    setFieldValue(MockConfigKey, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      content: parseInt(value),
    });
  };

  const onDelete = () => {
    setFieldValue(MockConfigKey, {});
  };

  return (
    <Box>
      <Label
        variant="label.primary"
        sx={{ display: "block", maxWidth: "400px" }}
      >
        <Text as="span">Number value</Text>
        <Input
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value={contentValue || ""}
          placeholder="A mock number for testing (eg. '1995')"
          type="number"
          onChange={(e) => onUpdate(e.target.value)}
          sx={{
            MozAppearance: "textField",
            "&::-webkit-outer-spin-button,&::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
          }}
        />
        <InputDeleteIcon onClick={onDelete} />
      </Label>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Form.initialValues = initialValues;

export const MockConfigForm = Form;
