import { FC, Suspense } from "react";
import {
  Button,
  Dialog,
  DialogContent,
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

  if (documentation.length === 0) {
    return null;
  }

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
      <DialogContent>
        {documentation.length > 1 ? (
          <ContentTabs
            style={{ flex: 1 }}
            tabs={documentation.map(({ label, content }, i) => ({
              label: label ?? `Tab ${i + 1}`,
              content: <MarkdownRenderer markdown={content} />,
            }))}
          />
        ) : (
          <ScrollArea style={{ flex: 1, padding: 16 }}>
            <MarkdownRenderer markdown={documentation[0].content} />
          </ScrollArea>
        )}
      </DialogContent>
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
        <Suspense
          fallback={
            <Button variant="secondary" startIcon={<CodeIcon />}>
              Page snippet
            </Button>
          }
        >
          <PageSnippetContent model={model} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
