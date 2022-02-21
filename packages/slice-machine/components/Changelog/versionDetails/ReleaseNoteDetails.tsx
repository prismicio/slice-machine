import React from "react";
import { Text } from "theme-ui";
import { marked } from "marked";

interface ReleaseNoteDetailsProps {
  releaseNote: string;
}

export const ReleaseNoteDetails: React.FC<ReleaseNoteDetailsProps> = ({
  releaseNote,
}) => {
  return (
    <Text
      sx={{
        "h1, h2, h3": {
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "20px",
        },
        p: {
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "20px",
        },
        b: {
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
        },
        code: {
          color: "code.orange",
        },
        li: {
          listStyleType: "disc",
          marginLeft: "25px",
          paddingLeft: "5px",
        },
      }}
      dangerouslySetInnerHTML={{
        __html: marked.parse(releaseNote),
      }}
    />
  );
};
