import React from "react";
import { Flex } from "theme-ui";

interface YoutubeEmbedProps {
  embedId: string;
  title: string;
  style: React.CSSProperties;
}

export const YoutubeEmbed: React.FC<YoutubeEmbedProps> = ({
  embedId,
  title,
  style,
}) => (
  <Flex sx={{ width: "100%", height: "100%" }}>
    <iframe
      style={style}
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={title}
    />
  </Flex>
);
