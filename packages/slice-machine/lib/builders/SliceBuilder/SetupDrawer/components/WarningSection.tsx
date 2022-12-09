import { type FC, type ReactNode } from "react";
import { type ThemeUIStyleObject, Flex, Text } from "theme-ui";

import { RiErrorWarningLine } from "react-icons/ri";

type WarningSectionProps = {
  title: string;
  sx: ThemeUIStyleObject;
  children?: ReactNode;
};

const WarningSection: FC<WarningSectionProps> = ({ title, sx, children }) => (
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
    {!!children && (
      <Text variant={"xs"} sx={{ mt: 2 }}>
        {children}
      </Text>
    )}
  </Flex>
);

export default WarningSection;
