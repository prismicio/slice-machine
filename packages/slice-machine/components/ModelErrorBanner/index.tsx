import React from "react";
import { Box } from "theme-ui";
import { AiFillExclamationCircle } from "react-icons/ai";

export interface ModelErrorBannerProps {
  text?: string;
}

export const ModelErrorBanner: React.FC<ModelErrorBannerProps> = ({
  text = "Field value needed. Please add the missing value for each field below, in order to push this Custom Type to Prismic.",
}) => (
  <Box
    bg="critical"
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      color: "white",
      borderRadius: "4px",
      marginBottom: "16px",
      fontWeight: "700",
      fontSize: "14px",
      lineHeight: "16px",
    }}
  >
    <AiFillExclamationCircle size="20" />
    {text}
  </Box>
);
