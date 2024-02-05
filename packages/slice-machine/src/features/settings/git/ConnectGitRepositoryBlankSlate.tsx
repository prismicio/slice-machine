import { Box, ButtonGroup, Text } from "@prismicio/editor-ui";
import type { FC, ReactNode } from "react";

type ConnectGitRepositoryBlankSlateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export const ConnectGitRepositoryBlankSlate: FC<
  ConnectGitRepositoryBlankSlateProps
> = ({ title, description, action }) => (
  <Box
    flexDirection="column"
    /*
     * TODO: these `padding` values actually don't match Figma, but they are the
     * closest allowed by the `Box` component.
     */
    padding={{ block: 72, inline: 100 }}
  >
    <Text align="center" variant="emphasized">
      {title}
    </Text>
    <Text align="center" color="grey11">
      {description}
    </Text>
    {Boolean(action) ? (
      <ButtonGroup sx={{ alignSelf: "center", marginTop: 8 }}>
        {action}
      </ButtonGroup>
    ) : undefined}
  </Box>
);
