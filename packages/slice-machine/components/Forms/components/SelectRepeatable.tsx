import React, { FC } from "react";
import { useField } from "formik";
import { Box, Radio } from "theme-ui";

import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";
import { FlexCard } from "./FlexCard";
import { CustomTypeFormat } from "@slicemachine/manager/*";

type SelectRepeatableProps = {
  format: CustomTypeFormat;
};

export const SelectRepeatable: FC<SelectRepeatableProps> = ({ format }) => {
  const [field, , helpers] = useField<boolean>("repeatable");
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];

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
            {customTypesConfig.hintRepeatable}
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
            {customTypesConfig.hintSingle}
          </Box>
        </Box>
      </FlexCard>
    </Box>
  );
};
