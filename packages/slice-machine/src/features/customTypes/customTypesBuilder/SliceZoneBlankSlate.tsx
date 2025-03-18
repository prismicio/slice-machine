import { ActionList, ActionListItem, Box } from "@prismicio/editor-ui";
import { FC } from "react";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { useAiSliceGenerationExperiment } from "@/features/builder/useAiSliceGenerationExperiment";
import { SliceMachinePrinterIcon } from "@/icons/SliceMachinePrinterIcon";

export type SliceZoneBlankSlateProps = {
  openUpdateSliceZoneModal: () => void;
  openCreateSliceModal: () => void;
  openGenerateSliceWithAiModal: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  openCreateSliceModal,
  openGenerateSliceWithAiModal,
  openUpdateSliceZoneModal,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  const aiSliceGenerationExperiment = useAiSliceGenerationExperiment();

  return (
    <Box
      flexGrow={1}
      justifyContent="center"
      data-testid="slice-zone-blank-slate"
    >
      <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
        <BlankSlateContent>
          <Box justifyContent="center" padding={{ bottom: 16 }}>
            <SliceMachinePrinterIcon />
          </Box>
          <BlankSlateTitle>Add slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <ActionList>
              {aiSliceGenerationExperiment.eligible && (
                <ActionListItem
                  startIcon="autoFixHigh"
                  onClick={openGenerateSliceWithAiModal}
                  description="Let AI instantly create a Slice for you."
                >
                  Generate with AI
                </ActionListItem>
              )}
              <ActionListItem
                startIcon="add"
                onClick={openCreateSliceModal}
                description="Build a custom Slice your way."
              >
                Start from scratch
              </ActionListItem>
              {isSlicesTemplatesSupported ? (
                <ActionListItem
                  startIcon="contentCopy"
                  onClick={openSlicesTemplatesModal}
                  description="Select from premade examples."
                >
                  Use template
                </ActionListItem>
              ) : undefined}
              {projectHasAvailableSlices ? (
                <ActionListItem
                  startIcon="folder"
                  onClick={openUpdateSliceZoneModal}
                  description="Select from your own slices."
                >
                  Select existing
                </ActionListItem>
              ) : undefined}
            </ActionList>
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
