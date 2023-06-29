import { FC, Suspense } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  ErrorBoundary,
  ScrollArea,
} from "@prismicio/editor-ui";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { MarkdownRenderer } from "@src/features/documentation/MarkdownRenderer";
import { ContentTabs } from "@src/components/ContentTabs";
import { CodeIcon } from "@src/icons/CodeIcon";
import { useDocumentation } from "@src/features/documentation/useDocumentation";

type PageSnippetContentProps = { model: CustomType };

const PageSnippetContent: FC<PageSnippetContentProps> = ({ model }) => {
  const documentation = useDocumentation({
    kind: "PageSnippet",
    data: { model },
  });

  return (
    <Dialog
      trigger={
        <Button variant="secondary" startIcon={<CodeIcon />}>
          Page snippet
        </Button>
      }
    >
      {/** Icon="code" once editor-ui PR is merged */}
      <DialogHeader icon="add" title="Page snippet" />
      <ScrollArea
        style={{
          display: "flex",
          gridArea: "content",
          height: "100%",
        }}
      >
        {documentation.length > 1 ? (
          <ContentTabs
            tabs={documentation.map(({ label, content }, i) => ({
              label: label ?? `Tab ${i + 1}`,
              content: <MarkdownRenderer markdown={content} />,
            }))}
          />
        ) : (
          <MarkdownRenderer markdown={documentation[0].content} />
        )}
      </ScrollArea>
    </Dialog>
  );
};

type PageSnippetDialogProps = { model: CustomType };

export const PageSnippetDialog: FC<PageSnippetDialogProps> = ({ model }) => {
  return (
    <div>
      <ErrorBoundary
        title="Request failed"
        description={`An error occurred while fetching page types snippets.`}
        renderError={() => null}
      >
        <Suspense>
          <PageSnippetContent model={model} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
