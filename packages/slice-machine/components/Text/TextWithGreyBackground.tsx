import React from "react";
import { Flex } from "theme-ui";

interface TextWithGreyBackgroundProps {
  text: string;
}

export const TextWithGreyBackground = ({
  text,
}: TextWithGreyBackgroundProps) => {
  return (
    <Flex
      sx={{
        alignItems: "center",
        fontSize: "14px",
        fontWeight: "heading",
        mt: 37,
        backgroundColor: "#EEEEEE",
        borderRadius: 4,
        padding: "12px 16px",
      }}
    >
      {text}
    </Flex>
  );
};
