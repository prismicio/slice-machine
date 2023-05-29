import React, { FC } from "react";
import { useField } from "formik";
import { Box, Radio } from "theme-ui";

import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { FlexCard } from "./FlexCard";
import { CustomTypeFormat } from "@slicemachine/manager";

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
          data-cy="repeatable-type-radio-btn"
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
          data-cy="single-type-radio-btn"
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
