import {
  ActionList,
  ActionListItem,
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
  Box,
} from "@prismicio/editor-ui";
import { FC } from "react";

import { useAiSliceGenerationExperiment } from "@/features/builder/useAiSliceGenerationExperiment";

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
      alignItems="center"
      padding={32}
      data-testid="slice-zone-blank-slate"
    >
      <BlankSlate>
        <Box justifyContent="center" padding={{ bottom: 16 }}>
          <BlankSlateIcon
            lineColor="purple9"
            backgroundColor="purple5"
            name="add"
            size="large"
          />
        </Box>
        <BlankSlateTitle size="big">Add slices</BlankSlateTitle>
        <BlankSlateDescription>
          Slices are website sections that you can reuse on different pages with
          different content. Each slice has its own component in your code.
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
                description="Choose from ready-made examples."
              >
                Use a template
              </ActionListItem>
            ) : undefined}
            {projectHasAvailableSlices ? (
              <ActionListItem
                startIcon="folder"
                onClick={openUpdateSliceZoneModal}
                description="Select from your created Slices."
              >
                Reuse an existing Slice
              </ActionListItem>
            ) : undefined}
          </ActionList>
        </BlankSlateActions>
      </BlankSlate>
    </Box>
  );
};
