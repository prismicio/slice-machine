import type { FC, ReactNode } from "react";
import { Flex } from "theme-ui";

type Props = Readonly<{
  children?: ReactNode;
}>;

export const ChangesSectionHeader: FC<Props> = ({ children }) => {
  return (
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        mt: "8px",
        bg: "grey02",
        borderRadius: 4,
        padding: "12px 16px",
      }}
    >
      {children}
    </Flex>
  );
};
