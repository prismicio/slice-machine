import React from "react";
import { Flex, Text } from "theme-ui";

import { RiErrorWarningLine } from "react-icons/ri";
import { ThemeUIStyleObject } from "@theme-ui/css";

type WarningSectionProps = {
  title: string;
  sx: ThemeUIStyleObject;
};

const WarningSection: React.FunctionComponent<WarningSectionProps> = ({
  title,
  sx,
  children,
}) => (
  <Flex
    sx={{
      p: 3,
      bg: "lightOrange",
      flexDirection: "column",
      borderRadius: 4,
      ...sx,
    }}
  >
    <Flex
      sx={{
        alignItems: "center",
      }}
    >
      <RiErrorWarningLine color="#F2994A" />
      <Text
        sx={{
          ml: 1,
          fontWeight: 500,
        }}
      >
        {title}
      </Text>
    </Flex>
    {!!children && <Text sx={{ color: "textClear", mt: 2 }}>{children}</Text>}
  </Flex>
);

export default WarningSection;
