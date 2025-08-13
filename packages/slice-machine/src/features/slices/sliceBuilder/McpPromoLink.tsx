import { Button } from "@prismicio/editor-ui";

import { telemetry } from "@/apiClient";

export const McpPromoLink = () => {
  return (
    <Button
      asChild
      invisible
      color="grey"
      endIcon="openInNew"
      sx={{ alignSelf: "center" }}
      onClick={() => {
        void telemetry.track({
          event: "mcp:promo-link-clicked",
          source: "slice_editor",
          target: "docs",
        });
      }}
    >
      <a
        href="https://prismic.io/docs/ai#code-with-prismics-mcp-server"
        target="_blank"
        rel="noopener,noreferrer"
      >
        Boost your workflow in Cursor with Prismic MCP
      </a>
    </Button>
  );
};
