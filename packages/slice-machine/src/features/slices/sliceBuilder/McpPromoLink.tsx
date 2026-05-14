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
      <a href="https://prismic.io/docs/ai" target="_blank">
        Boost your workflow with Prismic AI modeling
      </a>
    </Button>
  );
};
