import { FC, ReactNode } from "react";
import { Flex } from "theme-ui";

interface ZoneHeaderProps {
  Heading: ReactNode;
  Actions: ReactNode;
}

const ZoneHeader: FC<ZoneHeaderProps> = ({ Heading, Actions }) => (
  <Flex
    bg="grey02"
    sx={{
      pl: 3,
      pr: 2,
      py: 2,
      mb: 2,
      borderRadius: "6px",
      alignItems: "center",
      minHeight: "51px",
      justifyContent: "space-between",
    }}
  >
    <Flex sx={{ alignItems: "center" }}>{Heading}</Flex>
    <Flex sx={{ alignItems: "center" }}>{Actions}</Flex>
  </Flex>
);

export default ZoneHeader;
