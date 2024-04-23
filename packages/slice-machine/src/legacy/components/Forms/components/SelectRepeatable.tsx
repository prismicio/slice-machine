import { CustomTypeFormat } from "@slicemachine/manager";
import { useField } from "formik";
import React, { FC } from "react";
import { Box, Radio } from "theme-ui";

import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";

import { FlexCard } from "./FlexCard";

type SelectRepeatableProps = {
  format: CustomTypeFormat;
};

export const SelectRepeatable: FC<SelectRepeatableProps> = ({ format }) => {
  const [field, , helpers] = useField<boolean>("repeatable");
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  return (
    <Box mb={2}>
      <FlexCard selected={field.value} onClick={() => helpers.setValue(true)}>
        <Radio
          checked={field.value}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          data-testid="repeatable-type-radio-btn"
        />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Reusable type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            {customTypesMessages.hintRepeatable}
          </Box>
        </Box>
      </FlexCard>
      <FlexCard selected={!field.value} onClick={() => helpers.setValue(false)}>
        <Radio
          checked={!field.value}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          data-testid="single-type-radio-btn"
        />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Single type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            {customTypesMessages.hintSingle}
          </Box>
        </Box>
      </FlexCard>
    </Box>
  );
};
