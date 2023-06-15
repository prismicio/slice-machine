import { Suspense } from "react";
import { useRequest } from "@prismicio/editor-support/Suspense";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  ErrorBoundary,
  Icon,
  ProgressCircle,
  vars,
} from "@prismicio/editor-ui";

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getPageTypeSnippet(): Promise<string> {
  await wait(3000);
  return `Create a new page component in your  pages  directory with the filename  [uid].jsx . (If you already have a file with that name, you can create the file 
        in a child directory like  pages/marketing/[uid].jsx .)`;
}

const PluginPageTypeSnippet = () => {
  const content = useRequest(getPageTypeSnippet, []);
  return <div style={{ padding: vars.size[16] }}>{content}</div>;
};

export const PageTypeSnippet = () => {
  return (
    <Dialog
      trigger={
        <Button
          key="open-snippet"
          variant="secondary"
          startIcon={<Icon name="add" />}
        >
          Page snippet
        </Button>
      }
    >
      <DialogHeader icon="add" title="Page Snippet" />
      <DialogContent>
        <ErrorBoundary
          title="Request failed"
          description={`An error occurred while fetching page types snippets.`}
          renderError={(error) => {
            return (
              <Box
                height={"100%"}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                {error}
              </Box>
            );
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: vars.size[32],
                  height: "100%",
                }}
              >
                <ProgressCircle />
              </div>
            }
          >
            <PluginPageTypeSnippet />
          </Suspense>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
