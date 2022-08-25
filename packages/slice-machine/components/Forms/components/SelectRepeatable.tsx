import React from "react";
import { FlexCard } from "./FlexCard";
import { useField } from "formik";
import { Box, Radio } from "theme-ui";

export const SelectRepeatable: React.FC = () => {
  const [field, , helpers] = useField<boolean>("repeatable");
  return (
    <Box mb={2}>
      <FlexCard selected={field.value} onClick={() => helpers.setValue(true)}>
        <Radio checked={field.value} data-cy="repeatable-type-radio-btn" />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Repeatable type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            Best for multiple instances like blog posts, authors, products...
          </Box>
        </Box>
      </FlexCard>
      <FlexCard selected={!field.value} onClick={() => helpers.setValue(false)}>
        <Radio checked={!field.value} data-cy="single-type-radio-btn" />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Single type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            Best for a unique page, like the homepage or privacy policy page...
          </Box>
        </Box>
      </FlexCard>
    </Box>
  );
};
