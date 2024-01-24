import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Text,
} from "@prismicio/editor-ui";

import { useExperimentVariant } from "@src/hooks/useExperimentVariant";
import { telemetry } from "@src/apiClient";

export function JoinBetaExperiment() {
  const joinBetaExperiment = useExperimentVariant("test-xavier");
  const [isExperimentDialogOpen, setIsExperimentDialogOpen] = useState(false);

  useEffect(() => {
    if (joinBetaExperiment === "on") {
      void telemetry.track({ event: "experiment:join-beta-displayed" });
    }
  }, [joinBetaExperiment]);

  if (joinBetaExperiment !== "on") {
    return null;
  }

  return (
    <>
      <Box
        alignItems="flex-start"
        border={{ bottom: true, left: true, right: true, top: true }}
        borderRadius={6}
        borderStyle="dashed"
        flexDirection="column"
        gap={8}
        maxWidth={360}
        padding={16}
      >
        <Text variant="bold">Dev Collaboration Workflow</Text>
        <Text color="grey11">
          Test and preview seamlessly, collaborate with GIT branches, push
          models with code, and safeguard against overwrites—all without
          affecting your live website.
        </Text>
        <Button
          color="grey"
          onClick={() => {
            void telemetry.track({
              event: "experiment:join-beta-dialog-opened",
            });
            setIsExperimentDialogOpen(true);
          }}
        >
          Set up workflow
        </Button>
      </Box>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setIsExperimentDialogOpen(false);
          }
        }}
        open={isExperimentDialogOpen}
        size={{ height: "auto", width: 448 }}
      >
        <DialogHeader title="Hello! This feature is in the works." />
        <DialogContent>
          <Box flexDirection="column">
            <Box flexDirection="column" padding={16}>
              <Text>
                We're working hard to bring this to all Slice Machine users. If
                you'd like to get a sneak peek, sign up below for our beta
                program.
              </Text>
            </Box>
            <DialogActions
              cancel={{ text: "Cancel" }}
              ok={{
                text: "Join Beta",
                onClick: () => {
                  void telemetry.track({
                    event: "experiment:join-beta-clicked",
                  });
                  window.open("https://forms.gle/zkYcc7ERd7zmAq5SA", "_blank");
                  setIsExperimentDialogOpen(false);
                },
              }}
              size="medium"
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
