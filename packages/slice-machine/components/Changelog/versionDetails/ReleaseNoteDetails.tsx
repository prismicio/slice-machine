import React from "react";
import { Flex, Text } from "theme-ui";
import { marked } from "marked";

interface ReleaseNoteDetailsProps {
  releaseNote: string;
}

export const ReleaseNoteDetails: React.FC<ReleaseNoteDetailsProps> = ({
  releaseNote,
}) => {
  return (
    <Flex
      sx={{
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Text
        sx={{
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "32px",
        }}
      >
        What's new
      </Text>

      <Text
        dangerouslySetInnerHTML={{
          __html: marked.parse(releaseNote),
        }}
      />
    </Flex>
  );
};
