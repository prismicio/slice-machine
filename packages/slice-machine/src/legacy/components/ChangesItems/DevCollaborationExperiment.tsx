import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  Text,
} from "@prismicio/editor-ui";
import { useEffect, useState } from "react";

import { telemetry } from "@/apiClient";
import { useExperimentVariant } from "@/hooks/useExperimentVariant";

type DevCollaborationExperimentPayload = {
  cardButtonLabel: string;
  cardDescription: string;
  cardTitle: string;
  dialogButtonLabel: string;
  dialogButtonLink: string;
  dialogDescription: string;
  dialogTitle: string;
};

export function DevCollaborationExperiment() {
  const devCollaborationExperiment = useExperimentVariant(
    "slicemachine-dev-collaboration",
  );
  const [isExperimentDialogOpen, setIsExperimentDialogOpen] = useState(false);
  const payload = devCollaborationExperiment?.payload as
    | DevCollaborationExperimentPayload
    | undefined;

  useEffect(() => {
    if (devCollaborationExperiment?.value === "on" && payload !== undefined) {
      void telemetry.track({ event: "dev-collab:workflow-stub-displayed" });
    }
  }, [devCollaborationExperiment, payload]);

  if (devCollaborationExperiment?.value !== "on" || payload === undefined) {
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
        flexShrink={0}
        gap={8}
        padding={16}
        width={320}
      >
        <Box flexDirection="column" gap={2}>
          <Text variant="smallBold">{payload.cardTitle}</Text>
          <Text color="grey11" variant="small">
            {payload.cardDescription}
          </Text>
        </Box>
        <Button
          color="grey"
          onClick={() => {
            void telemetry.track({
              event: "dev-collab:set-up-workflow-opened",
            });
            setIsExperimentDialogOpen(true);
          }}
        >
          {payload.cardButtonLabel}
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
        <DialogHeader title={payload.dialogTitle} />
        <DialogContent>
          <Box flexDirection="column">
            <Box flexDirection="column" padding={16}>
              <Text>{payload.dialogDescription}</Text>
            </Box>
            <DialogActions
              cancel={{ text: "Cancel" }}
              ok={{
                text: payload.dialogButtonLabel,
                onClick: () => {
                  void telemetry.track({
                    event: "dev-collab:join-beta-clicked",
                  });
                  window.open(payload.dialogButtonLink, "_blank");
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
